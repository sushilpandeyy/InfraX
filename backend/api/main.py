from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
import uvicorn
import sys
from pathlib import Path
from sqlalchemy.orm import Session

# Add parent directory to path to import brahma
sys.path.insert(0, str(Path(__file__).parent.parent))

from brahma.core.orchestrator import BrahmaOrchestrator
from brahma.agents.vishu_agent import VishuAgent
from brahma.tools.repo_analyzer import RepositoryAnalyzer
from database import init_db, test_connection, get_db, SessionLocal, WorkflowModel, CodeVersionModel, VishuInteractionModel

load_dotenv()

app = FastAPI(title="InfraX - Brahma IaC Orchestration Platform")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    print("\n" + "="*80)
    print("🚀 InfraX Brahma Platform Starting...")
    print("="*80)

    # Test database connection
    print("\n🔌 Testing database connection...")
    if test_connection():
        # Initialize database tables
        init_db()
    else:
        print("⚠️  Warning: Database connection failed, workflows will only be stored in memory")

    print("\n✅ InfraX Brahma Platform Ready!")
    print("="*80 + "\n")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",  # Vite dev server alternate port
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize Brahma Orchestrator, Vishu Agent, and Repository Analyzer
brahma = BrahmaOrchestrator()
vishu = VishuAgent()
repo_analyzer = RepositoryAnalyzer()

class IntelligentWorkflowRequest(BaseModel):
    prompt: Optional[str] = None
    location: Optional[str] = None
    repo_url: Optional[str] = None

class VishuChatRequest(BaseModel):
    message: str
    workflow_id: Optional[str] = None

class VishuAnalysisRequest(BaseModel):
    workflow_id: str

class VishuImprovementRequest(BaseModel):
    workflow_id: str
    focus_area: Optional[str] = "all"  # all, security, cost, performance

class UpdateCodeRequest(BaseModel):
    workflow_id: str
    terraform_code: str
    change_description: Optional[str] = "User manual edit"

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
    """Execute intelligent workflow with auto-planning or repository analysis"""
    try:
        # Validate that either prompt or repo_url is provided
        if not request.prompt and not request.repo_url:
            raise HTTPException(
                status_code=400,
                detail="Either 'prompt' or 'repo_url' must be provided"
            )

        final_prompt = request.prompt

        # If repo_url is provided, analyze the repository
        if request.repo_url:
            print(f"\n[API] Repository URL provided: {request.repo_url}")
            print("[API] Initiating repository analysis...")

            repo_analysis = repo_analyzer.analyze_repository(request.repo_url)

            if not repo_analysis['success']:
                raise HTTPException(
                    status_code=400,
                    detail=f"Repository analysis failed: {repo_analysis.get('error', 'Unknown error')}"
                )

            # Use generated prompt from repository analysis
            generated_prompt = repo_analysis['generated_prompt']

            # If user also provided a prompt, append it as additional context
            if request.prompt and request.prompt.strip():
                final_prompt = f"{generated_prompt}\n\nAdditional Requirements:\n{request.prompt}"
            else:
                final_prompt = generated_prompt

            print(f"[API] Repository analysis complete. Generated prompt length: {len(final_prompt)} chars")
            print(f"[API] Detected tech stack: {', '.join(repo_analysis['analysis'].get('tech_stack', []))}")

        # Execute the workflow with the final prompt
        result = brahma.execute_intelligent_workflow(
            prompt=final_prompt,
            location=request.location
        )

        # Add repository analysis info to the result if available
        if request.repo_url:
            result['repository_analysis'] = {
                'repo_url': request.repo_url,
                'tech_stack': repo_analysis['analysis'].get('tech_stack', []),
                'frameworks': repo_analysis['analysis'].get('frameworks', []),
                'databases': repo_analysis['analysis'].get('databases', []),
            }

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/workflows")
async def get_workflows(db: Session = Depends(get_db)):
    """Get all workflow history from database"""
    try:
        # Fetch from database
        workflows = db.query(WorkflowModel).order_by(WorkflowModel.timestamp.desc()).all()

        # Convert to dictionary format expected by frontend
        result = []
        for w in workflows:
            result.append({
                "workflow_id": w.workflow_id,
                "success": w.success,
                "workflow_type": w.workflow_type,
                "timestamp": w.timestamp.isoformat(),
                "input": {
                    "prompt": w.prompt,
                    "location": w.location,
                    "iac_tool": w.iac_tool
                },
                "steps": {
                    "1_intelligent_planning": w.intelligent_planning,
                    "2_cost_optimization": w.cost_optimization,
                    "3_service_refinement": w.service_refinement,
                    "4_iac_generation": w.iac_generation,
                    "5_diagram_generation": w.diagram_generation
                },
                "summary": {
                    "cloud_provider": w.cloud_provider,
                    "region": w.region,
                    "location_rationale": w.location_rationale,
                    "iac_tool": w.iac_tool,
                    "services_count": int(w.services_count) if w.services_count else 0,
                    "estimated_savings": float(w.estimated_savings) if w.estimated_savings else 0,
                    "code_file": w.code_file,
                    "code_path": w.code_path,
                    "architecture": w.architecture,
                    "mermaid_diagram": w.mermaid_diagram,
                    "service_descriptions": w.service_descriptions,
                    "diagram_file": w.diagram_file,
                    "html_preview": w.html_preview
                }
            })

        return result
    except Exception as e:
        # Fallback to in-memory if database fails
        print(f"⚠️  Database query failed, using in-memory history: {e}")
        history = brahma.get_workflow_history()
        return history

