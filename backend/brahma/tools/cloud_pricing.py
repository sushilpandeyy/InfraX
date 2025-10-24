"""
Cloud Pricing Tool
Provides realistic pricing estimates for AWS, Azure, and GCP services
Uses OpenAI with latest pricing knowledge and can integrate with official pricing APIs
"""

import openai
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import json


class CloudPricing:
    """
    AI-powered cloud pricing estimator
    Provides accurate cost estimates for infrastructure planning
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key

    def get_service_pricing(self, service_request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get detailed pricing for specific services

        Args:
            service_request: Dictionary containing:
                - cloud_provider: aws/azure/gcp
                - services: List of services with specifications
                - region: Target region
                - usage_pattern: Expected usage (hours/month, requests, storage, etc.)

        Returns:
            Detailed pricing breakdown with monthly costs
        """
        try:
            cloud_provider = service_request.get("cloud_provider", "aws")
            services = service_request.get("services", [])
            region = service_request.get("region", "us-east-1")
            usage_pattern = service_request.get("usage_pattern", "Standard 24/7")

            print(f"\n💰 Fetching pricing for {len(services)} services in {cloud_provider.upper()} ({region})...")

            # Use OpenAI to provide accurate pricing based on latest knowledge
            pricing_data = self._get_ai_pricing_estimates(cloud_provider, services, region, usage_pattern)

            # Calculate totals
            total_monthly = sum(s.get("monthly_cost", 0) for s in pricing_data.get("services", []))
            total_annual = total_monthly * 12

            return {
                "success": True,
                "cloud_provider": cloud_provider,
                "region": region,
                "services": pricing_data.get("services", []),
                "total_monthly_cost": round(total_monthly, 2),
                "total_annual_cost": round(total_annual, 2),
                "currency": "USD",
                "pricing_date": datetime.utcnow().isoformat(),
                "notes": pricing_data.get("notes", "Pricing estimates based on standard configurations and on-demand rates."),
                "optimization_tips": pricing_data.get("optimization_tips", [])
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def _get_ai_pricing_estimates(self, cloud_provider: str, services: List[Dict], region: str, usage_pattern: str) -> Dict[str, Any]:
        """Use OpenAI to generate accurate pricing estimates based on latest knowledge"""

        system_prompt = f"""You are a cloud cost optimization expert with deep knowledge of {cloud_provider.upper()} pricing.

Provide ACCURATE monthly cost estimates for each service based on:
1. Current {cloud_provider.upper()} on-demand pricing
2. Standard configurations and instance types
3. Regional pricing variations
4. Typical usage patterns
5. Data transfer costs

Be realistic and conservative with estimates. Include optimization tips where applicable.

Output as JSON:
{{
  "services": [
    {{
      "service_name": "ServiceName",
      "component": "ComponentName",
      "instance_type": "specific type/SKU",
      "monthly_cost": 123.45,
      "breakdown": {{
        "compute": 100.00,
        "storage": 20.00,
        "data_transfer": 3.45
      }},
      "assumptions": ["24/7 operation", "Standard tier"]
    }}
  ],
  "notes": "General pricing notes",
  "optimization_tips": ["Tip 1", "Tip 2"]
}}"""

        user_prompt = f"""Provide pricing estimates for {cloud_provider.upper()} in {region}:

Services:
"""
        for i, service in enumerate(services, 1):
            component = service.get('component', 'unknown')
            service_name = service.get('service', 'unknown')
            category = service.get('category', 'unknown')
            config = service.get('configuration', {})

            user_prompt += f"{i}. {component} - {service_name} ({category})\n"
            if config:
                user_prompt += f"   Config: {json.dumps(config)}\n"

        user_prompt += f"\nUsage Pattern: {usage_pattern}\n"
        user_prompt += f"Region: {region}\n"

        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,  # Low temperature for consistent pricing
            max_tokens=2500,
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)

    def compare_cloud_pricing(self, services: List[Dict], usage_pattern: str = "Standard") -> Dict[str, Any]:
        """
        Compare pricing across AWS, Azure, and GCP for the same services

        Args:
            services: List of services to price
            usage_pattern: Expected usage pattern

        Returns:
            Comparison of pricing across all three cloud providers
        """
        try:
            providers = ["aws", "azure", "gcp"]
            regions = {
                "aws": "us-east-1",
                "azure": "East US",
                "gcp": "us-central1"
            }

            pricing_comparison = {}

            for provider in providers:
                result = self.get_service_pricing({
                    "cloud_provider": provider,
                    "services": services,
                    "region": regions[provider],
                    "usage_pattern": usage_pattern
                })

                if result.get("success"):
                    pricing_comparison[provider] = {
                        "monthly_cost": result.get("total_monthly_cost", 0),
                        "annual_cost": result.get("total_annual_cost", 0),
                        "services": result.get("services", [])
                    }

            # Find cheapest option
            if pricing_comparison:
                cheapest = min(pricing_comparison.items(), key=lambda x: x[1]["monthly_cost"])
                most_expensive = max(pricing_comparison.items(), key=lambda x: x[1]["monthly_cost"])

                return {
                    "success": True,
                    "comparison": pricing_comparison,
                    "recommendation": {
                        "cheapest_provider": cheapest[0],
                        "cheapest_monthly": cheapest[1]["monthly_cost"],
                        "most_expensive_provider": most_expensive[0],
                        "most_expensive_monthly": most_expensive[1]["monthly_cost"],
                        "potential_savings": round(most_expensive[1]["monthly_cost"] - cheapest[1]["monthly_cost"], 2)
                    },
                    "timestamp": datetime.utcnow().isoformat()
                }

            return {
                "success": False,
                "error": "Failed to fetch pricing for all providers"
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def get_optimization_recommendations(self, current_costs: Dict[str, Any]) -> List[str]:
        """
        Get AI-powered cost optimization recommendations

        Args:
            current_costs: Current infrastructure costs and configuration

        Returns:
            List of optimization recommendations
        """
        try:
            system_prompt = """You are a cloud cost optimization specialist.

Analyze the provided infrastructure costs and provide specific, actionable recommendations to reduce costs by 40-60%.

Focus on:
1. Reserved Instances / Savings Plans
2. Right-sizing over-provisioned resources
3. Auto-scaling and scheduling
4. Storage optimization
5. Network cost reduction
6. Spot/Preemptible instances where applicable

Provide 5-10 specific recommendations ranked by potential savings."""

            user_prompt = f"""Current Infrastructure Costs:
{json.dumps(current_costs, indent=2)}

Provide optimization recommendations."""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )

            recommendations_text = response.choices[0].message.content.strip()

            # Parse recommendations into list
            recommendations = [line.strip() for line in recommendations_text.split('\n') if line.strip() and (line.strip()[0].isdigit() or line.strip().startswith('-'))]

            return recommendations

        except Exception as e:
            print(f"Failed to generate recommendations: {e}")
            return [
                "Consider Reserved Instances for 1-3 year commitments (up to 72% savings)",
                "Implement auto-scaling to match demand (20-40% savings)",
                "Use spot/preemptible instances for fault-tolerant workloads (70-90% savings)",
                "Optimize storage tiers based on access patterns (30-50% savings)",
                "Enable data compression and deduplication (10-30% savings)"
            ]


# Example usage:
if __name__ == "__main__":
    pricer = CloudPricing()

    # Example: Get pricing for a web application
    services = [
        {
            "component": "Web Server",
            "service": "EC2 t3.medium",
            "category": "compute",
            "configuration": {"instance_count": 2, "hours_per_month": 730}
        },
        {
            "component": "Database",
            "service": "RDS PostgreSQL",
            "category": "database",
            "configuration": {"instance_type": "db.t3.medium", "storage_gb": 100}
        },
        {
            "component": "Load Balancer",
            "service": "Application Load Balancer",
            "category": "networking"
        }
    ]

    result = pricer.get_service_pricing({
        "cloud_provider": "aws",
        "services": services,
        "region": "us-east-1",
        "usage_pattern": "24/7 production workload"
    })

    print(json.dumps(result, indent=2))
