#!/usr/bin/env python3
"""
Brahma CLI - Command-line interface for the Brahma IaC system
"""

import sys
import os
import argparse
import json
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from brahma.core.orchestrator import BrahmaOrchestrator


def print_banner():
    """Print Brahma banner"""
    banner = """
╔══════════════════════════════════════════════════════════╗
║                    BRAHMA v1.0.0                         ║
║        Intelligent IaC Orchestration Platform            ║
║                                                          ║
║  AI-Powered Infrastructure as Code Generation            ║
╚══════════════════════════════════════════════════════════╝
"""
    print(banner)


def intelligent_mode():
    """Run intelligent planning mode - simplest way to use Brahma"""
    print_banner()

    print("\n🤖 INTELLIGENT MODE")
    print("Just tell me what you want to build and where your users are!")
    print("I'll figure out the rest automatically.\n")

    print("=" * 60)

    # Get prompt
    prompt = input("📝 What do you want to build?\n> ").strip()

    if not prompt:
        print("❌ Description is required. Exiting.")
        return

    # Get location
    location = input("\n📍 Where are your users/services located? (e.g., India, Europe, USA, Global)\n> ").strip()

    # IaC tool
    print("\n🛠️  Select IaC tool:")
    print("  1. Terraform (default)")
    print("  2. CloudFormation")
    print("  3. Pulumi")

    tool_map = {"1": "terraform", "2": "cloudformation", "3": "pulumi"}
    tool_choice = input("\nChoice [1]: ").strip() or "1"
    iac_tool = tool_map.get(tool_choice, "terraform")

    # Initialize Brahma
    brahma = BrahmaOrchestrator()

    # Execute intelligent workflow
    result = brahma.execute_intelligent_workflow(
        prompt=prompt,
        location=location if location else None,
        iac_tool=iac_tool
    )

    # Print summary
    if result.get("success"):
        brahma.print_workflow_summary(result)

        # Show architecture
        architecture = result.get("summary", {}).get("architecture", {})
        if architecture:
            print("\n📐 Architecture Overview:")
            print(f"  Network: {architecture.get('network_design', 'N/A')}")
            print(f"  Scalability: {architecture.get('scalability', 'N/A')}")
            print(f"  Availability: {architecture.get('availability', 'N/A')}")

        # Ask if user wants to see the code
        show_code = input("\n📄 Would you like to see the generated code? (y/n) [n]: ").strip().lower()
        if show_code == 'y':
            iac_result = result.get("steps", {}).get("4_iac_generation", {})
            code = iac_result.get("code", "")
            print("\n" + "=" * 80)
            print("GENERATED IAC CODE")
            print("=" * 80)
            print(code)
            print("=" * 80)
    else:
        print(f"\n❌ Workflow failed: {result.get('error')}")


def interactive_workflow():
    """Run interactive workflow"""
    print_banner()

    print("\n🎯 Let's build your cloud infrastructure!\n")

    # Gather requirements
    print("=" * 60)
    print("APPLICATION REQUIREMENTS")
    print("=" * 60 + "\n")

    description = input("📝 Describe your application/infrastructure needs:\n> ").strip()

    if not description:
        print("❌ Description is required. Exiting.")
        return

    # Workload type
    print("\n🏗️  Select workload type:")
    print("  1. Web Application")
    print("  2. API/Microservices")
    print("  3. Data Processing/Analytics")
    print("  4. Machine Learning")
    print("  5. Database/Storage")
    print("  6. Other/General")

    workload_map = {
        "1": "web",
        "2": "api",
        "3": "data",
        "4": "ml",
        "5": "database",
        "6": "general"
    }

    workload_choice = input("\nChoice [1]: ").strip() or "1"
    workload_type = workload_map.get(workload_choice, "general")

    # Scale
    print("\n📊 Expected scale:")
    print("  1. Small (dev/test, low traffic)")
    print("  2. Medium (production, moderate traffic)")
    print("  3. Large (enterprise, high traffic)")

    scale_map = {"1": "small", "2": "medium", "3": "large"}
    scale_choice = input("\nChoice [2]: ").strip() or "2"
    scale = scale_map.get(scale_choice, "medium")

    # Cloud provider
    print("\n☁️  Select cloud provider:")
    print("  1. AWS")
    print("  2. Azure")
    print("  3. GCP")
    print("  4. Compare all providers")

    provider_map = {"1": "aws", "2": "azure", "3": "gcp", "4": "compare"}
    provider_choice = input("\nChoice [1]: ").strip() or "1"
    cloud_provider = provider_map.get(provider_choice, "aws")

    # IaC tool
    print("\n🛠️  Select IaC tool:")
    print("  1. Terraform")
    print("  2. CloudFormation (AWS only)")
    print("  3. Pulumi")

    tool_map = {"1": "terraform", "2": "cloudformation", "3": "pulumi"}
    tool_choice = input("\nChoice [1]: ").strip() or "1"
    iac_tool = tool_map.get(tool_choice, "terraform")

    # Budget
    print("\n💰 Budget constraint:")
    print("  1. Low ($0-500/month)")
    print("  2. Moderate ($500-2000/month)")
    print("  3. High ($2000+/month)")

    budget_choice = input("\nChoice [2]: ").strip() or "2"

    # Build requirements dictionary
    requirements = {
        "description": description,
        "workload_type": workload_type,
        "scale": scale,
        "cloud_provider": cloud_provider,
        "iac_tool": iac_tool,
        "budget": budget_choice,
        "current_cost": 0
    }

    # Initialize Brahma
    brahma = BrahmaOrchestrator()

    # Handle comparison mode
    if cloud_provider == "compare":
        requirements["cloud_provider"] = "aws"  # Default for comparison
        result = brahma.compare_cloud_providers(requirements)

        if result.get("success"):
            print("\n" + "=" * 60)
            print("CLOUD PROVIDER COMPARISON")
            print("=" * 60)

            for provider, provider_result in result.get("comparisons", {}).items():
                if provider_result.get("success"):
                    print(f"\n{provider.upper()}:")
                    print(f"  Services: {len(provider_result.get('recommendations', []))}")
                    print(f"  Recommendations available")

        return

    # Execute workflow
    result = brahma.execute_full_workflow(requirements)

    # Print summary
    if result.get("success"):
        brahma.print_workflow_summary(result)

        # Ask if user wants to see the code
        show_code = input("\n Would you like to see the generated code? (y/n) [n]: ").strip().lower()
        if show_code == 'y':
            iac_result = result.get("steps", {}).get("3_iac_generation", {})
            code = iac_result.get("code", "")
            print("\n" + "=" * 80)
            print("GENERATED IAC CODE")
            print("=" * 80)
            print(code)
            print("=" * 80)
    else:
        print(f"\n❌ Workflow failed: {result.get('error')}")


