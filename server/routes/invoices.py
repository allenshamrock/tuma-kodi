from Flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import db
from models import Invoice,Tenant,User,Apartment,Property,Payment
from datetime import datetime
from decimal import Decimal
from sqlalchemy.exc import SQLAlchemyError
import random
import string


invoices_bp = Blueprint('invoices',__name__)

#Generate invoice no helper function
def generate_invoice_number():
    prefix = 'INV'
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}-{random_str}"

def calculate_total_amount(rent_amount,late_fee=0,other_charges=0):
    return float(rent_amount) + Decimal(late_fee) + Decimal(other_charges)\

#Check whether landlord owns the apartment which tenant is renting
def is_landlord_of_apartment(landlord_id,tenant_id):
    tenant = Tenant.query.get(tenant_id)
    if not tenant or not tenant.apartment:
        return False
    return tenant.apartment.property.landlord_id == landlord_id

#Create invoice 
@invoices_bp.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    data = request.get_json()

    #Validate required fields
    required_fields = ['tenant_id','apartment_id','month_year','rent_amount']
    for field in required_fields:
        if field not in data or not str(data[field]).strip():
            return jsonify({'error': f'{field} is required'}), 400

    #check if tenant exists
    tenant = Tenant.query.get(data['tenant_id'])
    if not tenant:
        return jsonify({'error':'Tenant not found'}), 404
    
    #check auth(only landlord can create invoice for their tenant)
    if user.role == 'landlord' and not is_landlord_of_apartment(user.id,tenant.id):
        return jsonify({'error':'Unauthorized to create invoice for this tenant'}), 403
    
    #check if invoice for the month already exists
    month_year = datetime.strptime(data['month_year'],'%Y-%m').strftime('%Y-%m')
    existing_invoice = Invoice.query.filter_by(tenant_id=data['tenant_id'], month_year=month_year).first()
    if existing_invoice:
        return jsonify({'error':'Invoice for this month already exists'}), 400
    
    #Create Invoice 
    try:
        rent_amount = float(data['rent_amount'])
        late_fee = float(data.get('late_fee',0))
        other_charges = float(data.get('other_charges',0))
        total_amount = calculate_total_amount(rent_amount,late_fee,other_charges)

        new_invoice = Invoice(
            tenant_id = data['tenant_id'],
            apartment_id = data['apartment_id'],
            invoice_number = generate_invoice_number(),
            month_year = month_year,
            rent_amount = rent_amount,
            late_fee = late_fee,
            other_charges = other_charges,
            total_amount = total_amount
        )
        db.session.add(new_invoice)
        db.session.commit()
        return jsonify({
            'message': 'Invoice created successfully',
            'invoice':{
                'tenant_id': new_invoice.tenant_id,
                'apartment_id': new_invoice.apartment_id,
                'invoice_number': new_invoice.invoice_number,
                'month_year': new_invoice.month_year,
                'rent_amount': str(new_invoice.rent_amount),
                'late_fee': str(new_invoice.late_fee),
                'other_charges': str(new_invoice.other_charges),
                'total_amount': str(new_invoice.total_amount)
            }
        }),201  
    except ValueError as e:
       return jsonify({'error': 'Invalid data format:{str(e)}'}),400
    
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500

