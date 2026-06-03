-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  email text,
  role text not null check (role in ('patient', 'doctor', 'admin')),
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create doctors table (extends profiles)
create table doctors (
  id uuid references profiles(id) not null primary key,
  specialty text not null,
  available_days text[], -- e.g., ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  license_number text
);

-- Create patients table (extends profiles)
create table patients (
  id uuid references profiles(id) not null primary key,
  date_of_birth date,
  blood_type text,
  allergies text[],
  medical_conditions text[]
);

-- Create appointments table
create table appointments (
  id uuid default uuid_generate_v4() not null primary key,
  patient_id uuid references patients(id) not null,
  doctor_id uuid references doctors(id) not null,
  appointment_date date not null,
  appointment_time time not null,
  appointment_type text not null check (appointment_type in ('In-Person', 'Video')),
  reason text,
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create lab_tests table
create table lab_tests (
  id uuid default uuid_generate_v4() not null primary key,
  patient_id uuid references patients(id) not null,
  doctor_id uuid references doctors(id),
  test_name text not null,
  test_date date not null,
  status text not null default 'Pending' check (status in ('Pending', 'In Progress', 'Completed')),
  result text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create invoices table
create table invoices (
  id uuid default uuid_generate_v4() not null primary key,
  patient_id uuid references patients(id) not null,
  service text not null,
  amount numeric not null,
  invoice_date date not null,
  status text not null default 'Pending' check (status in ('Pending', 'Paid')),
  payment_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create prescriptions table
create table prescriptions (
  id uuid default uuid_generate_v4() not null primary key,
  patient_id uuid references patients(id) not null,
  doctor_id uuid references doctors(id) not null,
  medication text not null,
  dosage text not null,
  frequency text not null,
  duration text not null,
  status text not null default 'Active' check (status in ('Active', 'Refill Needed', 'Completed')),
  remaining_supply text,
  prescription_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create medical_records table
create table medical_records (
  id uuid default uuid_generate_v4() not null primary key,
  patient_id uuid references patients(id) not null,
  doctor_id uuid references doctors(id) not null,
  record_type text not null, -- e.g., 'Consultation Note', 'Medical Report', 'Lab Result'
  title text not null,
  content text,
  record_date date not null,
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table messages (
  id uuid default uuid_generate_v4() not null primary key,
  sender_id uuid references profiles(id) not null,
  receiver_id uuid references profiles(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table doctors enable row level security;
alter table patients enable row level security;
alter table appointments enable row level security;
alter table lab_tests enable row level security;
alter table invoices enable row level security;
alter table prescriptions enable row level security;
alter table medical_records enable row level security;
alter table messages enable row level security;

-- Policies for profiles
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);
create policy "Doctors can view patient profiles" on profiles
  for select using (exists (select 1 from doctors where id = auth.uid()));
create policy "Admins can view all profiles" on profiles
  for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Policies for appointments
create policy "Patients can view their own appointments" on appointments
  for select using (patient_id = auth.uid());
create policy "Doctors can view their appointments" on appointments
  for select using (doctor_id = auth.uid());
create policy "Admins can view all appointments" on appointments
  for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Patients can book appointments" on appointments
  for insert with check (patient_id = auth.uid());
create policy "Doctors can update their appointments" on appointments
  for update using (doctor_id = auth.uid());

-- Policies for lab_tests
create policy "Patients can view their lab tests" on lab_tests
  for select using (patient_id = auth.uid());
create policy "Doctors and admins can manage lab tests" on lab_tests
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('doctor', 'admin'))
  );

-- Policies for invoices
create policy "Patients can view their invoices" on invoices
  for select using (patient_id = auth.uid());
create policy "Doctors and admins can manage invoices" on invoices
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('doctor', 'admin'))
  );

-- Policies for prescriptions
create policy "Patients can view their prescriptions" on prescriptions
  for select using (patient_id = auth.uid());
create policy "Doctors can manage prescriptions" on prescriptions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'doctor')
  );

-- Policies for medical_records
create policy "Patients can view their medical records" on medical_records
  for select using (patient_id = auth.uid());
create policy "Doctors can manage medical records" on medical_records
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'doctor')
  );

-- Policies for messages
create policy "Users can view messages sent to or by them" on messages
  for select using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "Users can send messages" on messages
  for insert with check (sender_id = auth.uid());

-- Create a function to handle new user signups
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, (new.raw_user_meta_data->>'role')::text);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile after sign up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
