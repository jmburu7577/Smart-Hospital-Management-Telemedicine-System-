-- Fix role provisioning and booking policies for existing Supabase projects

ALTER TABLE doctors ALTER COLUMN specialty SET DEFAULT 'General Practice';

-- Backfill missing role tables from existing profiles
INSERT INTO patients (id)
SELECT id
FROM profiles
WHERE role = 'patient'
ON CONFLICT (id) DO NOTHING;

INSERT INTO doctors (id, specialty)
SELECT id, 'General Practice'
FROM profiles
WHERE role = 'doctor'
ON CONFLICT (id) DO NOTHING;

-- Replace the signup trigger so new users also get patient/doctor rows
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, phone)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::text, 'patient'),
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  IF COALESCE((new.raw_user_meta_data->>'role')::text, 'patient') = 'patient' THEN
    INSERT INTO public.patients (id)
    VALUES (new.id)
    ON CONFLICT (id) DO NOTHING;
  ELSIF COALESCE((new.raw_user_meta_data->>'role')::text, 'patient') = 'doctor' THEN
    INSERT INTO public.doctors (id, specialty)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'specialty', 'General Practice'))
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop policies that conflict with the role-based setup
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Doctors can view patient profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view doctor profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can insert their own record" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own record" ON doctors;
DROP POLICY IF EXISTS "Patients can view their own patient record" ON patients;
DROP POLICY IF EXISTS "Patients can insert their own record" ON patients;
DROP POLICY IF EXISTS "Patients can update their own record" ON patients;
DROP POLICY IF EXISTS "Doctors can view patient records" ON patients;
DROP POLICY IF EXISTS "Patients can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can book appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can create their appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update their appointments" ON appointments;

-- Profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view doctor profiles" ON profiles
  FOR SELECT USING (role = 'doctor');

CREATE POLICY "Doctors can view patient profiles" ON profiles
  FOR SELECT USING (role = 'patient' AND EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid()));

-- Doctors
CREATE POLICY "Authenticated users can view doctors" ON doctors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Doctors can insert their own record" ON doctors
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors can update their own record" ON doctors
  FOR UPDATE USING (auth.uid() = id);

-- Patients
CREATE POLICY "Patients can view their own patient record" ON patients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Patients can insert their own record" ON patients
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Patients can update their own record" ON patients
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Doctors can view patient records" ON patients
  FOR SELECT USING (EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid()));

-- Appointments
CREATE POLICY "Patients can view their own appointments" ON appointments
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their appointments" ON appointments
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Patients can book appointments" ON appointments
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can create their appointments" ON appointments
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Patients can update their own appointments" ON appointments
  FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Doctors can update their appointments" ON appointments
  FOR UPDATE USING (doctor_id = auth.uid());
