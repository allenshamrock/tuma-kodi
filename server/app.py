from flask import Flask
from config import app, db
from models import User, Property, Apartment, Tenant, Payment, Invoice
from routes.auth import auth_bp
from routes.properties import properties_bp
from routes.apartments import apartments_bp
from routes.tenant import tenant_bp

# Register blueprint
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(properties_bp, url_prefix='/api')
app.register_blueprint(apartments_bp, url_prefix='/api')
app.register_blueprint(tenant_bp, url_prefix='/api')

@app.route('/')
def home():
    return {
        'message': 'Tuma Kodi API',
        'version': '1.0.0',
        'endpoints': {
            'register': 'POST /api/register',
            'login': 'POST /api/login',
            'profile': 'GET /api/profile'
        }
    }

if __name__ == '__main__':
    with app.app_context():
        # Create tables
        db.create_all()
        # print("Database tables created/verified")
        
        # Check if admin exists
        # if User.query.count() == 0:
        #     print(" No users in database. Register first via POST /api/register")

    app.run(debug=True, host='0.0.0.0', port=5000)