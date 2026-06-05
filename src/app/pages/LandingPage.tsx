import { Link } from "react-router";
import heroImage from "@assets/hero-doctor.jpg";
import ctaBackground from "@assets/hero-lab.jpg";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Calendar,
  Video,
  FileText,
  Brain,
  Shield,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Activity,
  Users,
  Award,
  HeartPulse,
  Stethoscope,
  Pill,
  TestTube,
  Phone,
} from "lucide-react";


const features = [
  {
    icon: Calendar,
    color: "bg-blue-100 text-blue-600",
    title: "Smart Appointment Booking",
    description:
      "Schedule appointments with specialist doctors in seconds. Get instant confirmations and automated reminders.",
  },
  {
    icon: Video,
    color: "bg-purple-100 text-purple-600",
    title: "Telemedicine Consultations",
    description:
      "Consult with top doctors from the comfort of your home via secure HD video calls.",
  },
  {
    icon: FileText,
    color: "bg-green-100 text-green-600",
    title: "Electronic Health Records",
    description:
      "Access your complete medical history, test results, prescriptions, and reports anytime.",
  },
  {
    icon: Brain,
    color: "bg-orange-100 text-orange-600",
    title: "AI Symptom Checker",
    description:
      "Get intelligent health insights powered by our rule-based AI engine — no wait time, instant results.",
  },
  {
    icon: Pill,
    color: "bg-rose-100 text-rose-600",
    title: "Pharmacy Integration",
    description:
      "Order and track prescriptions directly. Get medications delivered or pick up at the hospital.",
  },
  {
    icon: TestTube,
    color: "bg-cyan-100 text-cyan-600",
    title: "Laboratory Services",
    description:
      "Request lab tests, track samples, and receive digital results all within the platform.",
  },
  {
    icon: Shield,
    color: "bg-indigo-100 text-indigo-600",
    title: "Secure & Compliant",
    description:
      "Your health data is encrypted with AES-256. Fully HIPAA-compliant with role-based access control.",
  },
  {
    icon: Clock,
    color: "bg-amber-100 text-amber-600",
    title: "24/7 Availability",
    description:
      "Round-the-clock access to healthcare services, emergency support, and on-call specialists.",
  },
];

const testimonials = [
  {
    name: "Amina Wanjiru",
    role: "Patient",
    avatar: "AW",
    color: "bg-blue-500",
    quote:
      "AfyaConnect transformed how I manage my health. Booking appointments used to take hours — now it's done in minutes!",
    stars: 5,
  },
  {
    name: "Dr. James Mwangi",
    role: "Cardiologist",
    avatar: "JM",
    color: "bg-green-500",
    quote:
      "The platform streamlines my entire workflow. Patient records, notes, and video consultations all in one place.",
    stars: 5,
  },
  {
    name: "Grace Odhiambo",
    role: "Patient",
    avatar: "GO",
    color: "bg-purple-500",
    quote:
      "The AI Symptom Checker is incredibly accurate. It flagged a concern that led to early detection of my condition.",
    stars: 5,
  },
];

const howItWorks = [
  {
    step: "01",
    icon: Users,
    title: "Create Your Account",
    description: "Register as a patient, doctor, or admin. Verify your identity and set up your profile in minutes.",
  },
  {
    step: "02",
    icon: Stethoscope,
    title: "Find Your Doctor",
    description: "Browse specialists by specialty, availability, and ratings. Read reviews and book instantly.",
  },
  {
    step: "03",
    icon: Video,
    title: "Consult & Get Care",
    description: "Meet your doctor in person or via video call. Receive prescriptions, referrals, and follow-up care.",
  },
  {
    step: "04",
    icon: HeartPulse,
    title: "Track Your Health",
    description: "Monitor your health records, lab results, and medications all in your personal dashboard.",
  },
];

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Kimani",
    specialty: "Cardiologist",
  },
  {
    id: 2,
    name: "Dr. James Mwangi",
    specialty: "Neurologist",
  },
  {
    id: 3,
    name: "Dr. Grace Odhiambo",
    specialty: "Pediatrician",
  },
];

