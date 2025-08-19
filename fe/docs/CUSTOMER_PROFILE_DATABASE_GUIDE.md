# Customer Profile Database Integration Guide

## 🎯 **Overview**
This guide explains how to fetch data from the database `profiles` table and implement a comprehensive customer profile in the RouteLead app.

## 🗄️ **Database Schema - Profiles Table**

### **Available Fields:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,                    -- User ID (linked to auth.users)
  email VARCHAR(255) NOT NULL UNIQUE,     -- User email
  role user_role NOT NULL,                -- CUSTOMER/DRIVER/ADMIN
  first_name VARCHAR(100),                -- First name
  last_name VARCHAR(100),                 -- Last name
  phone_number VARCHAR(20),               -- Phone number
  nic_number VARCHAR(20),                 -- NIC number
  profile_photo_url TEXT,                 -- Profile photo URL
  is_verified BOOLEAN DEFAULT FALSE,      -- Verification status
  date_of_birth DATE,                     -- Date of birth
  gender gender_enum,                     -- Gender (MALE/FEMALE/OTHER/PNTS)
  address_line_1 VARCHAR(255),            -- Address line 1
  address_line_2 VARCHAR(255),            -- Address line 2
  city VARCHAR(100),                      -- City
  created_at TIMESTAMPTZ,                 -- Account creation date
  updated_at TIMESTAMPTZ                  -- Last update date
);
```

## 🔌 **Database Connection Setup**

### **1. Supabase Configuration**
The app uses Supabase for database operations. Configuration is in `fe/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnsaibersyxpedauhwfw.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### **2. Authentication Flow**
```typescript
// Get current authenticated user
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  throw new Error('User not authenticated');
}
```

## 📊 **Data Fetching Implementation**

### **1. Profile Data Interface**
```typescript
interface ProfileData {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  nic_number: string | null;
  profile_photo_url: string | null;
  is_verified: boolean;
  date_of_birth: string | null;
  gender: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}
```

### **2. Fetch Profile Function**
```typescript
const fetchUserProfile = async () => {
  try {
    setLoading(true);
    setError(null);

    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Fetch profile data from profiles table
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')  // Select all fields
      .eq('id', user.id)  // Filter by user ID
      .single();  // Get single record

    if (profileError) {
      throw new Error('Failed to fetch profile data');
    }

    if (data) {
      setProfileData(data);
    } else {
      throw new Error('Profile not found');
    }

  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error occurred');
  } finally {
    setLoading(false);
  }
};
```

## 🎨 **Frontend Implementation**

### **1. State Management**
```typescript
const [profileData, setProfileData] = useState<ProfileData | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### **2. Loading State**
```typescript
if (loading) {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#f97316" />
      <Text className="text-gray-600 mt-4">Loading profile...</Text>
    </View>
  );
}
```

### **3. Error State**
```typescript
if (error) {
  return (
    <View className="flex-1 justify-center items-center p-4">
      <Ionicons name="alert-circle" size={64} color="#ef4444" />
      <Text className="text-red-500 text-lg font-semibold mt-4 text-center">
        Error Loading Profile
      </Text>
      <Text className="text-gray-600 mt-2 text-center">{error}</Text>
      <TouchableOpacity onPress={fetchUserProfile} className="bg-orange-500 px-6 py-3 rounded-lg mt-4">
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### **4. Data Display**
```typescript
// Format display name
const displayName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'No Name Set';

// Format phone number
const displayPhone = profileData.phone_number || 'Not provided';

// Format NIC number
const displayNIC = profileData.nic_number || 'Not provided';

// Format address
const displayAddress = [
  profileData.address_line_1,
  profileData.address_line_2,
  profileData.city
].filter(Boolean).join(', ') || 'No address provided';
```

## 🔧 **Database Operations**

### **1. SELECT Query (Read)**
```typescript
// Fetch all profile data
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// Fetch specific fields only
const { data, error } = await supabase
  .from('profiles')
  .select('first_name, last_name, email, phone_number')
  .eq('id', user.id)
  .single();
```

### **2. UPDATE Query (Modify)**
```typescript
// Update profile information
const { data, error } = await supabase
  .from('profiles')
  .update({
    first_name: 'John',
    last_name: 'Doe',
    phone_number: '+1234567890'
  })
  .eq('id', user.id);
```

### **3. INSERT Query (Create)**
```typescript
// Insert new profile (usually handled by auth trigger)
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: user.id,
    email: user.email,
    role: 'CUSTOMER',
    first_name: 'John',
    last_name: 'Doe'
  });
```

## 🚨 **Error Handling**

### **1. Common Errors**
- **Authentication Error**: User not logged in
- **Profile Not Found**: Profile doesn't exist in database
- **Network Error**: Connection issues
- **Permission Error**: RLS (Row Level Security) restrictions

### **2. Error Handling Strategy**
```typescript
try {
  // Database operation
} catch (err) {
  console.error('Error details:', err);
  
  if (err.message.includes('authentication')) {
    setError('Please log in again');
  } else if (err.message.includes('not found')) {
    setError('Profile not found');
  } else {
    setError('An unexpected error occurred');
  }
}
```

## 🧪 **Testing & Debugging**

### **1. Debug Section (Development Only)**
```typescript
{__DEV__ && (
  <PrimaryCard className="mb-4 p-4">
    <Text className="text-sm text-gray-600 mb-2">Raw Profile Data:</Text>
    <Text className="text-xs text-gray-500 font-mono">
      {JSON.stringify(profileData, null, 2)}
    </Text>
    <TouchableOpacity onPress={fetchUserProfile} className="bg-blue-500 px-4 py-2 rounded-lg mt-3">
      <Text className="text-white text-sm font-medium">Refresh Data</Text>
    </TouchableOpacity>
  </PrimaryCard>
)}
```

### **2. Console Logging**
```typescript
console.log('User ID:', user.id);
console.log('Profile Data:', data);
console.log('Profile Error:', profileError);
```

## 📱 **UI Components Used**

### **1. PrimaryCard**
- Wrapper component for profile sections
- Consistent styling and spacing

### **2. PrimaryButton**
- Standard button component
- Used for logout and actions

### **3. Icons**
- Ionicons: General UI icons
- FontAwesome5: Specialized icons
- MaterialCommunityIcons: Additional icon set

## 🔐 **Security Considerations**

### **1. Row Level Security (RLS)**
- Users can only access their own profile
- Admins can access all profiles
- Proper authentication required

### **2. Data Validation**
- Always validate user input
- Sanitize data before database operations
- Use parameterized queries

## 📋 **Next Steps**

### **1. Profile Editing**
- Implement edit profile screen
- Add form validation
- Handle image uploads

### **2. Real-time Updates**
- Subscribe to profile changes
- Update UI automatically
- Handle offline scenarios

### **3. Data Caching**
- Implement local storage
- Cache profile data
- Sync with server

## 🎉 **Summary**

The customer profile now:
- ✅ Fetches real data from database
- ✅ Handles loading and error states
- ✅ Displays all relevant profile information
- ✅ Follows the same structure as driver profile
- ✅ Includes proper error handling
- ✅ Has debug information for development
- ✅ Uses consistent UI components

The profile will automatically load user data when the component mounts and display it in a clean, organized format.
