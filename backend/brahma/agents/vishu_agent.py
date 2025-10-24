"""
Vishu Agent - Intelligent Terraform Analyzer & Conversational Assistant
Enhanced with advanced tools for validation, security scanning, auto-formatting, and code generation
"""

import openai
import os
import subprocess
import tempfile
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from pathlib import Path
import json


class VishuAgent:
    """
    AI-powered agent that analyzes Terraform infrastructure code and provides
    conversational insights, Q&A, and improvement suggestions.

    Named "Vishu" - the intelligent analyst and advisor for infrastructure.
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key

        self.terraform_dir = Path(__file__).parent.parent.parent.parent / "data" / "generated_code"
        self.conversation_history = []

    def analyze_terraform_code(self, terraform_code: str, workflow_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze Terraform code and provide comprehensive insights

        Args:
            terraform_code: The Terraform code to analyze
            workflow_context: Optional workflow context (cloud provider, services, etc.)

        Returns:
            Analysis results with insights, issues, and recommendations
        """
        try:
            print("\n🔍 Vishu: Analyzing Terraform infrastructure...")

            system_prompt = """You are Vishu, an expert Terraform and cloud infrastructure analyst.

Your role is to:
1. Analyze Terraform code for best practices, security, and efficiency
2. Identify potential issues, vulnerabilities, and anti-patterns
3. Suggest specific improvements with code examples
4. Explain complex infrastructure decisions in simple terms
5. Provide cost optimization opportunities
6. Ensure security best practices are followed

Analyze the code and provide:
- Overall assessment (Good/Fair/Needs Improvement)
- Security analysis
- Cost optimization opportunities
- Best practice compliance
- Specific actionable recommendations

Be thorough, helpful, and educational."""

            user_prompt = f"""Analyze this Terraform infrastructure code:

```terraform
{terraform_code}
```
"""

            if workflow_context:
                user_prompt += f"\nWorkflow Context:\n"
                user_prompt += f"- Cloud Provider: {workflow_context.get('cloud_provider', 'Unknown')}\n"
                user_prompt += f"- Region: {workflow_context.get('region', 'Unknown')}\n"
                user_prompt += f"- Services: {workflow_context.get('services_count', 0)}\n"
                user_prompt += f"- Purpose: {workflow_context.get('prompt', 'Unknown')}\n"

            user_prompt += "\nProvide a comprehensive analysis with specific recommendations."

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=2500
            )

            analysis = response.choices[0].message.content.strip()

            return {
                "success": True,
                "analysis": analysis,
                "analyzed_at": datetime.utcnow().isoformat(),
                "code_length": len(terraform_code),
                "context": workflow_context
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def chat(self, message: str, workflow_id: str = None, terraform_code: str = None, workflow_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Conversational interface for asking questions about infrastructure

        Args:
            message: User's question or message
            workflow_id: Optional workflow ID for context
            terraform_code: Optional Terraform code for analysis
            workflow_context: Optional workflow metadata

        Returns:
            Vishu's response with insights and recommendations
        """
        try:
            print(f"\n💬 Vishu Chat: Processing query...")

            # Build context-aware system prompt
            system_prompt = """You are Vishu, an intelligent infrastructure analyst and advisor.

You help users understand their Terraform infrastructure by:
1. Answering questions about infrastructure design and decisions
2. Explaining cloud services and their purposes
3. Suggesting improvements and optimizations
4. Providing security and cost-saving recommendations
5. Helping debug infrastructure issues

Be conversational, helpful, and educational. Provide specific, actionable advice.
When suggesting improvements, provide code examples."""

            # Build conversation with context
            messages = [{"role": "system", "content": system_prompt}]

            # Add Terraform code context if provided
            if terraform_code:
                context_message = f"""Infrastructure Context:

Terraform Code:
```terraform
{terraform_code[:2000]}...  # Truncated for context
```
"""
                if workflow_context:
                    context_message += f"\nWorkflow Details:\n"
                    context_message += f"- Cloud Provider: {workflow_context.get('cloud_provider', 'Unknown')}\n"
                    context_message += f"- Region: {workflow_context.get('region', 'Unknown')}\n"
                    context_message += f"- Purpose: {workflow_context.get('prompt', 'Unknown')}\n"

                messages.append({"role": "system", "content": context_message})

            # Add conversation history (last 5 messages)
            messages.extend(self.conversation_history[-10:])

            # Add current user message
            messages.append({"role": "user", "content": message})

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.4,
                max_tokens=1500
            )

            assistant_message = response.choices[0].message.content.strip()

            # Update conversation history
            self.conversation_history.append({"role": "user", "content": message})
            self.conversation_history.append({"role": "assistant", "content": assistant_message})

            return {
                "success": True,
                "message": assistant_message,
                "workflow_id": workflow_id,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def suggest_improvements(self, terraform_code: str, focus_area: str = "all") -> Dict[str, Any]:
        """
        Suggest specific improvements for Terraform code

        Args:
            terraform_code: Terraform code to analyze
            focus_area: What to focus on (security/cost/performance/all)

        Returns:
            Specific improvement suggestions with code examples
        """
        try:
            print(f"\n💡 Vishu: Generating improvement suggestions (focus: {focus_area})...")

            focus_prompts = {
                "security": "Focus on security improvements, vulnerability fixes, and compliance.",
                "cost": "Focus on cost optimization, right-sizing, and efficient resource usage.",
                "performance": "Focus on performance improvements, scalability, and reliability.",
                "all": "Provide comprehensive improvements across security, cost, and performance."
            }

            system_prompt = f"""You are Vishu, an expert infrastructure optimization specialist.

{focus_prompts.get(focus_area, focus_prompts['all'])}

Provide:
1. Specific issue identified
2. Why it's a problem
3. Recommended solution with Terraform code example
4. Expected impact/benefit

Format each suggestion clearly with code examples."""

            user_prompt = f"""Analyze this Terraform code and suggest improvements:

```terraform
{terraform_code}
```

Focus area: {focus_area}

Provide 5-10 specific, actionable improvements with code examples."""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=2500
            )

            suggestions = response.choices[0].message.content.strip()

            return {
                "success": True,
                "suggestions": suggestions,
                "focus_area": focus_area,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def compare_workflows(self, workflow_ids: List[str], workflows_data: List[Dict]) -> Dict[str, Any]:
        """
        Compare multiple workflows and their infrastructure decisions

        Args:
            workflow_ids: List of workflow IDs to compare
            workflows_data: Workflow data including Terraform code

        Returns:
            Comparison analysis with recommendations
        """
        try:
            print(f"\n📊 Vishu: Comparing {len(workflow_ids)} workflows...")

            system_prompt = """You are Vishu, an infrastructure comparison analyst.

Compare the provided workflows and infrastructure designs:
1. Identify similarities and differences
2. Highlight best practices from each
3. Point out where one design is superior and why
4. Suggest a hybrid approach combining the best elements
5. Provide cost and performance comparisons

Be objective and educational."""

            workflows_summary = ""
            for i, workflow in enumerate(workflows_data, 1):
                workflows_summary += f"\n--- Workflow {i} ({workflow.get('workflow_id', 'Unknown')}) ---\n"
                workflows_summary += f"Cloud Provider: {workflow.get('cloud_provider', 'Unknown')}\n"
                workflows_summary += f"Region: {workflow.get('region', 'Unknown')}\n"
                workflows_summary += f"Services: {workflow.get('services_count', 0)}\n"
                workflows_summary += f"Purpose: {workflow.get('prompt', 'Unknown')}\n"

            user_prompt = f"""Compare these infrastructure workflows:

{workflows_summary}

Provide a comprehensive comparison and recommendations."""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )

            comparison = response.choices[0].message.content.strip()

            return {
                "success": True,
                "comparison": comparison,
                "workflows_compared": len(workflow_ids),
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def read_terraform_file(self, file_path: str) -> Optional[str]:
        """
        Read Terraform file from disk

        Args:
            file_path: Path to Terraform file

        Returns:
            Terraform code content or None
        """
        try:
            with open(file_path, 'r') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading Terraform file: {e}")
            return None

    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get the conversation history"""
        return self.conversation_history

    def clear_conversation_history(self):
        """Clear the conversation history"""
        self.conversation_history = []

    def get_quick_insights(self, terraform_code: str) -> Dict[str, Any]:
        """
        Get quick insights about Terraform code (faster than full analysis)

        Args:
            terraform_code: Terraform code to analyze

        Returns:
            Quick insights summary
        """
        try:
            # Extract basic metrics
            lines = terraform_code.split('\n')
            resource_count = len([l for l in lines if l.strip().startswith('resource "')])
            variable_count = len([l for l in lines if l.strip().startswith('variable "')])
            output_count = len([l for l in lines if l.strip().startswith('output "')])

            # Quick GPT-4 analysis
            system_prompt = """You are Vishu. Provide a quick 3-sentence summary of this Terraform code:
1. What it creates
2. One strength
3. One area for improvement"""

            user_prompt = f"Quick analysis:\n```terraform\n{terraform_code[:1000]}...\n```"

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=200
            )

            quick_summary = response.choices[0].message.content.strip()

            return {
                "success": True,
                "summary": quick_summary,
                "metrics": {
                    "total_lines": len(lines),
                    "resources": resource_count,
                    "variables": variable_count,
                    "outputs": output_count
                },
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    # ==================== ENHANCED TOOLS ====================

    def validate_terraform_syntax(self, terraform_code: str) -> Dict[str, Any]:
        """
        Validate Terraform syntax using terraform validate command

        Args:
            terraform_code: Terraform code to validate

        Returns:
            Validation results with errors/warnings
        """
        try:
            print("\n✅ Vishu: Validating Terraform syntax...")

            # Create temporary directory and file
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_file = Path(temp_dir) / "main.tf"
                temp_file.write_text(terraform_code)

                # Initialize terraform
                init_result = subprocess.run(
                    ["terraform", "init", "-backend=false"],
                    cwd=temp_dir,
                    capture_output=True,
                    text=True,
                    timeout=30
                )

                if init_result.returncode != 0:
                    # Terraform not installed, use AI-based validation
                    return self._ai_syntax_validation(terraform_code)

                # Run terraform validate
                validate_result = subprocess.run(
                    ["terraform", "validate", "-json"],
                    cwd=temp_dir,
                    capture_output=True,
                    text=True,
                    timeout=30
                )

                if validate_result.returncode == 0:
                    return {
                        "success": True,
                        "valid": True,
                        "message": "✅ Terraform syntax is valid!",
                        "errors": [],
                        "warnings": [],
                        "timestamp": datetime.utcnow().isoformat()
                    }
                else:
                    # Parse validation errors
                    try:
                        errors_json = json.loads(validate_result.stdout)
                        errors = errors_json.get("diagnostics", [])
                    except:
                        errors = [{"summary": validate_result.stderr}]

                    return {
                        "success": True,
                        "valid": False,
                        "message": f"❌ Found {len(errors)} syntax error(s)",
                        "errors": errors,
                        "warnings": [],
                        "timestamp": datetime.utcnow().isoformat()
                    }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Validation timed out",
                "timestamp": datetime.utcnow().isoformat()
            }
        except FileNotFoundError:
            # Terraform not installed, use AI-based validation
            return self._ai_syntax_validation(terraform_code)
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def _ai_syntax_validation(self, terraform_code: str) -> Dict[str, Any]:
        """AI-based syntax validation when Terraform CLI is not available"""
        try:
            system_prompt = """You are a Terraform syntax validator. Analyze the code and identify:
1. Syntax errors (invalid HCL, missing braces, etc.)
2. Common mistakes (missing required arguments, invalid resource types)
3. Return JSON format: {"valid": true/false, "errors": [...], "warnings": [...]}"""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Validate this Terraform code:\n```terraform\n{terraform_code}\n```"}
                ],
                temperature=0.1,
                max_tokens=1000
            )

            result = json.loads(response.choices[0].message.content.strip())

            return {
                "success": True,
                "valid": result.get("valid", True),
                "message": "✅ AI-based validation (install Terraform for precise results)" if result.get("valid") else "❌ Potential syntax issues detected",
                "errors": result.get("errors", []),
                "warnings": result.get("warnings", []),
                "method": "ai",
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"AI validation failed: {str(e)}",
                "timestamp": datetime.utcnow().isoformat()
            }

    def format_terraform_code(self, terraform_code: str) -> Dict[str, Any]:
        """
        Auto-format Terraform code using terraform fmt

        Args:
            terraform_code: Terraform code to format

        Returns:
            Formatted code
        """
        try:
            print("\n🎨 Vishu: Formatting Terraform code...")

            # Create temporary directory and file
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_file = Path(temp_dir) / "main.tf"
                temp_file.write_text(terraform_code)

                # Run terraform fmt
                fmt_result = subprocess.run(
                    ["terraform", "fmt", str(temp_file)],
                    cwd=temp_dir,
                    capture_output=True,
                    text=True,
                    timeout=10
                )

                # Read formatted code
                formatted_code = temp_file.read_text()

                changes_made = formatted_code != terraform_code

                return {
                    "success": True,
                    "formatted_code": formatted_code,
                    "changes_made": changes_made,
                    "message": "✅ Code formatted successfully!" if changes_made else "ℹ️ Code already properly formatted",
                    "timestamp": datetime.utcnow().isoformat()
                }

        except FileNotFoundError:
            # Terraform not installed, use AI-based formatting
            return self._ai_format_code(terraform_code)
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def _ai_format_code(self, terraform_code: str) -> Dict[str, Any]:
        """AI-based code formatting when Terraform CLI is not available"""
        try:
            system_prompt = """You are a Terraform code formatter. Format the code according to HashiCorp style guide:
- 2 spaces indentation
- Align equals signs
- Proper spacing around braces
- Consistent line breaks
Return ONLY the formatted code, no explanations."""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Format this Terraform code:\n```terraform\n{terraform_code}\n```"}
                ],
                temperature=0.1,
                max_tokens=3000
            )

            formatted_code = response.choices[0].message.content.strip()
            # Remove markdown code blocks if present
            formatted_code = re.sub(r'^```terraform\n|^```\n|```$', '', formatted_code, flags=re.MULTILINE).strip()

            return {
                "success": True,
                "formatted_code": formatted_code,
                "changes_made": formatted_code != terraform_code,
                "message": "✅ AI-based formatting applied",
                "method": "ai",
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"AI formatting failed: {str(e)}",
                "timestamp": datetime.utcnow().isoformat()
            }

    def security_scan(self, terraform_code: str) -> Dict[str, Any]:
        """
        Perform security scan on Terraform code using AI-powered analysis

        Args:
            terraform_code: Terraform code to scan

        Returns:
            Security scan results with vulnerabilities and fixes
        """
        try:
            print("\n🔒 Vishu: Running security scan...")

            system_prompt = """You are a Terraform security expert. Scan for security issues:

CRITICAL:
- Hardcoded credentials/secrets
- Public S3 buckets (acl = "public-read")
- Unencrypted storage (missing encryption)
- Open security groups (0.0.0.0/0)
- Missing IAM least privilege
- Disabled logging/monitoring

HIGH:
- HTTP instead of HTTPS
- Weak encryption algorithms
- Missing MFA requirements
- Overly permissive policies

MEDIUM:
- Missing backup configurations
- No versioning enabled
- Weak password policies

Return JSON: {
  "critical": [{issue, resource, line_hint, fix, severity_score}],
  "high": [...],
  "medium": [...],
  "low": [...],
  "score": 0-100 (100 = perfect security)
}"""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Scan this Terraform code:\n```terraform\n{terraform_code}\n```"}
                ],
                temperature=0.2,
                max_tokens=2500
            )

            result = json.loads(response.choices[0].message.content.strip())

            total_issues = (
                len(result.get("critical", [])) +
                len(result.get("high", [])) +
                len(result.get("medium", [])) +
                len(result.get("low", []))
            )

            return {
                "success": True,
                "security_score": result.get("score", 0),
                "total_issues": total_issues,
                "critical": result.get("critical", []),
                "high": result.get("high", []),
                "medium": result.get("medium", []),
                "low": result.get("low", []),
                "message": f"🔍 Found {total_issues} security issue(s)",
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def check_best_practices(self, terraform_code: str) -> Dict[str, Any]:
        """
        Check Terraform code against best practices

        Args:
            terraform_code: Terraform code to check

        Returns:
            Best practices compliance report
        """
        try:
            print("\n📋 Vishu: Checking best practices...")

            system_prompt = """You are a Terraform best practices expert. Check for:

1. Code Organization:
   - Use of modules
   - Resource naming conventions
   - File structure

2. State Management:
   - Remote backend configuration
   - State locking enabled

3. Variable Management:
   - Variables properly defined
   - Use of tfvars files
   - Sensitive variables marked

4. Resource Configuration:
   - Tags on all resources
   - Lifecycle rules where appropriate
   - Depends_on usage

5. Documentation:
   - Variable descriptions
   - Output descriptions
   - Comments for complex logic

Return JSON: {
  "score": 0-100,
  "passed": [checks],
  "failed": [{check, impact, recommendation}],
  "warnings": [{check, suggestion}]
}"""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Check best practices:\n```terraform\n{terraform_code}\n```"}
                ],
                temperature=0.2,
                max_tokens=2000
            )

            result = json.loads(response.choices[0].message.content.strip())

            return {
                "success": True,
                "score": result.get("score", 0),
                "passed": result.get("passed", []),
                "failed": result.get("failed", []),
                "warnings": result.get("warnings", []),
                "message": f"📊 Best practices score: {result.get('score', 0)}/100",
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def generate_auto_fix(self, terraform_code: str, issue_description: str) -> Dict[str, Any]:
        """
        Generate automatic fix for a specific issue

        Args:
            terraform_code: Original Terraform code
            issue_description: Description of the issue to fix

        Returns:
            Fixed code with explanation
        """
        try:
            print(f"\n🔧 Vishu: Generating auto-fix for: {issue_description}")

            system_prompt = """You are a Terraform code fixer. Given an issue, generate the fixed code.

Rules:
1. Fix ONLY the specific issue mentioned
2. Preserve all other code exactly as is
3. Add comments explaining the fix
4. Return complete fixed code
5. Explain what changed and why"""

            user_prompt = f"""Issue to fix: {issue_description}

Original code:
```terraform
{terraform_code}
```

Provide:
1. Fixed code (complete)
2. Changes made (list)
3. Explanation of fix"""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=3000
            )

            content = response.choices[0].message.content.strip()

            # Parse the response to extract code and explanation
            # This is a simplified parser - in production, use structured output
            fixed_code_match = re.search(r'```terraform\n(.*?)\n```', content, re.DOTALL)
            if fixed_code_match:
                fixed_code = fixed_code_match.group(1)
            else:
                # If no code block, assume the whole response is code
                fixed_code = terraform_code  # Fallback to original

            return {
                "success": True,
                "fixed_code": fixed_code,
                "explanation": content,
                "issue_fixed": issue_description,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def generate_documentation(self, terraform_code: str) -> Dict[str, Any]:
        """
        Generate comprehensive documentation for Terraform code

        Args:
            terraform_code: Terraform code to document

        Returns:
            Generated documentation in Markdown format
        """
        try:
            print("\n📝 Vishu: Generating documentation...")

            system_prompt = """You are a technical documentation expert. Generate comprehensive Terraform documentation:

Include:
1. Overview - What this infrastructure creates
2. Architecture Diagram (in text/ASCII)
3. Resources Created - Detailed list
4. Variables - All input variables with descriptions
5. Outputs - All outputs with descriptions
6. Prerequisites - What's needed to deploy
7. Deployment Instructions - Step by step
8. Cost Estimation - Approximate monthly cost
9. Security Considerations
10. Maintenance Notes

Format in beautiful Markdown."""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Document this Terraform code:\n```terraform\n{terraform_code}\n```"}
                ],
                temperature=0.3,
                max_tokens=3000
            )

            documentation = response.choices[0].message.content.strip()

            return {
                "success": True,
                "documentation": documentation,
                "format": "markdown",
                "message": "📄 Documentation generated successfully!",
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def analyze_resource_dependencies(self, terraform_code: str) -> Dict[str, Any]:
        """
        Analyze resource dependencies and relationships

        Args:
            terraform_code: Terraform code to analyze

        Returns:
            Dependency graph and analysis
        """
        try:
            print("\n🔗 Vishu: Analyzing resource dependencies...")

            system_prompt = """You are a Terraform dependency analyzer. Analyze resource relationships:

Identify:
1. Direct dependencies (explicit depends_on)
2. Implicit dependencies (resource references)
3. Dependency chains
4. Potential circular dependencies
5. Independent resources (can be created in parallel)

Return JSON: {
  "resources": [{name, type, depends_on_resources}],
  "dependency_chains": [[resource1, resource2, ...]],
  "parallel_groups": [[independent_resources]],
  "issues": [{type, description}],
  "graph": "Mermaid diagram syntax"
}"""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Analyze dependencies:\n```terraform\n{terraform_code}\n```"}
                ],
                temperature=0.2,
                max_tokens=2000
            )

            result = json.loads(response.choices[0].message.content.strip())

            return {
                "success": True,
                "resources": result.get("resources", []),
                "dependency_chains": result.get("dependency_chains", []),
                "parallel_groups": result.get("parallel_groups", []),
                "issues": result.get("issues", []),
                "graph": result.get("graph", ""),
                "message": f"🔍 Analyzed {len(result.get('resources', []))} resources",
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    # ==================== ADVANCED AI FEATURES ====================

    def parse_terraform_resources(self, terraform_code: str) -> Dict[str, Any]:
        """
        Parse Terraform code to extract all resources with their properties

        Args:
            terraform_code: Terraform code to parse

        Returns:
            Structured resource inventory
        """
        try:
            print("\n🔍 Vishu: Parsing Terraform resources...")

            system_prompt = """You are a Terraform code parser. Extract ALL resources from the code.

Return JSON format:
{
  "resources": [
    {
      "type": "aws_s3_bucket",
      "name": "data_bucket",
      "full_name": "aws_s3_bucket.data_bucket",
      "properties": {
        "bucket": "my-data-bucket",
        "acl": "private",
        "versioning": {"enabled": true}
      },
      "line_number": 10,
      "category": "storage"
    }
  ],
  "variables": [...],
  "outputs": [...],
  "data_sources": [...],
  "modules": [...]
}

Categories: compute, storage, network, database, security, monitoring, other"""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Parse this Terraform code:\n```terraform\n{terraform_code}\n```"}
                ],
                temperature=0.1,
                max_tokens=3000
            )

            result = json.loads(response.choices[0].message.content.strip())

            return {
                "success": True,
                "resources": result.get("resources", []),
                "variables": result.get("variables", []),
                "outputs": result.get("outputs", []),
                "data_sources": result.get("data_sources", []),
                "modules": result.get("modules", []),
                "total_resources": len(result.get("resources", [])),
                "resource_types": list(set([r["type"] for r in result.get("resources", [])])),
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def natural_language_query(self, terraform_code: str, query: str) -> Dict[str, Any]:
        """
        Execute natural language queries against Terraform code
        Examples:
        - "Show me all S3 buckets"
        - "List EC2 instances in production"
        - "Find resources without encryption"
        - "What databases are we using?"

        Args:
            terraform_code: Terraform code to query
            query: Natural language query

        Returns:
            Query results with matched resources
        """
        try:
            print(f"\n💬 Vishu: Processing query: '{query}'")

            # First, parse resources
            parsed = self.parse_terraform_resources(terraform_code)

            if not parsed.get("success"):
                return parsed

            resources = parsed.get("resources", [])

            # Use GPT-4 to understand and execute the query
            system_prompt = """You are a Terraform query engine. Given a natural language query and a list of resources, find matching resources.

Rules:
1. Understand user intent from the query
2. Match resources based on type, name, properties, or attributes
3. Return matching resources with explanations
4. If no matches, suggest similar queries

Return JSON:
{
  "matched_resources": [
    {
      "resource": {...},
      "match_reason": "This S3 bucket matches your query",
      "relevance_score": 0.95
    }
  ],
  "query_interpretation": "Looking for S3 storage buckets",
  "total_matches": 3,
  "suggestions": ["Show me encrypted S3 buckets", "List S3 buckets by region"]
}"""

            user_prompt = f"""Query: "{query}"

Available Resources:
{json.dumps(resources, indent=2)}

Find and return matching resources."""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=2500
            )

            result = json.loads(response.choices[0].message.content.strip())

            return {
                "success": True,
                "query": query,
                "matched_resources": result.get("matched_resources", []),
                "query_interpretation": result.get("query_interpretation", ""),
                "total_matches": result.get("total_matches", 0),
                "suggestions": result.get("suggestions", []),
                "total_resources_scanned": len(resources),
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def predictive_cost_analysis(self, terraform_code: str, months: int = 12,
                                 growth_rate: float = 0.05,
                                 usage_pattern: str = "steady") -> Dict[str, Any]:
        """
        Predict infrastructure costs over time with growth projections

        Args:
            terraform_code: Terraform code to analyze
            months: Number of months to forecast (default 12)
            growth_rate: Monthly growth rate (default 5% = 0.05)
            usage_pattern: "steady", "seasonal", "growing", "declining"

        Returns:
            Cost predictions with detailed breakdown
        """
        try:
            print(f"\n📊 Vishu: Analyzing costs for {months} months (growth: {growth_rate*100}%)...")

            # Parse resources first
            parsed = self.parse_terraform_resources(terraform_code)

            if not parsed.get("success"):
                return parsed

            resources = parsed.get("resources", [])

            system_prompt = """You are a cloud infrastructure cost forecasting expert with deep knowledge of AWS, Azure, and GCP pricing.

Analyze Terraform resources and predict costs:

1. Identify each resource type and estimate monthly costs
2. Consider:
   - Instance types and sizes
   - Storage volumes and types
   - Data transfer costs
   - Database capacity
   - Managed service fees
   - Regional pricing differences

3. Apply growth projections based on:
   - Usage pattern (steady/seasonal/growing/declining)
   - Growth rate
   - Scalability of resources

4. Provide cost breakdown by:
   - Resource category (compute, storage, network, database)
   - Individual resource
   - Monthly projections

Return JSON:
{
  "base_monthly_cost": 1250.50,
  "cost_breakdown": {
    "compute": 600.00,
    "storage": 200.00,
    "network": 150.00,
    "database": 250.00,
    "other": 50.50
  },
  "resource_costs": [
    {
      "resource": "aws_ec2_instance.web",
      "monthly_cost": 73.00,
      "category": "compute",
      "cost_factors": ["t3.large instance", "24/7 uptime", "us-east-1"]
    }
  ],
  "monthly_projections": [
    {"month": 1, "cost": 1250.50, "cumulative": 1250.50},
    {"month": 2, "cost": 1312.50, "cumulative": 2563.00},
    ...
  ],
  "yearly_total": 16890.00,
  "cost_drivers": [
    "EC2 instances account for 48% of costs",
    "RDS database is the second largest cost"
  ],
  "optimization_opportunities": [
    "Switch to reserved instances for 30% savings",
    "Use S3 lifecycle policies for 20% storage savings"
  ],
  "risk_factors": [
    "Data transfer costs may spike with high traffic",
    "Database storage may grow faster than projected"
  ]
}"""

            user_prompt = f"""Resources to analyze:
{json.dumps(resources, indent=2)}

Forecast Parameters:
- Months: {months}
- Growth Rate: {growth_rate*100}% per month
- Usage Pattern: {usage_pattern}

Provide detailed cost predictions."""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=3500
            )

            result = json.loads(response.choices[0].message.content.strip())

            # Add metadata
            result["success"] = True
            result["forecast_months"] = months
            result["growth_rate"] = growth_rate
            result["usage_pattern"] = usage_pattern
            result["total_resources_analyzed"] = len(resources)
            result["timestamp"] = datetime.utcnow().isoformat()

            return result

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def advanced_cost_query(self, terraform_code: str, query: str) -> Dict[str, Any]:
        """
        Answer cost-related questions using natural language
        Examples:
        - "What will this cost in 6 months?"
        - "Which resources are most expensive?"
        - "How can I reduce database costs?"
        - "Compare cost of AWS vs Azure for this setup"

        Args:
            terraform_code: Terraform code to analyze
            query: Cost-related question

        Returns:
            Answer with cost analysis
        """
        try:
            print(f"\n💰 Vishu: Answering cost query: '{query}'")

            # Get base cost analysis
            cost_analysis = self.predictive_cost_analysis(terraform_code, months=12)

            if not cost_analysis.get("success"):
                return cost_analysis

            system_prompt = """You are a cloud cost optimization expert. Answer cost-related questions based on the cost analysis data.

Provide:
1. Direct answer to the question
2. Supporting data from the analysis
3. Actionable recommendations
4. Cost comparisons if relevant

Be specific with numbers and percentages."""

            user_prompt = f"""Question: "{query}"

Cost Analysis Data:
{json.dumps(cost_analysis, indent=2)}

Provide a detailed answer."""

            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )

            answer = response.choices[0].message.content.strip()

            return {
                "success": True,
                "query": query,
                "answer": answer,
                "cost_data": cost_analysis,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def comprehensive_audit(self, terraform_code: str, workflow_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Run comprehensive audit combining all tools

        Args:
            terraform_code: Terraform code to audit
            workflow_context: Optional workflow metadata

        Returns:
            Complete audit report with all checks
        """
        try:
            print("\n🔍 Vishu: Running comprehensive audit...")

            # Run all checks
            validation = self.validate_terraform_syntax(terraform_code)
            security = self.security_scan(terraform_code)
            best_practices = self.check_best_practices(terraform_code)
            dependencies = self.analyze_resource_dependencies(terraform_code)
            insights = self.get_quick_insights(terraform_code)

            # Calculate overall score
            scores = []
            if security.get("success"):
                scores.append(security.get("security_score", 0))
            if best_practices.get("success"):
                scores.append(best_practices.get("score", 0))

            overall_score = sum(scores) / len(scores) if scores else 0

            # Determine grade
            if overall_score >= 90:
                grade = "A+"
            elif overall_score >= 80:
                grade = "A"
            elif overall_score >= 70:
                grade = "B"
            elif overall_score >= 60:
                grade = "C"
            else:
                grade = "D"

            return {
                "success": True,
                "overall_score": round(overall_score, 1),
                "grade": grade,
                "validation": validation,
                "security": security,
                "best_practices": best_practices,
                "dependencies": dependencies,
                "insights": insights,
                "total_issues": (
                    security.get("total_issues", 0) +
                    len(best_practices.get("failed", []))
                ),
                "message": f"📊 Audit complete: Grade {grade} ({overall_score:.1f}/100)",
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }


# Example usage
if __name__ == "__main__":
    vishu = VishuAgent()

    # Test with sample Terraform code
    sample_tf = """
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
  }
}

resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
  acl    = "private"
}
"""

    # Quick insights
    insights = vishu.get_quick_insights(sample_tf)
    print(json.dumps(insights, indent=2))

    # Full analysis
    analysis = vishu.analyze_terraform_code(sample_tf, {
        "cloud_provider": "aws",
        "region": "us-east-1",
        "prompt": "Web server with S3 storage"
    })
    print(json.dumps(analysis, indent=2))

    # Chat
    chat_response = vishu.chat(
        "How can I make this infrastructure more secure?",
        terraform_code=sample_tf
    )
    print(json.dumps(chat_response, indent=2))
