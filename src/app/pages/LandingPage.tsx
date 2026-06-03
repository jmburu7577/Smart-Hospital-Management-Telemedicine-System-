import { Link } from "react-router";
import { Calendar, Video, FileText, Brain, Shield, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function LandingPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("Testing Supabase... URL:", import.meta.env.VITE_SUPABASE_URL);
        const { data, error } = await supabase.from("lab_tests").select("count").limit(1);
        console.log("Supabase response:", { data, error });
        
        if (!error) {
          setSupabaseStatus("connected");
        } else {
          setSupabaseStatus("disconnected");
          setErrorMsg(error.message);
        }
      } catch (e) {
        setSupabaseStatus("disconnected");
        setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      }
    };
    
    checkConnection();
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Easy Appointments",
      description: "Book and manage appointments with doctors online",
    },
    {
      icon: Video,
      title: "Telemedicine",
      description: "Consult with doctors through video calls",
    },
    {
      icon: FileText,
      title: "Health Records",
      description: "Access your medical records anytime, anywhere",
    },
    {
      icon: Brain,
      title: "AI Symptom Checker",
      description: "Get instant health insights with AI",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is encrypted and protected",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Healthcare services available round the clock",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Supabase Status */}
      <div className="p-4 mb-4 flex flex-col items-center justify-center gap-2">
        {supabaseStatus === "checking" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-slate-600">Checking Supabase connection...</span>
          </>
        ) : supabaseStatus === "connected" ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-semibold">✅ Supabase Connected!</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-semibold">❌ Supabase Disconnected - Using mock data</span>
            {errorMsg && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded max-w-2xl text-center">
                Error: {errorMsg}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Hero Section */}
      <section className="py-16 px-4 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          Welcome to <span className="text-blue-600">AfyaConnect</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
          Smart Hospital Management & Telemedicine System - Transforming healthcare delivery
          with technology, making quality healthcare accessible to everyone.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to transform your healthcare experience?</h2>
        <p className="text-xl mb-8 text-blue-100">
          Join thousands of patients and healthcare providers on AfyaConnect
        </p>
        <Link
          to="/register"
          className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Create Account
        </Link>
      </section>
    </div>
  );
}
