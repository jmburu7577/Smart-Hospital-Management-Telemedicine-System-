import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: 'In-Person' | 'Video';
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
}

interface AppointmentsContextType {
  appointments: Appointment[];
  loading: boolean;
  bookAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  fetchAppointments: () => Promise<void>;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export function AppointmentsProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false });

      if (!error && data) {
        setAppointments(data as Appointment[]);
      } else {
        console.error('Error fetching appointments:', error);
      }
    } catch (e) {
      console.error('Error fetching appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select();

      if (!error && data) {
        setAppointments(prev => [...prev, data[0] as Appointment]);
      } else {
        throw error;
      }
    } catch (e) {
      console.error('Error booking appointment:', e);
      throw e;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id);

      if (!error) {
        setAppointments(prev =>
          prev.map(apt => (apt.id === id ? { ...apt, ...updates } : apt))
        );
      } else {
        throw error;
      }
    } catch (e) {
      console.error('Error updating appointment:', e);
      throw e;
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'Cancelled' })
        .eq('id', id);

      if (!error) {
        setAppointments(prev =>
          prev.map(apt => (apt.id === id ? { ...apt, status: 'Cancelled' } : apt))
        );
      } else {
        throw error;
      }
    } catch (e) {
      console.error('Error cancelling appointment:', e);
      throw e;
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('public:appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAppointments(prev => [payload.new as Appointment, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAppointments(prev =>
              prev.map(apt => (apt.id === payload.new.id ? (payload.new as Appointment) : apt))
            );
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AppointmentsContext.Provider
      value={{ appointments, loading, bookAppointment, updateAppointment, cancelAppointment, fetchAppointments }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within AppointmentsProvider');
  }
  return context;
}
