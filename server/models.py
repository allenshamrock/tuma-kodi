from datetime import datetime
from config import db
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    role = db.Column(db.String(50), default='landlord')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    properties = db.relationship('Property', backref='landlord', lazy=True)
    tenant_profile = db.relationship('Tenant', backref='user', uselist=False, lazy=True)

    def set_password(self,password):
        self.password_hash = Bcrypt().generate_password_hash(password).decode('utf-8')

    def check_password(self,password):
        return Bcrypt().check_password_hash(self.password_hash,password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_active': self.is_active
        }
    
class Property(db.Model):
    __tablename__ = 'properties'
    
    id = db.Column(db.Integer, primary_key=True)
    landlord_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text, nullable=False)
    city = db.Column(db.String(100))
    total_units = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = db.Column(db.String(50), default='active')
    
    # Relationships
    apartments = db.relationship('Apartment', backref='property', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'landlord_id': self.landlord_id,
            'name': self.name,
            'address': self.address,
            'city': self.city,
            'total_units': self.total_units,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'status': self.status
        }

class Apartment(db.Model):
    __tablename__ = 'apartments'
    
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    apartment_number = db.Column(db.String(50), nullable=False)
    apartment_type = db.Column(db.String(100))
    rent_amount = db.Column(db.Numeric(10, 2), nullable=False)
    deposit_amount = db.Column(db.Numeric(10, 2), default=0)
    size_sqft = db.Column(db.Integer)
    features = db.Column(db.Text)
    status = db.Column(db.String(50), default='vacant')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = db.relationship('Tenant', backref='apartment', uselist=False, lazy=True)
    payments = db.relationship('Payment', backref='apartment', lazy=True)
    invoices = db.relationship('Invoice', backref='apartment', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'apartment_number': self.apartment_number,
            'apartment_type': self.apartment_type,
            'rent_amount': str(self.rent_amount),
            'deposit_amount': str(self.deposit_amount),
            'size_sqft': self.size_sqft,
            'features': self.features,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Tenant(db.Model):
    __tablename__ = 'tenants'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    apartment_id = db.Column(db.Integer, db.ForeignKey('apartments.id'))
    lease_start_date = db.Column(db.Date, nullable=False)
    lease_end_date = db.Column(db.Date)
    monthly_rent = db.Column(db.Numeric(10, 2), nullable=False)
    security_deposit_paid = db.Column(db.Numeric(10, 2), default=0)
    emergency_contact = db.Column(db.String(100))
    id_number = db.Column(db.String(50))
    status = db.Column(db.String(50), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    
    # Relationships
    payments = db.relationship('Payment', backref='tenant', lazy=True)
    invoices = db.relationship('Invoice', backref='tenant', lazy=True)

    def to_dict(self):  
        return {
            'id': self.id,
            'user_id': self.user_id,
            'apartment_id': self.apartment_id,
            'lease_start_date': self.lease_start_date.isoformat(),
            'lease_end_date': self.lease_end_date.isoformat() if self.lease_end_date else None,
            'monthly_rent': str(self.monthly_rent),
            'security_deposit_paid': str(self.security_deposit_paid),
            'emergency_contact': self.emergency_contact,
            'id_number': self.id_number,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'name': self.name,
            'email': self.email,
            'phone': self.phone
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    apartment_id = db.Column(db.Integer, db.ForeignKey('apartments.id'))
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50))
    mpesa_receipt_number = db.Column(db.String(100))
    transaction_id = db.Column(db.String(255))
    payment_date = db.Column(db.Date, nullable=False)
    month_paid_for = db.Column(db.String(7))
    status = db.Column(db.String(50), default='pending')
    late_fee = db.Column(db.Numeric(10, 2), default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    apartment_id = db.Column(db.Integer, db.ForeignKey('apartments.id'))
    invoice_number = db.Column(db.String(100), unique=True, nullable=False)
    month_year = db.Column(db.String(7), nullable=False)
    rent_amount = db.Column(db.Numeric(10, 2), nullable=False)
    late_fee = db.Column(db.Numeric(10, 2), default=0)
    other_charges = db.Column(db.Numeric(10, 2), default=0)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default='pending')
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    payment = db.relationship('Payment', backref='invoice', uselist=False, lazy=True)