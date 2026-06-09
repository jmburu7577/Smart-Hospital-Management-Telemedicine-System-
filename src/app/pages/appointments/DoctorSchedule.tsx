import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Calendar, CheckCircle, Clock, Loader2, Plus, User, Video, XCircle } from "lucide-react";
import { useAppointments } from "../../contexts/AppointmentsContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";

interface PatientOption {
  id: string;
  full_name: string | null;
  email: string | null;
}

function todayAsInputDate() {
  return new Date().toISOString().split("T")[0];
}

function formatTime(time: string) {
  const normalized = time.length === 5 ? `${time}:00` : time;
  return new Date(`1970-01-01T${normalized}`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DoctorSchedule() {
  const { user } = useAuth();
  const { appointments, loading, bookAppointment, updateAppointment } = useAppointments();
  const [selectedDate, setSelectedDate] = useState(todayAsInputDate());
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    patientId: "",
    appointmentTime: "09:00",
    appointmentType: "Video" as "Video" | "In-Person",
    reason: "",
  });

  useEffect(() => {
    const loadPatients = async () => {
      const { data: patientRows, error: patientError } = await supabase
        .from("patients")
        .select("id");

      if (patientError) {
        console.error("Error loading patients:", patientError);
        return;
      }

      const patientIds = (patientRows ?? []).map((patient) => patient.id);
      if (patientIds.length === 0) {
        setPatients([]);
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", patientIds)
        .order("full_name", { ascending: true });

      if (profileError) {
        console.error("Error loading patient profiles:", profileError);
        return;
      }

      setPatients((profiles ?? []) as PatientOption[]);
    };

    loadPatients();
  }, []);

  const doctorAppointments = useMemo(() => {
    if (!user) {
      return [];
    }

    return appointments
      .filter((appointment) => appointment.doctor_id === user.id)
      .filter((appointment) => appointment.appointment_date === selectedDate);
  }, [appointments, selectedDate, user]);

  const stats = useMemo(() => {
    const confirmed = doctorAppointments.filter((appointment) => appointment.status === "Confirmed").length;
    const pending = doctorAppointments.filter((appointment) => appointment.status === "Pending").length;
    const video = doctorAppointments.filter((appointment) => appointment.appointment_type === "Video").length;

    return { confirmed, pending, video };
  }, [doctorAppointments]);

  const handleCreateAppointment = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("You must be signed in as a doctor to create appointments.");
      return;
    }

    if (!form.patientId || !form.reason.trim()) {
      setError("Select a patient and add a reason for the appointment.");
      return;
    }

    setSaving(true);
    try {
      await bookAppointment({
        patient_id: form.patientId,
        doctor_id: user.id,
        appointment_date: selectedDate,
        appointment_time: `${form.appointmentTime}:00`,
        appointment_type: form.appointmentType,
        reason: form.reason.trim(),
        status: "Confirmed",
      });

      setForm((current) => ({
        ...current,
        patientId: "",
        appointmentTime: "09:00",
        appointmentType: "Video",
        reason: "",
      }));
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create appointment.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: "Confirmed" | "Cancelled" | "Completed") => {
    try {
      await updateAppointment(appointmentId, { status });
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update appointment.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Doctor Schedule</h1>
        <p className="text-slate-600 mt-2">
          Schedule appointments for patients, confirm video visits, and launch calls from the same workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Select Date
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3 mt-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">Confirmed</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{stats.confirmed}</p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-900">Pending</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pending}</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Video Visits</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{stats.video}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Schedule for Patient</h2>
            </div>

            <form className="space-y-4" onSubmit={handleCreateAppointment}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Patient</label>
                <select
                  value={form.patientId}
                  onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name ?? patient.email ?? patient.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={form.appointmentTime}
                    onChange={(event) => setForm((current) => ({ ...current, appointmentTime: event.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={form.appointmentType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        appointmentType: event.target.value as "Video" | "In-Person",
                      }))
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="Video">Video Consultation</option>
                    <option value="In-Person">In-Person Visit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
                <textarea
                  rows={4}
                  value={form.reason}
                  onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                  placeholder="Add the consultation reason or notes for the patient..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? "Scheduling..." : "Create Confirmed Appointment"}
              </button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Appointments for {selectedDate}</h2>
                <p className="text-sm text-slate-500">Patients will see confirmed video visits on their appointments page.</p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
                Loading schedule...
              </div>
            ) : doctorAppointments.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-xl border border-slate-200">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No appointments scheduled for this date yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {doctorAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-2 text-slate-900 font-semibold">
                            <Clock className="w-4 h-4 text-blue-600" />
                            {formatTime(appointment.appointment_time)}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              appointment.status === "Confirmed"
                                ? "bg-green-100 text-green-700"
                                : appointment.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : appointment.status === "Completed"
                                ? "bg-slate-200 text-slate-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {appointment.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {appointment.appointment_type}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-slate-900 font-medium">
                            <User className="w-4 h-4 text-slate-500" />
                            {appointment.patient_name ?? "Patient"}
                          </p>
                          <p className="text-sm text-slate-600">{appointment.reason}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {appointment.status === "Pending" && (
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, "Confirmed")}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                          >
                            Confirm
                          </button>
                        )}

                        {appointment.status === "Confirmed" && appointment.appointment_type === "Video" && (
                          <Link
                            to={`/telemedicine/consultation/${appointment.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 inline-flex items-center gap-2"
                          >
                            <Video className="w-4 h-4" />
                            Join Call
                          </Link>
                        )}

                        {appointment.status !== "Completed" && appointment.status !== "Cancelled" && (
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, "Completed")}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 inline-flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </button>
                        )}

                        {appointment.status !== "Cancelled" && appointment.status !== "Completed" && (
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, "Cancelled")}
                            className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 inline-flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
