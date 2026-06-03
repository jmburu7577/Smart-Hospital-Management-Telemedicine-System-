import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  record_type: string;
  title: string;
  content: string;
  record_date: string;
  file_url?: string;
}

interface MedicalRecordsContextType {
  records: MedicalRecord[];
  loading: boolean;
  addRecord: (record: Omit<MedicalRecord, 'id'>) => Promise<void>;
  updateRecord: (id: string, updates: Partial<MedicalRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  fetchRecords: () => Promise<void>;
}

const MedicalRecordsContext = createContext<MedicalRecordsContextType | undefined>(undefined);

export function MedicalRecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .order('record_date', { ascending: false });

      if (!error && data) {
        setRecords(data as MedicalRecord[]);
      } else {
        console.error('Error fetching medical records:', error);
      }
    } catch (e) {
      console.error('Error fetching medical records:', e);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (record: Omit<MedicalRecord, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .insert([record])
        .select();

      if (!error && data) {
        setRecords(prev => [...prev, data[0] as MedicalRecord]);
      } else {
        throw error;
      }
    } catch (e) {
      console.error('Error adding record:', e);
      throw e;
    }
  };

  const updateRecord = async (id: string, updates: Partial<MedicalRecord>) => {
    try {
      const { error } = await supabase
        .from('medical_records')
        .update(updates)
        .eq('id', id);

      if (!error) {
        setRecords(prev =>
          prev.map(record => (record.id === id ? { ...record, ...updates } : record))
        );
      } else {
        throw error;
      }
    } catch (e) {
      console.error('Error updating record:', e);
      throw e;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (!error) {
        setRecords(prev => prev.filter(record => record.id !== id));
      } else {
        throw error;
      }
    } catch (e) {
      console.error('Error deleting record:', e);
      throw e;
    }
  };

  useEffect(() => {
    fetchRecords();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('public:medical_records')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medical_records' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRecords(prev => [payload.new as MedicalRecord, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRecords(prev =>
              prev.map(record => (record.id === payload.new.id ? (payload.new as MedicalRecord) : record))
            );
          } else if (payload.eventType === 'DELETE') {
            setRecords(prev => prev.filter(record => record.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <MedicalRecordsContext.Provider
      value={{ records, loading, addRecord, updateRecord, deleteRecord, fetchRecords }}
    >
      {children}
    </MedicalRecordsContext.Provider>
  );
}

export function useMedicalRecords() {
  const context = useContext(MedicalRecordsContext);
  if (context === undefined) {
    throw new Error('useMedicalRecords must be used within MedicalRecordsProvider');
  }
  return context;
}
