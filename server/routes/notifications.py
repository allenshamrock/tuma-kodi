from flask import Blueprint, request, jsonify
from models import User,Tenant,Apartment,Property,Invoice,Payment
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import db
from sms_client import sms_client
from datetime import datetime,timedelta,date
import logging

notifications_bp = Blueprint('notifications',__name__,url_prefix='/api/notifications')
logger = logging.getLogger(__name__)

@notifications_bp.route('/send/sms',methods=['POST'])
@jwt_required()
def send_custom_sms():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or user.role != 'landlord':
            return jsonify({'message':'Unauthorized only landlords can send notifications'}),403
        
        data = request.get_json()
        tenant_ids = data.get('tenant_ids', [])
        message = data.get('message')

        if not message:
            return jsonify({'message':'Message is required'}),400
        
        if not tenant_ids:
            return jsonify({'message':'At least one tenant ID is required'}),400
        
        #Get tenants and verify they belong to the landlord's properties
        tenants = Tenant.query.filter(Tenant.id.in_(tenant_ids)).all()

        #verify ownership
        landlord_property_ids = [property.id for property in user.properties]
        results  = []

        for tenant in tenants:
            apartment = Apartment.query.get(tenant.apartment_id)
            if apartment and apartment.property_id in landlord_property_ids:
                result = sms_client.send_custom_message(
                    tenant.phone_number,
                    message
                )
                results.append({
                    'tenant_id': tenant.id,
                    'phone_number': tenant.phone_number,
                    'status':'sent' if result['success'] else 'failed',
                    'error': result.get('error')
                })
            else:
                results.append({
                    'tenant_id': tenant.id,
                    'phone_number': tenant.phone_number,
                    'status':'failed',
                    'error':'Tenant does not belong to your property'
                })
        return jsonify({
            'message':'Notification sending completed',
            'results':results
        }), 200
    except Exception as e:
        logger.error(f"Custom SMS error:{str(e)}")
        return jsonify({'error':str(e)}),500
    
@notifications_bp.route('/sms/payment-remainder',methods=['POST'])
@jwt_required()
def send_payment_remainder():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or user.role != 'landlord':
            return jsonify({'message':'Unauthorized only landlords can send notifications'}),403
        
        data = request.get_json()
        tenant_ids = data.get(tenant_ids,[])
        due_date = data.get(due_date)

        if not tenant_ids:
            return jsonify({'message':'At least one tenant ID is required'}),400
        
        if not due_date:
            #Default to 10th of th current month
            today = date.today()
            due_date = date(today.year,today.month,10).strftime('%Y-%m-%d')

        tenants = Tenant.query.filter(Tenant.id.in_(tenant_ids)).all()
        landlord_property_ids = [property.id for property in user.properties]
        results = []

        for tenant in tenants:
            apartment = Apartment.query.get(tenant.apartment_id)
            if not apartment or apartment.property_id not in landlord_property_ids:
                continue
            property_info = Property.query.get(apartment.property_id)
            house_name = f"{property_info.name} - Apt{apartment.apartment_number}"

            result = sms_client.send_payment_remainder(
                tenant = tenant.name,
                amount = float(tenant.rent_amount),
                house_name = house_name,
                due_date = due_date,
                phone_number = tenant.phone_number,
                tenant_id = tenant.id

            )
            result.append({
                'tenant_id': tenant.id,
                'phone_number': tenant.phone_number,
                'status':'sent' if result['success'] else 'failed',
                'error': result.get('error')
            })

            return jsonify({
                'message':'Payment remainders sent',
                'results':results
            }),200
    except Exception as e:
        logger.error(f"Payment remainder error:{str(e)}")
        return jsonify({'error':str(e)}),500

