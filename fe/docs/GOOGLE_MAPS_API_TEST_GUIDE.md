# Google Maps API Testing Guide for RouteLead

This guide will help you verify that your Google Maps APIs are working correctly in your RouteLead project.

## 🔍 Current Configuration

Your project is configured with:
- **API Key**: `AIzaSyDj2o9cWpgCtIM2hUP938Ppo31-gvap1ig` (in `be/src/main/resources/application.properties`)
- **Dependencies**: Google Maps Services Java client v2.2.0
- **Services**: Directions API and Geocoding API

## 🚀 Quick Test Methods

### Method 1: Automated Script (Recommended)

#### For Windows Users:
```powershell
# Run the PowerShell script
.\test-google-maps-api.ps1
```

#### For Linux/Mac Users:
```bash
# Make the script executable
chmod +x test-google-maps-api.sh

# Run the script
./test-google-maps-api.sh
```

### Method 2: Manual API Testing

1. **Start your backend server:**
   ```bash
   cd be
   ./gradlew bootRun
   ```

2. **Test basic API status:**
   ```bash
   curl http://localhost:8080/api/health/maps/status
   ```

3. **Test directions API:**
   ```bash
   curl -X POST "http://localhost:8080/api/health/maps/test-directions" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "originLat=40.7128&originLng=-74.0060&destLat=34.0522&destLng=-118.2437"
   ```

4. **Test geocoding API:**
   ```bash
   curl http://localhost:8080/api/health/maps/test-geocoding
   ```

### Method 3: Browser Testing

1. Open your browser and navigate to:
   - `http://localhost:8080/api/health/maps/status`
   - `http://localhost:8080/api/health/maps/test-geocoding`

2. For POST requests, use a tool like Postman or curl

## 📊 Expected Results

### ✅ Success Response Example:
```json
{
  "status": "SUCCESS",
  "message": "Google Maps API is working correctly",
  "testLocation": "New York City",
  "geocodingResult": "New York, NY, USA",
  "timestamp": 1703123456789
}
```

### ⚠️ Warning Response Example:
```json
{
  "status": "WARNING",
  "message": "Google Maps API responded but no geocoding results",
  "timestamp": 1703123456789
}
```

### ❌ Error Response Example:
```json
{
  "status": "ERROR",
  "message": "Google Maps API is not working: RequestDeniedException",
  "error": "RequestDeniedException",
  "timestamp": 1703123456789
}
```

## 🔧 Troubleshooting Common Issues

### 1. API Key Issues

**Problem**: `RequestDeniedException` or `403 Forbidden`
**Solutions**:
- Verify your API key is correct in `application.properties`
- Check if the API key has the required permissions:
  - Directions API
  - Geocoding API
- Ensure the API key is not restricted to specific domains/IPs

### 2. Billing Issues

**Problem**: `QuotaExceededException` or `OVER_QUERY_LIMIT`
**Solutions**:
- Check your Google Cloud Console billing status
- Verify you have sufficient quota remaining
- Consider upgrading your billing plan

### 3. Network Issues

**Problem**: `ConnectException` or timeout errors
**Solutions**:
- Check your internet connection
- Verify firewall settings
- Ensure no proxy is blocking the requests

### 4. Application Issues

**Problem**: `500 Internal Server Error`
**Solutions**:
- Check application logs for detailed error messages
- Verify all dependencies are properly configured
- Ensure the GoogleMapsClient is properly injected

## 🛠️ Manual Verification Steps

### Step 1: Verify API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your API key and verify it's active
4. Check the enabled APIs include:
   - Directions API
   - Geocoding API

### Step 2: Check Billing
1. In Google Cloud Console, go to "Billing"
2. Ensure your project has billing enabled
3. Check for any payment issues

### Step 3: Test API Directly
1. Use the Google Maps API testing tool:
   ```
   https://developers.google.com/maps/documentation/directions/get-directions
   ```
2. Test with your API key directly

### Step 4: Check Application Logs
1. Start your Spring Boot application
2. Monitor the logs for any Google Maps related errors
3. Look for specific error messages in the console output

## 📈 Monitoring and Maintenance

### Regular Checks
- Monitor API usage in Google Cloud Console
- Set up alerts for quota limits
- Review billing statements regularly
- Test APIs after any configuration changes

### Best Practices
- Use environment variables for API keys in production
- Implement proper error handling in your application
- Consider implementing API key rotation
- Monitor for unusual usage patterns

## 🆘 Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look for detailed error messages in your application logs
2. **Google Cloud Console**: Check the API usage and error reports
3. **Google Maps API Documentation**: Review the official documentation for troubleshooting
4. **Community Support**: Check Stack Overflow for similar issues

## 📝 Additional Notes

- The test endpoints are designed for development/testing purposes
- In production, you should implement proper security measures
- Consider implementing rate limiting to avoid quota issues
- Monitor your API usage to optimize costs

---

**Last Updated**: December 2024
**Project**: RouteLead
**Version**: 1.0 