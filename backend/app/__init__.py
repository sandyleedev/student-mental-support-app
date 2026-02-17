from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from flask_sqlalchemy import SQLAlchemy

from app.config import (
    SECRET_KEY,
    DEBUG,
    CORS_ORIGINS,
    SQLALCHEMY_DATABASE_URI,
    SQLALCHEMY_TRACK_MODIFICATIONS,
)

app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY
app.config["DEBUG"] = DEBUG
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = SQLALCHEMY_TRACK_MODIFICATIONS
CORS(app, origins=CORS_ORIGINS, supports_credentials=True)

db = SQLAlchemy(app)

Swagger(
    app,
    template={
        "swagger": "2.0",
        "info": {
            "title": "Student Mental Support API",
            "description": "API for support request threads and health checks.",
            "version": "0.1.0",
        },
    },
)

from app import models  # noqa: E402, F401
from app import routes  # noqa: E402
