from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Apartment, Property
from config import db
from datetime import datetime

# Blueprint for apartment routes
apartments_bp = Blueprint('apartments', __name__)   
# get all apartments for a property
@apartments_bp.route('/apartments', methods=['GET'])
@jwt_required()
def get_all_apartments():
    try:
        landlord_id = get_jwt_identity() 

        # Start query to get apartments for the landlord's properties
        query = Apartment.query.join(Property).filter(Property.landlord_id == landlord_id)

        # Optional query params
        status = request.args.get('status')
        property_id = request.args.get('property_id')

        if status:
            query = query.filter(Apartment.status == status)
        if property_id:
            query = query.filter(Apartment.property_id == int(property_id))

        apartments = query.all()
        apartments_list = [apt.to_dict() for apt in apartments]

        return jsonify({'apartments': apartments_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@apartments_bp.route('/apartments/<int:apt_id>', methods=['PUT'])
@jwt_required()
def update_apartment(apt_id):
    try:
        landlord_id = get_jwt_identity()

        # Verify the apartment belongs to the landlord
        apartment = Apartment.query.join(Property).filter(
            Apartment.id == apt_id,
            Property.landlord_id == landlord_id
        ).first()

        if not apartment:
            return jsonify({'error': 'Apartment not found'}), 404

        data = request.get_json()

        if 'apartment_number' in data and str(data['apartment_number']).strip():
            apartment.apartment_number = str(data['apartment_number']).strip()
        if 'apartment_type' in data:
            apartment.apartment_type = data['apartment_type']
        if 'rent_amount' in data:
            apartment.rent_amount = data['rent_amount']
        if 'deposit_amount' in data:
            apartment.deposit_amount = data['deposit_amount']
        if 'size_sqft' in data:
            apartment.size_sqft = data['size_sqft']
        if 'features' in data:
            apartment.features = data['features']
        if 'status' in data:
            apartment.status = data['status']

        apartment.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'message': 'Apartment updated successfully', 'unit': apartment.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@apartments_bp.route('/apartments/<int:apt_id>', methods=['DELETE'])
@jwt_required()
def delete_apartment(apt_id):
    try:
        landlord_id = get_jwt_identity()

        # Verify the apartment belongs to the landlord
        apartment = Apartment.query.join(Property).filter(
            Apartment.id == apt_id,
            Property.landlord_id == landlord_id
        ).first()

        if not apartment:
            return jsonify({'error': 'Apartment not found'}), 404

        db.session.delete(apartment)
        db.session.commit()

        return jsonify({'message': 'Apartment deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500