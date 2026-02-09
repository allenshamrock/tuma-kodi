from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import User
from config import db
from datetime import datetime
import re

# Blueprint for auth routes
auth_bp = Blueprint('auth', __name__)


#Email validation function
def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

#Phone number validation function
def is_valid_phone(phone):
    pattern = r'^\+?1?\d{9,15}$'
    return re.match(pattern, phone) is not None

#Register route
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        #Register a new user(landlord)
        data = request.get_json()

        #Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({'error': f'{field} is required'}), 400

        #Validate email format
        if not is_valid_email(data['email']):
            return jsonify({'error':'Invalid email format'}), 400
        
        #Validate password strength
        if len(data['password']) < 6:
            return jsonify({'error':'Password must be at least 6 characters long'}), 400
        
        #Validate phone number if provided
        if 'phone' in data and data['phone'].strip():
            if not is_valid_phone(data['phone']):
                return jsonify({'error':'Invalid phone number format'}), 400
            
        #Check if user already exists
        existing_user =  User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error':'Email already registered'}), 400
        
        #Create new user
        new_user = User(
            email = data['email'].lower().strip(),
            first_name = data['first_name'].strip(),
            last_name = data['last_name'].strip(),
            role = data.get('role', 'landlord').strip() if data.get('role') else 'landlord',
            is_active = True
        )

        #set phone number if provided
        if 'phone' in data and data['phone']:
            new_user.phone = data['phone'].strip()  

        #Set password & Hash
        new_user.set_password(data['password'])

        #Save user to DB
        db.session.add(new_user)
        db.session.commit()

        #Create access & refresh tokens
        access_token = create_access_token(identity=str(new_user.id))
        refresh_token = create_refresh_token(identity=str(new_user.id))

        return jsonify({
            'message':'User registered successfully',
            'user':new_user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token    
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

#Login Route
@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user and return jwt tokens"""
    try:
        data = request.get_json()
        #Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error':'Email and password are required'}), 400
        
        #Find user by email
        user = User.query.filter_by(email=data['email'].lower().strip()).first()

        #Check if user exists and active
        if not user or not user.is_active:
            return jsonify({'error':'Inactive credentials or account is inactive'}), 401
        
        #Check password
        if not user.check_password(data['password']):
            return jsonify({'error':'Invalid credentials '}), 401
        
        #Create access & refresh tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return jsonify({
            'message':'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Profile route
@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    #Get current user profile
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error':'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Update profile route 
@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    #Update current user profile
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error':'User not found'}), 404
        
        data = request.get_json()

        #Validate email if provided
        if 'email' in data and data['email'].strip():
            new_email = data['email'].lower().strip()
            if not is_valid_email(new_email):
                return jsonify({'error':'Invalid email format'}), 400
            
            existing = User.query.filter_by(email=data['email'].lower().strip()).first()
            if existing and existing.id != user.id:
                return jsonify({'error':'Email already in use'}), 400

            user.email = new_email 
        
        #Validate phone number if provided
        if 'phone' in data and data['phone'].strip():
            if not is_valid_phone(data['phone']):
                return jsonify({'error':'Invalid phone number format'}), 400
            user.phone = data['phone'].strip()
        
        #Update other fields
        if 'first_name' in data and data['first_name'].strip():
            user.first_name = data['first_name'].strip()
        if 'last_name' in data and data['last_name'].strip():
            user.last_name = data['last_name'].strip()
        
        #Update password if provided
        if 'password' in data and data['password'].strip():
            if len(data['pasword']) < 6:
                return jsonify({'error':'Password must be at least 6 characters long'}), 400
            user.set_password(data['password'])

        
        db.session.commit()

        return jsonify({'message':'Profile updated successfully', 'user': user.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
#Refresh token route
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    #Refresh access token using refresh token
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or not user.is_active:
            return jsonify({'error':'User not found or inactive'}), 404
        
        new_access_token = create_access_token(identity=str(user.id))
        return jsonify({'access_token': new_access_token}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Logout route
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        return jsonify({'message':'Logout successful'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500