import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type AppointmentStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";
type AppointmentType = "In-Person" | "Video";

interface AppointmentRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: AppointmentType;
  reason: string;
  status: AppointmentStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment extends AppointmentRecord {
  patient_name?: string;
  doctor_name?: string;
}

type AppointmentInput = Omit<AppointmentRecord, "id" | "created_at" | "updated_at">;

interface AppointmentsContextType {
  appointments: Appointment[];
  loading: boolean;
  bookAppointment: (appointment: AppointmentInput) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<AppointmentRecord>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  fetchAppointments: () => Promise<void>;
  getAppointmentById: (id: string) => Promise<Appointment | null>;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

async function enrichAppointments(records: AppointmentRecord[]): Promise<Appointment[]> {
  if (records.length === 0) {
    return [];
  }

  const uniqueProfileIds = [...new Set(records.flatMap((record) => [record.patient_id, record.doctor_id]))];

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", uniqueProfileIds);

  if (error) {
    console.error("Error fetching appointment profiles:", error);
    return records;
  }

  const profileMap = new Map((profiles as ProfileRow[]).map((profile) => [profile.id, profile.full_name]));

  return records.map((record) => ({
    ...record,
    patient_name: profileMap.get(record.patient_id) ?? "Patient",
    doctor_name: profileMap.get(record.doctor_id) ?? "Doctor",
  }));
}

export function AppointmentsProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) {
        console.error("Error fetching appointments:", error);
        return;
      }

      const enriched = await enrichAppointments((data ?? []) as AppointmentRecord[]);
      setAppointments(enriched);
    } catch (e) {
      console.error("Error fetching appointments:", e);
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async (appointment: AppointmentInput) => {
    try {
      const { error } = await supabase.from("appointments").insert([appointment]);

      if (error) {
        if (
          error.message.includes("row-level security") ||
          error.message.includes("violates foreign key constraint")
        ) {
          throw new Error(
            "Appointment could not be saved because the linked patient/doctor record is not fully provisioned in Supabase yet.",
          );
        }
        throw error;
      }

      await fetchAppointments();
    } catch (e) {
      console.error("Error booking appointment:", e);
      throw e;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<AppointmentRecord>) => {
    try {
      const { error } = await supabase.from("appointments").update(updates).eq("id", id);

      if (error) {
        throw error;
      }

      await fetchAppointments();
    } catch (e) {
      console.error("Error updating appointment:", e);
      throw e;
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "Cancelled" })
        .eq("id", id);

      if (error) {
        throw error;
      }

      await fetchAppointments();
    } catch (e) {
      console.error("Error cancelling appointment:", e);
      throw e;
    }
  };

  const getAppointmentById = async (id: string) => {
    const cached = appointments.find((appointment) => appointment.id === id);
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase.from("appointments").select("*").eq("id", id).single();

    if (error || !data) {
      console.error("Error fetching appointment by id:", error);
      return null;
    }

    const [enriched] = await enrichAppointments([data as AppointmentRecord]);
    return enriched ?? null;
  };

  useEffect(() => {
    fetchAppointments();

    const subscription = supabase
      .channel("public:appointments")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        loading,
        bookAppointment,
        updateAppointment,
        cancelAppointment,
        fetchAppointments,
        getAppointmentById,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error("useAppointments must be used within an AppointmentsProvider");
  }
  return context;
}
