/*
  # Create Default Admin User

  1. Purpose
    - Creates a default admin user for initial system access
    - Sets up admin credentials for first-time login

  2. Admin User Details
    - Username: admin
    - Email: admin@financemanager.com
    - Role: admin
    - Status: active and approved
    - Password: Will be set through Supabase Auth

  3. Instructions
    - Run this SQL in Supabase SQL Editor
    - Then create the auth user with matching email in Supabase Auth
*/

-- First, create the auth user (this needs to be done through Supabase Auth UI or API)
-- Email: admin@financemanager.com
-- Password: admin123 (change this after first login)

-- Insert admin user into users table
-- Note: Replace 'your-auth-user-id-here' with the actual UUID from auth.users after creating the auth user

DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@financemanager.com' LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert or update admin user in users table
        INSERT INTO public.users (
            id,
            username,
            email,
            role,
            is_active,
            is_approved,
            created_at
        ) VALUES (
            admin_user_id,
            'admin',
            'admin@financemanager.com',
            'admin',
            true,
            true,
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            is_active = true,
            is_approved = true;
            
        RAISE NOTICE 'Admin user created/updated successfully with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Auth user with email admin@financemanager.com not found. Please create the auth user first.';
    END IF;
END $$;