@notifications_bp.route('/sms/overdue_notice',methods=['POST'])
@jwt_required()
def send_overdue_notice():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or user.role != 'landlord':
            return jsonify({'message':'Unauthorized only landlords can send notifications'}),403
        
        data = request.get_json()
        tenant_ids = data.get(tenant_ids,[])

        if not tenant_ids:
            return jsonify({'message':'At least one tenant ID is required'}),400
        
        #Get all landlord properties
        landlord_property_ids = [property.id for property in user.properties]

        #Get all active tenants in landlord's properties
        tenants = db.session.query(Tenant).join(
            Apartment,Tenant.apartment_id == Apartment.id
        ).filter(
            Apartment.property_id.in_(landlord_property_ids),
            Tenant.status == 'active'
        ).all()

        results = []
        current_month = datetime.now().strftime('%Y-%m')

        for tenant in tenants:
            #Check if tenant has paid for the current month
            payment = Payment.query.filter_by(
                tenant_id = tenant.id,
                month_paid_for = current_month,
                status = 'completed'
            ).first()

            if not payment:
                #Calculate due date assume rent is due on 10th of each month
                today = date.today()
                due_date = date(today.year,today.month,10)

                if today > due_date:
                    days_overdue  = (today - due_date).days
                    apartment = Apartment.query.get(tenant.apartment_id)
                    property_info = Property.query.get(apartment.property_id)
                    house_name = f"{property_info.name} - Apt{apartment.apartment_number}"

                    result = sms_client.send_overdue_notice(
                        tenant_name = tenant.name,
                        amount= float(tenant.rent_amount),
                        house_name = house_name,
                        days_overdue = days_overdue,
                        phone_number = tenant.phone_number
                    )
                    results.append({
                        'tenant_id':tenant.id,
                        'phone_number':tenant.phone_number,
                        'status':'sent' if result['success'] else 'failed',
                        'error': result.get('error')
                    })
        return jsonify({
            'message':'Overdue notices sent',
            'results':results
        }), 200
    except Exception as e:
        logger.error(f"Overdue notice error:{str(e)}")
        return jsonify({'error':str(e)}), 500
    
@notifications_bp.route('/sms/bulk-reminder', methods= ['POST'])
@jwt_required()
def send_bulk_reminder():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or user.role != 'landlord':
            return jsonify({'message':'Unauthorized only landlords can send notifications'}),403
        
        data = request.get_json()
        property_id  =  data.get('property_id=')
        due_date = data.get('due_date',date(date.today().year,date.today().month,10).strftime('%Y-%m-%d'))

        #Get tenants
        if property_id:
            #verify ownership
            property_info = Property.query.get(property_id)
            if not property_info or property_info.landlord_id != user.id:
                return jsonify({'message':'You do not own this property'}),403
            
            apartment_ids = [apartment.id for apartment in property_info.apartments]
            tenants = Tenant.query.filter(
                Tenant.apartment_id.in_(apartment_ids),
                Tenant.status == 'active'
                ).all()
        else:
            #All landlords tenants
            landlord_property_ids = [property.id for property in user.properties]
            tenants = db.session.query(Tenant).join(
                Apartment, Tenant.apartment_id == Apartment.id
            ).filter(
                Apartment.property_id.in_(landlord_property_ids),
                Tenant.status == 'active'
            ).all()

            results = []
            for tenant in tenants:
                apartment = Apartment.query.get(tenant.apartment_id)
                property_info = Property.query.get(apartment.property_id)
                house_name = f"{property_info.name} - Apt{apartment.apartment_number}"

                result = sms_client.send_payment_remainder(
                    tenant_name = tenant.name,
                    amount = float(tenant.rent_amount),
                    house_name = house_name,
                    due_date = due_date,
                    phone_number = tenant.phone_number,
                    tenant_id = tenant.id
                )
                results.append({
                    'tenant_id': tenant.id,
                    'phone_number': tenant.phone_number,
                    'status':'sent' if result['success'] else 'failed',
                    'error': result.get('error')
                })
            return jsonify({
                'message':'Bulk payment reminders sent',
                'results':results
            }), 200
    except Exception as e:
        logger.error(f"Bulk reminder error:{str(e)}")
        return jsonify({'error':str(e)}),500

def send_payment_confirmation_sms(payment):
    """
    Automatically send payment confirmation SMS
    Called after successful payment
    """
    try:
        tenant = Tenant.query.get(payment.tenant_id)
        if not tenant:
            return
        
        apartment = Apartment.query.get(payment.apartment_id)
        property_info = Property.query.get(apartment.property_id)
        house_name = f"{property_info.name} - {apartment.apartment_number}"
        
        result = sms_client.send_payment_confirmation(
            tenant_name=tenant.name,
            amount=float(payment.amount),
            house_name=house_name,
            mpesa_ref=payment.mpesa_receipt_number,
            phone_number=tenant.phone
        )
        
        logger.info(f"Payment confirmation SMS sent to {tenant.name}: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Auto confirmation SMS error: {str(e)}")
        return None


