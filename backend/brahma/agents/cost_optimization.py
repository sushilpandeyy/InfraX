"""
Cost Optimization Agent
Performs real-time cost analysis and provides optimization recommendations
"""

import openai
import os
from typing import Dict, List, Any
from datetime import datetime
import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from brahma.tools.cloud_pricing import CloudPricing


class CostOptimizationAgent:
    """
    AI-powered agent for cloud cost analysis and optimization
    Provides recommendations for 40-60% cost reduction
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key

        # Initialize pricing tool
        self.pricing_tool = CloudPricing(api_key=self.api_key)

        # Cost optimization strategies
        self.optimization_strategies = {
            "compute": [
                "Right-sizing instances",
                "Using spot/preemptible instances",
                "Auto-scaling configuration",
                "Reserved instances for steady workloads",
                "Serverless for variable workloads"
            ],
            "storage": [
                "Lifecycle policies",
                "Storage tiering",
                "Compression",
                "Deduplication",
                "Archive old data"
            ],
            "database": [
                "Right-sizing database instances",
                "Read replicas optimization",
                "Connection pooling",
                "Query optimization",
                "Automated backups schedule"
            ],
            "networking": [
                "CDN usage",
                "Data transfer optimization",
                "VPC endpoint usage",
                "Load balancer optimization"
            ]
        }

        # Pricing models (simplified estimates)
        self.pricing_estimates = {
            "aws": {
                "ec2_t3_micro": 0.0104,  # per hour
                "ec2_t3_small": 0.0208,
                "ec2_t3_medium": 0.0416,
                "lambda": 0.0000166667,  # per GB-second
                "s3_standard": 0.023,  # per GB/month
                "s3_glacier": 0.004,
                "rds_t3_micro": 0.017
            },
            "azure": {
                "vm_b1s": 0.0104,
                "vm_b2s": 0.0416,
                "functions": 0.000016,
                "blob_hot": 0.0184,
                "blob_cool": 0.01
            },
            "gcp": {
                "e2_micro": 0.0084,
                "e2_small": 0.0168,
                "e2_medium": 0.0336,
                "cloud_storage_standard": 0.020,
                "cloud_storage_nearline": 0.010
            }
        }

    def analyze_costs(self, infrastructure: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze infrastructure costs and provide optimization recommendations

        Args:
            infrastructure: Dictionary containing infrastructure details
                - cloud_provider: Cloud provider (aws/azure/gcp)
                - services: List of services being used
                - usage_patterns: Usage patterns and metrics
                - current_cost: Current monthly cost (optional)

        Returns:
            Dictionary with cost analysis and optimization recommendations
        """
        try:
            cloud_provider = infrastructure.get("cloud_provider", "aws").lower()
            services = infrastructure.get("services", [])
            current_cost = infrastructure.get("current_cost", 0)

            # Build GPT prompt for cost optimization
            system_prompt = self._build_cost_analysis_prompt(cloud_provider)
            user_prompt = self._build_user_cost_prompt(infrastructure)

            # Call OpenAI API
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )

            ai_response = response.choices[0].message.content.strip()

            # Calculate estimated savings
            estimated_savings = self._calculate_savings(services, cloud_provider)

            return {
                "success": True,
                "cloud_provider": cloud_provider,
                "current_cost": current_cost,
                "estimated_monthly_savings": estimated_savings,
                "savings_percentage": round((estimated_savings / max(current_cost, 1)) * 100, 2) if current_cost > 0 else 0,
                "optimization_recommendations": ai_response,
                "strategies": self._get_relevant_strategies(services),
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def _build_cost_analysis_prompt(self, cloud_provider: str) -> str:
        """Build system prompt for cost analysis"""
        return f"""You are an expert cloud cost optimization specialist for {cloud_provider.upper()}.
Your goal is to help organizations reduce their cloud spending by 40-60% while maintaining performance.

Available optimization strategies:
{json.dumps(self.optimization_strategies, indent=2)}

Provide specific, actionable recommendations that include:
1. Immediate cost-saving opportunities
2. Right-sizing recommendations
3. Resource scheduling (turn off non-production during off-hours)
4. Reserved capacity vs on-demand analysis
5. Serverless alternatives where applicable
6. Storage optimization
7. Network cost reduction

Format your response with:
## Immediate Actions (Quick wins)
- [Specific action with estimated savings]

## Short-term Optimizations (1-3 months)
- [Strategic changes with cost impact]

## Long-term Strategy
- [Architectural improvements]

## Estimated Total Savings
[Percentage and dollar amount]"""

    def _build_user_cost_prompt(self, infrastructure: Dict[str, Any]) -> str:
        """Build user prompt for cost analysis"""
        services = infrastructure.get("services", [])
        current_cost = infrastructure.get("current_cost", "Unknown")
        usage_patterns = infrastructure.get("usage_patterns", "Standard business hours")

        prompt = f"""Analyze costs for the following infrastructure:

Current Monthly Cost: ${current_cost}

Services in use:
"""
        for service in services:
            service_type = service.get("type", "unknown")
            service_config = service.get("config", {})
            prompt += f"- {service_type}: {json.dumps(service_config)}\n"

        prompt += f"\nUsage Patterns: {usage_patterns}\n"

        if infrastructure.get("additional_context"):
            prompt += f"\nAdditional Context:\n{infrastructure['additional_context']}\n"

        prompt += "\nPlease provide detailed cost optimization recommendations."

        return prompt

    def _calculate_savings(self, services: List[Dict], cloud_provider: str) -> float:
        """Calculate estimated savings based on services"""
        # Simple heuristic-based calculation
        # In production, this would use actual pricing APIs

        estimated_savings = 0.0
        pricing = self.pricing_estimates.get(cloud_provider, {})

        for service in services:
            service_type = service.get("type", "").lower()

            # Apply optimization factors
            if service_type == "compute":
                # Assume 50% savings from right-sizing and spot instances
                estimated_savings += 500

            elif service_type == "storage":
                # Assume 40% savings from tiering
                estimated_savings += 200

            elif service_type == "database":
                # Assume 30% savings from right-sizing
                estimated_savings += 300

            elif service_type == "networking":
                # Assume 25% savings from CDN and optimization
                estimated_savings += 150

        return round(estimated_savings, 2)

    def _get_relevant_strategies(self, services: List[Dict]) -> Dict[str, List[str]]:
        """Get optimization strategies relevant to the services"""
        relevant_strategies = {}

        for service in services:
            service_type = service.get("type", "").lower()
            if service_type in self.optimization_strategies:
                relevant_strategies[service_type] = self.optimization_strategies[service_type]

        return relevant_strategies

    def forecast_costs(self, infrastructure: Dict[str, Any], months: int = 12) -> Dict[str, Any]:
        """
        Forecast future costs based on growth projections

        Args:
            infrastructure: Infrastructure details
            months: Number of months to forecast

        Returns:
            Cost forecast with optimization scenarios
        """
        try:
            current_cost = infrastructure.get("current_cost", 1000)
            growth_rate = infrastructure.get("growth_rate", 0.1)  # 10% monthly growth

            # Calculate baseline forecast (without optimization)
            baseline_forecast = []
            optimized_forecast = []

            for month in range(1, months + 1):
                baseline_monthly = current_cost * ((1 + growth_rate) ** month)
                optimized_monthly = baseline_monthly * 0.5  # 50% savings

                baseline_forecast.append({
                    "month": month,
                    "cost": round(baseline_monthly, 2)
                })
                optimized_forecast.append({
                    "month": month,
                    "cost": round(optimized_monthly, 2)
                })

            total_baseline = sum([m["cost"] for m in baseline_forecast])
            total_optimized = sum([m["cost"] for m in optimized_forecast])

            return {
                "success": True,
                "months": months,
                "baseline_forecast": baseline_forecast,
                "optimized_forecast": optimized_forecast,
                "total_baseline_cost": round(total_baseline, 2),
                "total_optimized_cost": round(total_optimized, 2),
                "total_savings": round(total_baseline - total_optimized, 2),
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
