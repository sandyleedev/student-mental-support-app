import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key"
DEBUG = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
