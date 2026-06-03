import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: 'Active' | 'Refill Needed' | 'Completed';
  remaining_supply: string;
  prescription_date: string;
}

interface PrescriptionsContextType {
  prescriptions: Prescription[];
  loading: boolean;
  addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<void>;
  updatePrescription: (id: string, updates: Partial<Prescription>) => Promise<void>;
  requestRefill: (id: string) => Promise<void>;
  fetchPrescriptions: () => Promise<void>;
}

const PrescriptionsContext = createContext<PrescriptionsContextType | undefined>(undefined);

export function PrescriptionsProvider({ children }: { children: React.ReactNode }) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('prescription_date', { ascending: false });

      if (!error && data) {
        setPrescriptions(data as Prescription[]);
      } else {
        console.error('Error fetching prescriptions:', error);
      }
    } catch (e) {
      console.error('Error fetching prescriptions:', e);
    } finally {
      setLoading(false);
    }
  };

  const addPrescription = async (prescription: Omit<Prescription, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([prescription])
        .select();

      if (!error && data) {
        setPrescriptions(prev => [...prev, data[0] as Prescription]);
      } else {
        throw error;
      }
    } catch (e) {
      console.error('Error adding prescription:', e);
      throw e;
    }
  };

  const updatePrescription = async (id: string, updates: Partial<Prescription>) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update(updates)
        .eq('id', id);

      if (!error) {
        setPrescriptions(prev =>
          prev.map(pres => (pres.id === id ? { ...pres, ...updates } : pres))
        );
      } else {
        throw error;
      }
    } catch (e) {
      console.error('Error updating prescription:', e);
      throw e;
    }
  };

  const requestRefill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ status: 'Refill Needed' })
        .eq('id', id);

      if (!error) {
        setPrescriptions(prev =>
          prev.map(pres => (pres.id === id ? { ...pres, status: 'Refill Needed' } : pres))
        );
      } else {
        throw error;
      }
    } catch (e) {
      console.error('Error requesting refill:', e);
      throw e;
    }
  };

  useEffect(() => {
    fetchPrescriptions();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('public:prescriptions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prescriptions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPrescriptions(prev => [payload.new as Prescription, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPrescriptions(prev =>
              prev.map(pres => (pres.id === payload.new.id ? (payload.new as Prescription) : pres))
            );
          } else if (payload.eventType === 'DELETE') {
            setPrescriptions(prev => prev.filter(pres => pres.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <PrescriptionsContext.Provider
      value={{ prescriptions, loading, addPrescription, updatePrescription, requestRefill, fetchPrescriptions }}
    >
      {children}
    </PrescriptionsContext.Provider>
  );
}

export function usePrescriptions() {
  const context = useContext(PrescriptionsContext);
  if (context === undefined) {
    throw new Error('usePrescriptions must be used within PrescriptionsProvider');
  }
  return context;
}
