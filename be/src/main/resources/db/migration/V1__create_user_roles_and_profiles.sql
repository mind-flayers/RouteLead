-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS profiles;
DROP TYPE IF EXISTS user_role;

-- Create enum type for user roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER', 'CUSTOMER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
    role_value text;
BEGIN
    -- Get role from user metadata
    role_value := new.raw_user_meta_data->>'role';
    
    -- Convert role to uppercase and validate
    IF role_value IS NOT NULL THEN
        role_value := UPPER(role_value);
        IF role_value IN ('ADMIN', 'DRIVER', 'CUSTOMER') THEN
            user_role := role_value::user_role;
        ELSE
            user_role := 'CUSTOMER'::user_role;
        END IF;
    ELSE
        user_role := 'CUSTOMER'::user_role;
    END IF;

    -- Log the role for debugging
    RAISE NOTICE 'Creating profile with role: % (from metadata: %)', user_role, role_value;

    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (new.id, new.email, user_role, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 