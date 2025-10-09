from jinja2 import Environment, FileSystemLoader
from typing import Dict, List, Optional, Any
import json
import yaml
import os
from datetime import datetime

class IaCGenerationAgent:
    def __init__(self):
        self.template_dir = "templates"
        self.output_dir = "../data/generated_code"
        self.jinja_env = Environment(loader=FileSystemLoader(self.template_dir))

        # Best practices and security rules
        self.security_rules = {
            "aws": [
                "Enable encryption at rest",
                "Use IAM roles instead of access keys",
                "Enable VPC flow logs",
                "Use security groups with least privilege",
                "Enable CloudTrail logging",
                "Use KMS for encryption keys"
            ],
            "azure": [
                "Enable Azure Security Center",
                "Use managed identities",
                "Enable diagnostic logging",
                "Use Network Security Groups",
                "Enable Azure Monitor",
                "Use Azure Key Vault for secrets"
            ],
            "gcp": [
                "Enable Cloud Security Command Center",
                "Use service accounts with minimal permissions",
                "Enable audit logging",
                "Use VPC firewall rules",
                "Enable Cloud Monitoring",
                "Use Cloud KMS for encryption"
            ]
        }

        # Resource optimization rules
        self.optimization_rules = {
            "compute": {
                "right_sizing": "Use appropriate instance types based on workload",
                "auto_scaling": "Implement auto-scaling for variable workloads",
                "spot_instances": "Consider spot/preemptible instances for fault-tolerant workloads"
            },
            "storage": {
                "lifecycle": "Implement storage lifecycle policies",
                "compression": "Enable compression where applicable",
                "tiering": "Use appropriate storage tiers"
            },
            "networking": {
                "cdn": "Use CDN for global content delivery",
                "load_balancing": "Implement proper load balancing",
                "bandwidth": "Optimize bandwidth usage"
            }
        }

    def generate_iac_code(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate optimal IaC code based on requirements
        """
        try:
            cloud_provider = requirements.get("cloud_provider", "aws").lower()
            iac_type = requirements.get("iac_type", "terraform").lower()
            services = requirements.get("services", [])

            # Generate code based on IaC type
            if iac_type == "terraform":
                code = self._generate_terraform(cloud_provider, services, requirements)
            elif iac_type == "cloudformation":
                code = self._generate_cloudformation(services, requirements)
            elif iac_type == "pulumi":
                code = self._generate_pulumi(cloud_provider, services, requirements)
            else:
                raise ValueError(f"Unsupported IaC type: {iac_type}")

            # Apply security and optimization best practices
            code = self._apply_best_practices(code, cloud_provider, iac_type)

            # Save generated code
            filename = self._save_generated_code(code, cloud_provider, iac_type, requirements)

            return {
                "success": True,
                "code": code,
                "filename": filename,
                "cloud_provider": cloud_provider,
                "iac_type": iac_type,
                "security_notes": self.security_rules.get(cloud_provider, []),
                "optimization_notes": self._get_optimization_notes(services),
                "generated_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "generated_at": datetime.utcnow().isoformat()
            }

    def _generate_terraform(self, cloud_provider: str, services: List[Dict], requirements: Dict) -> str:
        """Generate Terraform configuration"""
        if cloud_provider == "aws":
            return self._generate_aws_terraform(services, requirements)
        elif cloud_provider == "azure":
            return self._generate_azure_terraform(services, requirements)
        elif cloud_provider == "gcp":
            return self._generate_gcp_terraform(services, requirements)
        else:
            raise ValueError(f"Unsupported cloud provider for Terraform: {cloud_provider}")

    def _generate_azure_terraform(self, services: List[Dict], requirements: Dict) -> str:
        """Generate Azure Terraform configuration"""
        terraform_config = []

        # Provider configuration
        terraform_config.append("""
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "infrax-project"
}

locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.location

  tags = local.common_tags
}
""")

        # Generate resources based on services
        for service in services:
            service_type = service.get("type", "").lower()

            if service_type == "compute":
                terraform_config.append(self._generate_azure_vm(service, requirements))
            elif service_type == "database":
                terraform_config.append(self._generate_azure_sql(service, requirements))
            elif service_type == "storage":
                terraform_config.append(self._generate_azure_storage(service, requirements))
            elif service_type == "networking":
                terraform_config.append(self._generate_azure_vnet(service, requirements))
            elif service_type == "container":
                terraform_config.append(self._generate_azure_aks(service, requirements))

        return "\n".join(terraform_config)

    def _generate_azure_vm(self, service: Dict, requirements: Dict) -> str:
        """Generate Azure VM Terraform configuration"""
        vm_size = service.get("instance_type", "Standard_B2s")
        return f"""
# Virtual Network (if not already created)
resource "azurerm_virtual_network" "main" {{
  name                = "${{var.project_name}}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = local.common_tags
}}

