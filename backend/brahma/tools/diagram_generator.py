"""
Infrastructure Visualization Generator
Generates visual diagrams from Terraform infrastructure plans
Creates architecture diagrams that users can understand at a glance
"""

import openai
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path


class DiagramGenerator:
    """
    AI-powered tool that generates visual infrastructure diagrams
    Supports multiple formats: Mermaid, PlantUML, ASCII art, Python (Diagrams)
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key

        self.output_dir = Path(__file__).parent.parent.parent.parent / "data" / "diagrams"
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_diagram(self, infrastructure_plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate Mermaid diagram from infrastructure plan
        Mermaid is the best format for React integration and web rendering

        Args:
            infrastructure_plan: Infrastructure details including:
                - cloud_provider: aws/azure/gcp
                - services: List of services
                - architecture: Architecture design
                - terraform_code: Generated Terraform code (optional)

        Returns:
            Dictionary with Mermaid diagram code and metadata
        """
        try:
            cloud_provider = infrastructure_plan.get("cloud_provider", "aws")
            services = infrastructure_plan.get("services", [])
            architecture = infrastructure_plan.get("architecture", {})

            print(f"\n🎨 Generating high-quality Mermaid diagram for React...")

            # Generate Mermaid diagram using GPT
            diagram_code = self._generate_mermaid_diagram(cloud_provider, services, architecture)

            # Extract service descriptions for tooltips
            service_descriptions = {}
            for service in services:
                service_name = service.get('service', service.get('component', 'Unknown'))
                purpose = service.get('purpose', service.get('description', ''))
                if purpose:
                    service_descriptions[service_name] = purpose

            # Save diagram
            filename = self._save_diagram(diagram_code, cloud_provider)

            return {
                "success": True,
                "diagram_type": "mermaid",
                "diagram_code": diagram_code,
                "service_descriptions": service_descriptions,
                "filename": filename,
                "file_path": str(self.output_dir / filename),
                "cloud_provider": cloud_provider,
                "services_count": len(services),
                "react_integration": "Use mermaid npm package or react-mermaid component",
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def _generate_mermaid_diagram(self, cloud_provider: str, services: List[Dict], architecture: Dict) -> str:
        """Generate Mermaid.js flowchart diagram"""

        system_prompt = f"""You are an expert at creating Mermaid.js diagrams for cloud infrastructure.

Create a beautiful, clear Mermaid flowchart that shows:
1. Network topology (VPC, subnets, zones)
2. All services and their relationships
3. Data flow between components
4. Security boundaries
5. Load balancers and gateways
6. Databases and storage
7. External connections (Internet, users, APIs)

Use appropriate Mermaid syntax:
- graph TD for top-down flow
- subgraph for grouping (VPC, subnets, security zones)
- --> for connections with labels
- Different shapes for different service types
- Icons using Mermaid syntax where possible

Make it visually clear and professional.
Output ONLY the Mermaid code, no explanations."""

        user_prompt = f"""Create a Mermaid diagram for this {cloud_provider.upper()} infrastructure:

Services:
"""
        for service in services:
            user_prompt += f"- {service.get('component', 'unknown')}: {service.get('service', 'unknown')} ({service.get('category', 'unknown')})\n"

        user_prompt += f"\nArchitecture:\n"
        user_prompt += f"Network: {architecture.get('network_design', 'Standard VPC')}\n"
        user_prompt += f"Security Zones: {', '.join(architecture.get('security_zones', ['Public', 'Private']))}\n"
        user_prompt += f"Scalability: {architecture.get('scalability', 'Auto-scaling')}\n"
        user_prompt += f"Data Flow: {architecture.get('data_flow', 'Standard 3-tier')}\n"

        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )

        diagram = response.choices[0].message.content.strip()

        # Clean up markdown code blocks
        if diagram.startswith("```"):
            lines = diagram.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            diagram = "\n".join(lines)

        return diagram

    def create_react_component_example(self) -> str:
        """
        Provide example React component code for rendering Mermaid diagrams
        """
        return '''
// Example React component to render Mermaid diagrams

import React, { useEffect } from 'react';
import mermaid from 'mermaid';

const InfrastructureDiagram = ({ diagramCode }) => {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
    mermaid.contentLoaded();
  }, [diagramCode]);

  return (
    <div className="mermaid-diagram">
      <div className="mermaid">{diagramCode}</div>
    </div>
  );
};

export default InfrastructureDiagram;

// Usage:
// <InfrastructureDiagram diagramCode={mermaidCode} />

// Install: npm install mermaid
'''

    def _generate_plantuml_diagram_REMOVED(self, cloud_provider: str, services: List[Dict], architecture: Dict) -> str:
        """Generate PlantUML diagram"""

        system_prompt = f"""You are an expert at creating PlantUML diagrams for cloud infrastructure.

Create a comprehensive PlantUML deployment diagram showing:
1. Cloud infrastructure components
2. Network boundaries and zones
3. Service relationships
4. Data flows
5. Security groups
6. Load balancing

Use PlantUML cloud/deployment diagram syntax:
- @startuml / @enduml
- cloud, database, node, component keywords
- rectangle for grouping
- --> for connections

Make it clear and professional.
Output ONLY the PlantUML code."""

        user_prompt = f"""Create a PlantUML diagram for {cloud_provider.upper()}:

Services:
"""
        for service in services:
            user_prompt += f"- {service.get('service', 'unknown')}\n"

        user_prompt += f"\nArchitecture: {architecture.get('network_design', 'VPC with subnets')}"

        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )

        return response.choices[0].message.content.strip()

    def _generate_python_diagrams(self, cloud_provider: str, services: List[Dict], architecture: Dict) -> str:
        """Generate Python Diagrams library code"""

        system_prompt = f"""You are an expert at creating diagrams using the Python 'diagrams' library.

Create Python code using the diagrams library (https://diagrams.mingrammer.com/) that shows:
1. All cloud services with proper icons
2. Network topology
3. Service connections
4. Load balancers, databases, storage
5. Grouping by VPC/subnets

Use proper diagrams library syntax:
- from diagrams import Diagram, Cluster
- from diagrams.{cloud_provider}.* import appropriate services
- with Diagram(...) context manager
- Cluster for grouping
- >> for connections

Generate complete, runnable Python code.
Output ONLY the Python code, no explanations."""

        user_prompt = f"""Create Python diagrams code for {cloud_provider.upper()}:

Services needed:
"""
        for service in services:
            user_prompt += f"- {service.get('service', 'unknown')} ({service.get('category', 'unknown')})\n"

        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=2000
        )

        code = response.choices[0].message.content.strip()

        # Clean up markdown
        if code.startswith("```"):
            lines = code.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            code = "\n".join(lines)

        return code

    def _generate_ascii_diagram(self, cloud_provider: str, services: List[Dict], architecture: Dict) -> str:
        """Generate ASCII art diagram"""

        system_prompt = """You are an expert at creating ASCII art diagrams for technical architecture.

Create a clear ASCII diagram showing:
1. Network boundaries using boxes
2. Services and components
3. Connections with arrows
4. Labels for everything

Use ASCII art:
- ┌──┐ │ └──┘ for boxes
- ──> for arrows
- Clear labels
- Hierarchical layout

Make it visually clear and well-formatted.
Output ONLY the ASCII diagram."""

        user_prompt = f"""Create ASCII diagram for {cloud_provider.upper()}:

Services:
"""
        for service in services:
            user_prompt += f"- {service.get('service', 'unknown')}\n"

        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )

        return response.choices[0].message.content.strip()

    def _save_diagram(self, diagram_code: str, cloud_provider: str) -> str:
        """Save Mermaid diagram to file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{cloud_provider}_diagram_{timestamp}.mmd"
        file_path = self.output_dir / filename

        with open(file_path, "w") as f:
            f.write(diagram_code)

        return filename


    def create_interactive_html(self, mermaid_diagram: str, cloud_provider: str) -> str:
        """
        Create an interactive HTML file that renders the Mermaid diagram

        Args:
            mermaid_diagram: Mermaid diagram code
            cloud_provider: Cloud provider name

        Returns:
            Path to generated HTML file
        """
        html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{cloud_provider.upper()} Infrastructure Diagram - Brahma</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }}
        h1 {{
            color: #333;
            margin-bottom: 10px;
        }}
        .subtitle {{
            color: #666;
            margin-bottom: 30px;
        }}
        .diagram-container {{
            background: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
            overflow-x: auto;
        }}
        .footer {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            color: #666;
            font-size: 14px;
        }}
        .badge {{
            display: inline-block;
            padding: 5px 12px;
            background: #667eea;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            margin-right: 10px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🏗️ Infrastructure Architecture Diagram</h1>
        <div class="subtitle">
            <span class="badge">{cloud_provider.upper()}</span>
            <span class="badge">Generated by Brahma</span>
            <span class="badge">Terraform</span>
        </div>

        <div class="diagram-container">
            <div class="mermaid">
{mermaid_diagram}
            </div>
        </div>

        <div class="footer">
            <strong>Generated:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}<br>
            <strong>Tool:</strong> InfraX Brahma - Intelligent IaC Orchestration Platform<br>
            <strong>Cloud Provider:</strong> {cloud_provider.upper()}<br>
            <br>
            <em>This diagram shows the complete infrastructure architecture that will be deployed using Terraform.</em>
        </div>
    </div>

    <script>
        mermaid.initialize({{
            startOnLoad: true,
            theme: 'default',
            flowchart: {{
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }}
        }});
    </script>
</body>
</html>"""

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{cloud_provider}_interactive_diagram_{timestamp}.html"
        file_path = self.output_dir / filename

        with open(file_path, "w") as f:
            f.write(html_template)

        return str(file_path)
