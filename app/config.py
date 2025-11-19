"""Configuration management for the application."""
import os
from dotenv import load_dotenv

load_dotenv()

# Groq API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

# File Upload Limits
MAX_FILE_SIZE_MB = 2
MAX_COLUMNS = 20

# Chart Configuration
CHARTS_DIR = "charts"

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")

