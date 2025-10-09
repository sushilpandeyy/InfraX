===========================================
DATA FOLDER - LOCAL GENERATED CONTENT
===========================================

This folder contains all generated content from Brahma workflows.
All files in this folder are LOCAL ONLY and NOT tracked in Git.

FOLDERS:
--------

generated_code/
  - Contains all generated Terraform/IaC code files
  - Format: {provider}_terraform_{timestamp}.tf
  - Example: aws_terraform_20241009_120000.tf

diagrams/
  - Contains Mermaid diagrams and HTML previews
  - Formats:
    * .mmd files - Mermaid diagram code (React-compatible)
    * .html files - Interactive HTML previews
  - Example: aws_diagram_20241009_120000.mmd

CLEANUP:
--------
You can safely delete all files in these folders at any time.
They will be regenerated when you create new workflows.

To clean up all generated content:
  rm -rf generated_code/* diagrams/*

GIT TRACKING:
-------------
These folders and their contents are excluded from Git via .gitignore:
  - data/generated_code/
  - data/diagrams/
  - data/*.db
  - data/*.sqlite*

DATABASE:
---------
Currently: IN-MEMORY STORAGE ONLY
- Workflow history is stored in memory (lost on server restart)
- No persistent database is being used
- Future: Will use SQLite/PostgreSQL for persistence

Location: data/workflows.db (when implemented)
