"""
Intelligent Infrastructure Planner
Analyzes user prompts and automatically plans infrastructure with location-aware service selection
"""

import openai
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import json


class IntelligentPlanner:
    """
    AI-powered tool that:
    1. Understands natural language infrastructure requirements
    2. Determines optimal cloud provider based on location
    3. Plans complete infrastructure architecture
    4. Selects specific services for each component
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key

        # Cloud provider regions and their strengths
        self.provider_regions = {
            "aws": {
                "regions": {
                    "us-east-1": {"location": "Virginia, USA", "latency_zone": "North America East"},
                    "us-west-2": {"location": "Oregon, USA", "latency_zone": "North America West"},
                    "eu-west-1": {"location": "Ireland", "latency_zone": "Europe West"},
                    "eu-central-1": {"location": "Frankfurt, Germany", "latency_zone": "Europe Central"},
                    "ap-southeast-1": {"location": "Singapore", "latency_zone": "Asia Pacific Southeast"},
                    "ap-south-1": {"location": "Mumbai, India", "latency_zone": "South Asia"},
                    "ap-northeast-1": {"location": "Tokyo, Japan", "latency_zone": "Asia Pacific Northeast"},
                    "sa-east-1": {"location": "São Paulo, Brazil", "latency_zone": "South America"}
                },
                "strengths": ["Most services", "Global presence", "Mature ecosystem"]
            },
            "azure": {
                "regions": {
                    "eastus": {"location": "Virginia, USA", "latency_zone": "North America East"},
                    "westus2": {"location": "Washington, USA", "latency_zone": "North America West"},
                    "northeurope": {"location": "Ireland", "latency_zone": "Europe North"},
                    "westeurope": {"location": "Netherlands", "latency_zone": "Europe West"},
                    "southeastasia": {"location": "Singapore", "latency_zone": "Asia Pacific Southeast"},
                    "centralindia": {"location": "Pune, India", "latency_zone": "South Asia"},
                    "japaneast": {"location": "Tokyo, Japan", "latency_zone": "Asia Pacific Northeast"}
                },
                "strengths": ["Microsoft integration", "Hybrid cloud", "Enterprise focus"]
            },
            "gcp": {
                "regions": {
                    "us-east1": {"location": "South Carolina, USA", "latency_zone": "North America East"},
                    "us-west1": {"location": "Oregon, USA", "latency_zone": "North America West"},
                    "europe-west1": {"location": "Belgium", "latency_zone": "Europe West"},
                    "europe-west3": {"location": "Frankfurt, Germany", "latency_zone": "Europe Central"},
                    "asia-southeast1": {"location": "Singapore", "latency_zone": "Asia Pacific Southeast"},
                    "asia-south1": {"location": "Mumbai, India", "latency_zone": "South Asia"},
                    "asia-northeast1": {"location": "Tokyo, Japan", "latency_zone": "Asia Pacific Northeast"}
                },
                "strengths": ["AI/ML services", "Data analytics", "Kubernetes native"]
            }
        }

        # Location to latency zone mapping
        self.location_mapping = {
            "usa": "North America East",
            "united states": "North America East",
            "us": "North America East",
            "canada": "North America East",
            "europe": "Europe West",
            "uk": "Europe West",
            "germany": "Europe Central",
            "india": "South Asia",
            "singapore": "Asia Pacific Southeast",
            "asia": "Asia Pacific Southeast",
            "japan": "Asia Pacific Northeast",
            "australia": "Asia Pacific Southeast",
            "brazil": "South America"
        }

    def plan_infrastructure(self, prompt: str, location: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze prompt and create complete infrastructure plan

        Args:
            prompt: Natural language description of what user wants to build
            location: Geographic location of users/deployment (optional)

        Returns:
            Complete infrastructure plan with cloud provider, services, and architecture
        """
        try:
            print(f"\n🧠 Analyzing your requirements...")
            print(f"📍 Target location: {location or 'Not specified (will recommend based on prompt)'}")

            # Step 1: Extract requirements and determine cloud provider
            analysis = self._analyze_requirements(prompt, location)

            if not analysis.get("success"):
                return analysis

            # Step 2: Select specific services for each component
            service_plan = self._create_service_plan(analysis, location)

            # Step 3: Generate architecture recommendations
            architecture = self._design_architecture(analysis, service_plan)

            return {
                "success": True,
                "cloud_provider": analysis.get("recommended_provider"),
                "region": analysis.get("recommended_region"),
                "location_rationale": analysis.get("location_rationale"),
                "requirements_analysis": analysis.get("requirements"),
                "service_plan": service_plan,
                "architecture": architecture,
                "estimated_components": len(service_plan.get("services", [])),
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def _analyze_requirements(self, prompt: str, location: Optional[str]) -> Dict[str, Any]:
        """Use GPT to analyze requirements and determine cloud provider"""

        system_prompt = f"""You are an expert cloud architect. Analyze the user's requirements and determine:

1. **Cloud Provider Selection**: Choose AWS, Azure, or GCP based on:
   - Geographic location and latency requirements
   - Specific service needs
   - Technology stack mentioned
   - Compliance requirements

2. **Requirements Breakdown**: Identify:
   - Application type (web, mobile, API, data processing, ML, etc.)
   - Core components needed (compute, database, storage, networking, etc.)
   - Scale and performance requirements
   - Security and compliance needs
   - Integration requirements

3. **Location Strategy**:
   - If location is specified, choose the provider with best presence there
   - If not specified, infer from context or recommend global deployment
   - Select specific region based on latency and data residency

Available providers and regions:
{json.dumps(self.provider_regions, indent=2)}

Respond in JSON format:
{{
  "recommended_provider": "aws|azure|gcp",
  "recommended_region": "specific-region-code",
  "location_rationale": "why this provider and region",
  "requirements": {{
    "app_type": "type",
    "components": ["list of components"],
    "scale": "small|medium|large",
    "special_needs": ["any special requirements"]
  }}
}}"""

        user_prompt = f"""Analyze this infrastructure requirement:

Prompt: {prompt}
Target Location: {location or "Not specified - please infer or recommend"}

Provide a complete analysis and cloud provider recommendation."""

        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )

        # Parse JSON response
        try:
            result = json.loads(response.choices[0].message.content.strip())
            result["success"] = True
            return result
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "success": True,
                "recommended_provider": "aws",
                "recommended_region": "us-east-1",
                "location_rationale": "Default to AWS US East due to parsing error",
                "requirements": {"app_type": "general", "components": [], "scale": "medium"}
            }

    def _create_service_plan(self, analysis: Dict[str, Any], location: Optional[str]) -> Dict[str, Any]:
        """Create detailed service plan with specific service selections"""

        provider = analysis.get("recommended_provider", "aws")
        requirements = analysis.get("requirements", {})
        components = requirements.get("components", [])

        system_prompt = f"""You are a {provider.upper()} solutions architect.
Create a detailed service plan specifying EXACT {provider.upper()} services for each component.

For each component, specify:
- Service name (exact {provider.upper()} service)
- Configuration recommendations
- Integration points
- Security considerations

Respond in JSON format:
{{
  "services": [
    {{
      "component": "component name",
      "service": "exact service name",
      "category": "compute|database|storage|networking|security|analytics",
      "configuration": {{
        "key_settings": ["important config items"]
      }},
      "rationale": "why this service"
    }}
  ],
  "integrations": ["how services connect"],
  "security_layers": ["security services needed"]
}}"""

        user_prompt = f"""Create a service plan for {provider.upper()}:

Application Type: {requirements.get('app_type')}
Components Needed: {', '.join(components)}
Scale: {requirements.get('scale')}
Location: {location or 'Global'}

Specify exact {provider.upper()} services for each component."""

        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=2000
        )

        try:
            return json.loads(response.choices[0].message.content.strip())
        except json.JSONDecodeError:
            return {
                "services": [],
                "integrations": [],
                "security_layers": []
            }

    def _design_architecture(self, analysis: Dict[str, Any], service_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Generate high-level architecture design"""

        provider = analysis.get("recommended_provider")
        region = analysis.get("recommended_region")

        system_prompt = """You are a cloud architect. Design a high-level architecture including:
- Network topology
- Data flow
- Security zones
- Scalability strategy
- Disaster recovery approach

Respond in JSON format:
{
  "network_design": "description",
  "data_flow": "how data moves through system",
  "security_zones": ["zone descriptions"],
  "scalability": "auto-scaling strategy",
  "availability": "HA/DR approach",
  "monitoring": "observability strategy"
}"""

        user_prompt = f"""Design architecture for:

Provider: {provider.upper()}
Region: {region}
Services: {json.dumps(service_plan.get('services', []), indent=2)}

Create a complete architecture design."""

        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )

        try:
            return json.loads(response.choices[0].message.content.strip())
        except json.JSONDecodeError:
            return {
                "network_design": "VPC with public and private subnets",
                "data_flow": "Standard 3-tier architecture",
                "security_zones": ["Public", "Application", "Data"],
                "scalability": "Auto-scaling groups",
                "availability": "Multi-AZ deployment"
            }

    def get_location_recommendation(self, target_audience: str) -> Dict[str, Any]:
        """
        Recommend cloud provider and region based on target audience location

        Args:
            target_audience: Description of where users are located

        Returns:
            Recommendations for each cloud provider
        """
        recommendations = {}

        for provider, data in self.provider_regions.items():
            # Find best region for this provider
            best_region = None
            best_match = 0

            for region_code, region_info in data["regions"].items():
                # Simple matching logic (can be enhanced with GPT)
                location_lower = region_info["location"].lower()
                audience_lower = target_audience.lower()

                match_score = sum(1 for word in audience_lower.split() if word in location_lower)

                if match_score > best_match:
                    best_match = match_score
                    best_region = {
                        "code": region_code,
                        "location": region_info["location"],
                        "latency_zone": region_info["latency_zone"]
                    }

            recommendations[provider] = {
                "recommended_region": best_region,
                "strengths": data["strengths"]
            }

        return {
            "success": True,
            "target_audience": target_audience,
            "recommendations": recommendations,
            "timestamp": datetime.utcnow().isoformat()
        }
