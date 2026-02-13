from flask import Flask
from flask_cors import CORS

from app.config import SECRET_KEY, DEBUG, CORS_ORIGINS

app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY
app.config["DEBUG"] = DEBUG
CORS(app, origins=CORS_ORIGINS, supports_credentials=True)

from app import routes  # noqa: E402
