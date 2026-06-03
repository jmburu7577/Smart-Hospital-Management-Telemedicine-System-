-- Fix RLS Policies for Development/Testing
-- Allows unauthenticated users to READ data, authenticated users can WRITE

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users full access to doctors" ON doctors;
DROP POLICY IF EXISTS "Allow authenticated users full access to patients" ON patients;
DROP POLICY IF EXISTS "Allow authenticated users full access to appointments" ON appointments;
DROP POLICY IF EXISTS "Allow authenticated users full access to lab_tests" ON lab_tests;
DROP POLICY IF EXISTS "Allow authenticated users full access to invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated users full access to prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Allow authenticated users full access to medical_records" ON medical_records;
DROP POLICY IF EXISTS "Allow authenticated users full access to messages" ON messages;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users to profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users to appointments" ON appointments;
DROP POLICY IF EXISTS "Enable all access for authenticated users to appointments" ON appointments;
DROP POLICY IF EXISTS "Enable read access for authenticated users to lab_tests" ON lab_tests;
DROP POLICY IF EXISTS "Enable all access for authenticated users to lab_tests" ON lab_tests;
DROP POLICY IF EXISTS "Enable read access for authenticated users to invoices" ON invoices;
DROP POLICY IF EXISTS "Enable all access for authenticated users to invoices" ON invoices;
DROP POLICY IF EXISTS "Enable read access for authenticated users to prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Enable all access for authenticated users to prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Enable read access for authenticated users to medical_records" ON medical_records;
DROP POLICY IF EXISTS "Enable all access for authenticated users to medical_records" ON medical_records;
DROP POLICY IF EXISTS "Enable read access for authenticated users to messages" ON messages;
DROP POLICY IF EXISTS "Enable all access for authenticated users to messages" ON messages;

-- Step 2: Create PERMISSIVE policies for public READ access
-- This allows everyone (authenticated or not) to READ the data

CREATE POLICY "Allow public read access to profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify profiles" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update profiles" ON profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete profiles" ON profiles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for doctors table
CREATE POLICY "Allow public read access to doctors" ON doctors
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify doctors" ON doctors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update doctors" ON doctors
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete doctors" ON doctors
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for patients table
CREATE POLICY "Allow public read access to patients" ON patients
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify patients" ON patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update patients" ON patients
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete patients" ON patients
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for appointments table
CREATE POLICY "Allow public read access to appointments" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify appointments" ON appointments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update appointments" ON appointments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete appointments" ON appointments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for lab_tests table
CREATE POLICY "Allow public read access to lab_tests" ON lab_tests
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify lab_tests" ON lab_tests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update lab_tests" ON lab_tests
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete lab_tests" ON lab_tests
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for invoices table
CREATE POLICY "Allow public read access to invoices" ON invoices
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify invoices" ON invoices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update invoices" ON invoices
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete invoices" ON invoices
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for prescriptions table
CREATE POLICY "Allow public read access to prescriptions" ON prescriptions
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update prescriptions" ON prescriptions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete prescriptions" ON prescriptions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for medical_records table
CREATE POLICY "Allow public read access to medical_records" ON medical_records
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify medical_records" ON medical_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update medical_records" ON medical_records
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete medical_records" ON medical_records
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for messages table
CREATE POLICY "Allow public read access to messages" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify messages" ON messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update messages" ON messages
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete messages" ON messages
  FOR DELETE USING (auth.role() = 'authenticated');
