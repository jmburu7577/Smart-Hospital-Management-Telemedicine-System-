import { createBrowserRouter } from "react-router";
import Layout from "./components/layout/Layout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PatientDashboard from "./pages/dashboards/PatientDashboard";
import DoctorDashboard from "./pages/dashboards/DoctorDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import BookAppointment from "./pages/appointments/BookAppointment";
import ViewAppointments from "./pages/appointments/ViewAppointments";
import DoctorSchedule from "./pages/appointments/DoctorSchedule";
import MedicalRecords from "./pages/ehr/MedicalRecords";
import ConsultationNotes from "./pages/ehr/ConsultationNotes";
import MedicalReports from "./pages/ehr/MedicalReports";
import Telemedicine from "./pages/telemedicine/Telemedicine";
import VideoConsultation from "./pages/telemedicine/VideoConsultation";
import Pharmacy from "./pages/pharmacy/Pharmacy";
import Laboratory from "./pages/laboratory/Laboratory";
import Billing from "./pages/billing/Billing";
import Payments from "./pages/billing/Payments";
import SymptomChecker from "./pages/ai/SymptomChecker";
import Profile from "./pages/profile/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import {useParams } from "react-router";
import DoctorProfile from "./pages/doctors/DoctorProfile";



export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: Login },
      { path: "register", Component: Register },

      // Dashboards (role-protected)
      {
        path: "patient/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "doctor/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },

      // Appointments (protected)
      {
        path: "appointments/book",
        element: (
          <ProtectedRoute>
            <BookAppointment />
          </ProtectedRoute>
        ),
      },
      {
        path: "appointments/view",
        element: (
          <ProtectedRoute>
            <ViewAppointments />
          </ProtectedRoute>
        ),
      },
      {
        path: "appointments/schedule",
        element: (
          <ProtectedRoute>
            <DoctorSchedule />
          </ProtectedRoute>
        ),
      },

      // Electronic Health Records (protected)
      {
        path: "ehr/records",
        element: (
          <ProtectedRoute>
            <MedicalRecords />
          </ProtectedRoute>
        ),
      },
      {
        path: "ehr/notes",
        element: (
          <ProtectedRoute>
            <ConsultationNotes />
          </ProtectedRoute>
        ),
      },
      {
        path: "ehr/reports",
        element: (
          <ProtectedRoute>
            <MedicalReports />
          </ProtectedRoute>
        ),
      },

      // Telemedicine (protected)
      {
        path: "telemedicine",
        element: (
          <ProtectedRoute>
            <Telemedicine />
          </ProtectedRoute>
        ),
      },
      {
        path: "telemedicine/consultation/:id",
        element: (
          <ProtectedRoute>
            <VideoConsultation />
          </ProtectedRoute>
        ),
      },

      // Hospital Services (protected)
      {
        path: "pharmacy",
        element: (
          <ProtectedRoute>
            <Pharmacy />
          </ProtectedRoute>
        ),
      },
      {
        path: "laboratory",
        element: (
          <ProtectedRoute>
            <Laboratory />
          </ProtectedRoute>
        ),
      },
      {
        path: "billing",
        element: (
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        ),
      },
      {
        path: "payments",
        element: (
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        ),
      },

      // AI & Profile (protected)
      {
        path: "symptom-checker",
        element: (
          <ProtectedRoute>
            <SymptomChecker />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "doctor/:id",
        element: (
          <ProtectedRoute>
            <DoctorProfile />
          </ProtectedRoute>
        ),
      },

      // 404
      { path: "*", Component: NotFound },
    ],
  },
]);