@app.get("/api/v1/workflows/{workflow_id}")
async def get_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Get specific workflow by ID from database"""
    try:
        # Fetch from database
        w = db.query(WorkflowModel).filter(WorkflowModel.workflow_id == workflow_id).first()

        if not w:
            raise HTTPException(status_code=404, detail="Workflow not found")

        # Convert to dictionary format
        return {
            "workflow_id": w.workflow_id,
            "success": w.success,
            "workflow_type": w.workflow_type,
            "timestamp": w.timestamp.isoformat(),
            "input": {
                "prompt": w.prompt,
                "location": w.location,
                "iac_tool": w.iac_tool
            },
            "steps": {
                "1_intelligent_planning": w.intelligent_planning,
                "2_cost_optimization": w.cost_optimization,
                "3_service_refinement": w.service_refinement,
                "4_iac_generation": w.iac_generation,
                "5_diagram_generation": w.diagram_generation
            },
            "summary": {
                "cloud_provider": w.cloud_provider,
                "region": w.region,
                "location_rationale": w.location_rationale,
                "iac_tool": w.iac_tool,
                "services_count": int(w.services_count) if w.services_count else 0,
                "estimated_savings": float(w.estimated_savings) if w.estimated_savings else 0,
                "code_file": w.code_file,
                "code_path": w.code_path,
                "architecture": w.architecture,
                "mermaid_diagram": w.mermaid_diagram,
                "service_descriptions": w.service_descriptions,
                "diagram_file": w.diagram_file,
                "html_preview": w.html_preview
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        # Fallback to in-memory if database fails
        print(f"⚠️  Database query failed, using in-memory history: {e}")
        history = brahma.get_workflow_history()
        workflow = next((w for w in history if w["workflow_id"] == workflow_id), None)

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        return workflow

# ===== Vishu Agent Endpoints =====

@app.post("/api/v1/vishu/chat")
async def vishu_chat(request: VishuChatRequest, db: Session = Depends(get_db)):
    """
    Chat with Vishu Agent about infrastructure
    """
    try:
        # Get workflow context if workflow_id provided
        terraform_code = None
        workflow_context = None

        if request.workflow_id:
            # Fetch workflow from database
            workflow = db.query(WorkflowModel).filter(
                WorkflowModel.workflow_id == request.workflow_id
            ).first()

            if workflow:
                # Read Terraform file
                terraform_code = vishu.read_terraform_file(workflow.code_path)
                workflow_context = {
                    "cloud_provider": workflow.cloud_provider,
                    "region": workflow.region,
                    "services_count": int(workflow.services_count) if workflow.services_count else 0,
                    "prompt": workflow.prompt
                }

        # Chat with Vishu
        response = vishu.chat(
            message=request.message,
            workflow_id=request.workflow_id,
            terraform_code=terraform_code,
            workflow_context=workflow_context
        )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vishu/analyze")
async def vishu_analyze_workflow(request: VishuAnalysisRequest, db: Session = Depends(get_db)):
    """
    Get comprehensive analysis of a workflow's Terraform code
    """
    try:
        # Fetch workflow from database
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        # Read Terraform file
        terraform_code = vishu.read_terraform_file(workflow.code_path)

        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        # Get workflow context
        workflow_context = {
            "cloud_provider": workflow.cloud_provider,
            "region": workflow.region,
            "services_count": int(workflow.services_count) if workflow.services_count else 0,
            "prompt": workflow.prompt
        }

        # Analyze
        analysis = vishu.analyze_terraform_code(terraform_code, workflow_context)

        return analysis

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vishu/suggest")
async def vishu_suggest_improvements(request: VishuImprovementRequest, db: Session = Depends(get_db)):
    """
    Get improvement suggestions for a workflow's Terraform code
    """
    try:
        # Fetch workflow from database
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        # Read Terraform file
        terraform_code = vishu.read_terraform_file(workflow.code_path)

        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        # Get suggestions
        suggestions = vishu.suggest_improvements(terraform_code, request.focus_area)

        return suggestions

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/vishu/insights/{workflow_id}")
async def vishu_quick_insights(workflow_id: str, db: Session = Depends(get_db)):
    """
    Get quick insights about a workflow's Terraform code
    """
    try:
        # Fetch workflow from database
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        # Read Terraform file
        terraform_code = vishu.read_terraform_file(workflow.code_path)

        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        # Get quick insights
        insights = vishu.get_quick_insights(terraform_code)

        return insights

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== Enhanced Vishu Tools Endpoints =====

@app.post("/api/v1/vishu/validate")
async def vishu_validate_terraform(request: VishuAnalysisRequest, db: Session = Depends(get_db)):
    """
    Validate Terraform syntax
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        validation = vishu.validate_terraform_syntax(terraform_code)
        return validation

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vishu/format")
async def vishu_format_terraform(request: VishuAnalysisRequest, db: Session = Depends(get_db)):
    """
    Auto-format Terraform code
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        formatted = vishu.format_terraform_code(terraform_code)
        return formatted

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vishu/security-scan")
async def vishu_security_scan(request: VishuAnalysisRequest, db: Session = Depends(get_db)):
    """
    Run security scan on Terraform code
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        security = vishu.security_scan(terraform_code)
        return security

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vishu/best-practices")
async def vishu_best_practices(request: VishuAnalysisRequest, db: Session = Depends(get_db)):
    """
    Check Terraform best practices
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        best_practices = vishu.check_best_practices(terraform_code)
        return best_practices

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AutoFixRequest(BaseModel):
    workflow_id: str
    issue_description: str

class NaturalLanguageQueryRequest(BaseModel):
    workflow_id: str
    query: str

class PredictiveCostRequest(BaseModel):
    workflow_id: str
    months: int = 12
    growth_rate: float = 0.05
    usage_pattern: str = "steady"

class CostQueryRequest(BaseModel):
    workflow_id: str
    query: str

@app.post("/api/v1/vishu/auto-fix")
async def vishu_auto_fix(request: AutoFixRequest, db: Session = Depends(get_db)):
    """
    Generate auto-fix for specific issue
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        auto_fix = vishu.generate_auto_fix(terraform_code, request.issue_description)
        return auto_fix

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vishu/generate-docs")
async def vishu_generate_docs(request: VishuAnalysisRequest, db: Session = Depends(get_db)):
    """
    Generate documentation for Terraform code
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        documentation = vishu.generate_documentation(terraform_code)
        return documentation

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vishu/dependencies")
async def vishu_dependencies(request: VishuAnalysisRequest, db: Session = Depends(get_db)):
    """
    Analyze resource dependencies
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        dependencies = vishu.analyze_resource_dependencies(terraform_code)
        return dependencies

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vishu/comprehensive-audit")
async def vishu_comprehensive_audit(request: VishuAnalysisRequest, db: Session = Depends(get_db)):
    """
    Run comprehensive audit with all checks
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        workflow_context = {
            "cloud_provider": workflow.cloud_provider,
            "region": workflow.region,
            "services_count": int(workflow.services_count) if workflow.services_count else 0,
            "prompt": workflow.prompt
        }

        audit = vishu.comprehensive_audit(terraform_code, workflow_context)
        return audit

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== Advanced AI Features =====

@app.post("/api/v1/vishu/nl-query")
async def vishu_natural_language_query(request: NaturalLanguageQueryRequest, db: Session = Depends(get_db)):
    """
    Execute natural language queries against Terraform code
    Examples: "Show me all S3 buckets", "List EC2 instances"
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        result = vishu.natural_language_query(terraform_code, request.query)
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vishu/predictive-costs")
async def vishu_predictive_costs(request: PredictiveCostRequest, db: Session = Depends(get_db)):
    """
    Predict infrastructure costs over time with growth projections
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        result = vishu.predictive_cost_analysis(
            terraform_code,
            months=request.months,
            growth_rate=request.growth_rate,
            usage_pattern=request.usage_pattern
        )
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/vishu/cost-query")
async def vishu_cost_query(request: CostQueryRequest, db: Session = Depends(get_db)):
    """
    Answer cost-related questions using natural language
    Examples: "What will this cost in 6 months?", "Which resources are most expensive?"
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == request.workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        result = vishu.advanced_cost_query(terraform_code, request.query)
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/vishu/parse-resources/{workflow_id}")
async def vishu_parse_resources(workflow_id: str, db: Session = Depends(get_db)):
    """
    Parse and extract all resources from Terraform code
    """
    try:
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        terraform_code = vishu.read_terraform_file(workflow.code_path)
        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        result = vishu.parse_terraform_resources(terraform_code)
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== Terraform Code Management Endpoints =====

