import { Link } from "react-router";
import { Calendar, Clock, User, Video, MapPin, X, Loader2 } from "lucide-react";
import { useAppointments } from "../../contexts/AppointmentsContext";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

function getAppointmentStart(date: string, time: string) {
  const normalized = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${normalized}`);
}

function formatTime(time: string) {
  const normalized = time.length === 5 ? `${time}:00` : time;
  return new Date(`1970-01-01T${normalized}`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ViewAppointments() {
  const { appointments, loading, cancelAppointment } = useAppointments();
  const { user } = useAuth();
  const [cancelling, setCancelling] = useState<string | null>(null);

  const visibleAppointments = user
    ? appointments.filter((appointment) =>
        user.role === "patient"
          ? appointment.patient_id === user.id
          : user.role === "doctor"
          ? appointment.doctor_id === user.id
          : true,
      )
    : appointments;

  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      setCancelling(id);
      try {
        await cancelAppointment(id);
      } catch (error) {
        alert("Failed to cancel appointment");
      } finally {
        setCancelling(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-slate-600 mt-4">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-600 mt-2">View and manage your appointments</p>
        </div>
        <Link
          to="/appointments/book"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Book New Appointment
        </Link>
      </div>

      <div className="space-y-4">
        {visibleAppointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No appointments found</p>
            <Link
              to="/appointments/book"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              Book your first appointment
            </Link>
          </div>
        ) : (
          visibleAppointments.map((appointment) => {
            const start = getAppointmentStart(appointment.appointment_date, appointment.appointment_time);
            const now = new Date();
            const joinWindowStart = new Date(start.getTime() - 10 * 60 * 1000);
            const joinWindowEnd = new Date(start.getTime() + 60 * 60 * 1000);
            const canJoinCall =
              appointment.appointment_type === "Video" &&
              appointment.status === "Confirmed" &&
              now >= joinWindowStart &&
              now <= joinWindowEnd;

            return (
            <div key={appointment.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{appointment.doctor_name ?? "Assigned Doctor"}</h3>
                      <p className="text-slate-600">{appointment.appointment_type} consultation</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : appointment.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(appointment.appointment_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatTime(appointment.appointment_time)}
                    </span>
                    <span className="flex items-center gap-2">
                      {appointment.appointment_type === "Video" ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      {appointment.appointment_type}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {appointment.appointment_type === "Video" && appointment.status === "Confirmed" && (
                    canJoinCall ? (
                      <Link
                        to={`/telemedicine/consultation/${appointment.id}`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Join Call
                      </Link>
                    ) : (
                      <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Starts 10 min before
                      </div>
                    )
                  )}
                  {appointment.status !== "Completed" && appointment.status !== "Cancelled" && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      disabled={cancelling === appointment.id}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {cancelling === appointment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <X className="w-4 h-4 inline mr-2" />
                          Cancel
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
}
