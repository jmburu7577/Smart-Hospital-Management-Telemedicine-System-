import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Calendar,
  Clock,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { useAppointments, type Appointment } from "../../contexts/AppointmentsContext";
import { useAuth } from "../../contexts/AuthContext";

function formatTime(time: string) {
  const normalized = time.length === 5 ? `${time}:00` : time;
  return new Date(`1970-01-01T${normalized}`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function VideoConsultation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAppointmentById } = useAppointments();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [notes, setNotes] = useState("");
  const [otherPartyJoined, setOtherPartyJoined] = useState(false);

  useEffect(() => {
    const loadAppointment = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const record = await getAppointmentById(id);
      setAppointment(record);
      setLoading(false);
    };

    loadAppointment();
  }, [getAppointmentById, id]);

  useEffect(() => {
    if (!appointment) {
      return;
    }

    const timeout = setTimeout(() => {
      setOtherPartyJoined(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [appointment]);

  const accessAllowed = useMemo(() => {
    if (!user || !appointment) {
      return false;
    }

    return appointment.patient_id === user.id || appointment.doctor_id === user.id;
  }, [appointment, user]);

  const roleLabel = user?.id === appointment?.doctor_id ? "Doctor" : "Patient";
  const remoteName = user?.id === appointment?.doctor_id ? appointment?.patient_name : appointment?.doctor_name;

  const handleLeave = () => {
    if (user?.role === "doctor") {
      navigate("/appointments/schedule");
      return;
    }

    navigate("/appointments/view");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-slate-600">Loading consultation room...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Consultation not found</h1>
        <p className="text-slate-600 mb-6">The appointment you are trying to join does not exist.</p>
        <button onClick={handleLeave} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  if (!accessAllowed) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Access denied</h1>
        <p className="text-slate-600 mb-6">
          Only the assigned doctor or patient can enter this telemedicine consultation.
        </p>
        <button onClick={handleLeave} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">
          Return
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
      <div className="px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Telemedicine Consultation</h1>
          <p className="text-slate-400 text-sm mt-1">
            Appointment #{appointment.id.slice(0, 8)} • {appointment.appointment_type}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span className="inline-flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            {new Date(appointment.appointment_date).toLocaleDateString()}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            {formatTime(appointment.appointment_time)}
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-400/20">
            {roleLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] min-h-[calc(100vh-16rem)]">
        <div className="p-6 border-b xl:border-b-0 xl:border-r border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between min-h-[320px]">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">You</p>
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <p className="text-slate-400 mt-2">{roleLabel}</p>
              </div>
              <div className="w-24 h-24 rounded-full bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-3xl font-bold text-blue-300">
                {user?.name?.charAt(0) ?? "Y"}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between min-h-[320px]">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">Other Participant</p>
                <h2 className="text-2xl font-bold text-white">{remoteName ?? "Participant"}</h2>
                <p className="text-slate-400 mt-2">
                  {otherPartyJoined ? "Connected to session" : "Waiting to join the consultation"}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-24 h-24 rounded-full bg-emerald-600/20 border border-emerald-400/30 flex items-center justify-center text-3xl font-bold text-emerald-300">
                  {remoteName?.charAt(0) ?? "P"}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    otherPartyJoined ? "bg-emerald-500/10 text-emerald-300" : "bg-yellow-500/10 text-yellow-300"
                  }`}
                >
                  {otherPartyJoined ? "Live" : "Waiting"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setMicOn((current) => !current)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                micOn ? "bg-slate-800 text-white" : "bg-red-500 text-white"
              }`}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setCameraOn((current) => !current)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                cameraOn ? "bg-slate-800 text-white" : "bg-red-500 text-white"
              }`}
            >
              {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLeave}
              className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-900/70">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 mb-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Appointment Summary
            </h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Doctor:</span> {appointment.doctor_name ?? "Assigned doctor"}
              </p>
              <p>
                <span className="text-slate-400">Patient:</span> {appointment.patient_name ?? "Assigned patient"}
              </p>
              <p>
                <span className="text-slate-400">Reason:</span> {appointment.reason}
              </p>
              <p>
                <span className="text-slate-400">Status:</span> {appointment.status}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <h3 className="text-white font-semibold mb-3">Consultation Notes</h3>
            <textarea
              rows={10}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Capture symptoms, discussion points, or follow-up actions here during the call..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-slate-500 mt-3">
              This MVP keeps notes locally in the session view. Next step can persist them to consultation records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