resource "azurerm_subnet" "main" {{
  name                 = "${{var.project_name}}-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}}

# Network Security Group
resource "azurerm_network_security_group" "main" {{
  name                = "${{var.project_name}}-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  security_rule {{
    name                       = "HTTP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }}

  security_rule {{
    name                       = "HTTPS"
    priority                   = 101
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }}

  tags = local.common_tags
}}

# Public IP
resource "azurerm_public_ip" "main" {{
  name                = "${{var.project_name}}-pip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = local.common_tags
}}

# Network Interface
resource "azurerm_network_interface" "main" {{
  name                = "${{var.project_name}}-nic"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {{
    name                          = "internal"
    subnet_id                     = azurerm_subnet.main.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.main.id
  }}

  tags = local.common_tags
}}

resource "azurerm_network_interface_security_group_association" "main" {{
  network_interface_id      = azurerm_network_interface.main.id
  network_security_group_id = azurerm_network_security_group.main.id
}}

# Virtual Machine
resource "azurerm_linux_virtual_machine" "main" {{
  name                = "${{var.project_name}}-vm"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = "{vm_size}"
  admin_username      = "azureuser"

  network_interface_ids = [
    azurerm_network_interface.main.id,
  ]

  admin_ssh_key {{
    username   = "azureuser"
    public_key = file("~/.ssh/id_rsa.pub")
  }}

  os_disk {{
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_encryption_set_id = azurerm_disk_encryption_set.main.id
  }}

  source_image_reference {{
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }}

  tags = local.common_tags
}}

# Disk Encryption
resource "azurerm_disk_encryption_set" "main" {{
  name                = "${{var.project_name}}-des"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  key_vault_key_id    = azurerm_key_vault_key.main.id

  identity {{
    type = "SystemAssigned"
  }}

  tags = local.common_tags
}}
"""

    def _generate_azure_sql(self, service: Dict, requirements: Dict) -> str:
        """Generate Azure SQL Database Terraform configuration"""
        return """
# Azure SQL Server
resource "azurerm_mssql_server" "main" {
  name                         = "${var.project_name}-sqlserver"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = "sqladmin"
  administrator_login_password = random_password.sql_password.result

  minimum_tls_version = "1.2"

  azuread_administrator {
    login_username = "AzureAD Admin"
    object_id      = data.azurerm_client_config.current.object_id
  }

  tags = local.common_tags
}

# Azure SQL Database
resource "azurerm_mssql_database" "main" {
  name           = "${var.project_name}-sqldb"
  server_id      = azurerm_mssql_server.main.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  license_type   = "LicenseIncluded"
  max_size_gb    = 32
  sku_name       = "S0"
  zone_redundant = false

  tags = local.common_tags
}

# SQL Firewall Rules
resource "azurerm_mssql_firewall_rule" "main" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Random Password
resource "random_password" "sql_password" {
  length  = 16
  special = true
}

data "azurerm_client_config" "current" {}
"""

    def _generate_azure_storage(self, service: Dict, requirements: Dict) -> str:
        """Generate Azure Storage Account Terraform configuration"""
        return """
# Storage Account
resource "azurerm_storage_account" "main" {
  name                     = "${var.project_name}${random_string.storage_suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "GRS"
  min_tls_version          = "TLS1_2"

  enable_https_traffic_only       = true
  allow_nested_items_to_be_public = false

  blob_properties {
    versioning_enabled = true

    delete_retention_policy {
      days = 7
    }

    container_delete_retention_policy {
      days = 7
    }
  }

  network_rules {
    default_action = "Deny"
    bypass         = ["AzureServices"]
  }

  tags = local.common_tags
}

# Storage Container
resource "azurerm_storage_container" "main" {
  name                  = "data"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

resource "random_string" "storage_suffix" {
  length  = 8
  special = false
  upper   = false
}
"""

    def _generate_azure_vnet(self, service: Dict, requirements: Dict) -> str:
        """Generate Azure VNet Terraform configuration"""
        return """
# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "${var.project_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = local.common_tags
}

# Subnets
resource "azurerm_subnet" "app" {
  name                 = "${var.project_name}-app-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "data" {
  name                 = "${var.project_name}-data-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]

  service_endpoints = ["Microsoft.Sql", "Microsoft.Storage"]
}

# Network Security Groups
resource "azurerm_network_security_group" "app" {
  name                = "${var.project_name}-app-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  security_rule {
    name                       = "AllowHTTP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 101
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = local.common_tags
}

resource "azurerm_subnet_network_security_group_association" "app" {
  subnet_id                 = azurerm_subnet.app.id
  network_security_group_id = azurerm_network_security_group.app.id
}
"""

    def _generate_azure_aks(self, service: Dict, requirements: Dict) -> str:
        """Generate Azure AKS Terraform configuration"""
        node_count = service.get("node_count", 2)
        vm_size = service.get("vm_size", "Standard_D2s_v3")
        return f"""
# Azure Kubernetes Service
resource "azurerm_kubernetes_cluster" "main" {{
  name                = "${{var.project_name}}-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "${{var.project_name}}-aks"

  default_node_pool {{
    name       = "default"
    node_count = {node_count}
    vm_size    = "{vm_size}"

    vnet_subnet_id = azurerm_subnet.app.id
  }}

  identity {{
    type = "SystemAssigned"
  }}

  network_profile {{
    network_plugin    = "azure"
    load_balancer_sku = "standard"
    network_policy    = "azure"
  }}

  azure_active_directory_role_based_access_control {{
    managed            = true
    azure_rbac_enabled = true
  }}

  tags = local.common_tags
}}

# Output
output "kube_config" {{
  value     = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive = true
}}
"""

    def _generate_gcp_terraform(self, services: List[Dict], requirements: Dict) -> str:
        """Generate GCP Terraform configuration"""
        terraform_config = []

        # Provider configuration
        terraform_config.append("""
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "infrax-project"
}

locals {
  common_labels = {
    environment = var.environment
    project     = var.project_name
    managed_by  = "terraform"
  }
}
""")

        # Generate resources based on services
        for service in services:
            service_type = service.get("type", "").lower()

            if service_type == "compute":
                terraform_config.append(self._generate_gcp_compute(service, requirements))
            elif service_type == "database":
                terraform_config.append(self._generate_gcp_sql(service, requirements))
            elif service_type == "storage":
                terraform_config.append(self._generate_gcp_storage(service, requirements))
            elif service_type == "networking":
                terraform_config.append(self._generate_gcp_vpc(service, requirements))
            elif service_type == "container":
                terraform_config.append(self._generate_gcp_gke(service, requirements))

        return "\n".join(terraform_config)

    def _generate_gcp_compute(self, service: Dict, requirements: Dict) -> str:
        """Generate GCP Compute Engine Terraform configuration"""
        machine_type = service.get("instance_type", "e2-medium")
        return f"""
# Compute Instance
resource "google_compute_instance" "main" {{
  name         = "${{var.project_name}}-instance"
  machine_type = "{machine_type}"
  zone         = var.zone

  boot_disk {{
    initialize_params {{
      image = "debian-cloud/debian-11"
      type  = "pd-ssd"
    }}
    kms_key_self_link = google_kms_crypto_key.compute_key.id
  }}

  network_interface {{
    network    = google_compute_network.main.id
    subnetwork = google_compute_subnetwork.main.id

    access_config {{
      // Ephemeral public IP
    }}
  }}

  metadata = {{
    environment = var.environment
  }}

  metadata_startup_script = "echo 'InfraX Instance Started' > /tmp/startup.log"

  service_account {{
    email  = google_service_account.compute.email
    scopes = ["cloud-platform"]
  }}

  shielded_instance_config {{
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }}

  labels = local.common_labels
}}

# Service Account
resource "google_service_account" "compute" {{
  account_id   = "${{var.project_name}}-compute-sa"
  display_name = "Compute Service Account"
}}

# KMS Key for encryption
resource "google_kms_key_ring" "main" {{
  name     = "${{var.project_name}}-keyring"
  location = var.region
}}

resource "google_kms_crypto_key" "compute_key" {{
  name     = "${{var.project_name}}-compute-key"
  key_ring = google_kms_key_ring.main.id

  lifecycle {{
    prevent_destroy = true
  }}
}}
"""

    def _generate_gcp_sql(self, service: Dict, requirements: Dict) -> str:
        """Generate GCP Cloud SQL Terraform configuration"""
        database_version = service.get("engine", "MYSQL_8_0")
        tier = service.get("instance_class", "db-f1-micro")
        return f"""
# Cloud SQL Instance
resource "google_sql_database_instance" "main" {{
  name             = "${{var.project_name}}-db-instance"
  database_version = "{database_version}"
  region           = var.region

  settings {{
    tier = "{tier}"

    backup_configuration {{
      enabled            = true
      start_time         = "03:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
    }}

    ip_configuration {{
      ipv4_enabled    = false
      private_network = google_compute_network.main.id
      require_ssl     = true
    }}

    database_flags {{
      name  = "cloudsql_iam_authentication"
      value = "on"
    }}

    disk_autoresize = true
    disk_size       = 20
    disk_type       = "PD_SSD"

    user_labels = local.common_labels
  }}

  deletion_protection = false
}}

# Database
resource "google_sql_database" "main" {{
  name     = "${{var.project_name}}-db"
  instance = google_sql_database_instance.main.name
}}

# Database User
resource "google_sql_user" "main" {{
  name     = "admin"
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}}

resource "random_password" "db_password" {{
  length  = 16
  special = true
}}

# Private Service Connection
resource "google_compute_global_address" "private_ip" {{
  name          = "${{var.project_name}}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.main.id
}}

resource "google_service_networking_connection" "private_vpc_connection" {{
  network                 = google_compute_network.main.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip.name]
}}
"""

    def _generate_gcp_storage(self, service: Dict, requirements: Dict) -> str:
        """Generate GCP Cloud Storage Terraform configuration"""
        return """
