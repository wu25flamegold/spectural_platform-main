# -*- encoding: utf-8 -*-
import os, json
from flask import Flask
from flask_cors import CORS
from .routes import rest_api
from .models import db
from .tmapi import TMAPI
from .matlab_client import MATLABSharedMemoryClient  # 確保 MATLABSharedMemoryClient 有正確導入
from .config import BaseConfig

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 2000 * 1024 * 1024  # 2000 MB
app.config.from_object('api.config.BaseConfig')

CORS(app, resources={r"/tmapi/*": {"origins": ["http://localhost:3000", "http://xds3.cmbm.idv.tw:81/"]}})
db.init_app(app)
rest_api.init_app(app)
app.config["TMAPI_INSTANCES"] = {} 
app.config["HOLO_INSTANCES"] = {} 

def get_process_instance(user_id):
    """ 確保每個 UserId 只創建一個 TMAPI """
    if user_id not in app.config["TMAPI_INSTANCES"]:
        if BaseConfig.PROCESSING_MODE == "TMAPI":
            app.config["TMAPI_INSTANCES"][user_id] = TMAPI(user_id)
        elif BaseConfig.PROCESSING_MODE == "process_request":
            app.config["TMAPI_INSTANCES"][user_id] = MATLABSharedMemoryClient(user_id)
        else:
            raise ValueError(f"Unknown PROCESSING_MODE: {BaseConfig.PROCESSING_MODE}")
    return app.config["TMAPI_INSTANCES"][user_id]

# Setup database
@app.before_first_request
def initialize_database():
    try:
        print(app.config['SQLALCHEMY_DATABASE_URI'])
        db.create_all()
    except Exception as e:
        print('> Error: DBMS Exception: ' + str(e) )
        raise

@app.after_request
def after_request(response):
    if int(response.status_code) >= 400:
        response_data = json.loads(response.get_data())
        if "errors" in response_data:
            response_data = {"success": False,
                             "msg": list(response_data["errors"].items())[0][1]}
            response.set_data(json.dumps(response_data))
        response.headers.add('Content-Type', 'application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

@app.teardown_appcontext
def shutdown_session(exception=None):
    if hasattr(app, 'tmapi'):
        app.tmapi.stop()