import DebtList from "@/components/DebtList";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DebtsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <DebtList />
      </AppLayout>
    </ProtectedRoute>
  );
}

