from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import uvicorn

load_dotenv()

app = FastAPI(title="InfraX - IaC Generator")

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

class IaCRequest(BaseModel):
    prompt: str
    cloud_provider: str = "aws"  # aws, azure, gcp
    iac_tool: str = "terraform"  # terraform, cloudformation, pulumi

class IaCResponse(BaseModel):
    code: str
    file_path: str
    provider: str
    tool: str

@app.get("/")
def read_root():
    return {"message": "InfraX IaC Generator API", "status": "running"}

@app.post("/generate", response_model=IaCResponse)
async def generate_iac(request: IaCRequest):
    """Generate IaC code based on user prompt using GPT"""

    if not openai.api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set in environment")

    # Create output directory
    output_dir = Path(__file__).parent.parent.parent / "data" / "generated_code"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Build GPT prompt
    system_prompt = f"""You are an expert Infrastructure as Code (IaC) engineer specializing in {request.cloud_provider.upper()} and {request.iac_tool}.
Generate production-ready, well-commented infrastructure code based on the user's requirements.
Include best practices for security, scalability, and cost optimization.
Only output the code, no explanations before or after."""

    user_prompt = f"""Create {request.iac_tool} code for {request.cloud_provider} with the following requirements:

{request.prompt}

Generate complete, production-ready code with:
- Proper variable definitions
- Resource configurations
- Output definitions
- Security best practices
- Comments explaining key sections"""

    try:
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )

        generated_code = response.choices[0].message.content.strip()

        # Remove markdown code blocks if present
        if generated_code.startswith("```"):
            lines = generated_code.split("\n")
            generated_code = "\n".join(lines[1:-1])

        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = {
            "terraform": "tf",
            "cloudformation": "yaml",
            "pulumi": "py"
        }.get(request.iac_tool, "txt")

        filename = f"{request.cloud_provider}_{request.iac_tool}_{timestamp}.{file_extension}"
        file_path = output_dir / filename

        # Save to file
        with open(file_path, "w") as f:
            f.write(generated_code)

        return IaCResponse(
            code=generated_code,
            file_path=str(file_path),
            provider=request.cloud_provider,
            tool=request.iac_tool
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating IaC code: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)