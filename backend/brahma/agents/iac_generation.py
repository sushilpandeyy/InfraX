"""
IaC Generation Agent
Creates production-ready infrastructure code using GPT
"""

import openai
import os
from typing import Dict, List, Any
from datetime import datetime
from pathlib import Path


class IaCGenerationAgent:
    """
    AI-powered agent for generating Infrastructure as Code
    Supports Terraform, CloudFormation, and Pulumi
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key

        self.output_dir = Path(__file__).parent.parent.parent.parent / "data" / "generated_code"
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_iac(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate IaC code based on configuration

        Args:
            config: Dictionary containing:
                - cloud_provider: aws/azure/gcp
                - iac_tool: terraform/cloudformation/pulumi
                - services: List of recommended services
                - requirements: Original requirements
                - optimization_notes: Cost optimization recommendations

        Returns:
            Dictionary with generated code and metadata
        """
        try:
            cloud_provider = config.get("cloud_provider", "aws")
            iac_tool = config.get("iac_tool", "terraform")
            services = config.get("services", [])
            requirements = config.get("requirements", {})

            # Build GPT prompt
            system_prompt = self._build_system_prompt(cloud_provider, iac_tool)
            user_prompt = self._build_user_prompt(config)

            # Call OpenAI API
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,  # Low temperature for consistent code generation
                max_tokens=3000
            )

            generated_code = response.choices[0].message.content.strip()

            # Clean up markdown code blocks if present
            generated_code = self._clean_code(generated_code)

            # Save to file
            filename = self._save_code(generated_code, cloud_provider, iac_tool)

            return {
                "success": True,
                "code": generated_code,
                "filename": filename,
                "file_path": str(self.output_dir / filename),
                "cloud_provider": cloud_provider,
                "iac_tool": iac_tool,
                "services_count": len(services),
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def _build_system_prompt(self, cloud_provider: str, iac_tool: str) -> str:
        """Build system prompt for IaC generation"""
        return f"""You are an expert DevOps engineer and Infrastructure as Code specialist.
You specialize in {cloud_provider.upper()} and {iac_tool}.

Your task is to generate production-ready, well-documented infrastructure code following these principles:

1. **Security Best Practices**
   - Enable encryption at rest and in transit
   - Use least privilege access (IAM roles, not access keys)
   - Enable logging and monitoring
   - Use security groups/network security with minimal exposure
   - Enable VPC flow logs / diagnostic logging

2. **Cost Optimization**
   - Right-sized resources
   - Auto-scaling where appropriate
   - Use appropriate storage tiers
   - Implement lifecycle policies

3. **Reliability**
   - Multi-AZ deployment for production workloads
   - Automated backups
   - Health checks
   - Proper tagging for resource management

4. **Code Quality**
   - Well-commented and documented
   - Proper variable definitions
   - Clear resource naming
   - Output important values
   - Follow {iac_tool} best practices

Generate ONLY the code with inline comments. No explanations before or after the code."""

    def _build_user_prompt(self, config: Dict[str, Any]) -> str:
        """Build user prompt from configuration"""
        cloud_provider = config.get("cloud_provider", "aws")
        iac_tool = config.get("iac_tool", "terraform")
        services = config.get("services", [])
        requirements = config.get("requirements", {})
        optimization_notes = config.get("optimization_notes", [])

        prompt = f"""Generate {iac_tool} code for {cloud_provider.upper()} with the following requirements:

**Application Description:**
{requirements.get('description', 'Cloud infrastructure')}

**Required Services:**
"""
        for service in services:
            prompt += f"- {service.get('category', 'unknown')}: {service.get('service', 'unknown')}\n"

        prompt += f"""
**Scale:** {requirements.get('scale', 'medium')}
**Environment:** {requirements.get('environment', 'production')}
**Region:** {requirements.get('region', 'default')}
"""

        if optimization_notes:
            prompt += "\n**Cost Optimization Considerations:**\n"
            for note in optimization_notes[:3]:  # Top 3 notes
                prompt += f"- {note}\n"

        prompt += f"""
Please generate complete, production-ready {iac_tool} code that:
1. Implements all required services
2. Follows security best practices
3. Includes proper networking (VPC/VNet)
4. Has appropriate monitoring and logging
5. Uses variables for configurability
6. Includes output values for important resources
"""

        return prompt

    def _clean_code(self, code: str) -> str:
        """Remove markdown code blocks and clean up generated code"""
        # Remove markdown code blocks
        if code.startswith("```"):
            lines = code.split("\n")
            # Remove first and last lines if they're markdown markers
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            code = "\n".join(lines)

        return code.strip()

    def _save_code(self, code: str, cloud_provider: str, iac_tool: str) -> str:
        """Save generated code to file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Determine file extension
        extension = {
            "terraform": "tf",
            "cloudformation": "yaml",
            "pulumi": "py"
        }.get(iac_tool, "txt")

        filename = f"{cloud_provider}_{iac_tool}_{timestamp}.{extension}"
        file_path = self.output_dir / filename

        with open(file_path, "w") as f:
            f.write(code)

        return filename

    def generate_with_context(self,
                            services_result: Dict[str, Any],
                            cost_result: Dict[str, Any],
                            iac_tool: str = "terraform") -> Dict[str, Any]:
        """
        Generate IaC code using results from Service Selection and Cost Optimization agents

        Args:
            services_result: Result from ServiceSelectionAgent
            cost_result: Result from CostOptimizationAgent
            iac_tool: IaC tool to use

        Returns:
            Generated IaC code and metadata
        """
        config = {
            "cloud_provider": services_result.get("cloud_provider", "aws"),
            "iac_tool": iac_tool,
            "services": services_result.get("recommendations", []),
            "requirements": {
                "description": services_result.get("ai_analysis", ""),
                "scale": services_result.get("scale", "medium"),
                "workload_type": services_result.get("workload_type", "general")
            },
            "optimization_notes": cost_result.get("strategies", {})
        }

        return self.generate_iac(config)