@app.get("/api/v1/workflows/{workflow_id}/code")
async def get_terraform_code(workflow_id: str):
    """
    Get the current Terraform code for a workflow
    """
    # Try database first, if available
    try:
        db = SessionLocal()
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == workflow_id
        ).first()

        if workflow:
            # Read Terraform file
            terraform_code = vishu.read_terraform_file(workflow.code_path)

            if terraform_code:
                # Get latest version info
                latest_version = db.query(CodeVersionModel).filter(
                    CodeVersionModel.workflow_id == workflow_id
                ).order_by(CodeVersionModel.version.desc()).first()

                db.close()
                return {
                    "success": True,
                    "workflow_id": workflow_id,
                    "terraform_code": terraform_code,
                    "file_path": workflow.code_path,
                    "file_name": workflow.code_file,
                    "current_version": latest_version.version if latest_version else 1,
                    "last_modified": latest_version.timestamp.isoformat() if latest_version else workflow.timestamp.isoformat()
                }
        db.close()
    except Exception as e:
        # Database failed, continue to in-memory fallback
        print(f"⚠️  Database query failed, trying in-memory: {e}")

    # Fallback to in-memory storage
    try:
        # Get workflow from in-memory history
        history = brahma.get_workflow_history()
        workflow = next((w for w in history if w["workflow_id"] == workflow_id), None)

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        # Get code path from workflow summary
        code_path = workflow.get("summary", {}).get("code_path")
        code_file = workflow.get("summary", {}).get("code_file")

        if not code_path:
            raise HTTPException(status_code=404, detail="Code path not found in workflow")

        # Read Terraform file
        terraform_code = vishu.read_terraform_file(code_path)

        if not terraform_code:
            raise HTTPException(status_code=404, detail="Terraform file not found")

        return {
            "success": True,
            "workflow_id": workflow_id,
            "terraform_code": terraform_code,
            "file_path": code_path,
            "file_name": code_file,
            "current_version": 1,
            "last_modified": workflow.get("timestamp")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get code: {str(e)}")

@app.post("/api/v1/workflows/{workflow_id}/code")
async def update_terraform_code(workflow_id: str, request: UpdateCodeRequest, db: Session = Depends(get_db)):
    """
    Update Terraform code for a workflow and save version history
    """
    try:
        # Fetch workflow from database
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        # Get current version number
        latest_version = db.query(CodeVersionModel).filter(
            CodeVersionModel.workflow_id == workflow_id
        ).order_by(CodeVersionModel.version.desc()).first()

        new_version = (latest_version.version + 1) if latest_version else 1

        # Save new version to database
        code_version = CodeVersionModel(
            workflow_id=workflow_id,
            version=new_version,
            terraform_code=request.terraform_code,
            file_path=workflow.code_path,
            modified_by="user",
            change_description=request.change_description,
            timestamp=datetime.utcnow()
        )
        db.add(code_version)

        # Update the actual file
        try:
            with open(workflow.code_path, 'w') as f:
                f.write(request.terraform_code)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to write file: {str(e)}")

        db.commit()

        return {
            "success": True,
            "workflow_id": workflow_id,
            "version": new_version,
            "message": "Terraform code updated successfully",
            "timestamp": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/workflows/{workflow_id}/code/versions")
async def get_code_versions(workflow_id: str, db: Session = Depends(get_db)):
    """
    Get version history of Terraform code edits
    """
    try:
        versions = db.query(CodeVersionModel).filter(
            CodeVersionModel.workflow_id == workflow_id
        ).order_by(CodeVersionModel.version.desc()).all()

        return {
            "success": True,
            "workflow_id": workflow_id,
            "versions": [
                {
                    "version": v.version,
                    "modified_by": v.modified_by,
                    "change_description": v.change_description,
                    "timestamp": v.timestamp.isoformat(),
                    "code_length": len(v.terraform_code)
                }
                for v in versions
            ],
            "total_versions": len(versions)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/workflows/{workflow_id}/code/versions/{version}")
async def get_code_version(workflow_id: str, version: int, db: Session = Depends(get_db)):
    """
    Get specific version of Terraform code
    """
    try:
        code_version = db.query(CodeVersionModel).filter(
            CodeVersionModel.workflow_id == workflow_id,
            CodeVersionModel.version == version
        ).first()

        if not code_version:
            raise HTTPException(status_code=404, detail="Code version not found")

        return {
            "success": True,
            "workflow_id": workflow_id,
            "version": code_version.version,
            "terraform_code": code_version.terraform_code,
            "modified_by": code_version.modified_by,
            "change_description": code_version.change_description,
            "timestamp": code_version.timestamp.isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/workflows/{workflow_id}/code/apply-suggestion")
async def apply_vishu_suggestion(workflow_id: str, request: UpdateCodeRequest, db: Session = Depends(get_db)):
    """
    Apply Vishu's suggested code changes
    """
    try:
        # Reuse update_terraform_code logic but mark as modified by Vishu
        workflow = db.query(WorkflowModel).filter(
            WorkflowModel.workflow_id == workflow_id
        ).first()

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        latest_version = db.query(CodeVersionModel).filter(
            CodeVersionModel.workflow_id == workflow_id
        ).order_by(CodeVersionModel.version.desc()).first()

        new_version = (latest_version.version + 1) if latest_version else 1

        code_version = CodeVersionModel(
            workflow_id=workflow_id,
            version=new_version,
            terraform_code=request.terraform_code,
            file_path=workflow.code_path,
            modified_by="vishu",
            change_description=request.change_description or "Applied Vishu's suggestion",
            timestamp=datetime.utcnow()
        )
        db.add(code_version)

        # Update the actual file
        with open(workflow.code_path, 'w') as f:
            f.write(request.terraform_code)

        db.commit()

        return {
            "success": True,
            "workflow_id": workflow_id,
            "version": new_version,
            "message": "Vishu's suggestion applied successfully",
            "timestamp": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
