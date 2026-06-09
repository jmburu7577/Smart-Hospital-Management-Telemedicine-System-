import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Shield,
  Stethoscope,
  Video,
  Wifi,
} from "lucide-react";
import { useAppointments, type Appointment } from "../../contexts/AppointmentsContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";

function getAppointmentStart(date: string, time: string) {
  const normalized = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${normalized}`);
}

function formatAppointmentDate(date: string) {
  return new Date(date).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAppointmentTime(time: string) {
  const normalized = time.length === 5 ? `${time}:00` : time;
  return new Date(`1970-01-01T${normalized}`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getJoinState(appointment: Appointment) {
  const start = getAppointmentStart(appointment.appointment_date, appointment.appointment_time);
  const now = new Date();
  const joinWindowStart = new Date(start.getTime() - 10 * 60 * 1000);
  const joinWindowEnd = new Date(start.getTime() + 60 * 60 * 1000);

  if (appointment.appointment_type !== "Video") {
    return {
      canJoin: false,
      label: "In-person visit",
      description: "This appointment is not a video consultation.",
      tone: "slate",
    } as const;
  }

  if (appointment.status !== "Confirmed") {
    return {
      canJoin: false,
      label: appointment.status,
      description: "Join becomes available after the doctor confirms the consultation.",
      tone: "amber",
    } as const;
  }

  if (now < joinWindowStart) {
    return {
      canJoin: false,
      label: "Starts soon",
      description: "Join opens 10 minutes before the scheduled start time.",
      tone: "blue",
    } as const;
  }

  if (now > joinWindowEnd) {
    return {
      canJoin: false,
      label: "Call ended",
      description: "This consultation is outside the active join window.",
      tone: "slate",
    } as const;
  }

  return {
    canJoin: true,
    label: "Ready to join",
    description: "Your doctor can meet you now in the consultation room.",
    tone: "green",
  } as const;
}

function getToneClasses(tone: "green" | "blue" | "amber" | "slate") {
  switch (tone) {
    case "green":
      return "bg-green-100 text-green-700 border-green-200";
    case "blue":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "amber":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function Telemedicine() {
  const { user } = useAuth();
  const { appointments, loading } = useAppointments();
  const [doctorSpecialties, setDoctorSpecialties] = useState<Record<string, string>>({});

  const patientVideoAppointments = useMemo(() => {
    if (!user) {
      return [];
    }

    return appointments
      .filter(
        (appointment) =>
          appointment.patient_id === user.id && appointment.appointment_type === "Video",
      )
      .sort((a, b) => {
        const first = getAppointmentStart(a.appointment_date, a.appointment_time).getTime();
        const second = getAppointmentStart(b.appointment_date, b.appointment_time).getTime();
        return first - second;
      });
  }, [appointments, user]);

  useEffect(() => {
    const loadDoctorSpecialties = async () => {
      const doctorIds = [...new Set(patientVideoAppointments.map((appointment) => appointment.doctor_id))];

      if (doctorIds.length === 0) {
        setDoctorSpecialties({});
        return;
      }

      const { data, error } = await supabase
        .from("doctors")
        .select("id, specialty")
        .in("id", doctorIds);

      if (error) {
        console.error("Error loading doctor specialties:", error);
        return;
      }

      const specialtyMap = Object.fromEntries((data ?? []).map((doctor) => [doctor.id, doctor.specialty]));
      setDoctorSpecialties(specialtyMap);
    };

    loadDoctorSpecialties();
  }, [patientVideoAppointments]);

  const now = new Date();
  const upcomingAppointments = patientVideoAppointments.filter(
    (appointment) => getAppointmentStart(appointment.appointment_date, appointment.appointment_time) >= now,
  );
  const pastAppointments = patientVideoAppointments.filter(
    (appointment) => getAppointmentStart(appointment.appointment_date, appointment.appointment_time) < now,
  );
  const nextAppointment = upcomingAppointments[0] ?? null;
  const confirmedAppointments = patientVideoAppointments.filter(
    (appointment) => appointment.status === "Confirmed",
  ).length;
  const completedAppointments = patientVideoAppointments.filter(
    (appointment) => appointment.status === "Completed",
  ).length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-slate-600">Loading your telemedicine visits...</p>
      </div>
    );
  }

  if (!user || user.role !== "patient") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900">Telemedicine</h1>
          <p className="mt-3 text-slate-600">
            This page is tailored for patients to manage video consultations and join scheduled calls.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/appointments/schedule"
              className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Doctor Schedule
            </Link>
            <Link
              to="/appointments/view"
              className="px-5 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              View Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Telemedicine</h1>
          <p className="mt-2 text-slate-600">
            Review your video consultations, see doctor details, and join calls when they are ready.
          </p>
        </div>
        <Link
          to="/appointments/book"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Book Video Visit
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">Next consultation</p>
              <h2 className="mt-2 text-2xl font-bold">
                {nextAppointment ? nextAppointment.doctor_name ?? "Assigned Doctor" : "No video visit scheduled"}
              </h2>
              <p className="mt-2 text-blue-100">
                {nextAppointment
                  ? `${formatAppointmentDate(nextAppointment.appointment_date)} at ${formatAppointmentTime(
                      nextAppointment.appointment_time,
                    )}`
                  : "Book a video consultation and it will appear here automatically."}
              </p>
            </div>
            <div className="hidden md:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Video className="w-7 h-7" />
            </div>
          </div>

          {nextAppointment ? (
            <div className="mt-6 rounded-xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-blue-100">Consultation reason</p>
                  <p className="mt-1 font-medium text-white">{nextAppointment.reason || "General follow-up"}</p>
                  <p className="mt-2 text-sm text-blue-100">
                    Specialty: {doctorSpecialties[nextAppointment.doctor_id] ?? "General practice"}
                  </p>
                </div>
                {getJoinState(nextAppointment).canJoin ? (
                  <Link
                    to={`/telemedicine/consultation/${nextAppointment.id}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Join Call
                  </Link>
                ) : (
                  <div className="rounded-lg border border-white/25 px-4 py-3 text-sm text-blue-50">
                    {getJoinState(nextAppointment).description}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Upcoming video visits</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{upcomingAppointments.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Confirmed calls</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{confirmedAppointments}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Completed consultations</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{completedAppointments}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Upcoming video consultations</h2>
              <p className="mt-1 text-sm text-slate-600">
                Your confirmed and pending telemedicine appointments appear here.
              </p>
            </div>
            <Link to="/appointments/view" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View all appointments
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Video className="w-10 h-10 mx-auto text-slate-400" />
                <p className="mt-4 text-slate-700 font-medium">No upcoming video consultations</p>
                <p className="mt-1 text-sm text-slate-500">
                  Once a doctor schedules or confirms a telemedicine visit, it will appear here.
                </p>
              </div>
            ) : (
              upcomingAppointments.map((appointment) => {
                const joinState = getJoinState(appointment);
                return (
                  <div key={appointment.id} className="rounded-xl border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {appointment.doctor_name ?? "Assigned Doctor"}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getToneClasses(
                              joinState.tone,
                            )}`}
                          >
                            {joinState.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            {formatAppointmentDate(appointment.appointment_date)}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            {formatAppointmentTime(appointment.appointment_time)}
                          </span>
                          <span className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-blue-600" />
                            {doctorSpecialties[appointment.doctor_id] ?? "General practice"}
                          </span>
                          <span className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-600" />
                            {appointment.status} consultation
                          </span>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                          <span className="font-semibold text-slate-900">Reason:</span>{" "}
                          {appointment.reason || "No reason provided"}
                        </div>
                        <p className="text-sm text-slate-500">{joinState.description}</p>
                      </div>

                      <div className="flex flex-col gap-3 lg:min-w-52">
                        {joinState.canJoin ? (
                          <Link
                            to={`/telemedicine/consultation/${appointment.id}`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                          >
                            <Video className="w-4 h-4" />
                            Join Call
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-500 rounded-lg font-semibold cursor-not-allowed"
                          >
                            <Video className="w-4 h-4" />
                            Not Ready Yet
                          </button>
                        )}
                        <Link
                          to="/appointments/view"
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          View Appointment
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Before you join</h2>
            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <Wifi className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Stable internet connection</p>
                  <p className="text-sm text-slate-600">Use Wi-Fi or a reliable mobile data connection.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Quiet, private space</p>
                  <p className="text-sm text-slate-600">Choose a place where you can speak freely with your doctor.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Keep records nearby</p>
                  <p className="text-sm text-slate-600">Have your medications, vitals, and previous notes ready.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Past consultations</h2>
            <div className="mt-4 space-y-3">
              {pastAppointments.length === 0 ? (
                <p className="text-sm text-slate-500">Your completed and past video visits will appear here.</p>
              ) : (
                pastAppointments.slice(-4).reverse().map((appointment) => (
                  <div key={appointment.id} className="rounded-lg bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      {appointment.doctor_name ?? "Assigned Doctor"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatAppointmentDate(appointment.appointment_date)} at{" "}
                      {formatAppointmentTime(appointment.appointment_time)}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{appointment.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