# Cloud Storage Bucket
resource "google_storage_bucket" "main" {
  name          = "${var.project_name}-${var.environment}-bucket-${random_string.bucket_suffix.result}"
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  encryption {
    default_kms_key_name = google_kms_crypto_key.storage_key.id
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  labels = local.common_labels
}

# KMS Key for storage encryption
resource "google_kms_crypto_key" "storage_key" {
  name     = "${var.project_name}-storage-key"
  key_ring = google_kms_key_ring.main.id

  lifecycle {
    prevent_destroy = true
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# IAM binding for bucket
resource "google_storage_bucket_iam_member" "admin" {
  bucket = google_storage_bucket.main.name
  role   = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.compute.email}"
}
"""

    def _generate_gcp_vpc(self, service: Dict, requirements: Dict) -> str:
        """Generate GCP VPC Terraform configuration"""
        return """
# VPC Network
resource "google_compute_network" "main" {
  name                    = "${var.project_name}-vpc"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "main" {
  name          = "${var.project_name}-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.main.id

  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Firewall Rules
resource "google_compute_firewall" "allow_http" {
  name    = "${var.project_name}-allow-http"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server"]
}

resource "google_compute_firewall" "allow_https" {
  name    = "${var.project_name}-allow-https"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["https-server"]
}

resource "google_compute_firewall" "allow_internal" {
  name    = "${var.project_name}-allow-internal"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/16"]
}

# Cloud Router and NAT
resource "google_compute_router" "main" {
  name    = "${var.project_name}-router"
  region  = var.region
  network = google_compute_network.main.id
}

resource "google_compute_router_nat" "main" {
  name                               = "${var.project_name}-nat"
  router                             = google_compute_router.main.name
  region                             = google_compute_router.main.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}
"""

    def _generate_gcp_gke(self, service: Dict, requirements: Dict) -> str:
        """Generate GCP GKE Terraform configuration"""
        node_count = service.get("node_count", 2)
        machine_type = service.get("vm_size", "e2-medium")
        return f"""
# GKE Cluster
resource "google_container_cluster" "main" {{
  name     = "${{var.project_name}}-gke"
  location = var.region

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.main.id
  subnetwork = google_compute_subnetwork.main.id

  # Enable features
  enable_shielded_nodes = true
  enable_autopilot      = false

  workload_identity_config {{
    workload_pool = "${{var.project_id}}.svc.id.goog"
  }}

  addons_config {{
    http_load_balancing {{
      disabled = false
    }}
    horizontal_pod_autoscaling {{
      disabled = false
    }}
  }}

  release_channel {{
    channel = "REGULAR"
  }}

  resource_labels = local.common_labels
}}

# Separately Managed Node Pool
resource "google_container_node_pool" "main" {{
  name       = "${{var.project_name}}-node-pool"
  location   = var.region
  cluster    = google_container_cluster.main.name
  node_count = {node_count}

  node_config {{
    preemptible  = false
    machine_type = "{machine_type}"

    service_account = google_service_account.gke_nodes.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    shielded_instance_config {{
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }}

    workload_metadata_config {{
      mode = "GKE_METADATA"
    }}

    labels = local.common_labels
  }}

  autoscaling {{
    min_node_count = 1
    max_node_count = 5
  }}

  management {{
    auto_repair  = true
    auto_upgrade = true
  }}
}}

# Service Account for GKE nodes
resource "google_service_account" "gke_nodes" {{
  account_id   = "${{var.project_name}}-gke-nodes"
  display_name = "GKE Nodes Service Account"
}}

# Output
output "gke_cluster_name" {{
  description = "GKE cluster name"
  value       = google_container_cluster.main.name
}}

output "gke_cluster_endpoint" {{
  description = "GKE cluster endpoint"
  value       = google_container_cluster.main.endpoint
  sensitive   = true
}}
"""

    def _generate_aws_terraform(self, services: List[Dict], requirements: Dict) -> str:
        """Generate AWS Terraform configuration"""
        terraform_config = []

        # Provider configuration
        terraform_config.append("""
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "infrax-project"
}

locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}
""")

        # Generate resources based on services
        for service in services:
            service_type = service.get("type", "").lower()

            if service_type == "compute":
                terraform_config.append(self._generate_aws_ec2(service, requirements))
            elif service_type == "database":
                terraform_config.append(self._generate_aws_rds(service, requirements))
            elif service_type == "storage":
                terraform_config.append(self._generate_aws_s3(service, requirements))
            elif service_type == "networking":
                terraform_config.append(self._generate_aws_vpc(service, requirements))
            elif service_type == "container":
                terraform_config.append(self._generate_aws_ecs(service, requirements))

        return "\n".join(terraform_config)

    def _generate_aws_ec2(self, service: Dict, requirements: Dict) -> str:
        """Generate AWS EC2 Terraform configuration"""
        instance_type = service.get("instance_type", "t3.micro")
        return f"""
# EC2 Instance
resource "aws_instance" "main" {{
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "{instance_type}"

  vpc_security_group_ids = [aws_security_group.main.id]
  subnet_id              = aws_subnet.main.id

  metadata_options {{
    http_tokens = "required"
    http_endpoint = "enabled"
  }}

  root_block_device {{
    encrypted = true
    volume_type = "gp3"
  }}

  tags = merge(local.common_tags, {{
    Name = "${{var.project_name}}-instance"
  }})
}}

data "aws_ami" "amazon_linux" {{
  most_recent = true
  owners      = ["amazon"]

  filter {{
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }}
}}
"""

    def _generate_aws_rds(self, service: Dict, requirements: Dict) -> str:
        """Generate AWS RDS Terraform configuration"""
        engine = service.get("engine", "mysql")
        instance_class = service.get("instance_class", "db.t3.micro")
        return f"""
# RDS Database
resource "aws_db_instance" "main" {{
  identifier = "${{var.project_name}}-db"

  engine         = "{engine}"
  engine_version = "8.0"
  instance_class = "{instance_class}"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type         = "gp3"
  storage_encrypted    = true

  db_name  = "appdb"
  username = "admin"
  password = random_password.db_password.result

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true
  deletion_protection = false

  tags = local.common_tags
}}

resource "random_password" "db_password" {{
  length  = 16
  special = true
}}

resource "aws_db_subnet_group" "main" {{
  name       = "${{var.project_name}}-db-subnet-group"
  subnet_ids = [aws_subnet.main.id, aws_subnet.secondary.id]

  tags = local.common_tags
}}
"""

    def _generate_aws_s3(self, service: Dict, requirements: Dict) -> str:
        """Generate AWS S3 Terraform configuration"""
        return """
# S3 Bucket
resource "aws_s3_bucket" "main" {
  bucket = "${var.project_name}-${var.environment}-bucket-${random_string.bucket_suffix.result}"

  tags = local.common_tags
}

resource "aws_s3_bucket_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}
"""

    def _generate_aws_vpc(self, service: Dict, requirements: Dict) -> str:
        """Generate AWS VPC Terraform configuration"""
        return """
# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-vpc"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-igw"
  })
}

