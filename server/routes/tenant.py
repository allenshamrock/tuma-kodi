from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Apartment, Property,Tenant,Payment
from config import db   
from datetime import datetime,date

# Blueprint for tenant routes
tenant_bp = Blueprint('tenant', __name__)
# Create a new tenant
@tenant_bp.route('/tenants', methods=['POST'])
@jwt_required()
def create_tenant():
    try:
        data = request.get_json()
        landlord_id = int(get_jwt_identity())
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
        apartment.status = 'occupied'
        db.session.flush()
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
        landlord_id = int(get_jwt_identity())
        db.session.expire_all()  # Clear session cache 
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
        landlord_id = int(get_jwt_identity())

        tenant = Tenant.query.join(Apartment).join(Property).filter(
            Tenant.id == tenant_id,
            Property.landlord_id == landlord_id
        ).first()

        if not tenant:
            return jsonify({'error': 'Tenant not found or does not belong to landlord'}), 404

        # Personal info
        if 'name' in data and str(data['name']).strip():
            tenant.name = data['name'].strip()
        if 'email' in data and str(data['email']).strip():
            tenant.email = data['email'].strip()
        if 'phone' in data and str(data['phone']).strip():
            tenant.phone = data['phone'].strip()
        if 'id_number' in data:
            tenant.id_number = data['id_number']
        if 'emergency_contact' in data:
            tenant.emergency_contact = data['emergency_contact']

        # Lease info
        if 'lease_start_date' in data and str(data['lease_start_date']).strip():
            tenant.lease_start_date = data['lease_start_date']
        if 'lease_end_date' in data:
            tenant.lease_end_date = data['lease_end_date'] or None
        if 'monthly_rent' in data:
            tenant.monthly_rent = data['monthly_rent']
        if 'security_deposit_paid' in data:
            tenant.security_deposit_paid = data['security_deposit_paid']
        if 'status' in data and str(data['status']).strip():
            tenant.status = data['status'].strip()

        tenant.updated_at = datetime.utcnow()
        db.session.commit()
        db.session.refresh(tenant)
        return jsonify({'message': 'Tenant updated successfully', 'tenant': tenant.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Create or update lease agreement for a tenant
@tenant_bp.route('/tenants/<int:tenant_id>/lease', methods=['POST'])
@jwt_required()
def create_lease(tenant_id):
    try:
        data = request.get_json()
        landlord_id = int(get_jwt_identity())
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

@tenant_bp.route('/tenants/<int:tenant_id>', methods=['DELETE'])
@jwt_required()
def delete_tenant(tenant_id):       
    try:
        landlord_id = int(get_jwt_identity())
        #Check if tenant exists and belongs to landlord
        tenant = Tenant.query.join(Apartment).join(Property).filter(Tenant.id == tenant_id, Property.landlord_id == landlord_id).first()
        if not tenant:
            return jsonify({'error':'Tenant not found or does not belong to landlord'}), 404 
        
        if tenant.apartment:
            tenant.apartment.status = 'vacant'
        
        db.session.delete(tenant)
        db.session.commit()
        return jsonify({'message':'Tenant deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
        
    # Tenants detail route
@tenant_bp.route('/tenants/<int:tenant_id>', methods=['GET'])
@jwt_required()
def get_tenant(tenant_id):
    try:
        landlord_id = int(get_jwt_identity())
        tenant = Tenant.query.join(Apartment).join(Property).filter(
            Tenant.id == tenant_id,
            Property.landlord_id == landlord_id
        ).first()
        if not tenant:
            return jsonify({'error': 'Tenant not found'}), 404

        # Payment history
        payments = Payment.query.filter_by(tenant_id=tenant_id)\
            .order_by(Payment.payment_date.desc()).all()

        # Calculate total paid and outstanding
        total_paid = sum(float(p.amount) for p in payments if p.status == 'completed')
        
        # Months since lease start
        lease_start = tenant.lease_start_date
        today = date.today()
        months_active = (today.year - lease_start.year) * 12 + (today.month - lease_start.month) + 1
        total_expected = float(tenant.monthly_rent) * max(months_active, 1)
        outstanding = max(total_expected - total_paid, 0)

        # Days until lease expires
        days_until_expiry = None
        lease_expiring_soon = False
        if tenant.lease_end_date:
            delta = tenant.lease_end_date - today
            days_until_expiry = delta.days
            lease_expiring_soon = 0 <= delta.days <= 30

        return jsonify({
            'tenant': tenant.to_dict(),
            'payments': [p.to_dict() for p in payments],
            'summary': {
                'total_paid': str(total_paid),
                'total_expected': str(total_expected),
                'outstanding': str(outstanding),
                'months_active': months_active,
                'days_until_expiry': days_until_expiry,
                'lease_expiring_soon': lease_expiring_soon,
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500