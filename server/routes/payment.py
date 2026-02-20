from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Payment, Tenant, Apartment, Property
from config import db
from datetime import datetime
from mpesa_client import mpesa_client
import logging
from .notifications import send_payment_confirmation_sms,send_partial_payment_sms

payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ==================== M-PESA ROUTES ====================

@payments_bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """
    M-Pesa C2B Paybill callback
    Called when tenant pays via Paybill 174379
    """
    try:
        data = request.get_json()
        logger.info(f"M-Pesa C2B callback received: {data}")

        # Extract M-Pesa data
        mpesa_receipt = data.get('TransID')
        apartment_number = data.get('BillRefNumber')
        amount = data.get('TransAmount')
        phone_number = data.get('MSISDN')
        trans_time = data.get('TransTime')

        # Validate required fields
        if not all([mpesa_receipt, apartment_number, amount, phone_number, trans_time]):
            return jsonify({
                'ResultCode': 1,
                'ResultDesc': 'Missing required fields'
            }), 400

        # Convert amount
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return jsonify({
                'ResultCode': 1,
                'ResultDesc': 'Invalid amount format'
            }), 400

        # Check for duplicate
        existing_payment = Payment.query.filter_by(
            mpesa_receipt_number=mpesa_receipt
        ).first()

        if existing_payment:
            logger.warning(f"Duplicate transaction: {mpesa_receipt}")
            return jsonify({
                'ResultCode': 0,
                'ResultDesc': 'Transaction already processed'
            }), 200

        # Parse tenant name
        first_name = data.get('FirstName', '')
        middle_name = data.get('MiddleName', '')
        last_name = data.get('LastName', '')
        tenant_name = f"{first_name} {middle_name} {last_name}".strip()

        # Find apartment
        apartment = Apartment.query.filter_by(
            apartment_number=apartment_number.strip()
        ).first()

        if not apartment:
            logger.error(f"Apartment not found: {apartment_number}")
            return jsonify({
                'ResultCode': 1,
                'ResultDesc': f'Apartment {apartment_number} not found'
            }), 404

        # Find active tenant
        tenant = Tenant.query.filter_by(
            apartment_id=apartment.id,
            status='active'
        ).first()

        if not tenant:
            logger.warning(f"No active tenant for {apartment_number}")
            # Still create payment but mark as pending
            tenant_id = None
            status = 'pending'
        else:
            tenant_id = tenant.id
            expected_rent = float(tenant.monthly_rent)
            
            if amount < expected_rent:
                status = 'partial'
            else:
                status = 'completed'

        # Parse payment date
        try:
            payment_date = datetime.strptime(trans_time, '%Y%m%d%H%M%S')
        except ValueError:
            logger.error(f"Invalid time format: {trans_time}")
            payment_date = datetime.utcnow()

        month_paid_for = payment_date.strftime('%Y-%m')

        # Format phone number
        if not phone_number.startswith('+'):
            if phone_number.startswith('254'):
                phone_number = f'+{phone_number}'
            elif phone_number.startswith('0'):
                phone_number = f'+254{phone_number[1:]}'

        # Create payment record
        payment = Payment(
            tenant_id=tenant_id,
            apartment_id=apartment.id,
            payment_date=payment_date,
            tenant_name=tenant_name,
            apartment_number=apartment_number,
            amount=amount,
            mpesa_receipt_number=mpesa_receipt,
            payment_method='mpesa',
            month_paid_for=month_paid_for,
            status=status,
            phone_number=phone_number
        )

        db.session.add(payment)
        db.session.commit()

        logger.info(f"Payment recorded: {mpesa_receipt} - {amount}")

        #Auto send confirmation SMS
        if status == 'completed':
            #Send payment confirmation
            send_payment_confirmation_sms(payment)
        elif status == 'partial':
            #Send partial payment notice
            if tenant:
                send_partial_payment_sms(payment,tenant,apartment)

        return jsonify({
            'ResultCode': 0,
            'ResultDesc': 'Payment received successfully'
        }), 200

    except Exception as e:
        logger.error(f"Callback error: {str(e)}")
        db.session.rollback()
        return jsonify({
            'ResultCode': 1,
            'ResultDesc': str(e)
        }), 500


