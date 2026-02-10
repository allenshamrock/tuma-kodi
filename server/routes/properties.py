from flask import Blueprint, request, jsonify
from models import Property,Apartment
from config import db
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity   

# Blueprint for property routes
properties_bp = Blueprint('properties',__name__)

#Create a new property
@properties_bp.route('/properties', methods=['POST'])
@jwt_required()
def create_property():
    try:
        data = request.get_json()
        landlord_id = get_jwt_identity()  # Get landlord ID from JWT token

        #Validate required fields
        required_fields = ['name','address','city',]
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return jsonify({'error': f'{field} is required'}), 400
            
        if 'total_units' not in data or not isinstance(data['total_units'],int):
            return jsonify({'error':'total_units is required and must be an integer'}), 400
        
        #Create new property
        new_property=Property(
            landlord_id = landlord_id,
            name = data['name'].strip(),
            address = data['address'].strip(),
            city =data['city'].strip(),
            total_units = data['total_units'] 
        )
        #Save property to Db
        db.session.add(new_property)
        db.session.commit()
        return jsonify({'message':'Property created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error':str(e)}), 500
    
#Get all properties
@properties_bp.route('/properties', methods=['GET'])
@jwt_required()
def get_properties():
    try:
        landlord_id = get_jwt_identity()  # Get landlord ID from JWT token
        properties = Property.query.filter_by(landlord_id=landlord_id).all()
        properties_list = [property.to_dict() for property in properties]
        return jsonify({'properties': properties_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Get a single property by ID
@properties_bp.route('/properties/<int:property_id>',methods=['GET'])
@jwt_required()
def get_property(property_id):
    try:
        landlord_id = get_jwt_identity()  # Get landlord ID from JWT token
        property =Property.query.filter_by(id=property_id, landlord_id=landlord_id).first()
        if not property:
            return jsonify({'error':'Property not found'}), 404
        return jsonify({'property': property.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
#Update a property by ID
@properties_bp.route('/properties/<int:property_id>', methods=['PUT'])
@jwt_required()
def update_property(property_id):
    try:
        landlord_id = get_jwt_identity()  # Get landlord ID from JWT token
        property = Property.query.filter_by(id=property_id, landlord_id=landlord_id).first()
        if not property:
            return jsonify({'error':'Property not found'}), 404
        
        data = request.get_json()
        #Update fields if provided
        if 'name' in data and data['name'].strip():
            property.name = data['name'].strip()
        if 'address' in data and data['address'].strip():
            property.address = data['address'].strip()
        if 'city' in data and data['city'].strip():
            property.city = data['city'].strip()
        if 'total_units' in data and isinstance(data['total_units'], int):
            property.total_units = data['total_units']
        
        property.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message':'Property updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
#Delete a property by ID
@properties_bp.route('/properties/<int:property_id>',methods=['DELETE'])
@jwt_required()
def delete_property(property_id):
    landlord_id = get_jwt_identity()  # Get landlord ID from JWT token
    property = Property.query.filter_by(id=property_id, landlord_id=landlord_id).first()
    if not property:
        return jsonify({'error':'Property not found'}), 404
    
    db.session.delete(property)
    db.session.commit()
    return jsonify({'message':'Property deleted successfully'}), 200

@properties_bp.route('/properties/<int:property_id>/units', methods=['POST'])
@jwt_required()
def create_unit(property_id):
    try:
        landlord_id = get_jwt_identity()
        property = Property.query.filter_by(id=property_id, landlord_id=landlord_id).first()
        if not property:
            return jsonify({'error':'Property not found'}), 404

        data = request.get_json()
        required_fields = ['apartment_number', 'rent_amount']
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return jsonify({'error': f'{field} is required'}), 400

        new_unit = Apartment(
            property_id=property.id,
            apartment_number=data['apartment_number'].strip(),
            apartment_type=data.get('apartment_type'),
            rent_amount=data['rent_amount'],
            deposit_amount=data.get('deposit_amount', 0),
            size_sqft=data.get('size_sqft'),
            features=data.get('features'),
            status=data.get('status', 'vacant')
        )

        db.session.add(new_unit)
        db.session.commit()

        return jsonify({'message':'Apartment created successfully', 'unit': new_unit.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


#Get all units for a property
@properties_bp.route('/properties/<int:property_id>/units',methods = ['GET'])
@jwt_required()
def get_units(property_id):
    try:
        landlord_id = get_jwt_identity()  # Get landlord ID from JWT token
        property = Property.query.filter_by(id=property_id, landlord_id=landlord_id).first()
        if not property:
            return jsonify({'error':'Property not found'}), 404
        
        units = [apartment.to_dict() for apartment in property.apartments]
        return jsonify({
            'property': property.to_dict(),
            'units': units}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

