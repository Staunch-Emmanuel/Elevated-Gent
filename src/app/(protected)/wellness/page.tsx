import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WellnessClient from "./WellnessClient";

export default function WellnessPage() {
  return (
    <ProtectedRoute>
      <WellnessClient />
    </ProtectedRoute>
  );
}
