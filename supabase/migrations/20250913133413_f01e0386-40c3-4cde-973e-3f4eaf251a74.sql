-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create hospitals table with global support
CREATE TABLE public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state_province TEXT, -- Made optional for international addresses
  country TEXT NOT NULL DEFAULT 'US', -- Added country field
  zip_code TEXT,
  phone TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  hospital_type TEXT DEFAULT 'General',
  emergency_services BOOLEAN DEFAULT true,
  rating DECIMAL(2, 1) DEFAULT 4.0,
  bed_capacity INTEGER,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create spatial index for efficient location-based queries
CREATE INDEX idx_hospitals_location ON public.hospitals USING GIST (
  ll_to_earth(latitude::float8, longitude::float8)
);

-- Enable RLS on hospitals (public read access)
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to hospitals
CREATE POLICY "Hospitals are viewable by everyone" 
ON public.hospitals 
FOR SELECT 
USING (true);

-- Insert global sample hospital data
INSERT INTO public.hospitals (name, address, city, state_province, country, zip_code, phone, latitude, longitude, hospital_type, emergency_services, rating, bed_capacity, website) VALUES
-- United States
('City General Hospital', '123 Main St', 'New York', 'NY', 'US', '10001', '(555) 123-4567', 40.7128, -74.0060, 'General', true, 4.2, 400, 'https://citygeneral.com'),
('St. Mary Medical Center', '456 Oak Ave', 'Los Angeles', 'CA', 'US', '90210', '(555) 234-5678', 34.0522, -118.2437, 'General', true, 4.5, 350, 'https://stmarymedical.com'),
('Metropolitan Emergency Hospital', '789 Pine St', 'Chicago', 'IL', 'US', '60601', '(555) 345-6789', 41.8781, -87.6298, 'Emergency', true, 4.0, 200, 'https://metroemergency.com'),

-- United Kingdom
('Royal London Hospital', '1 Whitechapel Road', 'London', 'England', 'GB', 'E1 1BB', '+44 20 7377 7000', 51.5074, -0.1278, 'General', true, 4.3, 800, 'https://bartshealth.nhs.uk'),
('Birmingham Children''s Hospital', 'Steelhouse Lane', 'Birmingham', 'England', 'GB', 'B4 6NH', '+44 121 333 9999', 52.4862, -1.8904, 'Pediatric', true, 4.6, 350, 'https://bch.nhs.uk'),
('Edinburgh Royal Infirmary', '51 Little France Crescent', 'Edinburgh', 'Scotland', 'GB', 'EH16 4SA', '+44 131 536 1000', 55.9533, -3.1883, 'General', true, 4.4, 900, 'https://nhslothian.scot'),

-- Canada
('Toronto General Hospital', '200 Elizabeth St', 'Toronto', 'ON', 'CA', 'M5G 2C4', '+1 416 340 4800', 43.6532, -79.3832, 'General', true, 4.5, 700, 'https://uhn.ca'),
('Vancouver General Hospital', '899 W 12th Ave', 'Vancouver', 'BC', 'CA', 'V5Z 1M9', '+1 604 875 4111', 49.2827, -123.1207, 'General', true, 4.2, 950, 'https://vch.ca'),

-- Australia
('Royal Melbourne Hospital', '300 Grattan St', 'Melbourne', 'VIC', 'AU', '3050', '+61 3 9342 7000', -37.8136, 144.9631, 'General', true, 4.3, 600, 'https://thermh.org.au'),
('Sydney Hospital', '8 Macquarie St', 'Sydney', 'NSW', 'AU', '2000', '+61 2 9382 7111', -33.8688, 151.2093, 'General', true, 4.1, 400, 'https://slhd.nsw.gov.au'),

-- Germany
('Charité - Universitätsmedizin Berlin', 'Charitéplatz 1', 'Berlin', 'Berlin', 'DE', '10117', '+49 30 450 50', 52.5200, 13.4050, 'Teaching', true, 4.4, 3000, 'https://charite.de'),
('University Hospital Munich', 'Marchioninistraße 15', 'Munich', 'Bavaria', 'DE', '81377', '+49 89 4400 0', 48.1351, 11.5820, 'Teaching', true, 4.2, 1400, 'https://klinikum.uni-muenchen.de'),

