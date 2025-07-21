/*
  # Create Admin User - Fixed Version

  1. Purpose
    - Creates a default admin user for initial system access
    - Properly handles both auth user and users table entry

  2. Instructions
    - First create auth user in Supabase Auth UI:
      Email: admin@financemanager.com
      Password: admin123
    - Then run this SQL to create the users table entry

  3. Admin Credentials
    - Username: admin
    - Email: admin@financemanager.com
    - Password: admin123 (change after first login)
*/

-- Create admin user in users table
-- This assumes you've already created the auth user with email admin@financemanager.com

DO $$
DECLARE
    admin_auth_id uuid;
BEGIN
    -- Get the auth user ID by email
    SELECT id INTO admin_auth_id 
    FROM auth.users 
    WHERE email = 'admin@financemanager.com' 
    LIMIT 1;
    
    IF admin_auth_id IS NOT NULL THEN
        -- Insert admin user into users table
        INSERT INTO public.users (
            id,
            username,
            email,
            role,
            is_active,
            is_approved,
            created_at
        ) VALUES (
            admin_auth_id,
            'admin',
            'admin@financemanager.com',
            'admin',
            true,
            true,
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            username = 'admin',
            role = 'admin',
            is_active = true,
            is_approved = true;
            
        RAISE NOTICE 'Admin user created successfully with ID: %', admin_auth_id;
    ELSE
        RAISE NOTICE 'Auth user not found. Please create auth user first with email: admin@financemanager.com';
    END IF;
END $$;

-- Verify the admin user was created
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.is_active,
    u.is_approved,
    au.email as auth_email
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.username = 'admin';