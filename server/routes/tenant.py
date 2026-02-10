from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Apartment, Property,Tenant
from config import db   

# Blueprint for tenant routes
tenant_bp = Blueprint('tenant', __name__)
# Create a new tenant
@tenant_bp.route('/tenants', methods=['POST'])
@jwt_required()
def create_tenant():
    try:
        data = request.get_json()
        landlord_id = get_jwt_identity()  # Get landlord ID from JWT token

        #Validate required fields
        required_fields = ['name','email','phone','apartment_id']
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return jsonify({'error': f'{field} is required'}), 400 
        #Check if apartment exists and belongs to landlord
        apartment = Apartment.query.join(Property).filter(Apartment.id == data['apartment_id'], Property.landlord_id == landlord_id).first()
        if not apartment:
            return jsonify({'error':'Apartment not found or does not belong to landlord'}), 404 
        
        if apartment.status == 'occupied':
            return jsonify({'error':'Apartment is already occupied'}), 400
        
        if apartment.tenant and apartment.tenant.status == 'active':
            return jsonify({'error':'Apartment already has an active tenant'}), 400
        
        #Create new tenant
        new_tenant = Tenant(
            user_id = landlord_id,
            name = data['name'].strip(),
            email = data['email'].strip(),      
            phone = data['phone'].strip(),
            apartment_id = data['apartment_id'],
            lease_start_date = data.get('lease_start_date'),
            lease_end_date = data.get('lease_end_date', None),
            status = 'active',
            monthly_rent = data.get('monthly_rent', apartment.rent_amount),
            security_deposit_paid = data.get('security_deposit', 0)
        )

        #Save tenant to Db
        db.session.add(new_tenant)
        db.session.commit()
        return jsonify({'message':'Tenant created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 
            
#Get all tenants for a property
@tenant_bp.route('/tenants', methods=['GET'])
@jwt_required()
def get_tenants():
    try:
        landlord_id = get_jwt_identity()  # Get landlord ID from JWT token
        tenants = Tenant.query.join(Apartment).join(Property).filter(Property.landlord_id == landlord_id).all()
        tenants_list = [tenant.to_dict() for tenant in tenants]
        return jsonify({'tenants': tenants_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
#update tenant status
@tenant_bp.route('/tenants/<int:tenant_id>', methods=['PUT'])
@jwt_required()
def update_tenant(tenant_id):
    try:
        data = request.get_json()
        landlord_id = get_jwt_identity()  # Get landlord ID from JWT token

        #Check if tenant exists and belongs to landlord
        tenant = Tenant.query.join(Apartment).join(Property).filter(Tenant.id == tenant_id, Property.landlord_id == landlord_id).first()
        if not tenant:
            return jsonify({'error':'Tenant not found or does not belong to landlord'}), 404 
        
        #Update tenant status
        if 'status' in data and str(data['status']).strip():
            tenant.status = data['status'].strip()
        
        db.session.commit()
        return jsonify({'message':'Tenant updated successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Create or update lease agreement for a tenant
@tenant_bp.route('/tenants/<int:tenant_id>/lease', methods=['POST'])
@jwt_required()
def create_lease(tenant_id):
    try:
        data = request.get_json()
        landlord_id = get_jwt_identity()  # Get landlord ID from JWT token

        # Find tenant and ensure it belongs to landlord
        tenant = Tenant.query.join(Apartment).join(Property)\
            .filter(Tenant.id == tenant_id, Property.landlord_id == landlord_id).first()

        if not tenant:
            return jsonify({'error': 'Tenant not found or does not belong to landlord'}), 404

        # Validate required field: lease_start_date
        if 'lease_start_date' not in data or not str(data['lease_start_date']).strip():
            return jsonify({'error': 'lease_start_date is required'}), 400

        # Set lease dates
        tenant.lease_start_date = data['lease_start_date']
        tenant.lease_end_date = data.get('lease_end_date', None)  
        # Optional fields
        if 'monthly_rent' in data:
            tenant.monthly_rent = data['monthly_rent']
        if 'status' in data:
            tenant.status = data['status'].strip()
        else:
            tenant.status = 'active'  

        db.session.commit()
        return jsonify({'message': 'Lease agreement created successfully', 'tenant': tenant.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
