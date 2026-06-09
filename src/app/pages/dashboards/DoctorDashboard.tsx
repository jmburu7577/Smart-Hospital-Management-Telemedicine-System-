import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Users,
  Calendar,
  Video,
  Clock,
  TrendingUp,
  Search,
  MessageSquare,
  Plus,
  MoreVertical,
  Pill,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { useAppointments } from "../../contexts/AppointmentsContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";

interface DashboardMessage {
  id: string;
  contactId: string;
  contactName: string;
  content: string;
  created_at: string;
  isOutgoing: boolean;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { appointments, loading } = useAppointments();
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [messageText, setMessageText] = useState("");

  const doctorAppointments = useMemo(() => {
    if (!user) {
      return [];
    }

    return appointments
      .filter((appointment) => appointment.doctor_id === user.id)
      .sort((a, b) => {
        const first = new Date(`${a.appointment_date}T${a.appointment_time}`).getTime();
        const second = new Date(`${b.appointment_date}T${b.appointment_time}`).getTime();
        return first - second;
      });
  }, [appointments, user]);

  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = doctorAppointments.filter(
    (appointment) => appointment.appointment_date === today && appointment.status !== "Cancelled",
  );
  const upcomingAppointments = doctorAppointments.filter((appointment) => {
    const start = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`).getTime();
    return start >= Date.now() && appointment.status !== "Cancelled";
  });
  const nextVideoAppointment = upcomingAppointments.find(
    (appointment) => appointment.appointment_type === "Video" && appointment.status === "Confirmed",
  );
  const uniquePatients = [...new Set(doctorAppointments.map((appointment) => appointment.patient_id))];
  const pendingAppointments = doctorAppointments.filter((appointment) => appointment.status === "Pending").length;
  const weeklyAppointments = doctorAppointments.filter((appointment) => {
    const start = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const daysAway = (start.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysAway >= -7 && daysAway <= 7 && appointment.status !== "Cancelled";
  });
  const recentPatients = [...new Map(
    [...doctorAppointments]
      .sort((a, b) => {
        const first = new Date(`${a.appointment_date}T${a.appointment_time}`).getTime();
        const second = new Date(`${b.appointment_date}T${b.appointment_time}`).getTime();
        return second - first;
      })
      .map((appointment) => [
        appointment.patient_id,
        {
          id: appointment.patient_id,
          name: appointment.patient_name ?? "Patient",
          lastVisit: new Date(appointment.appointment_date).toLocaleDateString(),
          condition: appointment.reason || `${appointment.appointment_type} consultation`,
          email: `${appointment.patient_name ?? "patient"}@patient.local`,
        },
      ]),
  ).values()].slice(0, 4);

  useEffect(() => {
    const loadMessages = async () => {
      if (!user) {
        return;
      }

      const { data: rawMessages } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      const otherUserIds = [...new Set((rawMessages ?? []).map((message) =>
        message.sender_id === user.id ? message.receiver_id : message.sender_id,
      ))];

      let profileMap = new Map<string, string>();
      if (otherUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", otherUserIds);
        profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name ?? "Patient"]));
      }

      const mappedMessages = (rawMessages ?? []).map((message) => {
        const contactId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        return {
          id: message.id,
          contactId,
          contactName: profileMap.get(contactId) ?? "Patient",
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

    loadMessages();
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

    const contactName = conversations.find((conversation) => conversation.contactId === activeConversation)?.contactName ?? "Patient";
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

  const formatTime = (time: string) =>
    new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Welcome back, {user?.name ?? "Doctor"}. This dashboard now mirrors your live schedule and telemedicine queue.
          </p>
        </div>
        <div className="flex gap-3">
          {nextVideoAppointment ? (
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link to={`/telemedicine/consultation/${nextVideoAppointment.id}`}>
                <Video className="w-4 h-4" />
                Join Next Call
              </Link>
            </Button>
          ) : (
            <Button variant="outline" className="flex items-center gap-2" disabled>
              <Video className="w-4 h-4" />
              No Video Call Ready
            </Button>
          )}
          <Button className="flex items-center gap-2" asChild>
            <Link to="/appointments/schedule">
              <Plus className="w-4 h-4" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-white p-1 border border-slate-200 shadow-sm rounded-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
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
                <span className="text-2xl font-bold text-slate-900">{loading ? "..." : todaysAppointments.length}</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Today's Appointments</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {todaysAppointments.filter((appointment) => appointment.status === "Confirmed").length} confirmed today
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{loading ? "..." : uniquePatients.length}</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Total Patients</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">Based on your appointment history</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {loading ? "..." : upcomingAppointments.filter((appointment) => appointment.appointment_type === "Video").length}
                </span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Video Consultations</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">Upcoming confirmed and pending video visits</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{loading ? "..." : pendingAppointments}</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Pending Confirmations</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">Appointments needing review or follow-up</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Appointments */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Today's Appointments</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/appointments/schedule" className="text-blue-600 font-medium">View Schedule</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {todaysAppointments.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">
                    No appointments scheduled for today.
                  </div>
                ) : todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                          {(appointment.patient_name ?? "P").charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{appointment.patient_name ?? "Patient"}</h3>
                          <p className="text-xs text-slate-600 uppercase tracking-wider font-medium">{appointment.appointment_type}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        appointment.status === 'Confirmed'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mt-3">
                      <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {formatTime(appointment.appointment_time)}
                      </span>
                      {appointment.appointment_type === "Video" ? (
                        <Button variant="ghost" size="sm" className="ml-auto h-8 text-blue-600" asChild>
                          <Link to={`/telemedicine/consultation/${appointment.id}`}>Start Visit</Link>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="ml-auto h-8 text-blue-600" asChild>
                          <Link to="/ehr/notes">Open Notes</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Patients */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Patients</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/ehr/records" className="text-blue-600 font-medium">All Records</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {recentPatients.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">
                    Patient summaries will appear here after appointments are created.
                  </div>
                ) : recentPatients.map((patient) => (
                  <div key={patient.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{patient.name}</h3>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                        {patient.condition}
                      </span>
                      <span className="text-xs">Last visit: {patient.lastVisit}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs flex-1" asChild>
                        <Link to="/ehr/notes">Add Note</Link>
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs flex-1">
                        <Pill className="w-3 h-3 mr-1" />
                        Prescribe
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Detailed Schedule</h2>
            {/* Appointment management table would go here */}
            <div className="text-center py-12 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Calendar view and advanced scheduling tools coming soon.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">Patient Directory</h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 text-sm font-medium">
                    <th className="pb-4">Patient Name</th>
                    <th className="pb-4">ID / Email</th>
                    <th className="pb-4">Condition</th>
                    <th className="pb-4">Last Visit</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentPatients.map((patient) => (
                    <tr key={patient.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-medium text-slate-900">{patient.name}</td>
                      <td className="py-4 text-slate-600 text-sm">{patient.email}</td>
                      <td className="py-4">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                          {patient.condition}
                        </span>
                      </td>
                      <td className="py-4 text-slate-600 text-sm">{patient.lastVisit}</td>
                      <td className="py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600 h-8" asChild>
                          <Link to="/ehr/records">Records</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-bold text-slate-900">Conversations</div>
              <div className="divide-y divide-slate-50">
                {conversations.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">No patient messages yet.</div>
                ) : conversations.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${activeConversation === msg.contactId ? "bg-slate-50" : ""}`}
                    onClick={() => setSelectedContactId(msg.contactId)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">{msg.contactName}</h4>
                      <span className="text-[10px] text-slate-400 font-medium uppercase">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                  {(conversations.find((conversation) => conversation.contactId === activeConversation)?.contactName ?? "P").charAt(0)}
                </div>
                <h4 className="font-bold text-slate-900">
                  {conversations.find((conversation) => conversation.contactId === activeConversation)?.contactName ?? "Patient Conversation"}
                </h4>
              </div>
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
                {activeMessages.length === 0 ? (
                  <div className="text-sm text-slate-500">No messages in this conversation yet.</div>
                ) : (
                  <div className="space-y-4">
                    {activeMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.isOutgoing ? "justify-end" : "justify-start"}`}>
                        <div className={`${message.isOutgoing ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"} p-3 rounded-2xl max-w-[80%] shadow-sm`}>
                          <p className="text-sm">{message.content}</p>
                          <span className={`text-[10px] mt-1 block ${message.isOutgoing ? "text-blue-100" : "text-slate-400"}`}>
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <form className="p-4 border-t border-slate-100 flex gap-2" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <Button size="sm">Send</Button>
              </form>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Performance Overview (Footer Stats) */}
      <div className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl text-white shadow-xl">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Weekly Practice Snapshot
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-blue-400">{weeklyAppointments.length}</div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Appointments</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-green-400">
              {weeklyAppointments.filter((appointment) => appointment.status === "Confirmed").length}
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Confirmed</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-purple-400">
              {weeklyAppointments.filter((appointment) => appointment.appointment_type === "Video").length}
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Video Visits</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-orange-400">{uniquePatients.length}</div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Patients</p>
          </div>
        </div>
      </div>
    </div>
  );
}
