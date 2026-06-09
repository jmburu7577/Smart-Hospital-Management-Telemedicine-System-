import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Calendar,
  FileText,
  Video,
  Activity,
  Clock,
  MessageSquare,
  Plus,
  Pill,
  Download,
  Search,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { useAppointments, type Appointment } from "../../contexts/AppointmentsContext";
import { supabase } from "../../../lib/supabase";

interface LabTestItem {
  id: string;
  test_name: string;
  test_date: string;
  result: string | null;
  status: string;
}

interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  remaining_supply: string | null;
  status: string;
}

interface MedicalRecordItem {
  id: string;
  title: string;
  record_type: string;
  record_date: string;
}

interface DashboardMessage {
  id: string;
  contactId: string;
  contactName: string;
  content: string;
  created_at: string;
  isOutgoing: boolean;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const { appointments, loading } = useAppointments();
  const [recentTests, setRecentTests] = useState<LabTestItem[]>([]);
  const [activePrescriptions, setActivePrescriptions] = useState<PrescriptionItem[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordItem[]>([]);
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [messageText, setMessageText] = useState("");

  const patientAppointments = useMemo(() => {
    if (!user) {
      return [];
    }

    return appointments
      .filter((appointment) => appointment.patient_id === user.id)
      .sort((a, b) => {
        const first = new Date(`${a.appointment_date}T${a.appointment_time}`).getTime();
        const second = new Date(`${b.appointment_date}T${b.appointment_time}`).getTime();
        return first - second;
      });
  }, [appointments, user]);

  const upcomingAppointments = patientAppointments.filter((appointment) => {
    const start = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`).getTime();
    return start >= Date.now() && appointment.status !== "Cancelled";
  });
  const upcomingVideoAppointments = upcomingAppointments.filter(
    (appointment) => appointment.appointment_type === "Video",
  );
  const confirmedAppointments = patientAppointments.filter(
    (appointment) => appointment.status === "Confirmed",
  ).length;
  const pendingAppointments = patientAppointments.filter(
    (appointment) => appointment.status === "Pending",
  ).length;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (time: string) =>
    new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  const getJoinState = (appointment: Appointment) => {
    const start = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();
    const joinWindowStart = new Date(start.getTime() - 10 * 60 * 1000);
    const joinWindowEnd = new Date(start.getTime() + 60 * 60 * 1000);

    if (appointment.appointment_type !== "Video") {
      return { canJoin: false, label: "In-person visit" };
    }
    if (appointment.status !== "Confirmed") {
      return { canJoin: false, label: appointment.status };
    }
    if (now < joinWindowStart) {
      return { canJoin: false, label: "Starts 10 min before" };
    }
    if (now > joinWindowEnd) {
      return { canJoin: false, label: "Call ended" };
    }
    return { canJoin: true, label: "Join Call" };
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || user.role !== "patient") {
        return;
      }

      const [{ data: tests }, { data: prescriptions }, { data: records }, { data: rawMessages }] =
        await Promise.all([
          supabase
            .from("lab_tests")
            .select("id, test_name, test_date, result, status")
            .eq("patient_id", user.id)
            .order("test_date", { ascending: false })
            .limit(5),
          supabase
            .from("prescriptions")
            .select("id, medication, dosage, frequency, remaining_supply, status")
            .eq("patient_id", user.id)
            .order("prescription_date", { ascending: false })
            .limit(6),
          supabase
            .from("medical_records")
            .select("id, title, record_type, record_date")
            .eq("patient_id", user.id)
            .order("record_date", { ascending: false })
            .limit(6),
          supabase
            .from("messages")
            .select("id, sender_id, receiver_id, content, created_at")
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order("created_at", { ascending: true }),
        ]);

      setRecentTests((tests ?? []) as LabTestItem[]);
      setActivePrescriptions((prescriptions ?? []) as PrescriptionItem[]);
      setMedicalRecords((records ?? []) as MedicalRecordItem[]);

      const otherUserIds = [...new Set((rawMessages ?? []).map((message) =>
        message.sender_id === user.id ? message.receiver_id : message.sender_id,
      ))];

      let profileMap = new Map<string, string>();
      if (otherUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", otherUserIds);
        profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name ?? "Care team"]));
      }

      const mappedMessages = (rawMessages ?? []).map((message) => {
        const contactId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        return {
          id: message.id,
          contactId,
          contactName: profileMap.get(contactId) ?? "Care team",
          content: message.content,
          created_at: message.created_at,
          isOutgoing: message.sender_id === user.id,
        };
      });

      setMessages(mappedMessages);
      if (!selectedContactId && mappedMessages.length > 0) {
        setSelectedContactId(mappedMessages[0].contactId);
      }
    };

    loadDashboardData();
  }, [selectedContactId, user]);

  const conversations = useMemo(() => {
    const latestByContact = new Map<string, DashboardMessage>();
    for (const message of [...messages].reverse()) {
      if (!latestByContact.has(message.contactId)) {
        latestByContact.set(message.contactId, message);
      }
    }
    return [...latestByContact.values()];
  }, [messages]);

  const activeConversation = selectedContactId || conversations[0]?.contactId || "";
  const activeMessages = messages.filter((message) => message.contactId === activeConversation);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !activeConversation || !messageText.trim()) {
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: user.id,
          receiver_id: activeConversation,
          content: messageText.trim(),
        },
      ])
      .select("id, sender_id, receiver_id, content, created_at")
      .single();

    if (error || !data) {
      console.error("Error sending message:", error);
      return;
    }

    const contactName = conversations.find((conversation) => conversation.contactId === activeConversation)?.contactName ?? "Care team";
    setMessages((current) => [
      ...current,
      {
        id: data.id,
        contactId: activeConversation,
        contactName,
        content: data.content,
        created_at: data.created_at,
        isOutgoing: true,
      },
    ]);
    setMessageText("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Welcome back, {user?.name ?? "there"}! Here's your health overview
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Contact Support
          </Button>
          <Button className="flex items-center gap-2" asChild>
            <Link to="/appointments/book">
              <Plus className="w-4 h-4" />
              Book Appointment
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-white p-1 border border-slate-200 shadow-sm rounded-xl overflow-x-auto max-w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{loading ? "..." : upcomingAppointments.length}</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Upcoming Appointments</h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{loading ? "..." : confirmedAppointments}</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Confirmed Visits</h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{loading ? "..." : upcomingVideoAppointments.length}</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Video Consultations</h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{loading ? "..." : pendingAppointments}</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Pending Requests</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/appointments/view" className="text-blue-600 font-medium">View All</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">
                    No upcoming appointments yet. Book one to see it here.
                  </div>
                ) : upcomingAppointments.slice(0, 3).map((appointment) => {
                  const joinState = getJoinState(appointment);
                  return (
                  <div key={appointment.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                          {(appointment.doctor_name ?? "D").charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{appointment.doctor_name ?? "Assigned Doctor"}</h3>
                          <p className="text-xs text-slate-600 uppercase tracking-wider font-medium">{appointment.status}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                        {appointment.appointment_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {formatDate(appointment.appointment_date)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {formatTime(appointment.appointment_time)}
                      </span>
                      {appointment.appointment_type === "Video" && joinState.canJoin ? (
                        <Button variant="default" size="sm" className="ml-auto h-8 bg-purple-600 hover:bg-purple-700" asChild>
                          <Link to={`/telemedicine/consultation/${appointment.id}`}>
                            <Video className="w-3.5 h-3.5 mr-1" /> Join Call
                          </Link>
                        </Button>
                      ) : appointment.appointment_type === "Video" ? (
                        <span className="ml-auto text-xs text-slate-500 font-medium">{joinState.label}</span>
                      ) : null}
                    </div>
                  </div>
                )})}
              </div>
            </div>

            {/* Telemedicine */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Telemedicine Access</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/telemedicine" className="text-blue-600 font-medium">Open Telemedicine</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {upcomingVideoAppointments.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">
                    No upcoming video visits yet. Once a doctor schedules one, it will appear here and on the telemedicine page.
                  </div>
                ) : upcomingVideoAppointments.slice(0, 3).map((appointment) => {
                  const joinState = getJoinState(appointment);
                  return (
                  <div key={appointment.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Video className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{appointment.doctor_name ?? "Assigned Doctor"}</h3>
                        <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">
                          {formatDate(appointment.appointment_date)} • {formatTime(appointment.appointment_time)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {joinState.canJoin ? (
                        <Button variant="default" size="sm" className="h-8 bg-purple-600 hover:bg-purple-700" asChild>
                          <Link to={`/telemedicine/consultation/${appointment.id}`}>Join</Link>
                        </Button>
                      ) : (
                        <span className="block text-xs font-bold px-2 py-1 rounded-full mb-1 bg-slate-100 text-slate-600">
                          {joinState.label}
                        </span>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Your Appointments</h2>
              <Button asChild>
                <Link to="/appointments/book" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Book New
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                      {(appointment.doctor_name ?? "D").charAt(0)}
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                      appointment.appointment_type === 'Video' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {appointment.appointment_type}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{appointment.doctor_name ?? "Assigned Doctor"}</h3>
                  <p className="text-xs text-slate-500 mb-4 font-medium">{appointment.status}</p>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {formatTime(appointment.appointment_time)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" asChild>
                      <Link to="/appointments/view">Manage</Link>
                    </Button>
                    {appointment.appointment_type === "Video" && getJoinState(appointment).canJoin ? (
                      <Button variant="default" size="sm" className="flex-1 text-xs h-8 bg-purple-600 hover:bg-purple-700" asChild>
                        <Link to={`/telemedicine/consultation/${appointment.id}`}>Join</Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="flex-1 text-xs h-8 text-slate-500" disabled>
                        {getJoinState(appointment).label}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-xl font-bold text-slate-900">Medical History</h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            
            <div className="space-y-4">
                {medicalRecords.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">
                    No medical records available yet.
                  </div>
                ) : medicalRecords.map((record) => (
                  <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">{record.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">{formatDate(record.record_date)} • {record.record_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-14 sm:ml-0">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                        {record.record_type}
                    </span>
                    <Button variant="outline" size="sm" className="h-8 px-3">
                      <Download className="w-3.5 h-3.5 mr-1" /> View Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Active Medications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePrescriptions.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500 md:col-span-2">
                  No prescriptions available yet.
                </div>
              ) : activePrescriptions.map((p) => (
                <div key={p.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/30">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{p.medication}</h4>
                        <p className="text-xs text-slate-500 font-medium">{p.dosage} • {p.frequency}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                      p.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-slate-600">Remaining supply:</span>
                    <span className="font-bold text-slate-900">{p.remaining_supply ?? "N/A"}</span>
                  </div>
                  <Button variant={p.status === 'Active' ? 'outline' : 'default'} className="w-full h-9 text-xs font-bold">
                    {p.status === 'Active' ? 'View Details' : 'Request Refill'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {(conversations.find((conversation) => conversation.contactId === activeConversation)?.contactName ?? "C").charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    {conversations.find((conversation) => conversation.contactId === activeConversation)?.contactName ?? "No conversation selected"}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Secure messaging
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400">
                <Video className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20">
              {activeMessages.length === 0 ? (
                <div className="text-sm text-slate-500">No messages yet. Once you contact your care team, the thread will appear here.</div>
              ) : activeMessages.map((message) => (
                <div key={message.id} className={`flex ${message.isOutgoing ? "justify-end" : "justify-start"}`}>
                  <div className={`${message.isOutgoing ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"} p-4 rounded-2xl max-w-[80%] shadow-sm`}>
                    <p className="text-sm">{message.content}</p>
                    <span className={`text-[10px] mt-2 block ${message.isOutgoing ? "text-blue-100" : "text-slate-400"}`}>
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white">
              <form className="flex gap-2" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <Button className="rounded-xl px-6">Send</Button>
              </form>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
