-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Update existing profile if it exists for admin user
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'marvellousbenji721@gmail.com'
);

-- Update the handle_new_user function to set admin role for your email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    CASE 
      WHEN NEW.email = 'marvellousbenji721@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;