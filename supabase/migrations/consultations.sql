-- Create consultations table to store booking data
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
  consultation_duration INTEGER, -- in minutes
  booking_reference TEXT UNIQUE DEFAULT CONCAT('HC-', EXTRACT(YEAR FROM NOW()), '-', LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0'), '-', UPPER(SUBSTR(gen_random_uuid()::text, 1, 8))),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX idx_consultations_date ON public.consultations(preferred_date);
CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_consultations_type ON public.consultations(consultation_type);

-- Enable RLS on consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Create policies for consultations
CREATE POLICY "Users can view their own consultations" 
ON public.consultations 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own consultations" 
ON public.consultations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own consultations" 
ON public.consultations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on consultations
CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN CONCAT(
    'HC-',
    EXTRACT(YEAR FROM NOW()),
    '-',
    LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0'),
    '-',
    UPPER(SUBSTR(gen_random_uuid()::text, 1, 8))
  );
END;
$$ LANGUAGE plpgsql;

-- Create doctors table for future use
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  consultation_fee DECIMAL(10, 2) DEFAULT 50.00,
  available_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  available_times TEXT[] DEFAULT ARRAY['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
  bio TEXT,
  years_experience INTEGER DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 4.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample doctors
INSERT INTO public.doctors (name, specialization, email, phone, consultation_fee, bio, years_experience, rating) VALUES
('Dr. Sarah Johnson', 'General Practice', 'sarah.johnson@healthconnect.com', '+1-555-0101', 50.00, 'Experienced general practitioner with focus on family medicine and preventive care.', 8, 4.8),
('Dr. Michael Chen', 'Cardiology', 'michael.chen@healthconnect.com', '+1-555-0102', 100.00, 'Board-certified cardiologist specializing in heart disease prevention and treatment.', 12, 4.9),
('Dr. Emily Rodriguez', 'Psychology', 'emily.rodriguez@healthconnect.com', '+1-555-0103', 80.00, 'Licensed clinical psychologist specializing in anxiety, depression, and cognitive behavioral therapy.', 6, 4.7),
('Dr. James Wilson', 'Emergency Medicine', 'james.wilson@healthconnect.com', '+1-555-0104', 75.00, 'Emergency medicine physician with expertise in urgent care and trauma medicine.', 10, 4.6),
('Dr. Lisa Thompson', 'Pediatrics', 'lisa.thompson@healthconnect.com', '+1-555-0105', 60.00, 'Pediatrician dedicated to providing comprehensive care for children and adolescents.', 9, 4.8),
('Dr. Robert Davis', 'Internal Medicine', 'robert.davis@healthconnect.com', '+1-555-0106', 70.00, 'Internal medicine specialist focused on adult healthcare and chronic disease management.', 15, 4.5);

-- Enable RLS on doctors (public read access)
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to doctors
CREATE POLICY "Doctors are viewable by everyone" 
ON public.doctors 
FOR SELECT 
USING (true);

-- Create appointment slots table for scheduling
CREATE TABLE public.appointment_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  slot_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for appointment slots
CREATE INDEX idx_appointment_slots_doctor ON public.appointment_slots(doctor_id);
CREATE INDEX idx_appointment_slots_date ON public.appointment_slots(slot_date);
CREATE INDEX idx_appointment_slots_available ON public.appointment_slots(is_available);

-- Enable RLS on appointment slots
ALTER TABLE public.appointment_slots ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to appointment slots
CREATE POLICY "Appointment slots are viewable by everyone" 
ON public.appointment_slots 
FOR SELECT 
USING (true);