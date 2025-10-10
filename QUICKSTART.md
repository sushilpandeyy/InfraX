# InfraX - Quick Start Guide

## Running the Brahma IaC Generation API

### Prerequisites
- Python 3.10+ installed
- `uv` package manager (already installed via Homebrew)

### Step 1: Install Dependencies

```bash
cd /Users/sushilpandey/Documents/InfraX/backend

# Activate virtual environment and install packages
source .venv/bin/activate
uv pip install -r requirements.txt
```

### Step 2: Start the API Server

```bash
# Make sure you're in the backend directory
cd /Users/sushilpandey/Documents/InfraX/backend

# Activate virtual environment
source .venv/bin/activate

# Start the FastAPI server
python api/main.py
```

The server will start at: **http://localhost:8000**

### Step 3: Test with Your Prompts

#### Option A: Using cURL

**Generate AWS Terraform:**
```bash
curl -X POST http://localhost:8000/api/generate-iac \
  -H "Content-Type: application/json" \
  -d '{
    "cloud_provider": "aws",
    "iac_type": "terraform",
    "services": [
      {"type": "compute", "instance_type": "t3.medium"},
      {"type": "storage"},
      {"type": "database", "engine": "mysql", "instance_class": "db.t3.small"}
    ],
    "environment": "production",
    "project_name": "my-awesome-app"
  }'
```

**Generate Azure Terraform:**
```bash
curl -X POST http://localhost:8000/api/generate-iac \
  -H "Content-Type: application/json" \
  -d '{
    "cloud_provider": "azure",
    "iac_type": "terraform",
    "services": [
      {"type": "compute", "instance_type": "Standard_D2s_v3"},
      {"type": "storage"},
      {"type": "container", "node_count": 3}
    ],
    "environment": "dev",
    "project_name": "azure-app"
  }'
```

**Generate GCP Terraform:**
```bash
curl -X POST http://localhost:8000/api/generate-iac \
  -H "Content-Type: application/json" \
  -d '{
    "cloud_provider": "gcp",
    "iac_type": "terraform",
    "services": [
      {"type": "compute", "instance_type": "e2-medium"},
      {"type": "storage"},
      {"type": "container", "node_count": 2, "vm_size": "e2-standard-4"}
    ],
    "environment": "staging",
    "project_name": "gcp-app"
  }'
```

**Generate AWS ECS Container:**
```bash
curl -X POST http://localhost:8000/api/generate-iac \
  -H "Content-Type: application/json" \
  -d '{
    "cloud_provider": "aws",
    "iac_type": "terraform",
    "services": [
      {"type": "networking"},
      {"type": "container", "container_port": 8080, "cpu": "512", "memory": "1024"}
    ],
    "environment": "production",
    "project_name": "microservice"
  }'
```

**Generate Pulumi Code:**
```bash
curl -X POST http://localhost:8000/api/generate-iac \
  -H "Content-Type: application/json" \
  -d '{
    "cloud_provider": "aws",
    "iac_type": "pulumi",
    "services": [
      {"type": "compute", "instance_type": "t3.small"},
      {"type": "storage"},
      {"type": "networking"},
      {"type": "database", "engine": "mysql"}
    ],
    "environment": "dev",
    "project_name": "pulumi-app"
  }'
```

#### Option B: Using Python Script

Create a file `test_api.py`:

```python
import requests
import json

# API endpoint
url = "http://localhost:8000/api/generate-iac"

# Your infrastructure requirements
requirements = {
    "cloud_provider": "aws",  # aws, azure, or gcp
    "iac_type": "terraform",  # terraform, cloudformation, or pulumi
    "services": [
        {
            "type": "compute",
            "instance_type": "t3.medium"
        },
        {
            "type": "storage"
        },
        {
            "type": "database",
            "engine": "mysql",
            "instance_class": "db.t3.small"
        },
        {
            "type": "container",
            "container_port": 80,
            "cpu": "512",
            "memory": "1024"
        }
    ],
    "environment": "production",
    "project_name": "my-app",
    "region": "us-west-2"
}

# Make the request
response = requests.post(url, json=requirements)

# Print the result
if response.status_code == 200:
    result = response.json()
    if result["success"]:
        print(f"✓ Success!")
        print(f"Filename: {result['filename']}")
        print(f"Cloud Provider: {result['cloud_provider']}")
        print(f"IaC Type: {result['iac_type']}")
        print(f"\n--- Generated Code Preview (first 500 chars) ---")
        print(result['code'][:500])
        print(f"\n--- Security Notes ---")
        for note in result['security_notes']:
            print(f"  • {note}")
        print(f"\n--- Optimization Notes ---")
        for note in result['optimization_notes']:
            print(f"  • {note}")
    else:
        print(f"✗ Error: {result.get('error')}")
else:
    print(f"✗ HTTP Error: {response.status_code}")
    print(response.text)
```

