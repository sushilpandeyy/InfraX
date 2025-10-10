# InfraX - Brahma: Intelligent IaC Orchestration Platform

## Project Overview
InfraX is an intelligent Infrastructure as Code (IaC) orchestration platform powered by "Brahma" - a multi-agent AI system that automates cloud infrastructure management using GPT-4.

**Current Version:** 1.0 (Production-Ready for Code Generation)

---

## Brahma Architecture

### Core Components (All Operational ✅)

**1. Intelligent Planner Tool**
- Location: `backend/brahma/tools/intelligent_planner.py`
- Purpose: Analyzes natural language prompts and plans complete infrastructure
- Features:
  - Location-aware cloud provider selection (AWS/Azure/GCP)
  - Automatic region optimization for lowest latency
  - Complete architecture design
  - Service mapping for all components
  - Multi-cloud region knowledge base

**2. Service Selection Agent**
- Location: `backend/brahma/agents/service_selection.py`
- Purpose: Recommends optimal cloud services
- Features:
  - 200+ cloud services across AWS, Azure, GCP
  - Workload-specific recommendations
  - Service comparison and alternatives
  - Best practices application
  - Provider comparison mode

**3. Cost Optimization Agent**
- Location: `backend/brahma/agents/cost_optimization.py`
- Purpose: Analyzes costs and identifies savings (40-60% target)
- Features:
  - AI-powered cost analysis
  - Right-sizing recommendations
  - Reserved instance strategies
  - Storage tiering optimization
  - 12-month cost forecasting
  - Resource scheduling strategies

**4. IaC Generation Agent**
- Location: `backend/brahma/agents/iac_generation.py`
- Purpose: Generates production-ready Terraform code
- Features:
  - Terraform code only (fixed)
  - Security best practices built-in
  - Multi-AZ deployment configurations
  - Auto-scaling setup
  - Monitoring and logging included
  - Supports AWS, Azure, GCP

**5. Diagram Generator Tool**
- Location: `backend/brahma/tools/diagram_generator.py`
- Purpose: Creates visual architecture diagrams
- Features:
  - Mermaid diagram generation (React-compatible)
  - Network topology visualization
  - Service relationship mapping
  - Data flow diagrams
  - Interactive HTML preview
  - GitHub/GitLab compatible

**6. Unified Orchestrator**
- Location: `backend/brahma/core/orchestrator.py`
- Purpose: Coordinates all agents and tools
- Features:
  - Intelligent workflow mode (auto-planning)
  - Standard workflow mode (manual control)
  - 5-step automated process
  - Workflow history tracking
  - Complete result packaging

---

## Project Structure

```
InfraX/
├── backend/
│   ├── brahma/                    # Brahma AI System
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── service_selection.py
│   │   │   ├── cost_optimization.py
│   │   │   └── iac_generation.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── orchestrator.py
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── intelligent_planner.py
│   │   │   └── diagram_generator.py
│   │   ├── utils/
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── api/
│   │   └── main.py                # FastAPI server (simplified)
│   ├── templates/
│   │   └── terraform/
│   │       └── aws_base.tf
│   ├── requirements.txt
│   ├── cli.py                     # Demo CLI (not active)
│   └── .env.example
├── data/
│   ├── generated_code/            # Terraform files output
│   └── diagrams/                  # Mermaid diagrams + HTML previews
├── PROJECT_VISION.txt             # Complete project vision document
└── CLAUDE.md                      # This file (to be gitignored)
```

---

## Tech Stack

### Backend
- **Runtime:** Python 3.8+
- **Framework:** FastAPI (REST API)
- **AI:** OpenAI GPT-4 (all agents and tools)
- **IaC Output:** Terraform only
- **Visualization:** Mermaid.js
- **Storage:** File-based (local development)

### Dependencies
```
fastapi
uvicorn
pydantic
openai
python-dotenv
requests
```

### Future Frontend
- **Framework:** React with TypeScript (planned)
- **Visualization:** Mermaid React component
- **State:** React Context API
- **Styling:** Tailwind CSS

---

## Environment Setup

### Required Environment Variables
```bash
# .env file
OPENAI_API_KEY=sk-your-key-here
```

### Setup Commands
```bash
# Backend setup
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your OpenAI API key to .env
```

---

## Workflow Modes

### Mode 1: Intelligent Workflow (Recommended)
**Input:** Natural language prompt + optional location

**Process:**
1. 🧠 Intelligent Planning - Auto-selects cloud provider & region
2. 💰 Cost Optimization - Identifies savings opportunities
3. 📋 Service Refinement - Maps to specific services
4. 🏗️ IaC Generation - Creates Terraform code
5. 🎨 Diagram Generation - Visual architecture (Mermaid)

