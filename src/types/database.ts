// ============================================================
// AfyaConnect — Database Type Definitions
// Mirrors the Supabase schema in supabase/schema.sql
// ============================================================

export type Role = "patient" | "doctor" | "admin";
export type AppointmentStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";
export type AppointmentType = "In-Person" | "Video";
export type LabTestStatus = "Pending" | "In Progress" | "Completed";
export type InvoiceStatus = "Pending" | "Paid";
export type PrescriptionStatus = "Active" | "Refill Needed" | "Completed";

// profiles — linked to auth.users
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// doctors — extends profiles
export interface Doctor {
  id: string;                      // FK → profiles.id
  specialty: string;
  available_days: string[] | null; // e.g. ["Mon", "Tue"]
  license_number: string | null;
}

// patients — extends profiles
export interface Patient {
  id: string;                          // FK → profiles.id
  date_of_birth: string | null;        // ISO date string
  blood_type: string | null;
  allergies: string[] | null;
  medical_conditions: string[] | null;
}

// appointments
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;           // ISO date string
  appointment_time: string;           // HH:MM:SS
  appointment_type: AppointmentType;
  reason: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  // enriched client-side
  patient_name?: string;
  doctor_name?: string;
}

export type AppointmentInput = Omit<Appointment, "id" | "created_at" | "updated_at" | "patient_name" | "doctor_name">;

// lab_tests
export interface LabTest {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  test_name: string;
  test_date: string;                   // ISO date string
  status: LabTestStatus;
  result: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // enriched client-side
  patient_name?: string;
  doctor_name?: string;
}

export type LabTestInput = Omit<LabTest, "id" | "created_at" | "updated_at" | "patient_name" | "doctor_name">;

// invoices
export interface Invoice {
  id: string;
  patient_id: string;
  service: string;
  amount: number;
  invoice_date: string;               // ISO date string
  status: InvoiceStatus;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
  // enriched client-side
  patient_name?: string;
}

export type InvoiceInput = Omit<Invoice, "id" | "created_at" | "updated_at" | "patient_name">;

// prescriptions
export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: PrescriptionStatus;
  remaining_supply: string | null;
  prescription_date: string;          // ISO date string
  created_at: string;
  updated_at: string;
  // enriched client-side
  patient_name?: string;
  doctor_name?: string;
}

export type PrescriptionInput = Omit<Prescription, "id" | "created_at" | "updated_at" | "patient_name" | "doctor_name">;

// medical_records
export type RecordType = "Consultation Note" | "Medical Report" | "Lab Result" | "Prescription" | string;

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  record_type: RecordType;
  title: string;
  content: string | null;
  record_date: string;                // ISO date string
  file_url: string | null;
  created_at: string;
  updated_at: string;
  // enriched client-side
  patient_name?: string;
  doctor_name?: string;
}

export type MedicalRecordInput = Omit<MedicalRecord, "id" | "created_at" | "updated_at" | "patient_name" | "doctor_name">;

// messages
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // enriched client-side
  sender_name?: string;
  receiver_name?: string;
}

export type MessageInput = Pick<Message, "sender_id" | "receiver_id" | "content">;

// Convenience: profile + doctor joined
export interface DoctorProfile extends Profile, Omit<Doctor, "id"> {}

// Convenience: profile + patient joined
export interface PatientProfile extends Profile, Omit<Patient, "id"> {}