Run it:
```bash
python test_api.py
```

#### Option C: Using the Interactive API Docs

1. Start the server (see Step 2)
2. Open your browser: **http://localhost:8000/docs**
3. You'll see Swagger UI with interactive API documentation
4. Click on "POST /api/generate-iac"
5. Click "Try it out"
6. Edit the JSON request body with your requirements
7. Click "Execute"
8. See the response with generated code!

### API Endpoints Reference

```
GET  /api/health              - Check API health
POST /api/generate-iac        - Generate IaC code
GET  /api/requests            - List all generation requests
GET  /api/requests/{id}       - Get specific request details
GET  /api/generated-iac       - List all generated files
GET  /api/templates           - Get supported services/templates
```

### Service Types Available

```python
"services": [
    {"type": "compute"},      # VMs/EC2 instances
    {"type": "storage"},      # S3/Blob/Cloud Storage
    {"type": "database"},     # RDS/SQL/Cloud SQL
    {"type": "networking"},   # VPC/VNet/Network
    {"type": "container"}     # ECS/AKS/GKE
]
```

### Service Configuration Options

**Compute:**
```json
{
    "type": "compute",
    "instance_type": "t3.medium"  // AWS: t3.*, Azure: Standard_*, GCP: e2-*
}
```

**Storage:**
```json
{
    "type": "storage"  // Uses defaults with best practices
}
```

**Database:**
```json
{
    "type": "database",
    "engine": "mysql",           // mysql, postgres, etc.
    "instance_class": "db.t3.small"
}
```

**Networking:**
```json
{
    "type": "networking"  // Creates VPC, subnets, security groups
}
```

**Container:**
```json
{
    "type": "container",
    "container_port": 80,
    "cpu": "256",
    "memory": "512",
    "node_count": 2  // For GKE/AKS
}
```

### Output Location

Generated IaC files are saved to:
```
/Users/sushilpandey/Documents/InfraX/data/generated_code/
```

Files are named: `{cloud}_{iac_type}_{timestamp}.{ext}`

Examples:
- `aws_terraform_20251007_142601.tf`
- `azure_terraform_20251007_142601.tf`
- `gcp_terraform_20251007_142601.tf`
- `aws_pulumi_20251007_142601.py`
- `aws_cloudformation_20251007_142601.yaml`

### Viewing Generated Files

```bash
# List all generated files
ls -lh /Users/sushilpandey/Documents/InfraX/data/generated_code/

# View a specific file
cat /Users/sushilpandey/Documents/InfraX/data/generated_code/aws_terraform_*.tf

# Get the latest file
ls -t /Users/sushilpandey/Documents/InfraX/data/generated_code/ | head -1
```

### Example Complete Workflow

```bash
# 1. Start the server (Terminal 1)
cd /Users/sushilpandey/Documents/InfraX/backend
source .venv/bin/activate
python api/main.py

# 2. In another terminal, generate code
curl -X POST http://localhost:8000/api/generate-iac \
  -H "Content-Type: application/json" \
  -d '{
    "cloud_provider": "aws",
    "iac_type": "terraform",
    "services": [
      {"type": "compute", "instance_type": "t3.medium"},
      {"type": "storage"},
      {"type": "database", "engine": "mysql"}
    ],
    "environment": "production",
    "project_name": "my-app"
  }' | jq '.'

# 3. View the generated file
ls -t /Users/sushilpandey/Documents/InfraX/data/generated_code/ | head -1
cat /Users/sushilpandey/Documents/InfraX/data/generated_code/$(ls -t /Users/sushilpandey/Documents/InfraX/data/generated_code/ | head -1)
```

### Troubleshooting

**Port already in use:**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9
```

**Module not found:**
```bash
# Reinstall dependencies
cd /Users/sushilpandey/Documents/InfraX/backend
source .venv/bin/activate
uv pip install -r requirements.txt
```

**Database errors:**
```bash
# The database will be created automatically on first run
# Location: /Users/sushilpandey/Documents/InfraX/data/infrastructure.db
```

### Next Steps

Once you've generated your IaC code:

1. **Review the code** - Check security notes and optimizations
2. **Customize** - Modify variables and configurations as needed
3. **Deploy** - Use terraform/pulumi/CloudFormation to deploy

For Terraform:
```bash
cd /Users/sushilpandey/Documents/InfraX/data/generated_code/
terraform init
terraform plan
terraform apply
```

For Pulumi:
```bash
cd /Users/sushilpandey/Documents/InfraX/data/generated_code/
pulumi stack init
pulumi up
```

---

**Happy Infrastructure Coding! 🚀**
