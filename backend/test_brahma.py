#!/usr/bin/env python3
"""
Test script for Brahma - IaC Generation Agent
"""
import sys
import json
from agents.iac_generation import IaCGenerationAgent

def test_aws_terraform():
    """Test AWS Terraform generation"""
    print("\n=== Testing AWS Terraform Generation ===")
    agent = IaCGenerationAgent()

    requirements = {
        "cloud_provider": "aws",
        "iac_type": "terraform",
        "services": [
            {"type": "compute", "instance_type": "t3.small"},
            {"type": "storage"},
            {"type": "database", "engine": "mysql", "instance_class": "db.t3.small"}
        ],
        "environment": "test",
        "project_name": "brahma-test"
    }

    result = agent.generate_iac_code(requirements)

    if result["success"]:
        print(f"✓ Success!")
        print(f"  Filename: {result['filename']}")
        print(f"  Cloud Provider: {result['cloud_provider']}")
        print(f"  IaC Type: {result['iac_type']}")
        print(f"  Security Notes: {len(result['security_notes'])} rules applied")
        print(f"  Code length: {len(result['code'])} characters")
        return True
    else:
        print(f"✗ Failed: {result['error']}")
        return False

def test_azure_terraform():
    """Test Azure Terraform generation"""
    print("\n=== Testing Azure Terraform Generation ===")
    agent = IaCGenerationAgent()

    requirements = {
        "cloud_provider": "azure",
        "iac_type": "terraform",
        "services": [
            {"type": "compute", "instance_type": "Standard_B2s"},
            {"type": "storage"},
            {"type": "container", "node_count": 3}
        ],
        "environment": "test",
        "project_name": "brahma-azure-test"
    }

    result = agent.generate_iac_code(requirements)

    if result["success"]:
        print(f"✓ Success!")
        print(f"  Filename: {result['filename']}")
        print(f"  Code length: {len(result['code'])} characters")
        return True
    else:
        print(f"✗ Failed: {result['error']}")
        return False

def test_gcp_terraform():
    """Test GCP Terraform generation"""
    print("\n=== Testing GCP Terraform Generation ===")
    agent = IaCGenerationAgent()

    requirements = {
        "cloud_provider": "gcp",
        "iac_type": "terraform",
        "services": [
            {"type": "compute", "instance_type": "e2-medium"},
            {"type": "storage"},
            {"type": "container", "node_count": 2}
        ],
        "environment": "test",
        "project_name": "brahma-gcp-test"
    }

    result = agent.generate_iac_code(requirements)

    if result["success"]:
        print(f"✓ Success!")
        print(f"  Filename: {result['filename']}")
        print(f"  Code length: {len(result['code'])} characters")
        return True
    else:
        print(f"✗ Failed: {result['error']}")
        return False

def test_aws_pulumi():
    """Test AWS Pulumi generation"""
    print("\n=== Testing AWS Pulumi Generation ===")
    agent = IaCGenerationAgent()

    requirements = {
        "cloud_provider": "aws",
        "iac_type": "pulumi",
        "services": [
            {"type": "compute", "instance_type": "t3.micro"},
            {"type": "storage"},
            {"type": "networking"},
            {"type": "database", "engine": "mysql"}
        ],
        "environment": "test",
        "project_name": "brahma-pulumi-test"
    }

    result = agent.generate_iac_code(requirements)

    if result["success"]:
        print(f"✓ Success!")
        print(f"  Filename: {result['filename']}")
        print(f"  Code length: {len(result['code'])} characters")
        return True
    else:
        print(f"✗ Failed: {result['error']}")
        return False

def test_aws_cloudformation():
    """Test AWS CloudFormation generation"""
    print("\n=== Testing AWS CloudFormation Generation ===")
    agent = IaCGenerationAgent()

    requirements = {
        "cloud_provider": "aws",
        "iac_type": "cloudformation",
        "services": [
            {"type": "compute", "instance_type": "t3.micro"},
            {"type": "storage"}
        ],
        "environment": "test",
        "project_name": "brahma-cf-test"
    }

    result = agent.generate_iac_code(requirements)

    if result["success"]:
        print(f"✓ Success!")
        print(f"  Filename: {result['filename']}")
        print(f"  Code length: {len(result['code'])} characters")
        return True
    else:
        print(f"✗ Failed: {result['error']}")
        return False

def test_aws_ecs():
    """Test AWS ECS/Container generation"""
    print("\n=== Testing AWS ECS Generation ===")
    agent = IaCGenerationAgent()

    requirements = {
        "cloud_provider": "aws",
        "iac_type": "terraform",
        "services": [
            {"type": "networking"},
            {"type": "container", "container_port": 8080, "cpu": "512", "memory": "1024"}
        ],
        "environment": "test",
        "project_name": "brahma-ecs-test"
    }

    result = agent.generate_iac_code(requirements)

    if result["success"]:
        print(f"✓ Success!")
        print(f"  Filename: {result['filename']}")
        print(f"  Code contains ECS: {'aws_ecs_cluster' in result['code']}")
        print(f"  Code contains ALB: {'aws_lb' in result['code']}")
        return True
    else:
        print(f"✗ Failed: {result['error']}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Brahma - IaC Generation Agent Test Suite")
    print("=" * 60)

    tests = [
        test_aws_terraform,
        test_azure_terraform,
        test_gcp_terraform,
        test_aws_pulumi,
        test_aws_cloudformation,
        test_aws_ecs
    ]

    results = []
    for test in tests:
        try:
            results.append(test())
        except Exception as e:
            print(f"✗ Test crashed: {str(e)}")
            results.append(False)

    print("\n" + "=" * 60)
    print(f"Test Results: {sum(results)}/{len(results)} passed")
    print("=" * 60)

    if all(results):
        print("✓ All tests passed!")
        sys.exit(0)
    else:
        print("✗ Some tests failed")
        sys.exit(1)
