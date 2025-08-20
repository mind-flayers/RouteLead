# PayHere Sandbox Integration Guide

## 🎯 **Overview**
This guide documents the complete PayHere sandbox payment gateway integration for the RouteLead application.

## 🔧 **Configuration**

### **PayHere Sandbox Credentials**
- **Merchant ID**: `1231712`
- **Merchant Secret**: `MjMwMjg1OTM5NTIyOTk2NzgwMTEyMDMyOTE3MzgzMTcxMzIyMjY5`
- **App ID**: `routelead`
- **Domain/App**: `routelead`

### **Test Card Details**
- **Card Number**: `4242424242424242`
- **Expiry**: `12/25`
- **CVV**: `404`

## 📋 **API Endpoints**

### **1. Initialize Payment**
```http
POST /api/payments/initialize
```

**Parameters:**
- `bidId` (UUID): The bid ID for the payment
- `requestId` (UUID): The parcel request ID
- `userId` (UUID): The customer user ID
- `amount` (BigDecimal): Payment amount
- `paymentMethod` (String): Payment method (e.g., "CREDIT_CARD", "DEBIT_CARD")

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "merchantId": "1231712",
    "returnUrl": "https://routelead.com/api/payments/return",
    "cancelUrl": "https://routelead.com/api/payments/cancel",
    "notifyUrl": "https://routelead.com/api/payments/webhook",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+94123456789",
    "address": "RouteLead Delivery",
    "city": "Colombo",
    "country": "Sri Lanka",
    "orderId": "RL_1703123456789_abc12345",
    "items": "RouteLead Parcel Delivery Service",
    "currency": "LKR",
    "amount": 2500.00,
    "hash": "ABC123DEF456...",
    "custom1": "bid-uuid",
    "custom2": "request-uuid",
    "custom3": "user-uuid",
    "custom4": "CREDIT_CARD",
    "timestamp": "2023-12-21 10:30:45"
  }
}
```

### **2. PayHere Webhook**
```http
POST /api/payments/webhook
```

**Webhook Data:**
```json
{
  "payment_id": "123456789",
  "order_id": "RL_1703123456789_abc12345",
  "payhere_amount": "2500.00",
  "payhere_currency": "LKR",
  "status_code": "2",
  "md5sig": "ABC123DEF456...",
  "custom_1": "bid-uuid",
  "custom_2": "request-uuid",
  "custom_3": "user-uuid",
  "custom_4": "CREDIT_CARD",
  "method": "CREDIT_CARD",
  "status_message": "Payment completed successfully",
  "card_mask": "**** **** **** 1234",
  "card_holder_name": "John Doe",
  "timestamp": "2023-12-21 10:35:12"
}
```

**Status Codes:**
- `2`: Payment completed successfully
- `-1`: Payment cancelled
- `-2`: Payment failed
- `-3`: Payment pending

### **3. Payment Return URL**
```http
GET /api/payments/return
```

### **4. Payment Cancel URL**
```http
GET /api/payments/cancel
```

### **5. Get Payment Details**
```http
GET /api/payments/{id}
```

### **6. Get User Payments**
```http
GET /api/payments/user/{userId}
```

### **7. Get Payments by Status**
```http
GET /api/payments/status/{status}
```

### **8. Update Payment Status**
```http
PATCH /api/payments/{id}/status?status={status}
```

### **9. Get Payment Statistics**
```http
GET /api/payments/statistics
```

### **10. Get User Payment Statistics**
```http
GET /api/payments/user/{userId}/statistics
```

### **11. Get PayHere Configuration**
```http
GET /api/payments/payhere/config
```

## 🔐 **Security Features**

### **Hash Verification**
PayHere uses MD5 hash verification for security. The hash is generated using:
```
merchant_id + order_id + amount + currency + merchant_secret
```

### **Webhook Verification**
All webhook calls are verified using the received hash to ensure data integrity.

## 📊 **Database Schema**

### **Payments Table**
```sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  bid_id UUID REFERENCES bids(id),
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
  payment_method VARCHAR(50),
  payment_status payment_status_enum NOT NULL,
  transaction_id VARCHAR(255),
  gateway_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### **Payment Status Enum**