# Subnets
resource "aws_subnet" "main" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-subnet-1"
  })
}

resource "aws_subnet" "secondary" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-subnet-2"
  })
}

# Route Table
resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-rt"
  })
}

resource "aws_route_table_association" "main" {
  subnet_id      = aws_subnet.main.id
  route_table_id = aws_route_table.main.id
}

# Security Groups
resource "aws_security_group" "main" {
  name_prefix = "${var.project_name}-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.main.id]
  }

  tags = local.common_tags
}

data "aws_availability_zones" "available" {
  state = "available"
}
"""

    def _generate_aws_ecs(self, service: Dict, requirements: Dict) -> str:
        """Generate AWS ECS Terraform configuration"""
        container_port = service.get("container_port", 80)
        cpu = service.get("cpu", "256")
        memory = service.get("memory", "512")

        return f"""
# ECS Cluster
resource "aws_ecs_cluster" "main" {{
  name = "${{var.project_name}}-cluster"

  setting {{
    name  = "containerInsights"
    value = "enabled"
  }}

  tags = local.common_tags
}}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs" {{
  name              = "/ecs/${{var.project_name}}"
  retention_in_days = 7

  tags = local.common_tags
}}

# ECS Task Definition
resource "aws_ecs_task_definition" "main" {{
  family                   = "${{var.project_name}}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "{cpu}"
  memory                   = "{memory}"
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {{
      name      = "${{var.project_name}}-container"
      image     = "nginx:latest"
      essential = true

      portMappings = [
        {{
          containerPort = {container_port}
          hostPort      = {container_port}
          protocol      = "tcp"
        }}
      ]

      logConfiguration = {{
        logDriver = "awslogs"
        options = {{
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }}
      }}

      environment = [
        {{
          name  = "ENVIRONMENT"
          value = var.environment
        }}
      ]
    }}
  ])

  tags = local.common_tags
}}

