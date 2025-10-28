"""
Repository Analyzer Tool

Analyzes GitHub/GitLab repositories to extract infrastructure requirements.
"""

import os
import re
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import requests
from openai import OpenAI


class RepositoryAnalyzer:
    """
    Analyzes code repositories to automatically detect tech stack and infrastructure needs.
    """

    def __init__(self):
        """Initialize the repository analyzer with OpenAI client"""
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.github_token = os.getenv('GITHUB_TOKEN')  # Optional for higher rate limits

    def analyze_repository(self, repo_url: str) -> Dict[str, Any]:
        """
        Main analysis function that orchestrates the entire repository analysis.

        Args:
            repo_url: GitHub or GitLab repository URL

        Returns:
            Dictionary containing analysis results and generated infrastructure requirements
        """
        try:
            print(f"[RepositoryAnalyzer] Starting analysis of: {repo_url}")

            # Parse repository URL
            repo_info = self._parse_repo_url(repo_url)
            if not repo_info['success']:
                return {
                    'success': False,
                    'error': repo_info['error']
                }

            # Fetch repository contents via API
            repo_data = self._fetch_repo_data(repo_info)
            if not repo_data['success']:
                return {
                    'success': False,
                    'error': repo_data['error']
                }

            # Analyze the codebase
            analysis = self._analyze_codebase(repo_data['data'])

            # Generate infrastructure prompt using AI
            infra_prompt = self._generate_infrastructure_prompt(analysis, repo_data['data'])

            return {
                'success': True,
                'repo_url': repo_url,
                'repo_name': repo_info['repo_name'],
                'owner': repo_info['owner'],
                'analysis': analysis,
                'generated_prompt': infra_prompt,
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"[RepositoryAnalyzer] Error: {str(e)}")
            return {
                'success': False,
                'error': f"Repository analysis failed: {str(e)}"
            }

    def _parse_repo_url(self, repo_url: str) -> Dict[str, Any]:
        """Parse GitHub/GitLab URL to extract owner and repo name"""
        try:
            # Support both GitHub and GitLab URLs
            patterns = [
                r'github\.com/([^/]+)/([^/]+?)(?:\.git)?$',
                r'gitlab\.com/([^/]+)/([^/]+?)(?:\.git)?$',
            ]

            for pattern in patterns:
                match = re.search(pattern, repo_url)
                if match:
                    owner, repo = match.groups()
                    platform = 'github' if 'github.com' in repo_url else 'gitlab'
                    return {
                        'success': True,
                        'owner': owner,
                        'repo_name': repo.replace('.git', ''),
                        'platform': platform
                    }

            return {
                'success': False,
                'error': 'Invalid repository URL. Please provide a valid GitHub or GitLab URL.'
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to parse repository URL: {str(e)}'
            }

    def _fetch_repo_data(self, repo_info: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch repository data via GitHub/GitLab API"""
        try:
            if repo_info['platform'] == 'github':
                return self._fetch_github_data(repo_info['owner'], repo_info['repo_name'])
            else:
                return self._fetch_gitlab_data(repo_info['owner'], repo_info['repo_name'])

        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to fetch repository data: {str(e)}'
            }

    def _fetch_github_data(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch data from GitHub API"""
        try:
            headers = {'Accept': 'application/vnd.github.v3+json'}
            if self.github_token:
                headers['Authorization'] = f'token {self.github_token}'

            # Get repository info
            repo_url = f'https://api.github.com/repos/{owner}/{repo}'
            repo_response = requests.get(repo_url, headers=headers)

            if repo_response.status_code == 404:
                return {'success': False, 'error': 'Repository not found or private'}
            elif repo_response.status_code != 200:
                return {'success': False, 'error': f'GitHub API error: {repo_response.status_code}'}

            repo_json = repo_response.json()

            # Get repository contents (root directory)
            contents_url = f'https://api.github.com/repos/{owner}/{repo}/contents'
            contents_response = requests.get(contents_url, headers=headers)

            if contents_response.status_code != 200:
                return {'success': False, 'error': 'Failed to fetch repository contents'}

            contents = contents_response.json()

            # Get README
            readme_content = self._fetch_readme(owner, repo, headers)

            # Get key files content
            key_files = self._fetch_key_files(owner, repo, contents, headers)

            return {
                'success': True,
                'data': {
                    'repo_info': {
                        'name': repo_json.get('name'),
                        'description': repo_json.get('description'),
                        'language': repo_json.get('language'),
                        'size': repo_json.get('size'),
                        'stargazers_count': repo_json.get('stargazers_count'),
                        'forks_count': repo_json.get('forks_count'),
                    },
                    'readme': readme_content,
                    'contents': contents,
                    'key_files': key_files
                }
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'GitHub API error: {str(e)}'
            }

    def _fetch_gitlab_data(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch data from GitLab API"""
        # Simplified GitLab support - can be expanded later
        return {
            'success': False,
            'error': 'GitLab support coming soon. Please use GitHub repositories for now.'
        }

    def _fetch_readme(self, owner: str, repo: str, headers: Dict) -> Optional[str]:
        """Fetch README content"""
        try:
            readme_url = f'https://api.github.com/repos/{owner}/{repo}/readme'
            response = requests.get(readme_url, headers=headers)

            if response.status_code == 200:
                import base64
                content = response.json().get('content', '')
                return base64.b64decode(content).decode('utf-8')
            return None

        except Exception:
            return None

    def _fetch_key_files(self, owner: str, repo: str, contents: List, headers: Dict) -> Dict[str, str]:
        """Fetch content of key configuration files"""
        key_filenames = [
            'package.json',
            'requirements.txt',
            'Pipfile',
            'go.mod',
            'pom.xml',
            'build.gradle',
            'Cargo.toml',
            'composer.json',
            'Gemfile',
            'docker-compose.yml',
            'Dockerfile',
            '.env.example',
            'kubernetes.yaml',
            'k8s.yaml'
        ]

        key_files = {}

        for item in contents:
            if item['type'] == 'file' and item['name'] in key_filenames:
                try:
                    file_response = requests.get(item['url'], headers=headers)
                    if file_response.status_code == 200:
                        import base64
                        content = file_response.json().get('content', '')
                        decoded = base64.b64decode(content).decode('utf-8', errors='ignore')
                        key_files[item['name']] = decoded
                except Exception as e:
                    print(f"Failed to fetch {item['name']}: {e}")
                    continue

        return key_files

    def _analyze_codebase(self, repo_data: Dict) -> Dict[str, Any]:
        """Analyze repository data to extract tech stack and patterns"""
        analysis = {
            'tech_stack': [],
            'frameworks': [],
            'databases': [],
            'infrastructure': [],
            'languages': [],
            'scale_indicators': {},
            'dependencies': {}
        }

        # Analyze primary language
        if repo_data['repo_info'].get('language'):
            analysis['languages'].append(repo_data['repo_info']['language'])

        # Analyze key files
        key_files = repo_data.get('key_files', {})

        # Node.js/JavaScript detection
        if 'package.json' in key_files:
            try:
                package_data = json.loads(key_files['package.json'])
                analysis['tech_stack'].append('Node.js')

                deps = {**package_data.get('dependencies', {}), **package_data.get('devDependencies', {})}
                analysis['dependencies']['npm'] = list(deps.keys())

                # Detect frameworks
                if 'react' in deps:
                    analysis['frameworks'].append('React')
                if 'next' in deps:
                    analysis['frameworks'].append('Next.js')
                if 'express' in deps:
                    analysis['frameworks'].append('Express.js')
                if 'vue' in deps:
                    analysis['frameworks'].append('Vue.js')
                if 'angular' in deps:
                    analysis['frameworks'].append('Angular')

                # Detect databases
                if 'pg' in deps or 'postgres' in deps:
                    analysis['databases'].append('PostgreSQL')
                if 'mysql' in deps or 'mysql2' in deps:
                    analysis['databases'].append('MySQL')
                if 'mongodb' in deps:
                    analysis['databases'].append('MongoDB')
                if 'redis' in deps:
                    analysis['databases'].append('Redis')

            except Exception as e:
                print(f"Error parsing package.json: {e}")

        # Python detection
        if 'requirements.txt' in key_files:
            analysis['tech_stack'].append('Python')
            req_content = key_files['requirements.txt'].lower()

            if 'django' in req_content:
                analysis['frameworks'].append('Django')
            if 'flask' in req_content:
                analysis['frameworks'].append('Flask')
            if 'fastapi' in req_content:
                analysis['frameworks'].append('FastAPI')

            if 'psycopg2' in req_content or 'postgresql' in req_content:
                analysis['databases'].append('PostgreSQL')
            if 'pymysql' in req_content or 'mysql' in req_content:
                analysis['databases'].append('MySQL')
            if 'pymongo' in req_content:
                analysis['databases'].append('MongoDB')
            if 'redis' in req_content:
                analysis['databases'].append('Redis')

        # Docker detection
        if 'Dockerfile' in key_files:
            analysis['infrastructure'].append('Docker')

        if 'docker-compose.yml' in key_files:
            analysis['infrastructure'].append('Docker Compose')

        # Kubernetes detection
        if any(k in key_files for k in ['kubernetes.yaml', 'k8s.yaml']):
            analysis['infrastructure'].append('Kubernetes')

        # Scale indicators
        analysis['scale_indicators'] = {
            'repo_size_kb': repo_data['repo_info'].get('size', 0),
            'stars': repo_data['repo_info'].get('stargazers_count', 0),
            'complexity': 'medium' if repo_data['repo_info'].get('size', 0) > 1000 else 'low'
        }

        return analysis

    def _generate_infrastructure_prompt(self, analysis: Dict, repo_data: Dict) -> str:
        """Use GPT-4 to generate a comprehensive infrastructure prompt from analysis"""
        try:
            # Prepare context for GPT-4
            context = {
                'repo_name': repo_data['repo_info']['name'],
                'description': repo_data['repo_info'].get('description', 'No description provided'),
                'tech_stack': analysis['tech_stack'],
                'frameworks': analysis['frameworks'],
                'databases': analysis['databases'],
                'infrastructure': analysis['infrastructure'],
                'languages': analysis['languages'],
                'readme_snippet': repo_data.get('readme', '')[:2000] if repo_data.get('readme') else None
            }

            prompt = f"""Analyze this code repository and generate a comprehensive infrastructure requirements prompt.

Repository Information:
- Name: {context['repo_name']}
- Description: {context['description']}
- Languages: {', '.join(context['languages']) if context['languages'] else 'Unknown'}
- Tech Stack: {', '.join(context['tech_stack']) if context['tech_stack'] else 'Not detected'}
- Frameworks: {', '.join(context['frameworks']) if context['frameworks'] else 'None detected'}
- Databases: {', '.join(context['databases']) if context['databases'] else 'None detected'}
- Existing Infrastructure: {', '.join(context['infrastructure']) if context['infrastructure'] else 'None'}

README Content (first 2000 chars):
{context['readme_snippet'] if context['readme_snippet'] else 'No README found'}

Based on this repository analysis, generate a detailed infrastructure requirements prompt that includes:
1. Application type and primary function
2. Required cloud services (compute, database, storage, networking)
3. Estimated scale and traffic expectations
4. Security and compliance considerations
5. High availability and disaster recovery needs
6. Monitoring and logging requirements

Generate the prompt in a clear, technical format that an infrastructure engineer would write."""

            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert DevOps engineer and cloud architect. Analyze code repositories and generate precise infrastructure requirements."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )

            generated_prompt = response.choices[0].message.content.strip()

            print(f"[RepositoryAnalyzer] Generated infrastructure prompt ({len(generated_prompt)} chars)")
            return generated_prompt

        except Exception as e:
            print(f"[RepositoryAnalyzer] Error generating prompt with GPT-4: {str(e)}")
            # Fallback to template-based prompt
            return self._generate_template_prompt(analysis, repo_data)

    def _generate_template_prompt(self, analysis: Dict, repo_data: Dict) -> str:
        """Generate a template-based prompt as fallback"""
        tech_stack = ', '.join(analysis['tech_stack']) if analysis['tech_stack'] else 'web application'
        frameworks = ', '.join(analysis['frameworks']) if analysis['frameworks'] else ''
        databases = ', '.join(analysis['databases']) if analysis['databases'] else 'database'

        prompt = f"""Infrastructure for {repo_data['repo_info']['name']} application.

Application Details:
- Primary technology: {tech_stack}
{'- Frameworks: ' + frameworks if frameworks else ''}
- Database requirements: {databases}
- Repository description: {repo_data['repo_info'].get('description', 'Not provided')}

Infrastructure Requirements:
- Compute resources for hosting the application
- Managed {databases} database with automated backups
- Load balancing and auto-scaling capabilities
- Monitoring and logging setup
- Security best practices including firewalls and SSL/TLS
- Cost-optimized resource allocation

Environment: Production-ready with high availability"""

        return prompt
