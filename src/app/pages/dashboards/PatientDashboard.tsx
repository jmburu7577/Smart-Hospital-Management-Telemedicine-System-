import { Link } from "react-router";
import {
  Calendar,
  FileText,
  Video,
  Activity,
  Clock,
  AlertCircle,
  MessageSquare,
  Plus,
  Pill,
  Download,
  Search,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";

export default function PatientDashboard() {
  const { user } = useAuth();
  const upcomingAppointments = [
    { id: 1, doctor: "Dr. Sarah Johnson", specialty: "Cardiologist", date: "May 20, 2026", time: "10:00 AM", type: "In-Person" },
    { id: 2, doctor: "Dr. Michael Chen", specialty: "Dermatologist", date: "May 22, 2026", time: "2:30 PM", type: "Video" },
  ];

  const recentTests = [
    { id: 1, test: "Blood Test", date: "May 15, 2026", status: "Completed", result: "Normal" },
    { id: 2, test: "X-Ray", date: "May 10, 2026", status: "Completed", result: "Pending Review" },
  ];

  const activePrescriptions = [
    { id: 1, medication: "Amoxicillin", dosage: "500mg", frequency: "Twice daily", remaining: "5 days", status: "Active" },
    { id: 2, medication: "Lisinopril", dosage: "10mg", frequency: "Once daily", remaining: "12 days", status: "Refill Needed" },
  ];

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
                <span className="text-2xl font-bold text-slate-900">2</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Upcoming Appointments</h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">12</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Medical Records</h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">3</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Video Consultations</h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-slate-900">5</span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">Active Prescriptions</h3>
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
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                          {appointment.doctor.charAt(4)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{appointment.doctor}</h3>
                          <p className="text-xs text-slate-600 uppercase tracking-wider font-medium">{appointment.specialty}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                        {appointment.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {appointment.time}
                      </span>
                      {appointment.type === "Video" && (
                        <Button variant="default" size="sm" className="ml-auto h-8 bg-purple-600 hover:bg-purple-700">
                          <Video className="w-3.5 h-3.5 mr-1" /> Join Call
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Tests */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Tests</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/laboratory" className="text-blue-600 font-medium">View Results</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {recentTests.map((test) => (
                  <div key={test.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{test.test}</h3>
                        <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">{test.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`block text-xs font-bold px-2 py-1 rounded-full mb-1 ${
                        test.result === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {test.result}
                      </span>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                        <Download className="w-3 h-3 mr-1" /> PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Health Reminder */}
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-900 text-sm">Health Reminder</h3>
                    <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                      Your annual checkup is due. Regular screenings are vital for early detection and prevention.
                    </p>
                    <Button variant="link" size="sm" className="p-0 h-auto text-orange-800 text-xs font-bold mt-2 hover:text-orange-900">
                      Schedule Now →
                    </Button>
                  </div>
                </div>
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
                      {appointment.doctor.charAt(4)}
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                      appointment.type === 'Video' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {appointment.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{appointment.doctor}</h3>
                  <p className="text-xs text-slate-500 mb-4 font-medium">{appointment.specialty}</p>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {appointment.time}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8">Reschedule</Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50">Cancel</Button>
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
              {recentTests.map((test) => (
                <div key={test.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{test.test}</h4>
                      <p className="text-xs text-slate-500 font-medium">{test.date} • Hospital Central Lab</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-14 sm:ml-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      test.result === 'Normal' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {test.result}
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
              {activePrescriptions.map((p) => (
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
                    <span className="font-bold text-slate-900">{p.remaining}</span>
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
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">J</div>
                <div>
                  <h4 className="font-bold text-slate-900">Dr. Sarah Johnson</h4>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400">
                <Video className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20">
              <div className="flex justify-end">
                <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none text-white max-w-[80%] shadow-md">
                  <p className="text-sm">Hi Dr. Johnson, I've been feeling a bit dizzy after taking the new prescription. Is this normal?</p>
                  <span className="text-[10px] text-blue-100 mt-2 block opacity-70">Yesterday, 4:30 PM</span>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 text-slate-800 max-w-[80%] shadow-sm">
                  <p className="text-sm">Hi there! Mild dizziness can sometimes occur in the first few days. However, let's monitor your blood pressure. Can you take a reading and message me the results?</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">Today, 9:15 AM</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white">
              <form className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message here..."
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
