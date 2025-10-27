# InfraX - Brahma

AI-powered Infrastructure as Code (IaC) orchestration platform that automates cloud infrastructure design, cost optimization, and Terraform code generation.

## Overview

InfraX uses a multi-agent AI system (Brahma) powered by GPT-4 to transform natural language requirements into production-ready infrastructure code with built-in cost optimization and security best practices.

## Current Features ✅

### Core System
- **Intelligent Planning**: Auto-selects optimal cloud provider and region based on location
- **Multi-Agent Architecture**: Specialized agents for service selection, cost optimization, and code generation
- **Cost Optimization**: AI-driven cost analysis targeting 40-60% savings
- **IaC Generation**: Production-ready Terraform code with security, HA, and monitoring built-in
- **Architecture Visualization**: Interactive Mermaid diagrams with service descriptions
- **Cloud Pricing**: AI-powered pricing estimates across AWS, Azure, GCP

### Frontend (React + TypeScript)
- Vintage black/white/red themed UI with glassmorphism effects
- Real-time workflow creation and tracking with progress indicators
- Interactive architecture diagrams with hover tooltips
- Workflow history management with PostgreSQL persistence
- Vishu AI chat assistant for infrastructure queries
- Advanced AI features panel
- Terraform code editor with syntax highlighting

### Backend (FastAPI + Python)
- RESTful API with CORS support
- PostgreSQL database (Neon) for workflow persistence
- Multi-cloud support: AWS, Azure, GCP
- OpenAI GPT-4 integration for all AI capabilities

## Tech Stack

**Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Mermaid.js, Axios
**Backend**: Python 3.8+, FastAPI, SQLAlchemy, OpenAI GPT-4
**Database**: PostgreSQL (Neon)
**IaC Output**: Terraform
**Styling**: Dark vintage theme (Black #0a0a0a, White #f5f5f5, Red #dc2626)

## Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- OpenAI API key
- PostgreSQL database (Neon or local)

### Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add: OPENAI_API_KEY=your-key-here

# Start server
python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5174
```

## Usage

1. Navigate to `http://localhost:5174`
2. Click "Create New Workflow"
3. Enter project description and requirements
4. Brahma AI generates:
   - Complete infrastructure architecture
   - Cost optimization recommendations
   - Production-ready Terraform code
   - Interactive architecture diagram
5. Review, customize, and download generated code

## API Endpoints

```
POST /api/v1/workflows/intelligent  - Create workflow with AI planning
GET  /api/v1/workflows              - List all workflows
GET  /api/v1/workflows/{id}         - Get workflow details
GET  /health                        - Health check
```

## Project Structure

```
InfraX/
├── backend/
│   ├── brahma/
│   │   ├── agents/          # AI agents (service selection, cost optimization, IaC generation)
│   │   ├── core/            # Orchestrator
│   │   └── tools/           # Intelligent planner, diagram generator, cloud pricing
│   ├── api/                 # FastAPI server
│   └── database.py          # PostgreSQL models
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Dashboard, Workflows, CreateWorkflow, WorkflowDetails
│   │   └── api/            # API client
└── data/
    ├── generated_code/      # Terraform output
    └── diagrams/            # Mermaid diagrams
```

## Roadmap 🚀

### Phase 1: Core Platform (✅ Complete)
- Multi-agent AI system
- Terraform code generation
- Cost optimization
- Frontend dashboard
- Database persistence

### Phase 2: Enhanced Features (In Progress)
- [ ] User authentication & authorization
- [ ] Multi-user workspace support
- [ ] Live cloud pricing API integration (AWS/Azure/GCP)
- [ ] Infrastructure validation and testing
- [ ] Compliance scanning (SOC2, HIPAA, PCI-DSS)
- [ ] Multi-environment management (dev/staging/prod)

### Phase 3: Deployment & Automation
- [ ] Actual cloud deployment orchestration
- [ ] CI/CD pipeline integration
- [ ] Terraform state management
- [ ] Drift detection and remediation
- [ ] Disaster recovery planning
- [ ] Infrastructure migration tools

### Phase 4: Advanced Capabilities
- [ ] Kubernetes and container orchestration support
- [ ] Serverless architecture patterns
- [ ] Cost anomaly detection and alerts
- [ ] Infrastructure recommendations based on usage patterns
- [ ] Team collaboration features
- [ ] Version control integration (GitHub/GitLab)

## Performance Targets

- Workflow execution: < 2 minutes end-to-end
- Code generation: 600-1000 lines of Terraform
- Diagram generation: < 30 seconds
- Cost analysis: < 15 seconds

## Key Innovations

1. **Location-Aware Intelligence**: Automatically selects optimal cloud provider and region
2. **Multi-Agent Specialization**: 4 specialized AI agents working collaboratively
3. **Cost-First Approach**: Optimization built into every step
4. **Production-Ready Output**: Security, monitoring, and HA included by default
5. **Interactive Visualization**: React-compatible Mermaid diagrams with service tooltips

## License

Proprietary

## Support

For issues and feature requests, contact the development team.

---

**Status**: Production-Ready (Full-Stack Application)
**Last Updated**: January 2025
**Version**: 1.5
