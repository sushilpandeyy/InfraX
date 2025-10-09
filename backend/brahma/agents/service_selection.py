"""
Service Selection Agent
Analyzes application requirements and recommends optimal cloud services
"""

import openai
import os
from typing import Dict, List, Any
from datetime import datetime
import json


class ServiceSelectionAgent:
    """
    AI-powered agent that analyzes application requirements
    and recommends optimal cloud services across AWS, Azure, and GCP
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key

        # Service catalog for different cloud providers
        self.service_catalog = {
            "aws": {
                "compute": ["EC2", "Lambda", "ECS", "Fargate", "EKS", "Batch"],
                "database": ["RDS", "DynamoDB", "Aurora", "DocumentDB", "Neptune"],
                "storage": ["S3", "EFS", "FSx", "EBS"],
                "networking": ["VPC", "CloudFront", "Route53", "ALB", "NLB"],
                "analytics": ["Athena", "EMR", "Redshift", "Kinesis"],
                "security": ["IAM", "KMS", "Secrets Manager", "WAF"]
            },
            "azure": {
                "compute": ["Virtual Machines", "Functions", "Container Instances", "AKS"],
                "database": ["SQL Database", "Cosmos DB", "PostgreSQL", "MySQL"],
                "storage": ["Blob Storage", "Files", "Data Lake", "Disk Storage"],
                "networking": ["VNet", "CDN", "DNS", "Load Balancer", "App Gateway"],
                "analytics": ["Synapse Analytics", "Data Factory", "Stream Analytics"],
                "security": ["AD", "Key Vault", "Security Center"]
            },
            "gcp": {
                "compute": ["Compute Engine", "Cloud Functions", "Cloud Run", "GKE"],
                "database": ["Cloud SQL", "Firestore", "Cloud Spanner", "Bigtable"],
                "storage": ["Cloud Storage", "Filestore", "Persistent Disk"],
                "networking": ["VPC", "Cloud CDN", "Cloud DNS", "Cloud Load Balancing"],
                "analytics": ["BigQuery", "Dataflow", "Pub/Sub", "Dataproc"],
                "security": ["IAM", "Cloud KMS", "Secret Manager"]
            }
        }

    def analyze_requirements(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze user requirements and recommend cloud services

        Args:
            requirements: Dictionary containing application requirements
                - description: Text description of the application
                - workload_type: Type of workload (web, data, ml, etc.)
                - scale: Expected scale (small, medium, large)
                - budget: Budget constraints
                - cloud_provider: Preferred cloud provider (optional)

        Returns:
            Dictionary with recommended services and reasoning
        """
        try:
            description = requirements.get("description", "")
            workload_type = requirements.get("workload_type", "general")
            scale = requirements.get("scale", "medium")
            cloud_provider = requirements.get("cloud_provider", "aws").lower()

            # Build GPT prompt for service selection
            system_prompt = self._build_system_prompt(cloud_provider)
            user_prompt = self._build_user_prompt(requirements)

            # Call OpenAI API
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,  # Lower temperature for more consistent recommendations
                max_tokens=1500
            )

            # Parse AI response
            ai_response = response.choices[0].message.content.strip()

            # Extract structured recommendations
            recommendations = self._parse_recommendations(ai_response, cloud_provider)

            return {
                "success": True,
                "cloud_provider": cloud_provider,
                "workload_type": workload_type,
                "scale": scale,
                "recommendations": recommendations,
                "ai_analysis": ai_response,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def _build_system_prompt(self, cloud_provider: str) -> str:
        """Build system prompt for GPT"""
        return f"""You are an expert cloud architect specializing in {cloud_provider.upper()}.
Your role is to analyze application requirements and recommend the most appropriate cloud services.

Available {cloud_provider.upper()} services:
{json.dumps(self.service_catalog.get(cloud_provider, {}), indent=2)}

Provide recommendations based on:
1. Technical fit for the use case
2. Cost-effectiveness
3. Scalability
4. Security best practices
5. Operational simplicity

Format your response as:
## Recommended Services
- [Service Category]: [Service Name] - [Brief reasoning]

## Architecture Overview
[Brief description of how services work together]

## Key Considerations
- [Important points about implementation]"""

    def _build_user_prompt(self, requirements: Dict[str, Any]) -> str:
        """Build user prompt from requirements"""
        description = requirements.get("description", "")
        workload_type = requirements.get("workload_type", "general")
        scale = requirements.get("scale", "medium")
        budget = requirements.get("budget", "moderate")

        prompt = f"""I need to build the following application:

Description: {description}

Requirements:
- Workload Type: {workload_type}
- Expected Scale: {scale}
- Budget: {budget}
"""

        if requirements.get("additional_requirements"):
            prompt += f"\nAdditional Requirements:\n{requirements['additional_requirements']}"

        prompt += "\n\nPlease recommend the most appropriate cloud services for this application."

        return prompt

    def _parse_recommendations(self, ai_response: str, cloud_provider: str) -> List[Dict[str, Any]]:
        """Parse AI response to extract structured recommendations"""
        recommendations = []

        # Simple parsing - look for service names in response
        for category, services in self.service_catalog.get(cloud_provider, {}).items():
            for service in services:
                if service.lower() in ai_response.lower():
                    recommendations.append({
                        "category": category,
                        "service": service,
                        "provider": cloud_provider
                    })

        # Remove duplicates
        unique_recommendations = []
        seen = set()
        for rec in recommendations:
            key = (rec["category"], rec["service"])
            if key not in seen:
                seen.add(key)
                unique_recommendations.append(rec)

        return unique_recommendations

    def compare_providers(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compare service recommendations across AWS, Azure, and GCP
        """
        comparisons = {}

        for provider in ["aws", "azure", "gcp"]:
            req_copy = requirements.copy()
            req_copy["cloud_provider"] = provider
            result = self.analyze_requirements(req_copy)
            comparisons[provider] = result

        return {
            "success": True,
            "comparisons": comparisons,
            "timestamp": datetime.utcnow().isoformat()
        }
