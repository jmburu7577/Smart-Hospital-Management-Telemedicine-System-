-- Complete Setup Script for AfyaConnect

-- Step 1: Disable RLS temporarily for setup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Doctors can view patient profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Patients can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can book appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update their appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view their lab tests" ON lab_tests;
DROP POLICY IF EXISTS "Doctors and admins can manage lab tests" ON lab_tests;
DROP POLICY IF EXISTS "Patients can view their invoices" ON invoices;
DROP POLICY IF EXISTS "Doctors and admins can manage invoices" ON invoices;
DROP POLICY IF EXISTS "Patients can view their prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors can manage prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Patients can view their medical records" ON medical_records;
DROP POLICY IF EXISTS "Doctors can manage medical records" ON medical_records;
DROP POLICY IF EXISTS "Users can view messages sent to or by them" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Step 3: Temporarily remove foreign key constraint on profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_id_fkey;
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_id_fkey;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;
ALTER TABLE lab_tests DROP CONSTRAINT IF EXISTS lab_tests_patient_id_fkey;
ALTER TABLE lab_tests DROP CONSTRAINT IF EXISTS lab_tests_doctor_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_patient_id_fkey;
ALTER TABLE prescriptions DROP CONSTRAINT IF EXISTS prescriptions_patient_id_fkey;
ALTER TABLE prescriptions DROP CONSTRAINT IF EXISTS prescriptions_doctor_id_fkey;
ALTER TABLE medical_records DROP CONSTRAINT IF EXISTS medical_records_patient_id_fkey;
ALTER TABLE medical_records DROP CONSTRAINT IF EXISTS medical_records_doctor_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Step 4: Insert Sample Data

-- Insert profiles (no FK constraint for now)
INSERT INTO profiles (id, full_name, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'John Doe', 'patient@example.com', 'patient'),
  ('00000000-0000-0000-0000-000000000002', 'Dr. Sarah Johnson', 'doctor@example.com', 'doctor'),
  ('00000000-0000-0000-0000-000000000003', 'Admin User', 'admin@example.com', 'admin');

-- Insert doctors
INSERT INTO doctors (id, specialty, available_days, license_number) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Cardiologist', ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 'LIC-001');

-- Insert patients
INSERT INTO patients (id, date_of_birth, blood_type, allergies, medical_conditions) VALUES
  ('00000000-0000-0000-0000-000000000001', '1990-01-01', 'O+', ARRAY['Penicillin'], ARRAY['Hypertension']);

-- Insert lab tests
INSERT INTO lab_tests (id, patient_id, doctor_id, test_name, test_date, status, result, notes) VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Complete Blood Count (CBC)', '2026-05-15', 'Completed', 'Normal', 'All values within normal range'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Lipid Panel', '2026-05-12', 'Completed', 'Abnormal', 'Elevated LDL cholesterol'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Urinalysis', '2026-05-18', 'In Progress', '-', 'Pending results');

-- Insert invoices
INSERT INTO invoices (id, patient_id, service, amount, invoice_date, status, payment_date) VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'Consultation - Dr. Sarah Johnson', 5000, '2026-05-15', 'Paid', '2026-05-15'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'Blood Test - Complete Panel', 3500, '2026-05-12', 'Paid', '2026-05-12'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 'X-Ray Imaging', 8000, '2026-05-10', 'Pending', NULL),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', 'Medication - Pharmacy', 2500, '2026-05-08', 'Paid', '2026-05-08');

-- Step 5: Re-enable RLS with safe, non-recursive policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create simple, safe policies for authenticated users
CREATE POLICY "Allow authenticated users full access to profiles" ON profiles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to doctors" ON doctors
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to patients" ON patients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to appointments" ON appointments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to lab_tests" ON lab_tests
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to invoices" ON invoices
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to prescriptions" ON prescriptions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to medical_records" ON medical_records
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to messages" ON messages
  FOR ALL USING (auth.role() = 'authenticated');
