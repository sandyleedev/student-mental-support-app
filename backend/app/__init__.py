from flask import Flask
from flask_cors import CORS
from flasgger import Swagger

from app.config import SECRET_KEY, DEBUG, CORS_ORIGINS

app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY
app.config["DEBUG"] = DEBUG
CORS(app, origins=CORS_ORIGINS, supports_credentials=True)

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

from app import routes