**Example:**
```python
from brahma.core.orchestrator import BrahmaOrchestrator

brahma = BrahmaOrchestrator()
result = brahma.execute_intelligent_workflow(
    prompt="Build e-commerce platform for Indian users with payment gateway",
    location="India"
)

# Returns:
# - cloud_provider: "aws"
# - region: "ap-south-1"
# - terraform_code: Complete .tf file
# - mermaid_diagram: Architecture visualization
# - estimated_savings: Cost optimization suggestions
```

### Mode 2: Standard Workflow
**Input:** Structured requirements with cloud provider specified

```python
result = brahma.execute_full_workflow({
    "description": "Web application with database",
    "workload_type": "web",
    "scale": "medium",
    "cloud_provider": "aws"  # User specifies provider
})
```

---

## Output Files

### Generated Files Location

**Terraform Code:**
- Path: `/data/generated_code/`
- Format: `{provider}_terraform_{timestamp}.tf`
- Example: `aws_terraform_20241008_143022.tf`

**Mermaid Diagrams:**
- Path: `/data/diagrams/`
- Formats:
  - `.mmd` - Mermaid code (React-compatible)
  - `.html` - Interactive HTML preview
- Example: `aws_diagram_20241008_143022.mmd`

**Workflow Results:**
Complete JSON with all step outputs including:
- Infrastructure plan
- Cost analysis
- Service recommendations
- Generated code
- Diagram code
- Provider selection rationale

---

## Key Features

### ✅ Implemented (V1.0)
- Multi-agent AI system with specialized roles
- Natural language infrastructure planning
- Location-aware cloud provider selection
- Automatic region optimization
- Production-ready Terraform generation
- Cost optimization (40-60% target)
- Security best practices built-in
- Mermaid diagram generation
- React-compatible visualizations
- Multi-cloud support (AWS, Azure, GCP)

### ⏳ Planned (Future Versions)
- Actual deployment orchestration
- Real-time cloud pricing API integration
- Infrastructure validation and testing
- Existing infrastructure migration
- Compliance scanning (SOC2, HIPAA, PCI)
- Multi-environment management (dev/staging/prod)
- Disaster recovery planning
- React frontend development
- User authentication
- Database persistence

---

## Development Guidelines

### Adding New Agents
1. Create new agent file in `backend/brahma/agents/`
2. Implement agent class with GPT-4 integration
3. Add agent to orchestrator initialization
4. Update workflow steps as needed

### Adding New Tools
1. Create tool file in `backend/brahma/tools/`
2. Implement tool class with specific functionality
3. Integrate with orchestrator if needed
4. Add to relevant workflow steps

### Code Standards
- All agents use GPT-4 for intelligence
- Error handling in all methods
- Return structured dictionaries with `success` field
- Include timestamps in all outputs
- Use type hints for all functions
- Document all public methods

---

## Important Notes

### Current Limitations
- IaC output is Terraform only (CloudFormation/Pulumi removed for simplicity)
- Diagram format is Mermaid only (best for React integration)
- No actual deployment - only code generation
- Cost estimates are AI-based, not real-time pricing
- File-based storage (no database yet)
- No user authentication
- Local development only

### Production Considerations
Before production deployment, add:
1. User authentication and authorization
2. Database for workflow persistence (PostgreSQL)
3. Cloud storage for generated files (S3/Azure Blob)
4. Rate limiting and API quotas
5. Monitoring and logging
6. Frontend application
7. CI/CD pipeline
8. Infrastructure validation

---

## API Integration (Future)

### Planned FastAPI Endpoints
```
POST /api/v1/workflows/intelligent
POST /api/v1/workflows/standard
GET  /api/v1/workflows/{workflow_id}
GET  /api/v1/workflows
GET  /api/v1/diagrams/{workflow_id}
GET  /api/v1/terraform/{workflow_id}
```

---

## Performance Targets

- Workflow execution: < 2 minutes end-to-end
- Code generation: 600-1000 lines of Terraform
- Diagram generation: < 30 seconds
- Cost analysis: < 15 seconds
- Service recommendations: < 20 seconds

---

## Innovation Highlights

**What Makes Brahma Unique:**

1. **Multi-Agent Specialization** - 4 specialized agents working together
2. **Location-Aware Intelligence** - Automatic provider/region selection
3. **Full Automation** - Natural language → Production-ready Terraform
4. **Cost-First Approach** - Optimization built into every step
5. **Production-Ready Output** - Security, monitoring, HA included
6. **React Integration** - Mermaid diagrams for easy frontend use

---

## Version History

**v1.0 (Current)** - October 2024
- All core agents operational
- Intelligent planner tool
- Diagram generator tool
- Terraform-only output
- Mermaid-only diagrams
- Production-ready for code generation

---

## Support & Documentation

- **Project Vision:** See `PROJECT_VISION.txt` for complete details
- **Tool Suggestions:** See tool recommendations document
- **Issues:** Track in GitHub issues (when repository is created)

---

**Last Updated:** October 2024
**Status:** Production-Ready (Code Generation)
**Next Milestone:** Frontend Development + Deployment Orchestration