#get all invoices for a tenant
@invoices_bp.route('/tenants/<int:tenant_id>/invoices', methods=['GET'])
@jwt_required()
def get_invoices_for_tenant(tenant_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

 #query parameters for filtering 
    tenant_id = request.args.get('tenant_id', type=int)
    month_year = request.args.get('month_year')
    apartment_id = request.args.get('apartment_id', type=int)
    status = request.args.get(status)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    #Base query
    if user.role == 'landlord':
        #landlord sees invoices for their tenants only
        query = Invoice.query.join(Tenant).join(Apartment).join(Property).filter(Property.landlord_id == user.id)
    elif user.role == 'tenant':
        #Tenants see their own invoices only
        tenant = Tenant.query.filter_by(user_id=user.id).first()
        if not tenant:
            return jsonify({'invoices':[]})
        query = Invoice.query.filter_by(tenant_id=tenant.id)
    else:
        query = Invoice.query

    #Apply filters
    if tenant_id:
        query = query.filter(Invoice.tenant_id == tenant_id)
    if month_year:
        query = query.filter(Invoice.month_year == month_year)
    if apartment_id:
        query = query.filter(Invoice.apartment_id == apartment_id)
    if status:
        query = query.filter(Invoice.status == status)
    if start_date:
        query = query.filter(Invoice.created_at >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:    
        query = query.filter(Invoice.created_at <=  datetime.strptime(end_date, '%Y-%m-%d').date())
    
    #order by most recent
    query = query.order_by(Invoice.created_at.desc())
    invoices = query.all()

    return jsonify({
        'count':len(invoices),
        'invoices':[{
            'tenant_id': inv.tenant_id,
            'apartment_id': inv.apartment_id,
            'tenant_name':f"{inv.tenant.user.first_name} {inv.tenant.user.last_name}" if inv.tenant and inv.user else None,
            'property_name': inv.apartment.property.name if inv.apartment and inv.apartment.property else None,
            'apartment_number': inv.apartment.apartment_number if inv.apartment else None,
            'invoice_number': inv.invoice_number,
            'month_year': inv.month_year,
            'rent_amount': float(inv.rent_amount),
            'late_fee': float(inv.late_fee),
            'other_charges': float(inv.other_charges),
            'total_amount': float(inv.total_amount),
            'status': inv.status,
            'due_date': inv.due_date.strftime('%Y-%m-%d'),
            'created_at': inv.created_at.isoformat() if created_at else None
    }for inv in invoices]
    })

#get a single invoice by id
@invoices_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    invoice = Invoice.query.get(invoice_id)

    if user.role == "landlord":
        if not is_landlord_of_apartment(user.id,invoice.tenant.id):
            return jsonify({'error':'Unauthorized to view this invoice'}), 403
    elif user.role == 'tenant':
            tenant = Tenant.query.filter_by(user_id=user.id).first()
            if not tenant or invoice.tenant_id !=tenant.id:
                return jsonify({'error':'Unauthorized to view this invoice'}), 403
            
    #Get payment details if it exists
    payment = None
    if invoice.payment_id:
        payment_obj = Payment.query.get(invoice.payment_id)
        if payment_obj:
            payment = {
                'payment_date': payment_obj.payment_date.isoformat(),
                'amount': float(payment_obj.amount),
                'mpesa_receipt_number': payment_obj.mpesa_receipt_number,
                'payment_method': payment_obj.payment_method,
                'month_paid_for': payment_obj.month_paid_for,
                'status': payment_obj.status
            }
    return jsonify({
        'tenant_id': invoice.tenant_id,
        'apartment_id': invoice.apartment_id,       
        'tenant_name':f"{invoice.tenant.user.first_name} {invoice.tenant.user.last_name}" if invoice.tenant and invoice.tenant.user else None,
        'property_name': invoice.apartment.property.name if invoice.apartment and invoice.apartment.property
        else None,
        'apartment_number': invoice.apartment.apartment_number if invoice.apartment else None,
        'invoice_number': invoice.invoice_number,
        'month_year': invoice.month_year,
        'rent_amount': float(invoice.rent_amount),
        'late_fee': float(invoice.late_fee),    
        'other_charges': float(invoice.other_charges),
        'total_amount': float(invoice.total_amount),
        'status': invoice.status,
        'due_date': invoice.due_date.strftime('%Y-%m-%d'),
        'created_at': invoice.created_at.isoformat() if invoice.created_at else None,
        'payment': payment
    })  

@invoices_bp.route('/<int:invoice_id>', methods=['PUT'])
@jwt_required()
def update_invoice(invoice_id):
    """Update an existing invoice"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    invoice = Invoice.query.get_or_404(invoice_id)
    
    # Check authorization (only landlord or admin can update)
    if user.role == 'landlord':
        if not is_landlord_of_tenant(user_id, invoice.tenant_id):
            return jsonify({'error': 'Unauthorized to update this invoice'}), 403
    elif user.role == 'tenant':
        return jsonify({'error': 'Tenants cannot update invoices'}), 403
    
    data = request.get_json()
    
    try:
        # Update fields if provided
        if 'rent_amount' in data:
            invoice.rent_amount = float(data['rent_amount'])
        if 'late_fee' in data:
            invoice.late_fee = float(data['late_fee'])
        if 'other_charges' in data:
            invoice.other_charges = float(data['other_charges'])
        if 'due_date' in data:
            invoice.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        if 'status' in data:
            invoice.status = data['status']
        
        # Recalculate total
        invoice.total_amount = calculate_total(
            invoice.rent_amount, 
            invoice.late_fee, 
            invoice.other_charges
        )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice updated successfully',
            'invoice': {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'total_amount': float(invoice.total_amount),
                'status': invoice.status,
                'due_date': invoice.due_date.strftime('%Y-%m-%d')
            }
        })
        
    except ValueError as e:
        return jsonify({'error': f'Invalid data format: {str(e)}'}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500

# Dleting an invoice (only if not paid and not linked to a payment)
@invoices_bp.route('/<int:invoice_id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(invoice_id):
    """Delete an invoice (only if not paid)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    invoice = Invoice.query.get_or_404(invoice_id)
    
    # Check authorization (only landlord or admin can delete)
    if user.role == 'landlord':
        if not is_landlord_of_tenant(user_id, invoice.tenant_id):
            return jsonify({'error': 'Unauthorized to delete this invoice'}), 403
    
    # Check if invoice is already paid
    if invoice.status == 'paid':
        return jsonify({'error': 'Cannot delete a paid invoice'}), 400
    
    if invoice.payment_id:
        return jsonify({'error': 'Cannot delete invoice linked to a payment'}), 400
    
    try:
        db.session.delete(invoice)
        db.session.commit()
        return jsonify({'message': 'Invoice deleted successfully'})
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500

# mark invoice as paid
@invoices_bp.route('/<int:invoice_id>/mark-paid', methods=['POST'])
@jwt_required()
def mark_invoice_paid(invoice_id):
    """Mark invoice as paid (when payment is received)"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    invoice = Invoice.query.get_or_404(invoice_id)
    
    # Check authorization
    if user.role == 'landlord':
        if not is_landlord_of_tenant(user_id, invoice.tenant_id):
            return jsonify({'error': 'Unauthorized'}), 403
    
    if invoice.status == 'paid':
        return jsonify({'error': 'Invoice is already paid'}), 400
    
    data = request.get_json()
    payment_id = data.get('payment_id')
    
    if not payment_id:
        return jsonify({'error': 'payment_id is required'}), 400
    
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({'error': 'Payment not found'}), 404
    
    try:
        invoice.status = 'paid'
        invoice.payment_id = payment_id
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice marked as paid',
            'invoice_id': invoice.id,
            'payment_id': payment_id
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500

            

   
