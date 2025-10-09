"""
Brahma Orchestrator
Unified workflow engine that coordinates all three agents
"""

from typing import Dict, Any, Optional
from datetime import datetime
import json

from brahma.agents.service_selection import ServiceSelectionAgent
from brahma.agents.cost_optimization import CostOptimizationAgent
from brahma.agents.iac_generation import IaCGenerationAgent
from brahma.tools.intelligent_planner import IntelligentPlanner
from brahma.tools.diagram_generator import DiagramGenerator


class BrahmaOrchestrator:
    """
    Main orchestrator for the Brahma IaC system
    Coordinates Service Selection, Cost Optimization, IaC Generation agents
    Plus Intelligent Planner and Diagram Generator
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Brahma with all agents and tools

        Args:
            api_key: OpenAI API key (optional, can use env variable)
        """
        self.service_agent = ServiceSelectionAgent(api_key=api_key)
        self.cost_agent = CostOptimizationAgent(api_key=api_key)
        self.iac_agent = IaCGenerationAgent(api_key=api_key)
        self.planner = IntelligentPlanner(api_key=api_key)
        self.diagram_generator = DiagramGenerator(api_key=api_key)

        self.workflow_history = []

    def execute_full_workflow(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the complete Brahma workflow:
        1. Service Selection
        2. Cost Optimization
        3. IaC Generation

        Args:
            requirements: Dictionary containing:
                - description: Application description
                - workload_type: Type of workload
                - scale: Expected scale
                - cloud_provider: Preferred cloud provider
                - iac_tool: IaC tool to use (terraform/cloudformation/pulumi)
                - budget: Budget constraints (optional)
                - current_cost: Current cost if migrating (optional)

        Returns:
            Complete workflow result with all agent outputs
        """
        workflow_id = f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        print(f"\n🚀 Starting Brahma Workflow: {workflow_id}")
        print("=" * 80)

        try:
            # Step 1: Service Selection
            print("\n📋 Step 1/3: Analyzing requirements and selecting optimal services...")
            services_result = self.service_agent.analyze_requirements(requirements)

            if not services_result.get("success"):
                return self._create_error_response(workflow_id, "Service Selection failed", services_result.get("error"))

            print(f"✅ Selected {len(services_result.get('recommendations', []))} services for {services_result.get('cloud_provider', 'unknown').upper()}")

            # Step 2: Cost Optimization
            print("\n💰 Step 2/3: Analyzing costs and generating optimization recommendations...")

            # Build infrastructure config for cost analysis
            infrastructure_config = {
                "cloud_provider": services_result.get("cloud_provider"),
                "services": services_result.get("recommendations", []),
                "usage_patterns": requirements.get("usage_patterns", "Standard business hours"),
                "current_cost": requirements.get("current_cost", 0)
            }

            cost_result = self.cost_agent.analyze_costs(infrastructure_config)

            if not cost_result.get("success"):
                print("⚠️  Cost optimization failed, continuing without cost analysis")
                cost_result = {"success": True, "strategies": {}}
            else:
                savings = cost_result.get("estimated_monthly_savings", 0)
                print(f"✅ Identified ${savings:.2f}/month in potential savings")

            # Step 3: IaC Generation
            print("\n🏗️  Step 3/3: Generating Infrastructure as Code...")

            iac_tool = requirements.get("iac_tool", "terraform")
            iac_result = self.iac_agent.generate_with_context(
                services_result=services_result,
                cost_result=cost_result,
                iac_tool=iac_tool
            )

            if not iac_result.get("success"):
                return self._create_error_response(workflow_id, "IaC Generation failed", iac_result.get("error"))

            print(f"✅ Generated {iac_tool} code: {iac_result.get('filename')}")
            print(f"📁 Saved to: {iac_result.get('file_path')}")

            # Create complete workflow result
            workflow_result = {
                "workflow_id": workflow_id,
                "success": True,
                "timestamp": datetime.utcnow().isoformat(),
                "steps": {
                    "1_service_selection": services_result,
                    "2_cost_optimization": cost_result,
                    "3_iac_generation": iac_result
                },
                "summary": {
                    "cloud_provider": services_result.get("cloud_provider"),
                    "iac_tool": iac_tool,
                    "services_count": len(services_result.get("recommendations", [])),
                    "estimated_savings": cost_result.get("estimated_monthly_savings", 0),
                    "code_file": iac_result.get("filename"),
                    "code_path": iac_result.get("file_path")
                }
            }

            # Store in history
            self.workflow_history.append(workflow_result)

            print("\n" + "=" * 80)
            print("✅ Brahma Workflow Completed Successfully!")
            print("=" * 80)

            return workflow_result

        except Exception as e:
            return self._create_error_response(workflow_id, "Workflow execution failed", str(e))

    def execute_intelligent_workflow(self, prompt: str, location: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute intelligent workflow using natural language prompt
        Automatically determines cloud provider, region, and services based on prompt and location

        NOTE: IaC tool is fixed to Terraform

        Args:
            prompt: Natural language description (e.g., "Build an e-commerce platform for Indian users")
            location: Geographic location/target audience (e.g., "India", "Europe", "Global")

        Returns:
            Complete workflow result with infrastructure plan and generated code
        """
        iac_tool = "terraform"  # Fixed to Terraform
        workflow_id = f"intelligent_workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        print(f"\n🤖 Starting Intelligent Brahma Workflow: {workflow_id}")
        print("=" * 80)
        print(f"📝 Prompt: {prompt}")
        print(f"📍 Location: {location or 'Auto-detect'}")
        print(f"🛠️  IaC Tool: Terraform (fixed)")
        print("=" * 80)

        try:
            # Step 1: Intelligent Planning - analyzes prompt and determines everything
            print("\n🧠 Step 1/4: Intelligent infrastructure planning...")
            plan_result = self.planner.plan_infrastructure(prompt, location)

            if not plan_result.get("success"):
                return self._create_error_response(workflow_id, "Intelligent planning failed", plan_result.get("error"))

            cloud_provider = plan_result.get("cloud_provider")
            region = plan_result.get("region")
            services = plan_result.get("service_plan", {}).get("services", [])

            print(f"✅ Planned for {cloud_provider.upper()} in {region}")
            print(f"✅ Selected {len(services)} services")
            print(f"   Rationale: {plan_result.get('location_rationale')}")

            # Step 2: Cost Optimization
            print("\n💰 Step 2/4: Analyzing costs and optimization opportunities...")
            infrastructure_config = {
                "cloud_provider": cloud_provider,
                "services": services,
                "usage_patterns": "Production workload",
                "current_cost": 0
            }

            cost_result = self.cost_agent.analyze_costs(infrastructure_config)

            if cost_result.get("success"):
                savings = cost_result.get("estimated_monthly_savings", 0)
                print(f"✅ Identified ${savings:.2f}/month in potential savings")
            else:
                print("⚠️  Cost optimization analysis skipped")
                cost_result = {"success": True, "strategies": {}}

            # Step 3: Refine service selection with cost optimization
            print("\n📋 Step 3/4: Refining service selection with optimizations...")
            refined_requirements = {
                "description": prompt,
                "workload_type": plan_result.get("requirements_analysis", {}).get("app_type", "general"),
                "scale": plan_result.get("requirements_analysis", {}).get("scale", "medium"),
                "cloud_provider": cloud_provider
            }

            services_result = self.service_agent.analyze_requirements(refined_requirements)
            print(f"✅ Service selection refined")

            # Step 4: Generate IaC
            print("\n🏗️  Step 4/4: Generating Infrastructure as Code...")
            iac_config = {
                "cloud_provider": cloud_provider,
                "iac_tool": iac_tool,
                "services": services,
                "requirements": {
                    "description": prompt,
                    "scale": plan_result.get("requirements_analysis", {}).get("scale", "medium"),
                    "region": region
                },
                "optimization_notes": cost_result.get("strategies", {})
            }

            iac_result = self.iac_agent.generate_iac(iac_config)

            if not iac_result.get("success"):
                return self._create_error_response(workflow_id, "IaC Generation failed", iac_result.get("error"))

            print(f"✅ Generated {iac_tool} code: {iac_result.get('filename')}")
            print(f"📁 Saved to: {iac_result.get('file_path')}")

            # Step 5: Generate Mermaid Diagram (React-compatible)
            print("\n🎨 Step 5/5: Generating infrastructure diagram (Mermaid for React)...")
            diagram_plan = {
                "cloud_provider": cloud_provider,
                "services": services,
                "architecture": plan_result.get("architecture", {}),
                "terraform_code": iac_result.get("code")
            }

            # Generate Mermaid diagram
            diagram_result = self.diagram_generator.generate_diagram(diagram_plan)

            # Create interactive HTML preview
            html_path = None
            if diagram_result.get("success"):
                mermaid_code = diagram_result.get("diagram_code")
                html_path = self.diagram_generator.create_interactive_html(mermaid_code, cloud_provider)
                print(f"✅ Mermaid diagram: {diagram_result.get('filename')}")
                print(f"✅ HTML preview: {html_path}")
            else:
                print(f"⚠️  Diagram generation failed: {diagram_result.get('error')}")

            # Create complete workflow result
            workflow_result = {
                "workflow_id": workflow_id,
                "success": True,
                "workflow_type": "intelligent",
                "timestamp": datetime.utcnow().isoformat(),
                "input": {
                    "prompt": prompt,
                    "location": location,
                    "iac_tool": iac_tool
                },
                "steps": {
                    "1_intelligent_planning": plan_result,
                    "2_cost_optimization": cost_result,
                    "3_service_refinement": services_result,
                    "4_iac_generation": iac_result,
                    "5_diagram_generation": diagram_result
                },
                "summary": {
                    "cloud_provider": cloud_provider,
                    "region": region,
                    "location_rationale": plan_result.get("location_rationale"),
                    "iac_tool": iac_tool,
                    "services_count": len(services),
                    "estimated_savings": cost_result.get("estimated_monthly_savings", 0),
                    "code_file": iac_result.get("filename"),
                    "code_path": iac_result.get("file_path"),
                    "architecture": plan_result.get("architecture", {}),
                    "mermaid_diagram": diagram_result.get("diagram_code"),
                    "diagram_file": diagram_result.get("filename"),
                    "html_preview": html_path
                }
            }

            # Store in history
            self.workflow_history.append(workflow_result)

            print("\n" + "=" * 80)
            print("✅ Intelligent Brahma Workflow Completed Successfully!")
            print("=" * 80)

            return workflow_result

        except Exception as e:
            return self._create_error_response(workflow_id, "Intelligent workflow execution failed", str(e))

    def get_service_recommendations(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute only service selection step

        Args:
            requirements: Application requirements

        Returns:
            Service recommendations
        """
        return self.service_agent.analyze_requirements(requirements)

    def get_cost_analysis(self, infrastructure: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute only cost optimization step

        Args:
            infrastructure: Infrastructure configuration

        Returns:
            Cost analysis and optimization recommendations
        """
        return self.cost_agent.analyze_costs(infrastructure)

    def generate_iac_only(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute only IaC generation step

        Args:
            config: IaC generation configuration

        Returns:
            Generated IaC code
        """
        return self.iac_agent.generate_iac(config)

    def compare_cloud_providers(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compare service recommendations across AWS, Azure, and GCP

        Args:
            requirements: Application requirements

        Returns:
            Comparison across all three cloud providers
        """
        print("\n🔍 Comparing cloud providers: AWS, Azure, GCP...")
        print("=" * 80)

        comparison_result = self.service_agent.compare_providers(requirements)

        print("\n✅ Provider comparison complete!")
        print("=" * 80)

        return comparison_result

    def get_workflow_history(self) -> list:
        """Get history of all executed workflows"""
        return self.workflow_history

    def _create_error_response(self, workflow_id: str, message: str, error: str) -> Dict[str, Any]:
        """Create standardized error response"""
        print(f"\n❌ Error: {message}")
        print(f"Details: {error}")

        return {
            "workflow_id": workflow_id,
            "success": False,
            "error": message,
            "error_details": error,
            "timestamp": datetime.utcnow().isoformat()
        }

    def print_workflow_summary(self, workflow_result: Dict[str, Any]):
        """Print a formatted summary of workflow results"""
        if not workflow_result.get("success"):
            print(f"\n❌ Workflow failed: {workflow_result.get('error')}")
            return

        summary = workflow_result.get("summary", {})

        print("\n" + "=" * 80)
        print("BRAHMA WORKFLOW SUMMARY")
        print("=" * 80)
        print(f"\nWorkflow ID: {workflow_result.get('workflow_id')}")
        print(f"Cloud Provider: {summary.get('cloud_provider', 'N/A').upper()}")
        print(f"IaC Tool: {summary.get('iac_tool', 'N/A').upper()}")
        print(f"Services Selected: {summary.get('services_count', 0)}")
        print(f"Estimated Monthly Savings: ${summary.get('estimated_savings', 0):.2f}")
        print(f"\nGenerated Code: {summary.get('code_file')}")
        print(f"File Location: {summary.get('code_path')}")
        print("=" * 80 + "\n")
