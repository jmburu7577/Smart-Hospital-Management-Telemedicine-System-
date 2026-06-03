-- Fix Infinite Recursion in RLS Policies

-- First, drop all existing policies
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

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read access for authenticated users to profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- For all other tables, use simple policies that don't query profiles
CREATE POLICY "Enable read access for authenticated users to appointments" ON appointments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users to appointments" ON appointments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users to lab_tests" ON lab_tests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users to lab_tests" ON lab_tests
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users to invoices" ON invoices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users to invoices" ON invoices
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users to prescriptions" ON prescriptions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users to prescriptions" ON prescriptions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users to medical_records" ON medical_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users to medical_records" ON medical_records
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users to messages" ON messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users to messages" ON messages
  FOR ALL USING (auth.role() = 'authenticated');