def send_partial_payment_sms(payment, tenant, apartment):
    """
    Send partial payment notification
    """
    try:
        property_info = Property.query.get(apartment.property_id)
        house_name = f"{property_info.name} - {apartment.apartment_number}"
        
        expected_rent = float(tenant.monthly_rent)
        amount_paid = float(payment.amount)
        balance = expected_rent - amount_paid
        
        result = sms_client.send_partial_payment_notice(
            tenant_name=tenant.name,
            amount_paid=amount_paid,
            amount_due=expected_rent,
            balance=balance,
            house_name=house_name,
            phone_number=tenant.phone
        )
        
        logger.info(f"Partial payment SMS sent to {tenant.name}")
        return result
        
    except Exception as e:
        logger.error(f"Partial payment SMS error: {str(e)}")
        return None


#Scheduled tasks
@notifications_bp.route('/scheduled/monthly-reminders', methods=['POST'])
@jwt_required()
def trigger_monthly_reminders():
    """
    Trigger monthly payment reminders
    This can be called by a cron job or scheduler
    Usually run on 1st of each month
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'landlord':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get all active tenants
        landlord_property_ids = [prop.id for prop in user.properties]
        tenants = db.session.query(Tenant).join(
            Apartment, Tenant.apartment_id == Apartment.id
        ).filter(
            Apartment.property_id.in_(landlord_property_ids),
            Tenant.status == 'active'
        ).all()
        
        # Due date is 5th of current month
        today = date.today()
        due_date = date(today.year, today.month, 10).strftime('%B 5, %Y')
        
        sent_count = 0
        for tenant in tenants:
            apartment = Apartment.query.get(tenant.apartment_id)
            property_info = Property.query.get(apartment.property_id)
            house_name = f"{property_info.name} - {apartment.apartment_number}"
            
            result = sms_client.send_payment_reminder(
                tenant_name=tenant.name,
                amount=float(tenant.monthly_rent),
                house_name=house_name,
                due_date=due_date,
                phone_number=tenant.phone,
                tenant_id=tenant.id
            )
            
            if result['success']:
                sent_count += 1
        
        return jsonify({
            'message': 'Monthly reminders sent',
            'total_tenants': len(tenants),
            'sent': sent_count
        }), 200
        
    except Exception as e:
        logger.error(f"Monthly reminders error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/scheduled/check-overdue', methods=['POST'])
@jwt_required()
def check_and_notify_overdue():
    """
    Check for overdue payments and send notifications
    Can be run daily by a cron job
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'landlord':
            return jsonify({'error': 'Unauthorized'}), 403
        
        landlord_property_ids = [prop.id for prop in user.properties]
        tenants = db.session.query(Tenant).join(
            Apartment, Tenant.apartment_id == Apartment.id
        ).filter(
            Apartment.property_id.in_(landlord_property_ids),
            Tenant.status == 'active'
        ).all()
        
        current_month = datetime.now().strftime('%Y-%m')
        today = date.today()
        due_date = date(today.year, today.month, 10)
        
        overdue_count = 0
        if today > due_date:
            for tenant in tenants:
                # Check if paid
                payment = Payment.query.filter_by(
                    tenant_id=tenant.id,
                    month_paid_for=current_month,
                    status='completed'
                ).first()
                
                if not payment:
                    days_overdue = (today - due_date).days
                    
                    # Send notice on days 3, 7, 14, 21, 28
                    if days_overdue in [3, 7, 14, 21, 28]:
                        apartment = Apartment.query.get(tenant.apartment_id)
                        property_info = Property.query.get(apartment.property_id)
                        house_name = f"{property_info.name} - {apartment.apartment_number}"
                        
                        sms_client.send_overdue_notice(
                            tenant_name=tenant.name,
                            amount=float(tenant.monthly_rent),
                            house_name=house_name,
                            days_overdue=days_overdue,
                            phone_number=tenant.phone
                        )
                        overdue_count += 1
        
        return jsonify({
            'message': 'Overdue check completed',
            'notices_sent': overdue_count
        }), 200
        
    except Exception as e:
        logger.error(f"Check overdue error: {str(e)}")
        return jsonify({'error': str(e)}), 500

