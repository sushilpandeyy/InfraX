#!/usr/bin/env python3
"""
InfraX CLI - Interactive IaC Code Generator
"""
import requests
import sys
import json
from pathlib import Path

API_URL = "http://localhost:8000"

def print_banner():
    banner = """
╔═══════════════════════════════════════╗
║        InfraX - IaC Generator         ║
║   AI-Powered Infrastructure as Code   ║
╚═══════════════════════════════════════╝
"""
    print(banner)

def check_server():
    """Check if the FastAPI server is running"""
    try:
        response = requests.get(f"{API_URL}/", timeout=2)
        if response.status_code == 200:
            return True
    except requests.exceptions.RequestException:
        return False
    return False

def generate_iac(prompt, cloud_provider="aws", iac_tool="terraform"):
    """Send request to generate IaC code"""
    try:
        payload = {
            "prompt": prompt,
            "cloud_provider": cloud_provider,
            "iac_tool": iac_tool
        }

        print(f"\n🔄 Generating {iac_tool} code for {cloud_provider.upper()}...")
        print("⏳ Please wait, this may take a few seconds...\n")

        response = requests.post(
            f"{API_URL}/generate",
            json=payload,
            timeout=60
        )

        if response.status_code == 200:
            result = response.json()
            return result
        else:
            error_detail = response.json().get("detail", "Unknown error")
            print(f"❌ Error: {error_detail}")
            return None

    except requests.exceptions.Timeout:
        print("❌ Request timed out. Please try again.")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {str(e)}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return None

def display_result(result):
    """Display the generated IaC code and file location"""
    if not result:
        return

    print("✅ Code generated successfully!\n")
    print("=" * 80)
    print(f"Provider: {result['provider'].upper()}")
    print(f"Tool: {result['tool'].upper()}")
    print(f"File saved to: {result['file_path']}")
    print("=" * 80)
    print("\nGenerated Code:\n")
    print("-" * 80)
    print(result['code'])
    print("-" * 80)
    print(f"\n💾 Your IaC code has been saved to:\n   {result['file_path']}\n")

def interactive_mode():
    """Run the CLI in interactive mode"""
    print_banner()

    # Check if server is running
    if not check_server():
        print("❌ Error: FastAPI server is not running!")
        print("\nPlease start the server first:")
        print("   cd /Users/sushilpandey/Documents/InfraX/backend")
        print("   python3 api/main.py")
        print("\nOr run in a separate terminal:")
        print("   uvicorn api.main:app --reload")
        sys.exit(1)

    print("✅ Connected to InfraX API\n")

    # Get user input
    print("What infrastructure do you want to create?")
    print("(Describe your requirements in plain English)\n")
    prompt = input("📝 Your prompt: ").strip()

    if not prompt:
        print("❌ No prompt provided. Exiting.")
        sys.exit(1)

    print("\n" + "-" * 80)

    # Cloud provider selection
    print("\nSelect cloud provider:")
    print("  1. AWS (default)")
    print("  2. Azure")
    print("  3. GCP")
    provider_choice = input("\nChoice [1]: ").strip() or "1"

    provider_map = {"1": "aws", "2": "azure", "3": "gcp"}
    cloud_provider = provider_map.get(provider_choice, "aws")

    # IaC tool selection
    print("\nSelect IaC tool:")
    print("  1. Terraform (default)")
    print("  2. CloudFormation")
    print("  3. Pulumi")
    tool_choice = input("\nChoice [1]: ").strip() or "1"

    tool_map = {"1": "terraform", "2": "cloudformation", "3": "pulumi"}
    iac_tool = tool_map.get(tool_choice, "terraform")

    # Generate IaC code
    result = generate_iac(prompt, cloud_provider, iac_tool)

    # Display result
    display_result(result)

def main():
    """Main entry point"""
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print("InfraX CLI - IaC Generator")
        print("\nUsage:")
        print("  python3 cli.py           # Interactive mode")
        print("  python3 cli.py --help    # Show this help")
        sys.exit(0)

    try:
        interactive_mode()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
        sys.exit(0)

if __name__ == "__main__":
    main()
