import os
from dotenv import load_dotenv
import africastalking
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class SMSClient:
    """
    Handles all SMS notifications for the property management system
    """
    def __init__(self):
        self.username = os.getenv('AFRICASTALKING_USERNAME')
        self.api_key = os.getenv('AFRICASTALKING_API_KEY')
        self.sender_id = os.getenv('AFRICASTALKING_SENDER_ID') or None
        africastalking.initialize(self.username, self.api_key)
        self.sms = africastalking.SMS

    def send_sms(self,phone_number,message):
        """
        Send an SMS to a single recipient
        """
        try:
            phone_number = self._format_phone_number(phone_number)
            #Send the SMS
            response = self.sms.send(
                message = message,
                recipients = [phone_number],
                # sender_id = self.sender_id
            )
            logger.info(f"SMS sent to {phone_number}:{response}")
            return {
                'status': 'success',
                'response': response
            }
        except Exception as e:
            logger.error(f"Failed to send SMS to {phone_number}:{str(e)}")
            return{
                'status':'error',
                'error':str(e)
            }
    
    def send_bulk_sms(self,recipients,message):
        """
        Send SMS to multiple recipients
        """
        try:
            formatted_recipients = [
                self._format_phone_number(phone)
                for phone in recipients
            ]

            response =self.sms.send(
                message = message,
                recipients = formatted_recipients,
                # sender_id = self.sender_id
            )
            logger.info(f"Bulk SMS sent to {len(formatted_recipients)} recipients")
            return{
                'status':'success',
                'response':'response'
            }
        except Exception as e:
            logger.error(f"Failed to send bulk SMS:{str(e)}")
            return{
                'status':'error',
                'error':str(e)
            }
        
    def send_payment_reminder(self,tenant_name,phone_number,amount,house_name,tenant_id,due_date):
            """
            Send payment remainder to tenant
            """
            message = (
            f"Dear {tenant_name}, your rent of KES {amount:,.0f} for {house_name}"
            f" is due on {due_date}. Please pay via M-Pesa Paybill 174379. "
            f"Account: {house_name}. Ref: {tenant_id}"
            )
            return self.send_sms(phone_number,message)
    
    def send_payment_confirmation(self,tenant_name,amount,phone_number,house_name,mpesa_ref):
        """
        Send payment confirmation to tenant
        """
        message = (
            f"Dear {tenant_name}, we have received your payment of KES {amount:,.0f} "
            f"for {house_name}. M-Pesa Ref: {mpesa_ref}. Thank you!"            
        )
        return self.send_sms(phone_number,message)
    
    def send_overdue_notice(self,tenant_name,phone_number,amount,house_name,days_overdue):
        """
        Send overdue notice to tenant
        """
        message = (
             f"Dear {tenant_name}, your rent of KES {amount:,.0f} for {house_name} "
            f"is {days_overdue} days overdue. Please pay immediately via M-Pesa "
            f"Paybill 174379 to avoid penalties."           
        )

        return self.send_sms(phone_number,message)
    
    def send_partial_payment_notice(self,tenant_name,phone_number,amount_paid,amount_due,balance,house_name):
        """
        Send Partial payment notice to tenant
        """
        message = (
            f"Dear {tenant_name}, we received KES {amount_paid:,.0f} for {house_name}. "
            f"Your balance is KES {balance:,.0f} out of KES {amount_due:,.0f}. "
            f"Please pay the remaining amount soon."            
        )
        return self.send_sms(phone_number,message)
    
    def send_custom_message(self,phone_number,message):
        """
        Send a custom message to tenant
        """
        return self.send_sms(phone_number,message)
    
    def _format_phone_number(self,phone_number):
        """
        Format phone number to +254 format
        """
        phone_number = phone_number.replace(' ', '').replace('-', '').replace('+', '')

        #COnvert to +254 format
        if phone_number.startswith('0'):
            phone_number = f'+254{phone_number[1:]}'
        elif phone_number.startswith('254'):
            phone_number = f'+{phone_number}'
        elif phone_number.startswith('7') or phone_number.startswith('1'):
            phone_number = f'+254{phone_number}'
        else:
            if not phone_number.startswith('+'):
                phone_number = f'+{phone_number}'
        return phone_number

sms_client = SMSClient()
       

