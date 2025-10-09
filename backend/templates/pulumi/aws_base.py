import pulumi
import pulumi_aws as aws

# Configuration
config = pulumi.Config()
environment = config.get("environment") or "dev"
project_name = config.get("project_name") or "infrax-project"
aws_region = config.get("aws_region") or "us-west-2"

# Common tags
common_tags = {
    "Environment": environment,
    "Project": project_name,
    "ManagedBy": "pulumi"
}

# Export configuration
pulumi.export("environment", environment)
pulumi.export("project_name", project_name)
pulumi.export("aws_region", aws_region)