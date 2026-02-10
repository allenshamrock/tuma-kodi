from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Apartment, Property

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