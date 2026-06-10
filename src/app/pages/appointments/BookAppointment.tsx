import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Calendar, Clock, Loader2, MapPin, Stethoscope, User } from "lucide-react";
import { useAppointments } from "../../contexts/AppointmentsContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";

interface DoctorOption {
  id: string;
  name: string;
  specialty: string;
}

const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

function todayAsInputDate() {
  return new Date().toISOString().split("T")[0];
}

function formatDisplayTime(time: string) {
  return new Date(`1970-01-01T${time}:00`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { bookAppointment } = useAppointments();

  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    fullName: user?.name ?? "",
    phoneNumber: "",
    doctorId: "",
    appointmentDate: todayAsInputDate(),
    appointmentTime: "09:00",
    appointmentType: "In-Person" as "In-Person" | "Video",
    reason: "",
  });

  useEffect(() => {
    setForm((current) => ({ ...current, fullName: user?.name ?? current.fullName }));
  }, [user]);

  useEffect(() => {
    const loadDoctors = async () => {
      setLoadingDoctors(true);

      const { data: doctorRows, error: doctorError } = await supabase
        .from("doctors")
        .select("id, specialty");

      if (doctorError) {
        console.error("Error loading doctors:", doctorError);
        setError("Failed to load doctors. Please try again.");
        setLoadingDoctors(false);
        return;
      }

      const doctorIds = (doctorRows ?? []).map((doctor) => doctor.id);
      if (doctorIds.length === 0) {
        setDoctors([]);
        setLoadingDoctors(false);
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", doctorIds);

      if (profileError) {
        console.error("Error loading doctor profiles:", profileError);
        setError("Failed to load doctors. Please try again.");
        setLoadingDoctors(false);
        return;
      }

      const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));
      const mergedDoctors = (doctorRows ?? []).map((doctor) => ({
        id: doctor.id,
        name: profileMap.get(doctor.id) ?? "Doctor",
        specialty: doctor.specialty,
      }));

      setDoctors(mergedDoctors);
      setLoadingDoctors(false);
    };

    loadDoctors();
  }, []);

  useEffect(() => {
    const requestedDoctor = searchParams.get("doctor");
    if (!requestedDoctor) {
      return;
    }

    setForm((current) => ({ ...current, doctorId: requestedDoctor }));
  }, [searchParams]);

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === form.doctorId),
    [doctors, form.doctorId],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("You must be signed in to book an appointment.");
      return;
    }

    if (user.role !== "patient") {
      setError("Only patient accounts can book appointments from this page.");
      return;
    }

    if (!form.doctorId || !form.appointmentDate || !form.appointmentTime || !form.reason.trim()) {
      setError("Please select a doctor, date, time, and add the reason for the visit.");
      return;
    }

    setSaving(true);
    try {
      await bookAppointment({
        patient_id: user.id,
        doctor_id: form.doctorId,
        appointment_date: form.appointmentDate,
        appointment_time: `${form.appointmentTime}:00`,
        appointment_type: form.appointmentType,
        reason: form.reason.trim(),
        status: "Pending",
      });

      setSuccess("Appointment booked successfully.");
      setTimeout(() => navigate("/appointments/view"), 700);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to book appointment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Book Appointment</h1>
        <p className="text-slate-600 mt-2">Schedule your consultation with our healthcare professionals</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                  placeholder="+254 700 000 000"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Select Doctor
            </h2>
            {loadingDoctors ? (
              <div className="py-10 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-3" />
                Loading doctors...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doctor) => (
                  <label key={doctor.id} className="relative">
                    <input
                      type="radio"
                      name="doctor"
                      value={doctor.id}
                      checked={form.doctorId === doctor.id}
                      onChange={(event) => setForm((current) => ({ ...current, doctorId: event.target.value }))}
                      className="peer sr-only"
                    />
                    <div className="p-4 border-2 border-slate-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:border-slate-300 transition-colors">
                      <h3 className="font-semibold text-slate-900">{doctor.name}</h3>
                      <p className="text-sm text-slate-600">{doctor.specialty}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Date
            </h2>
            <input
              type="date"
              value={form.appointmentDate}
              onChange={(event) => setForm((current) => ({ ...current, appointmentDate: event.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Select Time
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {timeSlots.map((time) => (
                <label key={time} className="relative">
                  <input
                    type="radio"
                    name="time"
                    value={time}
                    checked={form.appointmentTime === time}
                    onChange={(event) => setForm((current) => ({ ...current, appointmentTime: event.target.value }))}
                    className="peer sr-only"
                  />
                  <div className="p-3 text-center border-2 border-slate-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white hover:border-slate-300 transition-colors">
                    <span className="text-sm font-medium">{formatDisplayTime(time)}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Appointment Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative">
                <input
                  type="radio"
                  name="type"
                  value="In-Person"
                  checked={form.appointmentType === "In-Person"}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      appointmentType: event.target.value as "In-Person" | "Video",
                    }))
                  }
                  className="peer sr-only"
                />
                <div className="p-4 border-2 border-slate-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:border-slate-300 transition-colors">
                  <h3 className="font-semibold text-slate-900">In-Person Visit</h3>
                  <p className="text-sm text-slate-600">Visit the hospital for consultation</p>
                </div>
              </label>
              <label className="relative">
                <input
                  type="radio"
                  name="type"
                  value="Video"
                  checked={form.appointmentType === "Video"}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      appointmentType: event.target.value as "In-Person" | "Video",
                    }))
                  }
                  className="peer sr-only"
                />
                <div className="p-4 border-2 border-slate-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:border-slate-300 transition-colors">
                  <h3 className="font-semibold text-slate-900">Video Consultation</h3>
                  <p className="text-sm text-slate-600">Online consultation via video call</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Visit</label>
            <textarea
              rows={4}
              value={form.reason}
              onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
              placeholder="Describe your symptoms or reason for appointment..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {selectedDoctor && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              Booking with <span className="font-semibold">{selectedDoctor.name}</span> for a{" "}
              <span className="font-semibold">{form.appointmentType}</span> visit on{" "}
              <span className="font-semibold">{form.appointmentDate}</span> at{" "}
              <span className="font-semibold">{formatDisplayTime(form.appointmentTime)}</span>.
            </div>
          )}

          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          {success && <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving || loadingDoctors}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Booking..." : "Book Appointment"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/appointments/view")}
              className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