# ECS Service
resource "aws_ecs_service" "main" {{
  name            = "${{var.project_name}}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {{
    subnets          = [aws_subnet.main.id, aws_subnet.secondary.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }}

  load_balancer {{
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "${{var.project_name}}-container"
    container_port   = {container_port}
  }}

  depends_on = [aws_lb_listener.main]

  tags = local.common_tags
}}

# Application Load Balancer
resource "aws_lb" "main" {{
  name               = "${{var.project_name}}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.main.id, aws_subnet.secondary.id]

  enable_deletion_protection = false

  tags = local.common_tags
}}

resource "aws_lb_target_group" "main" {{
  name        = "${{var.project_name}}-tg"
  port        = {container_port}
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {{
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }}

  tags = local.common_tags
}}

resource "aws_lb_listener" "main" {{
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {{
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }}
}}

# Security Groups
resource "aws_security_group" "ecs" {{
  name_prefix = "${{var.project_name}}-ecs-sg"
  vpc_id      = aws_vpc.main.id

  ingress {{
    from_port       = {container_port}
    to_port         = {container_port}
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }}

  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  tags = local.common_tags
}}

resource "aws_security_group" "alb" {{
  name_prefix = "${{var.project_name}}-alb-sg"
  vpc_id      = aws_vpc.main.id

  ingress {{
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  ingress {{
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  tags = local.common_tags
}}

# IAM Roles
resource "aws_iam_role" "ecs_execution" {{
  name = "${{var.project_name}}-ecs-execution-role"

  assume_role_policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {{
          Service = "ecs-tasks.amazonaws.com"
        }}
      }}
    ]
  }})

  tags = local.common_tags
}}

