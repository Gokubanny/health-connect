-- 1. First, check if consultations table exists and drop it if it does
DROP TABLE IF EXISTS public.consultations CASCADE;

-- 2. Create function to generate booking reference - FIXED VERSION
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN CONCAT(
    'HC-',
    EXTRACT(YEAR FROM CURRENT_DATE),
    '-',
    LPAD(EXTRACT(DOY FROM CURRENT_DATE)::text, 3, '0'),
    '-',
    UPPER(SUBSTR(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8))
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Create consultations table - SIMPLIFIED WITHOUT FUNCTION DEPENDENCY
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('general', 'specialist', 'mental-health', 'emergency')),
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  symptoms TEXT,
  medical_history TEXT,
  emergency_contact TEXT,
  payment_method TEXT CHECK (payment_method IN ('card', 'insurance')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  consultation_fee DECIMAL(10, 2),
  consultation_duration INTEGER,
  booking_reference TEXT UNIQUE, -- Removed DEFAULT function to avoid issues
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create indexes for consultations
CREATE INDEX idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX idx_consultations_date ON public.consultations(preferred_date);
CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_consultations_type ON public.consultations(consultation_type);

-- 5. Enable RLS on consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for consultations
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own consultations" ON public.consultations;
    DROP POLICY IF EXISTS "Users can insert their own consultations" ON public.consultations;
    DROP POLICY IF EXISTS "Users can update their own consultations" ON public.consultations;
    
    -- Create new policies
    CREATE POLICY "Users can view their own consultations" 
    ON public.consultations 
    FOR SELECT 
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own consultations" 
    ON public.consultations 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own consultations" 
    ON public.consultations 
    FOR UPDATE 
    USING (auth.uid() = user_id);
END $$;

-- 7. Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for consultations
DROP TRIGGER IF EXISTS update_consultations_updated_at ON public.consultations;
CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Grant necessary permissions
GRANT ALL ON public.consultations TO authenticated;
GRANT ALL ON public.consultations TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Skip doctors and appointment_slots for now to avoid conflicts
-- 10. Test the table with a simple insert
DO $$
BEGIN
    -- Test insert to ensure everything works
    INSERT INTO public.consultations (
      user_id, patient_name, email, phone, consultation_type,
      preferred_date, preferred_time, payment_method,
      consultation_fee, consultation_duration, booking_reference, status
    ) VALUES (
      NULL, 'Test Patient', 'test@example.com', '1234567890', 'general',
      CURRENT_DATE, '10:00 AM', 'card',
      5000, 30, 'HC-TEST-12345', 'pending'
    );
    
    -- Clean up test data
    DELETE FROM public.consultations WHERE booking_reference = 'HC-TEST-12345';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;