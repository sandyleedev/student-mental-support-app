from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

from app.config import (
    SECRET_KEY,
    DEBUG,
    CORS_ORIGINS,
    SQLALCHEMY_DATABASE_URI,
    SQLALCHEMY_TRACK_MODIFICATIONS,
)
load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY
app.config["DEBUG"] = DEBUG
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = SQLALCHEMY_TRACK_MODIFICATIONS

# CORS configuration with more explicit settings
CORS(
    app,
    origins=CORS_ORIGINS,
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

db = SQLAlchemy(app)

Swagger(
    app,
    template={
        "swagger": "2.0",
        "info": {
            "title": "Student Mental Support API",
            "description": "API for support request threads, bookings, and health checks.",
            "version": "0.1.0",
        },
    },
)

from app import models  # noqa: E402, F401
from app import routes  # noqa: E402