-- France
('Hôpital Pitié-Salpêtrière', '47-83 Boulevard de l''Hôpital', 'Paris', 'Île-de-France', 'FR', '75013', '+33 1 42 16 00 00', 48.8566, 2.3522, 'General', true, 4.0, 1600, 'https://aphp.fr'),
('CHU de Lyon', '59 Boulevard Pinel', 'Lyon', 'Auvergne-Rhône-Alpes', 'FR', '69500', '+33 4 72 35 58 00', 45.7640, 4.8357, 'General', true, 4.1, 1200, 'https://chu-lyon.fr'),

-- Japan
('Tokyo University Hospital', '7-3-1 Hongo', 'Tokyo', 'Tokyo', 'JP', '113-8655', '+81 3 3815 5411', 35.6762, 139.6503, 'Teaching', true, 4.3, 1200, 'https://h.u-tokyo.ac.jp'),
('Osaka University Hospital', '2-15 Yamadaoka', 'Osaka', 'Osaka', 'JP', '565-0871', '+81 6 6879 5111', 34.6937, 135.5023, 'Teaching', true, 4.2, 1000, 'https://hosp.med.osaka-u.ac.jp'),

-- Nigeria (Lagos area)
('Lagos University Teaching Hospital', '1-5 Idi Araba Road', 'Lagos', 'Lagos', 'NG', '101001', '+234 1 8966005', 6.5244, 3.3792, 'Teaching', true, 3.8, 800, 'https://luth.edu.ng'),
('National Hospital Abuja', 'Plot 132 District Hospital Road', 'Abuja', 'FCT', 'NG', '900211', '+234 9 4616900', 9.0765, 7.3986, 'General', true, 3.9, 400, 'https://nationalhospitalabuja.gov.ng'),
('University College Hospital', 'Queen Elizabeth Road', 'Ibadan', 'Oyo', 'NG', '200212', '+234 2 2410088', 7.3775, 3.9470, 'Teaching', true, 4.0, 600, 'https://uch-ibadan.org.ng'),

-- India
('All India Institute of Medical Sciences', 'Sri Aurobindo Marg', 'New Delhi', 'Delhi', 'IN', '110029', '+91 11 2659 3333', 28.6139, 77.2090, 'Teaching', true, 4.1, 2500, 'https://aiims.edu'),
('Apollo Hospital Chennai', '21 Greams Lane', 'Chennai', 'Tamil Nadu', 'IN', '600006', '+91 44 2829 3333', 13.0827, 80.2707, 'Private', true, 4.4, 550, 'https://apollohospitals.com'),

-- Brazil
('Hospital das Clínicas', 'Av. Dr. Enéas Carvalho de Aguiar, 255', 'São Paulo', 'SP', 'BR', '05403-000', '+55 11 2661 0000', -23.5505, -46.6333, 'Teaching', true, 4.2, 2200, 'https://hc.fm.usp.br'),
('Hospital Israelita Albert Einstein', 'Av. Albert Einstein, 627', 'São Paulo', 'SP', 'BR', '05652-900', '+55 11 2151 1233', -23.5985, -46.7281, 'Private', true, 4.8, 600, 'https://einstein.br');

-- Create function to find hospitals within radius (in kilometers)
CREATE OR REPLACE FUNCTION find_nearby_hospitals(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  city TEXT,
  state_province TEXT,
  country TEXT,
  zip_code TEXT,
  phone TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  hospital_type TEXT,
  emergency_services BOOLEAN,
  rating DECIMAL,
  bed_capacity INTEGER,
  website TEXT,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.address,
    h.city,
    h.state_province,
    h.country,
    h.zip_code,
    h.phone,
    h.latitude,
    h.longitude,
    h.hospital_type,
    h.emergency_services,
    h.rating,
    h.bed_capacity,
    h.website,
    ROUND(
      (earth_distance(
        ll_to_earth(user_lat::float8, user_lng::float8),
        ll_to_earth(h.latitude::float8, h.longitude::float8)
      ) / 1000)::numeric, 1
    ) as distance_km
  FROM hospitals h
  WHERE earth_box(ll_to_earth(user_lat::float8, user_lng::float8), radius_km * 1000) @> ll_to_earth(h.latitude::float8, h.longitude::float8)
  ORDER BY earth_distance(
    ll_to_earth(user_lat::float8, user_lng::float8),
    ll_to_earth(h.latitude::float8, h.longitude::float8)
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();