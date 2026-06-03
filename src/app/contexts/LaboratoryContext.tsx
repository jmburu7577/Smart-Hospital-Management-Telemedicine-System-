import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface LabTest {
  id: number | string;
  test: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  result: string;
}

interface LaboratoryContextType {
  tests: LabTest[];
  processTest: (id: number | string, status: 'Pending' | 'In Progress' | 'Completed', result: string) => void;
  addTest: (test: Omit<LabTest, 'id'>) => void;
  fetchTests: () => Promise<void>;
  loading: boolean;
}

const LaboratoryContext = createContext<LaboratoryContextType | undefined>(undefined);

export function LaboratoryProvider({ children }: { children: React.ReactNode }) {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchTests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("lab_tests").select("*");
      if (!error && data) {
        const formattedTests: LabTest[] = data.map(t => ({
          id: t.id,
          test: t.test_name,
          date: new Date(t.test_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          status: t.status as any,
          result: t.result || '-'
        }));
        setTests(formattedTests);
      }
    } catch (e) {
      console.error("Error fetching lab tests:", e);
      // Fallback to mock data if Supabase fails
      setTests([
        { id: 1, test: "Complete Blood Count (CBC)", date: "May 15, 2026", status: "Completed", result: "Normal" },
        { id: 2, test: "Lipid Panel", date: "May 12, 2026", status: "Completed", result: "Abnormal" },
        { id: 3, test: "Urinalysis", date: "May 18, 2026", status: "In Progress", result: "-" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const processTest = async (id: number | string, status: 'Pending' | 'In Progress' | 'Completed', result: string) => {
    // Update local state first
    setTests(prev => prev.map(t => t.id === id ? { ...t, status, result } : t));
    
    // Try to update Supabase
    try {
      await supabase.from("lab_tests").update({ status, result }).eq("id", id);
    } catch (e) {
      console.error("Error updating lab test:", e);
    }
  };

  const addTest = async (test: Omit<LabTest, 'id'>) => {
    try {
      const { data, error } = await supabase.from("lab_tests").insert({
        test_name: test.test,
        test_date: new Date().toISOString().split('T')[0],
        status: test.status,
        result: test.result
      }).select();
      
      if (!error && data) {
        const newTest: LabTest = {
          id: data[0].id,
          test: data[0].test_name,
          date: new Date(data[0].test_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          status: data[0].status as any,
          result: data[0].result || '-'
        };
        setTests(prev => [...prev, newTest]);
      }
    } catch (e) {
      console.error("Error adding lab test:", e);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <LaboratoryContext.Provider value={{ tests, processTest, addTest, fetchTests, loading }}>
      {children}
    </LaboratoryContext.Provider>
  );
}

export function useLaboratory() {
  const context = useContext(LaboratoryContext);
  if (context === undefined) {
    throw new Error('useLaboratory must be used within a LaboratoryProvider');
  }
  return context;
}
