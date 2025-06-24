-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS profiles;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create enum type for user roles (use CASCADE to ensure dependencies are dropped if recreating)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER', 'CUSTOMER');
    END IF;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Grant necessary permissions
GRANT ALL ON TABLE profiles TO postgres;
GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON TABLE profiles TO anon;
GRANT ALL ON TABLE profiles TO service_role;

-- Grant SELECT permission on auth.users columns to authenticated users for RLS checks
GRANT SELECT (id, raw_user_meta_data) ON auth.users TO authenticated;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'ADMIN'
        )
    );

-- Policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'ADMIN'
        )
    );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
    role_value text;
BEGIN
    -- Set the search path to ensure 'user_role' is found
    SET search_path = public, auth;

    -- Log the incoming data
    RAISE NOTICE 'New user creation triggered for email: %', new.email;
    RAISE NOTICE 'Raw metadata: %', new.raw_user_meta_data;
    
    -- Get role from user metadata
    role_value := new.raw_user_meta_data->>'role';
    RAISE NOTICE 'Extracted role value: %', role_value;
    
    -- Convert role to uppercase and validate
    IF role_value IS NOT NULL THEN
        role_value := UPPER(role_value);
        RAISE NOTICE 'Uppercase role value: %', role_value;
        
        BEGIN
            user_role := role_value::user_role;
            RAISE NOTICE 'Successfully cast role to enum: %', user_role;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to cast role, defaulting to CUSTOMER. Error: %', SQLERRM;
            user_role := 'CUSTOMER'::user_role;
        END;
    ELSE
        RAISE NOTICE 'No role provided, defaulting to CUSTOMER';
        user_role := 'CUSTOMER'::user_role;
    END IF;

    -- Log the final role for debugging
    RAISE NOTICE 'Creating profile with role: %', user_role;

    -- Try to insert the profile
    BEGIN
        INSERT INTO public.profiles (
            id, 
            email, 
            role, 
            first_name,
            last_name,
            phone_number,
            created_at, 
            updated_at
        )
        VALUES (
            new.id, 
            new.email, 
            user_role,
            new.raw_user_meta_data->>'first_name',
            new.raw_user_meta_data->>'last_name',
            new.raw_user_meta_data->>'phone_number',
            CURRENT_TIMESTAMP, 
            CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Profile created successfully';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating profile: %', SQLERRM;
        RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
    END;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();