@payments_bp.route('/mpesa/stk-push', methods=['POST'])
@jwt_required()
def initiate_stk_push():
    """
    Initiate STK Push payment
    Sends payment prompt to tenant's phone
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        phone_number = data.get('phone_number')
        apartment_number = data.get('apartment_number')

        # If apartment_number not provided, get from user's tenant profile
        if not apartment_number:
            if not user.tenant_profile:
                return jsonify({'error': 'No tenant profile found'}), 404

            tenant = user.tenant_profile
            apartment = Apartment.query.get(tenant.apartment_id)
            
            if not apartment:
                return jsonify({'error': 'Apartment not found'}), 404

            apartment_number = apartment.apartment_number
            
            # Use tenant's rent amount
            rent_amount = float(tenant.monthly_rent)
            
        else:
            # Find apartment by number
            apartment = Apartment.query.filter_by(
                apartment_number=apartment_number
            ).first()

            if not apartment:
                return jsonify({'error': 'Apartment not found'}), 404

            # Get active tenant
            tenant = Tenant.query.filter_by(
                apartment_id=apartment.id,
                status='active'
            ).first()

            if not tenant:
                return jsonify({'error': 'No active tenant'}), 404

            rent_amount = float(tenant.monthly_rent)

        # Use provided phone or tenant's phone
        if not phone_number:
            phone_number = tenant.phone

        # Validate phone number
        if not mpesa_client.validate_phone_number(phone_number):
            return jsonify({
                'error': 'Invalid phone number. Use format: 0712345678 or 254712345678'
            }), 400

        # Initiate STK Push
        try:
            response = mpesa_client.stk_push(
                phone_number=phone_number,
                amount=rent_amount,
                account_reference=apartment_number,
                transaction_desc=f'Rent for {apartment_number}'
            )

            # M-Pesa response structure:
            # Success: ResponseCode = "0"
            # Failed: ResponseCode != "0"

            if response.get('ResponseCode') == '0':
                return jsonify({
                    'success': True,
                    'message': 'Payment prompt sent to your phone',
                    'amount': rent_amount,
                    'apartment_number': apartment_number,
                    'phone_number': phone_number,
                    'checkout_request_id': response.get('CheckoutRequestID'),
                    'merchant_request_id': response.get('MerchantRequestID')
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': response.get('ResponseDescription', 'STK Push failed'),
                    'error_code': response.get('ResponseCode')
                }), 400

        except Exception as e:
            logger.error(f"STK Push error: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Failed to send payment prompt',
                'details': str(e)
            }), 500

    except Exception as e:
        logger.error(f"STK Push route error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/mpesa/stk-callback', methods=['POST'])
def stk_push_callback():
    """
    STK Push callback
    M-Pesa sends result of STK Push here
    """
    try:
        data = request.get_json()
        logger.info(f"STK callback received: {data}")

        # Extract callback data
        body = data.get('Body', {})
        stk_callback = body.get('stkCallback', {})
        
        result_code = stk_callback.get('ResultCode')
        result_desc = stk_callback.get('ResultDesc')
        merchant_request_id = stk_callback.get('MerchantRequestID')
        checkout_request_id = stk_callback.get('CheckoutRequestID')

        if result_code == 0:
            # Payment successful
            callback_metadata = stk_callback.get('CallbackMetadata', {})
            items = callback_metadata.get('Item', [])

            # Extract payment details
            payment_details = {}
            for item in items:
                name = item.get('Name')
                value = item.get('Value')
                payment_details[name] = value

            amount = payment_details.get('Amount')
            mpesa_receipt = payment_details.get('MpesaReceiptNumber')
            phone_number = str(payment_details.get('PhoneNumber'))
            
            logger.info(f"STK Push successful: {mpesa_receipt} - Amount: {amount}")

            # Note: For STK Push, we don't automatically create a payment here
            # because we don't have apartment_number in the callback
            # The payment will be created by the C2B callback when it arrives
            # This callback is mainly for updating UI/notification purposes

        else:
            # Payment failed or cancelled
            logger.warning(f"STK Push failed: {result_desc}")

        return jsonify({
            'ResultCode': 0,
            'ResultDesc': 'Callback processed'
        }), 200

    except Exception as e:
        logger.error(f"STK callback error: {str(e)}")
        return jsonify({
            'ResultCode': 1,
            'ResultDesc': str(e)
        }), 500


@payments_bp.route('/mpesa/query/<checkout_request_id>', methods=['GET'])
@jwt_required()
def query_stk_status(checkout_request_id):
    """
    Query STK Push transaction status
    Useful to check if user completed payment
    """
    try:
        response = mpesa_client.query_stk_status(checkout_request_id)
        
        return jsonify({
            'success': True,
            'data': response
        }), 200

    except Exception as e:
        logger.error(f"Query error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@payments_bp.route('/mpesa/verify/<receipt_number>', methods=['GET'])
@jwt_required()
def verify_payment(receipt_number):
    """
    Verify payment by M-Pesa receipt number
    """
    try:
        payment = Payment.query.filter_by(
            mpesa_receipt_number=receipt_number
        ).first()

        if not payment:
            return jsonify({
                'found': False,
                'message': 'Payment not found'
            }), 404

        return jsonify({
            'found': True,
            'payment': {
                'receipt_number': payment.mpesa_receipt_number,
                'amount': str(payment.amount),
                'apartment_number': payment.apartment_number,
                'tenant_name': payment.tenant_name,
                'payment_date': payment.payment_date.isoformat(),
                'month_paid_for': payment.month_paid_for,
                'status': payment.status
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== LANDLORD PAYMENT VIEWING ROUTES ====================

@payments_bp.route('/', methods=['GET'])
@jwt_required()
def get_landlord_payments():
    """
    Get all payments for landlord's properties
    """
    try:
        current_user_id = get_jwt_identity()
        landlord = User.query.get(current_user_id)

        if not landlord:
            return jsonify({'error': 'User not found'}), 404

        if landlord.role != 'landlord':
            return jsonify({'error': 'Unauthorized. Only landlords allowed'}), 403

        landlord_property_ids = [prop.id for prop in landlord.properties]

        if not landlord_property_ids:
            return jsonify({'payments': [], 'total_count': 0}), 200

        # Build query
        query = db.session.query(Payment).join(
            Apartment, Payment.apartment_id == Apartment.id
        ).filter(
            Apartment.property_id.in_(landlord_property_ids)
        )

        # Apply filters
        property_id = request.args.get('property_id', type=int)
        if property_id:
            if property_id not in landlord_property_ids:
                return jsonify({'error': 'Unauthorized property'}), 403
            query = query.filter(Apartment.property_id == property_id)

        apartment_id = request.args.get('apartment_id', type=int)
        if apartment_id:
            query = query.filter(Payment.apartment_id == apartment_id)

        status = request.args.get('status')
        if status:
            query = query.filter(Payment.status == status)

        month_paid_for = request.args.get('month_paid_for')
        if month_paid_for:
            query = query.filter(Payment.month_paid_for == month_paid_for)

        start_date = request.args.get('start_date')
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
                query = query.filter(Payment.payment_date >= start_dt)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format'}), 400

        end_date = request.args.get('end_date')
        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date)
                query = query.filter(Payment.payment_date <= end_dt)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format'}), 400

        # Execute query
        payments = query.order_by(Payment.payment_date.desc()).all()

        # Format response
        payments_data = []
        for payment in payments:
            apartment = Apartment.query.get(payment.apartment_id)
            property_info = Property.query.get(apartment.property_id) if apartment else None

            payments_data.append({
                'id': payment.id,
                'tenant_name': payment.tenant_name,
                'apartment_number': payment.apartment_number,
                'amount': str(payment.amount),
                'mpesa_receipt_number': payment.mpesa_receipt_number,
                'payment_method': payment.payment_method,
                'payment_date': payment.payment_date.isoformat(),
                'month_paid_for': payment.month_paid_for,
                'status': payment.status,
                'phone_number': payment.phone_number,
                'property_name': property_info.name if property_info else None,
                'property_address': property_info.address if property_info else None,
                'created_at': payment.created_at.isoformat(),
                'updated_at': payment.updated_at.isoformat()
            })

        # Calculate summary
        total_amount = sum(float(payment.amount) for payment in payments)
        completed_payments = [p for p in payments if p.status == 'completed']
        pending_payments = [p for p in payments if p.status == 'pending']

        return jsonify({
            'payments': payments_data,
            'total_count': len(payments),
            'total_amount': str(total_amount),
            'completed_count': len(completed_payments),
            'pending_count': len(pending_payments)
        }), 200

    except Exception as e:
        logger.error(f"Get payments error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment_detail(payment_id):
    """
    Get detailed information about a specific payment
    """
    try:
        current_user_id = get_jwt_identity()
        landlord = User.query.get(current_user_id)

        if not landlord or landlord.role != 'landlord':
            return jsonify({'error': 'Unauthorized'}), 403

        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404

        apartment = Apartment.query.get(payment.apartment_id)
        if not apartment or apartment.property.landlord_id != landlord.id:
            return jsonify({'error': 'Unauthorized'}), 403

        tenant = Tenant.query.get(payment.tenant_id)
        property_info = Property.query.get(apartment.property_id)

        return jsonify({
            'id': payment.id,
            'tenant_name': payment.tenant_name,
            'tenant_email': tenant.email if tenant else None,
            'tenant_phone': payment.phone_number,
            'apartment_number': payment.apartment_number,
            'apartment_type': apartment.apartment_type if apartment else None,
            'property_name': property_info.name if property_info else None,
            'property_address': property_info.address if property_info else None,
            'amount': str(payment.amount),
            'mpesa_receipt_number': payment.mpesa_receipt_number,
            'payment_method': payment.payment_method,
            'payment_date': payment.payment_date.isoformat(),
            'month_paid_for': payment.month_paid_for,
            'status': payment.status,
            'created_at': payment.created_at.isoformat(),
            'updated_at': payment.updated_at.isoformat()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_payment_summary():
    """
    Get payment summary statistics
    """
    try:
        current_user_id = get_jwt_identity()
        landlord = User.query.get(current_user_id)

        if not landlord or landlord.role != 'landlord':
            return jsonify({'error': 'Unauthorized'}), 403

        landlord_property_ids = [prop.id for prop in landlord.properties]

        if not landlord_property_ids:
            return jsonify({
                'total_properties': 0,
                'total_apartments': 0,
                'total_payments': 0,
                'total_revenue': '0.00'
            }), 200

        # Get payments
        query = db.session.query(Payment).join(
            Apartment, Payment.apartment_id == Apartment.id
        ).filter(
            Apartment.property_id.in_(landlord_property_ids)
        )

        month_year = request.args.get('month_year')
        if month_year:
            query = query.filter(Payment.month_paid_for == month_year)

        payments = query.all()

        # Calculate statistics
        completed = [p for p in payments if p.status == 'completed']
        pending = [p for p in payments if p.status == 'pending']
        partial = [p for p in payments if p.status == 'partial']

        total_revenue = sum(float(p.amount) for p in completed)
        expected_revenue = sum(float(p.amount) for p in payments)

        total_apartments = db.session.query(Apartment).filter(
            Apartment.property_id.in_(landlord_property_ids)
        ).count()

        return jsonify({
            'total_properties': len(landlord.properties),
            'total_apartments': total_apartments,
            'total_payments': len(payments),
            'completed_payments': len(completed),
            'pending_payments': len(pending),
            'partial_payments': len(partial),
            'total_revenue': f'{total_revenue:.2f}',
            'expected_revenue': f'{expected_revenue:.2f}',
            'collection_rate': f'{(len(completed) / len(payments) * 100) if payments else 0:.2f}%',
            'month_year': month_year if month_year else 'All time'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/by-property', methods=['GET'])
@jwt_required()
def get_payments_by_property():
    """
    Get payments grouped by property
    """
    try:
        current_user_id = get_jwt_identity()
        landlord = User.query.get(current_user_id)

        if not landlord or landlord.role != 'landlord':
            return jsonify({'error': 'Unauthorized'}), 403

        properties_data = []

        for property_info in landlord.properties:
            apartment_ids = [apt.id for apt in property_info.apartments]

            payments = Payment.query.filter(
                Payment.apartment_id.in_(apartment_ids)
            ).all()

            completed = [p for p in payments if p.status == 'completed']
            total_revenue = sum(float(p.amount) for p in completed)

            properties_data.append({
                'property_id': property_info.id,
                'property_name': property_info.name,
                'property_address': property_info.address,
                'total_units': property_info.total_units,
                'total_payments': len(payments),
                'completed_payments': len(completed),
                'total_revenue': f'{total_revenue:.2f}'
            })

        return jsonify({'properties': properties_data}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500