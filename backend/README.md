# InfraX - Simple IaC Generator

A simple CLI tool that uses GPT-4 to generate Infrastructure as Code based on natural language prompts.

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/sushilpandey/Documents/InfraX/backend
pip install -r requirements.txt
```

### 2. Set Up OpenAI API Key

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# Get your key from: https://platform.openai.com/api-keys
```

Your `.env` file should look like:
```
OPENAI_API_KEY=sk-...your-key-here...
```

### 3. Start the Server

In one terminal:
```bash
python3 api/main.py
```

The server will start at `http://localhost:8000`

### 4. Run the CLI

In another terminal:
```bash
cd /Users/sushilpandey/Documents/InfraX/backend
python3 cli.py
```

## Usage Example

```
What infrastructure do you want to create?
📝 Your prompt: Create a web application with EC2 instance, RDS database, and S3 bucket

Select cloud provider:
  1. AWS (default)
  2. Azure
  3. GCP
Choice [1]: 1

Select IaC tool:
  1. Terraform (default)
  2. CloudFormation
  3. Pulumi
Choice [1]: 1
```

The tool will generate IaC code and save it to `../data/generated_code/`

## Features

- 🤖 AI-powered IaC generation using GPT-4
- ☁️ Supports AWS, Azure, and GCP
- 🛠️ Supports Terraform, CloudFormation, and Pulumi
- 💾 Automatically saves generated code
- 📋 Interactive CLI interface

## Generated Files Location

All generated IaC files are saved in:
```
/Users/sushilpandey/Documents/InfraX/data/generated_code/
```

Files are named: `{provider}_{tool}_{timestamp}.{extension}`

Example: `aws_terraform_20241007_143022.tf`
