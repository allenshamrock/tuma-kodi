"""
Direct SMS Test - Bypass all routes and test SMS directly
Run this standalone to see the EXACT error
"""

import os
from dotenv import load_dotenv
import africastalking

# Load environment variables
load_dotenv(override=True)

print("=" * 70)
print("DIRECT SMS TEST")
print("=" * 70)

# Get credentials
at_username = os.getenv('AT_USERNAME') or os.getenv('AFRICASTALKING_USERNAME')
at_api_key = os.getenv('AT_API_KEY') or os.getenv('AFRICASTALKING_API_KEY')
at_sender = os.getenv('AT_SENDER_ID') or os.getenv('AFRICASTALKING_SENDER_ID') 
print(f"\n1. Environment Variables:")
print(f"   Username: {at_username}")
print(f"   API Key: {at_api_key[:20]}...{at_api_key[-4:] if at_api_key else ''}")
print(f"   Sender ID: {at_sender}")

if not at_username or not at_api_key:
    print("\n Missing credentials!")
    exit(1)

# Normalize username
at_username = at_username.lower()
print(f"\n2. Username normalized to: {at_username}")

# Initialize
print(f"\n3. Initializing Africa's Talking...")
try:
    africastalking.initialize(at_username, at_api_key)
    sms = africastalking.SMS
    print("   ✓ Initialized")
except Exception as e:
    print(f"    Failed: {e}")
    exit(1)

# Test phone number - use your actual phone
print(f"\n4. Enter phone number to test:")
phone = input("   Phone: ").strip() or "254711123456"

# Format phone
if not phone.startswith('+'):
    phone = phone.replace(' ', '').replace('-', '')
    if phone.startswith('0'):
        phone = f'+254{phone[1:]}'
    elif phone.startswith('254'):
        phone = f'+{phone}'
    else:
        phone = f'+254{phone}'

print(f"   Formatted: {phone}")

# Send SMS
message = "TEST: Direct SMS from Python script. If you receive this, SMS API is working!"

print(f"\n5. Sending SMS...")
print(f"   To: {phone}")
print(f"   From: {at_sender if at_sender else 'Default (AFRICASTKNG)'}")
print(f"   Message: {message}")

try:
    # Don't include sender_id if it's None (for sandbox)
    if at_sender:
        response = sms.send(
            message=message,
            recipients=[phone],
            sender_id=at_sender
        )
    else:
        response = sms.send(
            message=message,
            recipients=[phone]
        )
    
    print(f"\n6. RAW API RESPONSE:")
    print(f"   {response}")
    
    # Parse response
    sms_data = response.get('SMSMessageData', {})
    api_message = sms_data.get('Message', '')
    recipients = sms_data.get('Recipients', [])
    
    print(f"\n7. PARSED RESPONSE:")
    print(f"   Message: {api_message}")
    print(f"   Recipients count: {len(recipients)}")
    
    if recipients:
        for i, recipient in enumerate(recipients, 1):
            print(f"\n   Recipient {i}:")
            print(f"      Number: {recipient.get('number', 'N/A')}")
            print(f"      Status: {recipient.get('status', 'N/A')}")
            print(f"      Status Code: {recipient.get('statusCode', 'N/A')}")
            print(f"      Message ID: {recipient.get('messageId', 'N/A')}")
            print(f"      Cost: {recipient.get('cost', 'N/A')}")
            
            status_code = recipient.get('statusCode', 0)
            
            print(f"\n   [DIAGNOSIS]")
            if status_code == 101:
                print("   ✓✓✓ SUCCESS! SMS sent!")
                print("   Check your phone and Africa's Talking Outbox")
            elif status_code == 102:
                print("   ✓ QUEUED! SMS is being sent")
            elif status_code == 401:
                print("    AUTHENTICATION FAILED")
                print("   Your username or API key is wrong")
                print(f"   Current username: {at_username}")
                print(f"   Current API key: {at_api_key[:20]}...")
            elif status_code == 403:
                print("    PHONE NOT REGISTERED IN SANDBOX")
                print(f"   Phone {phone} is not registered")
                print("   → Go to sandbox.africastalking.com")
                print("   → Register this phone number")
            elif status_code == 404:
                print("    INVALID PHONE NUMBER")
                print(f"   Phone {phone} is not valid")
            elif status_code == 405:
                print("    NO CREDIT")
                print("   Your account has no SMS credits")
                print("   → Top up your account")
            else:
                print(f"    FAILED: {recipient.get('status', 'Unknown error')}")
                print(f"   Status Code: {status_code}")
    else:
        print("\n    No recipients in response!")
        print("   This usually means authentication failed")
        
except Exception as e:
    print(f"\n    EXCEPTION: {e}")
    print(f"   Type: {type(e).__name__}")
    
    error_str = str(e).lower()
    
    if 'authentication' in error_str or 'invalid' in error_str or '401' in error_str:
        print("\n   [DIAGNOSIS] Authentication Error")
        print("   Your credentials are wrong")
        print("\n   → Fix:")
        print("      1. Go to https://account.africastalking.com/")
        print("      2. Login to sandbox")
        print("      3. Copy API Key again")
        print("      4. Update .env:")
        print(f"         AT_USERNAME=sandbox")
        print(f"         AT_API_KEY=<your_new_key>")
        
    elif 'connection' in error_str or 'timeout' in error_str:
        print("\n   [DIAGNOSIS] Network Error")
        print("   Cannot reach Africa's Talking servers")
        print("   Check your internet connection")
        
    else:
        print("\n   [DIAGNOSIS] Unknown Error")
        import traceback
        print(traceback.format_exc())

print("\n" + "=" * 70)