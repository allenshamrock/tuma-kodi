import os
import base64
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class MpesaClient:
    """
    M-Pesa Daraja API Client
    Handles STK Push, callbacks, and transaction queries
    """
    
    def __init__(self):
        self.consumer_key = os.getenv('CONSUMER_KEY')
        self.consumer_secret = os.getenv('CONSUMER_SECRET')
        self.business_shortcode = os.getenv('BUSINESS_SHORTCODE')
        self.passkey = os.getenv('PASSKEY')
        self.environment = os.getenv('MPESA_ENVIRONMENT', 'sandbox')
        self.callback_url = os.getenv('MPESA_CALLBACK_URL')
        
        # Set base URL based on environment
        if self.environment == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'
        
        self.access_token = None
        self.token_expiry = None
    
    def get_access_token(self):
        """
        Get OAuth access token from M-Pesa
        Token is valid for 1 hour
        """
        # Check if we have a valid token
        if self.access_token and self.token_expiry:
            if datetime.now() < self.token_expiry:
                return self.access_token
        
        # Get new token
        url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'
        
        try:
            response = requests.get(
                url,
                auth=(self.consumer_key, self.consumer_secret)
            )
            response.raise_for_status()
            
            data = response.json()
            self.access_token = data['access_token']
            

            from datetime import timedelta
            self.token_expiry = datetime.now() + timedelta(minutes=55)
            
            return self.access_token
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get access token: {str(e)}")
    
    def generate_password(self, timestamp):
        """
        Generate password for STK Push
        Password = Base64(Shortcode + Passkey + Timestamp)
        """
        data_to_encode = f"{self.business_shortcode}{self.passkey}{timestamp}"
        encoded = base64.b64encode(data_to_encode.encode())
        return encoded.decode('utf-8')
    
    def stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """
        Initiate STK Push (Lipa na M-Pesa Online)
        Sends payment prompt to customer's phone
        
        Args:
            phone_number: Customer phone (254XXXXXXXXX format)
            amount: Amount to charge (minimum 1)
            account_reference: Reference (apartment number)
            transaction_desc: Description of transaction
        
        Returns:
            dict: Response from M-Pesa
        """
        # Get access token
        access_token = self.get_access_token()
        
        # Format phone number
        phone_number = self._format_phone_number(phone_number)
        
        # Generate timestamp and password
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = self.generate_password(timestamp)
        
        # Prepare request
        url = f'{self.base_url}/mpesa/stkpush/v1/processrequest'
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'BusinessShortCode': self.business_shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(amount),
            'PartyA': phone_number,
            'PartyB': self.business_shortcode,
            'PhoneNumber': phone_number,
            'CallBackURL': f'{self.callback_url}/api/mpesa/stk-callback',
            'AccountReference': account_reference,
            'TransactionDesc': transaction_desc
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"STK Push failed: {str(e)}")
    
    def query_stk_status(self, checkout_request_id):
        """
        Query the status of an STK Push transaction
        
        Args:
            checkout_request_id: CheckoutRequestID from STK Push response
        
        Returns:
            dict: Transaction status
        """
        access_token = self.get_access_token()
        
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = self.generate_password(timestamp)
        
        url = f'{self.base_url}/mpesa/stkpushquery/v1/query'
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'BusinessShortCode': self.business_shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'CheckoutRequestID': checkout_request_id
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Query failed: {str(e)}")
    
    def _format_phone_number(self, phone_number):
        """
        Format phone number to 254XXXXXXXXX format
        """
        # Remove spaces and special characters
        phone_number = phone_number.replace(' ', '').replace('+', '').replace('-', '')
        
        # Convert to 254 format
        if phone_number.startswith('0'):
            phone_number = f'254{phone_number[1:]}'
        elif phone_number.startswith('254'):
            pass
        elif phone_number.startswith('7') or phone_number.startswith('1'):
            phone_number = f'254{phone_number}'
        
        return phone_number
    
    def validate_phone_number(self, phone_number):
        """
        Validate Kenyan phone number
        """
        formatted = self._format_phone_number(phone_number)
        
        # Should be 12 digits starting with 254
        if len(formatted) == 12 and formatted.startswith('254'):
            # Should start with 2547 or 2541 (Safaricom/Airtel)
            if formatted.startswith('2547') or formatted.startswith('2541'):
                return True
        
        return False


mpesa_client = MpesaClient()