from flask import Flask
from config import app, db
from models import User, Property, Apartment, Tenant, Payment, Invoice

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)