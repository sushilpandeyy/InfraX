# InfraX - Intelligent IaC Orchestration Platform

## Project Overview
This project develops an intelligent Infrastructure as Code (IaC) orchestration platform using three specialized AI agents that work together to automate cloud infrastructure management.

## Core AI Agents

### 1. Service Selection Agent
- Analyzes application requirements to recommend optimal cloud services
- Supports AWS, Azure, and GCP
- Provides service comparison and selection logic

### 2. Cost Optimization Agent
- Performs real-time cost analysis
- Predictive modeling for cost forecasting
- Resource right-sizing recommendations
- Target: 40-60% reduction in cloud spending
- ML-driven demand prediction and automated resource scaling

### 3. IaC Generation Agent
- Creates production-ready infrastructure code
- Supports Terraform, CloudFormation, and Pulumi
- Built-in best practices and security standards
- Generates deployment-ready scripts

## Platform Features

### Unified Workflow Engine
- Orchestrates all three agents seamlessly
- Requirement ingestion and processing
- Service selection pipeline
- Cost analysis integration
- Code generation workflow
- Automated deployment capabilities

### Architecture
- Microservices architecture
- Docker/Kubernetes deployment
- React frontend for user interface
- Cloud provider API integrations (AWS, Azure, GCP)
- CI/CD platform integration
- Monitoring tools integration

## Key Benefits
- **80% reduction** in infrastructure setup time
- **40-60% cost savings** through optimization
- Eliminates over-provisioning
- Provides senior cloud manager expertise at scale
- Suitable for organizations of all sizes

## Tech Stack (Local Development)

### Backend
- **Runtime**: Python with FastAPI
- **Database**: SQLite (file-based)
- **AI/ML**: scikit-learn, pandas
- **Cloud SDKs**: boto3 (AWS), azure-sdk, google-cloud
- **Cache**: In-memory Python dictionaries

### Frontend
- **Framework**: React with TypeScript
- **Dev Server**: Vite
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

### Project Structure
```
InfraX/
├── backend/
│   ├── agents/
│   │   ├── service_selection.py
│   │   ├── cost_optimization.py
│   │   └── iac_generation.py
│   ├── api/
│   │   └── main.py
│   ├── models/
│   │   └── database.py
│   ├── templates/
│   │   ├── terraform/
│   │   ├── cloudformation/
│   │   └── pulumi/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── api/
│   ├── package.json
│   └── vite.config.ts
├── data/
│   ├── infrastructure.db
│   └── generated_code/
└── claude.md
```

## Development Commands

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py            # Start FastAPI server on http://localhost:8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev               # Start Vite dev server on http://localhost:5173
```

### Testing Commands
```bash
# Backend
cd backend
pytest                    # Run Python tests
black .                   # Format Python code
flake8 .                  # Lint Python code

# Frontend
cd frontend
npm test                  # Run Jest tests
npm run lint              # Run ESLint
npm run type-check        # Run TypeScript checks
```

## Environment Setup
```bash
# Create project directories
mkdir -p backend/{agents,api,models,templates/{terraform,cloudformation,pulumi}}
mkdir -p frontend/src/{components,pages,context,api}
mkdir -p data/generated_code

# Initialize SQLite database
cd backend && python -c "import sqlite3; sqlite3.connect('../data/infrastructure.db').close()"
```

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/analyze-requirements` - Service Selection Agent
- `POST /api/optimize-costs` - Cost Optimization Agent
- `POST /api/generate-iac` - IaC Generation Agent
- `GET /api/workflows` - List workflow executions
- `POST /api/workflows` - Start new workflow