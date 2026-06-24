import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { LaboratoryProvider } from "./contexts/LaboratoryContext";
import { BillingProvider } from "./contexts/BillingContext";
import { AppointmentsProvider } from "./contexts/AppointmentsContext";
import { PrescriptionsProvider } from "./contexts/PrescriptionsContext";
import { MedicalRecordsProvider } from "./contexts/MedicalRecordsContext";
import { MessagesProvider } from "./contexts/MessagesContext"; // NEW

export default function App() {
  return (
    <AuthProvider>
      <LaboratoryProvider>
        <BillingProvider>
          <AppointmentsProvider>
            <PrescriptionsProvider>
              <MedicalRecordsProvider>
                <MessagesProvider>        {/* NEW */}
                  <RouterProvider router={router} />
                </MessagesProvider>
              </MedicalRecordsProvider>
            </PrescriptionsProvider>
          </AppointmentsProvider>
        </BillingProvider>
      </LaboratoryProvider>
    </AuthProvider>
  );
}
