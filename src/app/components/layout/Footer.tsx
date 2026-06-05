import { Link } from "react-router";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-100 border-t border-slate-200 mt-auto">
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-slate-900 mb-4">AfyaConnect</h3>
            <p className="text-sm text-slate-600">
              Smart Hospital Management & Telemedicine System for better healthcare delivery.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/appointments/book" className="text-sm text-slate-600 hover:text-blue-600">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/telemedicine" className="text-sm text-slate-600 hover:text-blue-600">
                  Telemedicine
                </Link>
              </li>
              <li>
                <Link to="/symptom-checker" className="text-sm text-slate-600 hover:text-blue-600">
                  Symptom Checker
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/pharmacy" className="text-sm text-slate-600 hover:text-blue-600">
                  Pharmacy
                </Link>
              </li>
              <li>
                <Link to="/laboratory" className="text-sm text-slate-600 hover:text-blue-600">
                  Laboratory
                </Link>
              </li>
              <li>
                <Link to="/billing" className="text-sm text-slate-600 hover:text-blue-600">
                  Billing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Contact</h4>
            <p className="text-sm text-slate-600">Email: support@afyaconnect.com</p>
            <p className="text-sm text-slate-600">Phone: +254 700 000 000</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-center gap-2 text-sm text-slate-600">
          <span>&copy; 2026 AfyaConnect. Made with</span>
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span>for better healthcare</span>
        </div>
      </div>
    </footer>
  );
}
