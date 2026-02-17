import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key"
DEBUG = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

# PostgreSQL: read from env (set DATABASE_URL in .env)
DATABASE_URL = os.environ.get("DATABASE_URL") or "postgresql+psycopg://localhost/student_mental_support"
SQLALCHEMY_DATABASE_URI = DATABASE_URL
SQLALCHEMY_TRACK_MODIFICATIONS = False
