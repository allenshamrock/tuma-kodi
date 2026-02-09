from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy 
from flask_restful import Api
from flask_jwt_extended import JWTManager
from sqlalchemy import MetaData
from flask_cors import CORS
from datetime import timedelta
import os
from dotenv import load_dotenv

load_dotenv()

db_user = os.getenv('DB_USERNAME')
db_pass = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT', '5432')  
db_name = os.getenv('DB_DATABASE')

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1) 
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Database URL
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'
print(f"Database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")

app.json.compact = False

metadata = MetaData(
    naming_convention={
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
        "ix": "ix_%(table_name)s_%(column_0_name)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
    }
)

db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db)
db.init_app(app)
api = Api(app)
jwt = JWTManager(app)
CORS(app, supports_credentials=True)