resource "aws_iam_role_policy_attachment" "ecs_execution" {{
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}}

resource "aws_iam_role" "ecs_task" {{
  name = "${{var.project_name}}-ecs-task-role"

  assume_role_policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {{
          Service = "ecs-tasks.amazonaws.com"
        }}
      }}
    ]
  }})

  tags = local.common_tags
}}

# Outputs
output "alb_dns_name" {{
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}}

output "ecs_cluster_name" {{
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}}
"""

    def _generate_cloudformation(self, services: List[Dict], requirements: Dict) -> str:
        """Generate CloudFormation template"""
        template = {
            "AWSTemplateFormatVersion": "2010-09-09",
            "Description": "InfraX Generated CloudFormation Template",
            "Parameters": {
                "Environment": {
                    "Type": "String",
                    "Default": "dev",
                    "Description": "Environment name"
                },
                "ProjectName": {
                    "Type": "String",
                    "Default": "infrax-project",
                    "Description": "Project name"
                }
            },
            "Resources": {},
            "Outputs": {}
        }

        # Add resources based on services
        for i, service in enumerate(services):
            service_type = service.get("type", "").lower()
            if service_type == "compute":
                template["Resources"][f"EC2Instance{i}"] = self._get_cloudformation_ec2(service)
            elif service_type == "database":
                template["Resources"][f"RDSInstance{i}"] = self._get_cloudformation_rds(service)
            elif service_type == "storage":
                template["Resources"][f"S3Bucket{i}"] = self._get_cloudformation_s3(service)

        return yaml.dump(template, default_flow_style=False)

    def _generate_pulumi(self, cloud_provider: str, services: List[Dict], requirements: Dict) -> str:
        """Generate Pulumi code"""
        if cloud_provider == "aws":
            return self._generate_aws_pulumi(services, requirements)
        else:
            raise ValueError(f"Pulumi support for {cloud_provider} not implemented yet")

    def _generate_aws_pulumi(self, services: List[Dict], requirements: Dict) -> str:
        """Generate AWS Pulumi code in Python"""
        code = """
import pulumi
import pulumi_aws as aws

# Configuration
config = pulumi.Config()
environment = config.get("environment") or "dev"
project_name = config.get("project_name") or "infrax-project"
aws_region = config.get("aws_region") or "us-west-2"

# Common tags
common_tags = {
    "Environment": environment,
    "Project": project_name,
    "ManagedBy": "pulumi"
}
"""

        for i, service in enumerate(services):
            service_type = service.get("type", "").lower()
            if service_type == "compute":
                code += self._get_pulumi_ec2(service, i)
            elif service_type == "storage":
                code += self._get_pulumi_s3(service, i)
            elif service_type == "database":
                code += self._get_pulumi_rds(service, i)
            elif service_type == "networking":
                code += self._get_pulumi_vpc(service, i)
            elif service_type == "container":
                code += self._get_pulumi_ecs(service, i)

        return code

    def _apply_best_practices(self, code: str, cloud_provider: str, iac_type: str) -> str:
        """Apply security and optimization best practices to generated code"""
        # Add security comments and optimization notes
        security_comment = f"# Security Best Practices Applied:\n"
        for rule in self.security_rules.get(cloud_provider, []):
            security_comment += f"# - {rule}\n"

        return security_comment + "\n" + code

    def _get_optimization_notes(self, services: List[Dict]) -> List[str]:
        """Get optimization recommendations based on services"""
        notes = []
        for service in services:
            service_type = service.get("type", "").lower()
            if service_type in self.optimization_rules:
                for key, value in self.optimization_rules[service_type].items():
                    notes.append(f"{service_type.title()}: {value}")
        return notes

    def _save_generated_code(self, code: str, cloud_provider: str, iac_type: str, requirements: Dict) -> str:
        """Save generated code to file"""
        os.makedirs(self.output_dir, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{cloud_provider}_{iac_type}_{timestamp}"

        if iac_type == "terraform":
            filename += ".tf"
        elif iac_type == "cloudformation":
            filename += ".yaml"
        elif iac_type == "pulumi":
            filename += ".py"

        file_path = os.path.join(self.output_dir, filename)

        with open(file_path, "w") as f:
            f.write(code)

        return filename

    def _get_cloudformation_ec2(self, service: Dict) -> Dict:
        """Get CloudFormation EC2 resource definition"""
        return {
            "Type": "AWS::EC2::Instance",
            "Properties": {
                "ImageId": "ami-0abcdef1234567890",
                "InstanceType": service.get("instance_type", "t3.micro"),
                "SecurityGroupIds": [{"Ref": "SecurityGroup"}],
                "Tags": [
                    {"Key": "Name", "Value": {"Ref": "ProjectName"}},
                    {"Key": "Environment", "Value": {"Ref": "Environment"}}
                ]
            }
        }

    def _get_cloudformation_rds(self, service: Dict) -> Dict:
        """Get CloudFormation RDS resource definition"""
        return {
            "Type": "AWS::RDS::DBInstance",
            "Properties": {
                "DBInstanceClass": service.get("instance_class", "db.t3.micro"),
                "Engine": service.get("engine", "mysql"),
                "AllocatedStorage": "20",
                "StorageEncrypted": True,
                "MasterUsername": "admin",
                "MasterUserPassword": {"Ref": "DBPassword"},
                "Tags": [
                    {"Key": "Environment", "Value": {"Ref": "Environment"}}
                ]
            }
        }

    def _get_cloudformation_s3(self, service: Dict) -> Dict:
        """Get CloudFormation S3 resource definition"""
        return {
            "Type": "AWS::S3::Bucket",
            "Properties": {
                "BucketEncryption": {
                    "ServerSideEncryptionConfiguration": [{
                        "ServerSideEncryptionByDefault": {
                            "SSEAlgorithm": "AES256"
                        }
                    }]
                },
                "PublicAccessBlockConfiguration": {
                    "BlockPublicAcls": True,
                    "BlockPublicPolicy": True,
                    "IgnorePublicAcls": True,
                    "RestrictPublicBuckets": True
                }
            }
        }

    def _get_pulumi_ec2(self, service: Dict, index: int) -> str:
        """Get Pulumi EC2 resource code"""
        return f"""