def service_selection_mode(args):
    """Run only service selection"""
    print_banner()
    print("\n🔍 Service Selection Mode\n")

    requirements = {
        "description": args.description,
        "workload_type": args.workload or "general",
        "scale": args.scale or "medium",
        "cloud_provider": args.provider or "aws"
    }

    brahma = BrahmaOrchestrator()
    result = brahma.get_service_recommendations(requirements)

    if result.get("success"):
        print(f"\n✅ Selected {len(result.get('recommendations', []))} services")
        print("\nRecommendations:")
        for rec in result.get("recommendations", []):
            print(f"  - {rec.get('category')}: {rec.get('service')}")

        print(f"\n\nAI Analysis:\n{result.get('ai_analysis')}")
    else:
        print(f"❌ Error: {result.get('error')}")


def cost_analysis_mode(args):
    """Run only cost analysis"""
    print_banner()
    print("\n💰 Cost Optimization Mode\n")

    if args.config_file:
        with open(args.config_file, 'r') as f:
            infrastructure = json.load(f)
    else:
        print("❌ Config file required for cost analysis mode")
        print("Use: --config-file <path-to-config.json>")
        return

    brahma = BrahmaOrchestrator()
    result = brahma.get_cost_analysis(infrastructure)

    if result.get("success"):
        print(f"✅ Estimated Monthly Savings: ${result.get('estimated_monthly_savings', 0):.2f}")
        print(f"\n{result.get('optimization_recommendations')}")
    else:
        print(f"❌ Error: {result.get('error')}")


def iac_generation_mode(args):
    """Run only IaC generation"""
    print_banner()
    print("\n🏗️  IaC Generation Mode\n")

    if args.config_file:
        with open(args.config_file, 'r') as f:
            config = json.load(f)
    else:
        print("❌ Config file required for IaC generation mode")
        print("Use: --config-file <path-to-config.json>")
        return

    brahma = BrahmaOrchestrator()
    result = brahma.generate_iac_only(config)

    if result.get("success"):
        print(f"✅ Generated code: {result.get('filename')}")
        print(f"📁 Location: {result.get('file_path')}")
    else:
        print(f"❌ Error: {result.get('error')}")


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Brahma - Intelligent IaC Orchestration Platform",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Interactive mode (default)
    subparsers.add_parser("interactive", help="Run interactive workflow (default)")

    # Service selection mode
    service_parser = subparsers.add_parser("services", help="Service selection only")
    service_parser.add_argument("description", help="Application description")
    service_parser.add_argument("--provider", choices=["aws", "azure", "gcp"], help="Cloud provider")
    service_parser.add_argument("--workload", help="Workload type")
    service_parser.add_argument("--scale", choices=["small", "medium", "large"], help="Expected scale")

    # Cost analysis mode
    cost_parser = subparsers.add_parser("costs", help="Cost analysis only")
    cost_parser.add_argument("--config-file", required=True, help="Infrastructure config JSON file")

    # IaC generation mode
    iac_parser = subparsers.add_parser("generate", help="IaC generation only")
    iac_parser.add_argument("--config-file", required=True, help="Generation config JSON file")

    args = parser.parse_args()

    # Default to interactive mode
    if not args.command or args.command == "interactive":
        interactive_workflow()
    elif args.command == "services":
        service_selection_mode(args)
    elif args.command == "costs":
        cost_analysis_mode(args)
    elif args.command == "generate":
        iac_generation_mode(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)