export default function LandingPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400); // show after 400px scroll
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="max-w-[1200px] mx-auto w-full">
      {/* Hero Section */}
      <section id="hero" className="relative text-white overflow-hidden">
        {/* Hero Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Optional dark overlay for text readability */}
        <div className="absolute inset-0 bg-blue-900/60" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
                <Activity className="w-4 h-4 text-blue-200" />
                <span className="text-sm text-blue-100">Smarter Healthcare for Everyone</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Your Health, <br />
                <span className="text-blue-200">Connected.</span>
              </h1>
              <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-lg">
                AfyaConnect is a smart hospital management & telemedicine system built to make
                quality healthcare accessible, efficient, and patient-centered.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Sign In
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {["AW", "JM", "GO", "MK"].map((initials, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white flex items-center justify-center text-xs font-bold"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-blue-200">Trusted by 10,000+ patients</p>
                </div>
              </div>
            </div>
            {/* Hero Visual */}
            <div className="hidden lg:block">
              <div className="bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <HeartPulse className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Health Overview</p>
                    <p className="text-xs text-blue-200">Last updated: Today</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Next Appointment", value: "Dr. Mwangi — Jun 8, 10:00 AM", color: "bg-blue-400" },
                    { label: "Prescriptions Active", value: "3 medications on track", color: "bg-green-400" },
                    { label: "Lab Results", value: "Blood panel — Received", color: "bg-purple-400" },
                    { label: "Telemedicine", value: "Video call ready in 15 min", color: "bg-orange-400" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <div>
                        <p className="text-xs text-blue-200">{item.label}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

            <div className="bg-slate-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all">
              <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <p className="text-4xl font-extrabold text-blue-600">10,000+</p>
              <p className="text-slate-500 text-sm mt-2">Patients Served</p>
            </div>

            <div className="bg-slate-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all">
              <Stethoscope className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="text-4xl font-extrabold text-green-600">500+</p>
              <p className="text-slate-500 text-sm mt-2">Certified Doctors</p>
            </div>

            <div className="bg-slate-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all">
              <Award className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <p className="text-4xl font-extrabold text-purple-600">50+</p>
              <p className="text-slate-500 text-sm mt-2">Specialties</p>
            </div>

            <div className="bg-slate-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all">
              <Shield className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <p className="text-4xl font-extrabold text-indigo-600">99.9%</p>
              <p className="text-slate-500 text-sm mt-2">System Uptime</p>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-100 py-20 px-4 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">Everything you need, in one platform</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              From booking appointments to receiving lab results, AfyaConnect covers every aspect of your healthcare journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">Get started in 4 simple steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative text-center">
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-blue-100" />
                  )}
                  <div className="relative z-10 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-xs font-bold text-blue-400 tracking-widest">{step.step}</span>
                  <h3 className="text-lg font-semibold text-slate-900 mt-1 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our specialists */}
      <section id="specialists" className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Our Specialists
            </span>

            <h2 className="text-4xl font-bold text-slate-900 mt-2">
              Meet Our Healthcare Experts
            </h2>

            <p className="text-slate-500 max-w-2xl mx-auto mt-4">
              Experienced healthcare professionals dedicated to providing
              exceptional care and support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {doctors.map((doctor, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all"
              >

                <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Stethoscope className="w-10 h-10 text-blue-600" />
                </div>

                <h3 className="font-bold text-xl text-slate-900">
                  {doctor.name}
                </h3>

                <p className="text-slate-500 mt-2">
                  {doctor.specialty}
                </p>

                <Link
                  to={`/doctors/${doctor.id}`}
                  className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Profile
                </Link>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-slate-100 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">What our users say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why" className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Why AfyaConnect</span>
              <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-6">Built for modern African healthcare</h2>
              <p className="text-slate-500 mb-8">
                Designed with local healthcare challenges in mind, AfyaConnect bridges the gap between patients and quality care.
              </p>
              <ul className="space-y-4">
                {[
                  "Role-based access for patients, doctors, and administrators",
                  "Fully bilingual and mobile-responsive interface",
                  "Integrated billing, pharmacy, and laboratory workflows",
                  "Real-time notifications and appointment reminders",
                  "Offline-capable for low-connectivity environments",
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, label: "CSE 499 Senior Project", sub: "Academic Excellence", color: "from-blue-500 to-indigo-600" },
                { icon: Shield, label: "HIPAA Compliant", sub: "Data Protection", color: "from-green-500 to-emerald-600" },
                { icon: HeartPulse, label: "Patient-First Design", sub: "UX Focused", color: "from-rose-500 to-pink-600" },
                { icon: Phone, label: "24/7 Support", sub: "Always Available", color: "from-amber-500 to-orange-600" },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white`}>
                    <Icon className="w-8 h-8 mb-4 opacity-90" />
                    <p className="font-bold text-sm">{card.label}</p>
                    <p className="text-xs opacity-75 mt-1">{card.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-100 py-20 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              FAQ
            </span>

            <h2 className="text-4xl font-bold text-slate-900 mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="font-semibold text-slate-900">
                How do I book an appointment?
              </h3>
              <p className="text-slate-500 mt-2">
                Register an account, choose a doctor, and select an available appointment slot.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="font-semibold text-slate-900">
                Can I consult a doctor online?
              </h3>
              <p className="text-slate-500 mt-2">
                Yes. AfyaConnect supports secure telemedicine consultations through video calls.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="font-semibold text-slate-900">
                Are my medical records secure?
              </h3>
              <p className="text-slate-500 mt-2">
                Yes. All records are encrypted and protected through role-based access control.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="font-semibold text-slate-900">
                Can I access laboratory results online?
              </h3>
              <p className="text-slate-500 mt-2">
                Absolutely. Results are uploaded directly to your account once available.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CTA */}
      {/* Hero CTA Section */}
      <section className="relative text-white overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${ctaBackground})` }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-blue-900/55" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center py-24 px-4">
          <h2 className="text-5xl font-extrabold mb-6">
            Experience Healthcare Without Boundaries
          </h2>

          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients and healthcare providers using
            AfyaConnect to access smarter, faster, and more secure healthcare.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10 text-blue-100">
            <span>✓ Free Registration</span>
            <span>✓ Secure Platform</span>
            <span>✓ 24/7 Access</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white/10 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {showScrollTop && (
        <button
          onClick={() => {
            document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
        >
          ↑ Top
        </button>
      )}
      
    </div>
  );
}
