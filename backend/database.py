"""
Database configuration and models for InfraX Brahma platform.
Uses PostgreSQL (Neon) for persistent workflow storage.
"""

from sqlalchemy import create_engine, Column, String, Boolean, DateTime, JSON, Text, text, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Database connection string (remove channel_binding from URL, use connect_args instead)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_gcakYdi19TOA@ep-shy-dream-a1e1wqp3-pooler.ap-southeast-1.aws.neon.tech/neondb"
)

# Create SQLAlchemy engine with proper SSL configuration for Neon
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=300,  # Recycle connections after 5 minutes
    echo=False,  # Set to True for SQL query logging
    connect_args={
        "sslmode": "require",
        "channel_binding": "require",
        "connect_timeout": 10,
    }
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


class WorkflowModel(Base):
    """
    SQLAlchemy model for workflow storage.
    Stores complete workflow execution results.
    """
    __tablename__ = "workflows"

    workflow_id = Column(String, primary_key=True, index=True)
    success = Column(Boolean, nullable=False)
    workflow_type = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Input data
    prompt = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    iac_tool = Column(String, nullable=False)

    # Workflow steps (stored as JSON)
    intelligent_planning = Column(JSON, nullable=False)
    cost_optimization = Column(JSON, nullable=False)
    service_refinement = Column(JSON, nullable=False)
    iac_generation = Column(JSON, nullable=False)
    diagram_generation = Column(JSON, nullable=False)

    # Summary data
    cloud_provider = Column(String, nullable=False)
    region = Column(String, nullable=False)
    location_rationale = Column(Text, nullable=True)
    services_count = Column(String, nullable=False)
    estimated_savings = Column(String, nullable=False)
    code_file = Column(String, nullable=False)
    code_path = Column(String, nullable=False)
    architecture = Column(JSON, nullable=True)
    mermaid_diagram = Column(Text, nullable=True)
    service_descriptions = Column(JSON, nullable=True)
    diagram_file = Column(String, nullable=True)
    html_preview = Column(String, nullable=True)


class CodeVersionModel(Base):
    """
    SQLAlchemy model for tracking Terraform code versions.
    Stores history of code edits made with Vishu's help.
    """
    __tablename__ = "code_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    workflow_id = Column(String, nullable=False, index=True)
    version = Column(Integer, nullable=False)
    terraform_code = Column(Text, nullable=False)
    file_path = Column(String, nullable=False)
    modified_by = Column(String, default="user")  # "user" or "vishu"
    change_description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class VishuInteractionModel(Base):
    """
    SQLAlchemy model for storing Vishu chat interactions.
    Enables conversation history and analytics.
    """
    __tablename__ = "vishu_interactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    workflow_id = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False)  # "user" or "assistant"
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    extra_data = Column(JSON, nullable=True)  # Store additional context


def get_db():
    """
    Dependency function for FastAPI to get database session.
    Usage: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database by creating all tables.
    Call this on application startup.
    """
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully")


def test_connection():
    """
    Test database connection.
    Returns True if connection is successful, False otherwise.
    """
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