# EC2 Instance {index}
instance_{index} = aws.ec2.Instance(f"instance-{index}",
    ami="ami-0abcdef1234567890",
    instance_type="{service.get('instance_type', 't3.micro')}",
    tags={{**common_tags, "Name": f"{{project_name}}-instance-{index}"}}
)

pulumi.export(f"instance_{index}_public_ip", instance_{index}.public_ip)
"""

    def _get_pulumi_s3(self, service: Dict, index: int) -> str:
        """Get Pulumi S3 resource code"""
        return f"""
# S3 Bucket {index}
bucket_{index} = aws.s3.Bucket(f"bucket-{index}",
    server_side_encryption_configuration={{
        "rule": {{
            "apply_server_side_encryption_by_default": {{
                "sse_algorithm": "AES256"
            }}
        }}
    }},
    tags=common_tags
)

pulumi.export(f"bucket_{index}_name", bucket_{index}.bucket)
"""

    def _get_pulumi_rds(self, service: Dict, index: int) -> str:
        """Get Pulumi RDS resource code"""
        engine = service.get("engine", "mysql")
        instance_class = service.get("instance_class", "db.t3.micro")
        return f"""
# RDS Instance {index}
db_subnet_group_{index} = aws.rds.SubnetGroup(f"db-subnet-group-{index}",
    subnet_ids=[subnet_main.id, subnet_secondary.id],
    tags=common_tags
)

rds_instance_{index} = aws.rds.Instance(f"rds-{index}",
    identifier=f"{{project_name}}-db-{index}",
    engine="{engine}",
    engine_version="8.0",
    instance_class="{instance_class}",
    allocated_storage=20,
    storage_type="gp3",
    storage_encrypted=True,
    db_name="appdb",
    username="admin",
    password=pulumi.Config().require_secret("db_password"),
    db_subnet_group_name=db_subnet_group_{index}.name,
    vpc_security_group_ids=[rds_sg.id],
    backup_retention_period=7,
    skip_final_snapshot=True,
    tags=common_tags
)

pulumi.export(f"rds_{index}_endpoint", rds_instance_{index}.endpoint)
"""

    def _get_pulumi_vpc(self, service: Dict, index: int) -> str:
        """Get Pulumi VPC resource code"""
        return f"""
# VPC {index}
vpc_main = aws.ec2.Vpc(f"vpc-{index}",
    cidr_block="10.0.0.0/16",
    enable_dns_hostnames=True,
    enable_dns_support=True,
    tags={{**common_tags, "Name": f"{{project_name}}-vpc"}}
)

# Internet Gateway
igw = aws.ec2.InternetGateway(f"igw-{index}",
    vpc_id=vpc_main.id,
    tags={{**common_tags, "Name": f"{{project_name}}-igw"}}
)

# Subnets
subnet_main = aws.ec2.Subnet(f"subnet-main-{index}",
    vpc_id=vpc_main.id,
    cidr_block="10.0.1.0/24",
    availability_zone="us-west-2a",
    map_public_ip_on_launch=True,
    tags={{**common_tags, "Name": f"{{project_name}}-subnet-1"}}
)

subnet_secondary = aws.ec2.Subnet(f"subnet-secondary-{index}",
    vpc_id=vpc_main.id,
    cidr_block="10.0.2.0/24",
    availability_zone="us-west-2b",
    tags={{**common_tags, "Name": f"{{project_name}}-subnet-2"}}
)

