import { useNavigate, useParams } from "react-router";
import { Calendar, Mail, Phone, Star, MapPin, Clock, Stethoscope } from "lucide-react";


const doctors = [
    {
        id: 1,
        name: "Dr. Sarah Kimani",
        specialty: "Cardiologist",
        email: "sarah.kimani@hospital.com",
        phone: "+254 700 111 222",
        location: "Nairobi Hospital",
        experience: "12 years",
        rating: 4.9,
        availability: "Mon - Fri (9:00 AM - 4:00 PM)",
        about:
            "Dr. Sarah Kimani is a highly experienced cardiologist specializing in heart disease prevention, hypertension management, and advanced cardiac care. She has worked in leading hospitals across East Africa.",
    },
    {
        id: 2,
        name: "Dr. James Mwangi",
        specialty: "Neurologist",
        email: "james.mwangi@hospital.com",
        phone: "+254 700 333 444",
        location: "Aga Khan Hospital",
        experience: "10 years",
        rating: 4.8,
        availability: "Mon - Thu (10:00 AM - 5:00 PM)",
        about:
            "Dr. James Mwangi specializes in brain and nervous system disorders including epilepsy, stroke management, and neuro-rehabilitation.",
    },
    {
        id: 3,
        name: "Dr. Grace Odhiambo",
        specialty: "Pediatrician",
        email: "grace.odhiambo@hospital.com",
        phone: "+254 700 555 666",
        location: "Kenyatta Hospital",
        experience: "8 years",
        rating: 4.7,
        availability: "Tue - Sat (8:00 AM - 3:00 PM)",
        about:
            "Dr. Grace Odhiambo provides comprehensive child healthcare including immunizations, growth monitoring, and childhood illness management.",
    },
];

export default function DoctorProfile() {
    const navigate = useNavigate();
    
    const { id } = useParams();

    const doctor = doctors.find((d) => d.id === Number(id));

    if (!doctor) {
        return (
            <div className="p-10 text-center text-red-500 font-semibold">
                Doctor not found
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">

            {/* HEADER CARD */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                        <Stethoscope className="w-10 h-10 text-blue-600" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold">{doctor.name}</h1>
                        <p className="text-slate-600">{doctor.specialty}</p>

                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            {doctor.rating} • {doctor.experience} experience
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/login")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Book Appointment
                    </button>
                    <button className="px-4 py-2 border rounded-lg hover:bg-slate-50">
                        Message
                    </button>
                </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* Contact Info */}
                <div className="bg-white border rounded-2xl p-5 space-y-4">
                    <h2 className="font-semibold text-lg">Contact Info</h2>

                    <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        {doctor.email}
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        {doctor.phone}
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        {doctor.location}
                    </div>
                </div>

                {/* Availability */}
                <div className="bg-white border rounded-2xl p-5 space-y-4">
                    <h2 className="font-semibold text-lg">Availability</h2>

                    <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        {doctor.availability}
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        Accepting new patients
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white border rounded-2xl p-5 space-y-4">
                    <h2 className="font-semibold text-lg">Quick Stats</h2>

                    <p className="text-slate-600">
                        ⭐ Rating: {doctor.rating}
                    </p>
                    <p className="text-slate-600">
                        🩺 Specialty: {doctor.specialty}
                    </p>
                    <p className="text-slate-600">
                        📅 Experience: {doctor.experience}
                    </p>
                </div>
            </div>

            {/* ABOUT */}
            <div className="bg-white border rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-3">About Doctor</h2>
                <p className="text-slate-600 leading-relaxed">
                    {doctor.about}
                </p>
            </div>

        </div>
    );
}