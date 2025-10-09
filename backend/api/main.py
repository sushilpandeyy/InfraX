from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
import uvicorn
import sys
from pathlib import Path

# Add parent directory to path to import brahma
sys.path.insert(0, str(Path(__file__).parent.parent))

from brahma.core.orchestrator import BrahmaOrchestrator

load_dotenv()

app = FastAPI(title="InfraX - Brahma IaC Orchestration Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize Brahma Orchestrator
brahma = BrahmaOrchestrator()

class IntelligentWorkflowRequest(BaseModel):
    prompt: str
    location: Optional[str] = None

@app.get("/")
def read_root():
    return {
        "message": "InfraX Brahma - Intelligent IaC Orchestration Platform",
        "status": "running",
        "version": "1.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/v1/workflows/intelligent")
async def create_intelligent_workflow(request: IntelligentWorkflowRequest):
    """Execute intelligent workflow with auto-planning"""
    try:
        result = brahma.execute_intelligent_workflow(
            prompt=request.prompt,
            location=request.location
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/workflows")
async def get_workflows():
    """Get all workflow history"""
    try:
        history = brahma.get_workflow_history()
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Get specific workflow by ID"""
    try:
        history = brahma.get_workflow_history()
        workflow = next((w for w in history if w["workflow_id"] == workflow_id), None)

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        return workflow
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