# Route Table
route_table = aws.ec2.RouteTable(f"rt-{index}",
    vpc_id=vpc_main.id,
    routes=[{{
        "cidr_block": "0.0.0.0/0",
        "gateway_id": igw.id
    }}],
    tags={{**common_tags, "Name": f"{{project_name}}-rt"}}
)

# Route Table Association
rt_association = aws.ec2.RouteTableAssociation(f"rt-assoc-{index}",
    subnet_id=subnet_main.id,
    route_table_id=route_table.id
)

# Security Groups
main_sg = aws.ec2.SecurityGroup(f"main-sg-{index}",
    vpc_id=vpc_main.id,
    description="Main security group",
    ingress=[
        {{
            "protocol": "tcp",
            "from_port": 80,
            "to_port": 80,
            "cidr_blocks": ["0.0.0.0/0"]
        }},
        {{
            "protocol": "tcp",
            "from_port": 443,
            "to_port": 443,
            "cidr_blocks": ["0.0.0.0/0"]
        }}
    ],
    egress=[{{
        "protocol": "-1",
        "from_port": 0,
        "to_port": 0,
        "cidr_blocks": ["0.0.0.0/0"]
    }}],
    tags=common_tags
)

rds_sg = aws.ec2.SecurityGroup(f"rds-sg-{index}",
    vpc_id=vpc_main.id,
    description="RDS security group",
    ingress=[{{
        "protocol": "tcp",
        "from_port": 3306,
        "to_port": 3306,
        "security_groups": [main_sg.id]
    }}],
    tags=common_tags
)

pulumi.export("vpc_id", vpc_main.id)
"""

    def _get_pulumi_ecs(self, service: Dict, index: int) -> str:
        """Get Pulumi ECS resource code"""
        container_port = service.get("container_port", 80)
        cpu = service.get("cpu", "256")
        memory = service.get("memory", "512")
        return f"""
# ECS Cluster {index}
ecs_cluster_{index} = aws.ecs.Cluster(f"ecs-cluster-{index}",
    name=f"{{project_name}}-cluster",
    settings=[{{
        "name": "containerInsights",
        "value": "enabled"
    }}],
    tags=common_tags
)

# IAM Roles
execution_role_{index} = aws.iam.Role(f"ecs-execution-role-{index}",
    assume_role_policy=pulumi.Output.all().apply(lambda _: json.dumps({{
        "Version": "2012-10-17",
        "Statement": [{{
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Principal": {{"Service": "ecs-tasks.amazonaws.com"}}
        }}]
    }})),
    tags=common_tags
)

execution_role_policy_attachment_{index} = aws.iam.RolePolicyAttachment(f"ecs-execution-role-policy-{index}",
    role=execution_role_{index}.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
)

task_role_{index} = aws.iam.Role(f"ecs-task-role-{index}",
    assume_role_policy=pulumi.Output.all().apply(lambda _: json.dumps({{
        "Version": "2012-10-17",
        "Statement": [{{
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Principal": {{"Service": "ecs-tasks.amazonaws.com"}}
        }}]
    }})),
    tags=common_tags
)

# CloudWatch Log Group
log_group_{index} = aws.cloudwatch.LogGroup(f"ecs-log-group-{index}",
    name=f"/ecs/{{project_name}}",
    retention_in_days=7,
    tags=common_tags
)

# ECS Task Definition
task_definition_{index} = aws.ecs.TaskDefinition(f"task-def-{index}",
    family=f"{{project_name}}-task",
    network_mode="awsvpc",
    requires_compatibilities=["FARGATE"],
    cpu="{cpu}",
    memory="{memory}",
    execution_role_arn=execution_role_{index}.arn,
    task_role_arn=task_role_{index}.arn,
    container_definitions=pulumi.Output.all(log_group_{index}.name).apply(lambda args: json.dumps([{{
        "name": f"{{project_name}}-container",
        "image": "nginx:latest",
        "essential": True,
        "portMappings": [{{
            "containerPort": {container_port},
            "hostPort": {container_port},
            "protocol": "tcp"
        }}],
        "logConfiguration": {{
            "logDriver": "awslogs",
            "options": {{
                "awslogs-group": args[0],
                "awslogs-region": aws_region,
                "awslogs-stream-prefix": "ecs"
            }}
        }}
    }}])),
    tags=common_tags
)

# ECS Service
ecs_service_{index} = aws.ecs.Service(f"ecs-service-{index}",
    cluster=ecs_cluster_{index}.id,
    task_definition=task_definition_{index}.arn,
    desired_count=2,
    launch_type="FARGATE",
    network_configuration={{
        "subnets": [subnet_main.id, subnet_secondary.id],
        "security_groups": [main_sg.id],
        "assign_public_ip": True
    }},
    tags=common_tags
)

pulumi.export(f"ecs_cluster_{index}_name", ecs_cluster_{index}.name)
"""