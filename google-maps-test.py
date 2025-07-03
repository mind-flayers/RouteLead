#!/usr/bin/env python3
"""
Google Maps API Key Test Script
This script tests your Google Maps API key directly to verify it's valid and working.
"""

import requests
import json
import sys
from urllib.parse import quote

# Your API key from application.properties
API_KEY = "AIzaSyDj2o9cWpgCtIM2hUP938Ppo31-gvap1ig"

def test_api_key():
    """Test if the API key is valid and working"""
    print("🔍 Testing Google Maps API Key")
    print("=" * 50)
    print(f"API Key: {API_KEY[:10]}...{API_KEY[-10:]}")
    print()
    
    # Test 1: Geocoding API
    print("1️⃣ Testing Geocoding API...")
    geocoding_url = f"https://maps.googleapis.com/maps/api/geocode/json?address=New+York+City&key={API_KEY}"
    
    try:
        response = requests.get(geocoding_url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'OK':
                print("✅ Geocoding API: SUCCESS")
                print(f"   Found: {data['results'][0]['formatted_address']}")
            elif data.get('status') == 'REQUEST_DENIED':
                print("❌ Geocoding API: REQUEST DENIED")
                print(f"   Error: {data.get('error_message', 'No error message')}")
                return False
            elif data.get('status') == 'OVER_QUERY_LIMIT':
                print("⚠️  Geocoding API: QUOTA EXCEEDED")
                print("   You've exceeded your daily quota")
                return False
            else:
                print(f"❌ Geocoding API: {data.get('status')}")
                print(f"   Error: {data.get('error_message', 'Unknown error')}")
                return False
        else:
            print(f"❌ Geocoding API: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Geocoding API: Network error - {e}")
        return False
    
    print()
    
    # Test 2: Directions API
    print("2️⃣ Testing Directions API...")
    origin = "New York, NY"
    destination = "Los Angeles, CA"
    directions_url = f"https://maps.googleapis.com/maps/api/directions/json?origin={quote(origin)}&destination={quote(destination)}&key={API_KEY}"
    
    try:
        response = requests.get(directions_url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'OK':
                print("✅ Directions API: SUCCESS")
                route = data['routes'][0]['legs'][0]
                print(f"   Distance: {route['distance']['text']}")
                print(f"   Duration: {route['duration']['text']}")
            elif data.get('status') == 'REQUEST_DENIED':
                print("❌ Directions API: REQUEST DENIED")
                print(f"   Error: {data.get('error_message', 'No error message')}")
                return False
            elif data.get('status') == 'OVER_QUERY_LIMIT':
                print("⚠️  Directions API: QUOTA EXCEEDED")
                print("   You've exceeded your daily quota")
                return False
            else:
                print(f"❌ Directions API: {data.get('status')}")
                print(f"   Error: {data.get('error_message', 'Unknown error')}")
                return False
        else:
            print(f"❌ Directions API: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Directions API: Network error - {e}")
        return False
    
    print()
    
    # Test 3: Reverse Geocoding API
    print("3️⃣ Testing Reverse Geocoding API...")
    lat, lng = 40.7128, -74.0060  # New York coordinates
    reverse_geocoding_url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={API_KEY}"
    
    try:
        response = requests.get(reverse_geocoding_url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'OK':
                print("✅ Reverse Geocoding API: SUCCESS")
                print(f"   Address: {data['results'][0]['formatted_address']}")
            elif data.get('status') == 'REQUEST_DENIED':
                print("❌ Reverse Geocoding API: REQUEST DENIED")
                print(f"   Error: {data.get('error_message', 'No error message')}")
                return False
            elif data.get('status') == 'OVER_QUERY_LIMIT':
                print("⚠️  Reverse Geocoding API: QUOTA EXCEEDED")
                print("   You've exceeded your daily quota")
                return False
            else:
                print(f"❌ Reverse Geocoding API: {data.get('status')}")
                print(f"   Error: {data.get('error_message', 'Unknown error')}")
                return False
        else:
            print(f"❌ Reverse Geocoding API: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Reverse Geocoding API: Network error - {e}")
        return False
    
    print()
    return True

def check_api_restrictions():
    """Check for common API key restrictions"""
    print("🔧 Checking for API Key Restrictions...")
    print("=" * 50)
    
    # Test with different user agents to check for referrer restrictions
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    test_url = f"https://maps.googleapis.com/maps/api/geocode/json?address=test&key={API_KEY}"
    
    try:
        response = requests.get(test_url, headers=headers, timeout=10)
        data = response.json()
        
        if data.get('status') == 'REQUEST_DENIED':
            error_msg = data.get('error_message', '').lower()
            if 'referrer' in error_msg or 'domain' in error_msg:
                print("⚠️  API Key has referrer/domain restrictions")
                print("   You may need to add your domain to the allowed list")
            elif 'ip' in error_msg:
                print("⚠️  API Key has IP address restrictions")
                print("   You may need to add your IP to the allowed list")
            else:
                print("⚠️  API Key has restrictions (check Google Cloud Console)")
        else:
            print("✅ No obvious restrictions detected")
            
    except Exception as e:
        print(f"❌ Could not check restrictions: {e}")

def main():
    print("🚀 Google Maps API Key Validation Test")
    print("=" * 60)
    print()
    
    # Check if requests library is available
    try:
        import requests
    except ImportError:
        print("❌ Error: 'requests' library not found")
        print("   Install it with: pip install requests")
        sys.exit(1)
    
    # Test the API key
    success = test_api_key()
    
    print()
    check_api_restrictions()
    
    print()
    print("🎯 Summary:")
    print("=" * 20)
    if success:
        print("✅ Your Google Maps API key is working correctly!")
        print("   All tested APIs are responding properly.")
    else:
        print("❌ Your Google Maps API key has issues.")
        print("   Check the error messages above for details.")
    
    print()
    print("🔧 Troubleshooting Tips:")
    print("=" * 25)
    print("1. Verify your API key in Google Cloud Console")
    print("2. Check if the required APIs are enabled:")
    print("   - Geocoding API")
    print("   - Directions API")
    print("3. Ensure billing is enabled for your project")
    print("4. Check API key restrictions (referrer, IP, etc.)")
    print("5. Monitor your quota usage in Google Cloud Console")

if __name__ == "__main__":
    main() 