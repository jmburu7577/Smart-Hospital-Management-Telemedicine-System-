import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface Invoice {
  id: number | string;
  service: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Paid';
}

interface BillingContextType {
  invoices: Invoice[];
  markAsPaid: (id: number | string) => void;
  generateBill: (bill: Omit<Invoice, 'id'>) => void;
  fetchInvoices: () => Promise<void>;
  loading: boolean;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("invoices").select("*");
      if (!error && data) {
        const formattedInvoices: Invoice[] = data.map(i => ({
          id: i.id,
          service: i.service,
          amount: i.amount,
          date: new Date(i.invoice_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          status: i.status as any
        }));
        setInvoices(formattedInvoices);
      }
    } catch (e) {
      console.error("Error fetching invoices:", e);
      // Fallback to mock data
      setInvoices([
        { id: 1, service: "Consultation - Dr. Sarah Johnson", amount: 5000, date: "May 15, 2026", status: "Paid" },
        { id: 2, service: "Blood Test - Complete Panel", amount: 3500, date: "May 12, 2026", status: "Paid" },
        { id: 3, service: "X-Ray Imaging", amount: 8000, date: "May 10, 2026", status: "Pending" },
        { id: 4, service: "Medication - Pharmacy", amount: 2500, date: "May 8, 2026", status: "Paid" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: number | string) => {
    // Update local state first
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv));
    
    try {
      await supabase.from("invoices").update({ 
        status: 'Paid', 
        payment_date: new Date().toISOString().split('T')[0] 
      }).eq("id", id);
    } catch (e) {
      console.error("Error marking invoice as paid:", e);
    }
  };

  const generateBill = async (bill: Omit<Invoice, 'id'>) => {
    try {
      const { data, error } = await supabase.from("invoices").insert({
        service: bill.service,
        amount: bill.amount,
        invoice_date: new Date().toISOString().split('T')[0],
        status: bill.status
      }).select();
      
      if (!error && data) {
        const newInvoice: Invoice = {
          id: data[0].id,
          service: data[0].service,
          amount: data[0].amount,
          date: new Date(data[0].invoice_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          status: data[0].status as any
        };
        setInvoices(prev => [...prev, newInvoice]);
      }
    } catch (e) {
      console.error("Error generating bill:", e);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <BillingContext.Provider value={{ invoices, markAsPaid, generateBill, fetchInvoices, loading }}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}