```sql
CREATE TYPE payment_status_enum AS ENUM(
  'PENDING',
  'PROCESSING', 
  'COMPLETED',
  'FAILED',
  'REFUNDED'
);
```

## 🚀 **Frontend Integration**

### **1. Initialize Payment**
```javascript
const initializePayment = async (bidId, requestId, userId, amount, paymentMethod) => {
  try {
    const response = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        bidId,
        requestId,
        userId,
        amount,
        paymentMethod
      })
    });
    
    const data = await response.json();
    if (data.success) {
      // Redirect to PayHere checkout
      redirectToPayHere(data.data);
    }
  } catch (error) {
    console.error('Payment initialization failed:', error);
  }
};
```

### **2. Redirect to PayHere**
```javascript
const redirectToPayHere = (paymentData) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://sandbox.payhere.lk/pay/checkout';
  
  // Add all payment data as hidden fields
  Object.keys(paymentData).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = paymentData[key];
    form.appendChild(input);
  });
  
  document.body.appendChild(form);
  form.submit();
};
```

### **3. Handle Payment Return**
```javascript
const handlePaymentReturn = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentId = urlParams.get('payment_id');
  const statusCode = urlParams.get('status_code');
  
  if (statusCode === '2') {
    // Payment successful
    showSuccessMessage('Payment completed successfully!');
  } else if (statusCode === '-1') {
    // Payment cancelled
    showErrorMessage('Payment was cancelled.');
  } else {
    // Payment failed
    showErrorMessage('Payment failed. Please try again.');
  }
};
```

## 🧪 **Testing**

### **Test Scenarios**
1. **Successful Payment**: Use test card `4242424242424242`
2. **Failed Payment**: Use invalid card number
3. **Cancelled Payment**: Cancel during checkout process
4. **Webhook Testing**: Use PayHere webhook simulator

### **Test Data**
```json
{
  "testCard": {
    "number": "4242424242424242",
    "expiry": "12/25",
    "cvv": "404"
  },
  "testAmount": 2500.00,
  "testCurrency": "LKR"
}
```

## 📝 **Error Handling**

### **Common Errors**
1. **Invalid Hash**: Check merchant secret and hash generation
2. **Payment Not Found**: Verify bid ID and user ID
3. **Webhook Failure**: Check webhook URL accessibility
4. **Database Errors**: Verify database connection and schema

### **Error Response Format**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🔄 **Payment Flow**

1. **Customer selects winning bid**
2. **System initializes payment** (`POST /api/payments/initialize`)
3. **Customer redirected to PayHere checkout**
4. **Customer completes payment on PayHere**
5. **PayHere sends webhook** (`POST /api/payments/webhook`)
6. **System updates payment status**
7. **Customer redirected to return URL**
8. **System shows payment confirmation**

## 📞 **Support**

For PayHere support:
- **Documentation**: https://developers.payhere.co/docs
- **Sandbox**: https://sandbox.payhere.lk
- **Live**: https://www.payhere.lk

## 🔒 **Security Best Practices**

1. **Always verify webhook hashes**
2. **Use HTTPS for all API calls**
3. **Validate all input parameters**
4. **Log all payment activities**
5. **Implement proper error handling**
6. **Use environment variables for secrets**
7. **Regular security audits**

## 📈 **Monitoring**

### **Key Metrics to Monitor**
- Payment success rate
- Webhook delivery success
- Average payment processing time
- Failed payment reasons
- Revenue by payment method

### **Logging**
All payment activities are logged with appropriate log levels:
- `INFO`: Payment initialization, successful payments
- `WARN`: Payment cancellations, hash verification failures
- `ERROR`: Payment failures, webhook errors, database errors
