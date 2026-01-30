import DebtList from "@/components/DebtList";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DebtsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col md:flex-row">
          <aside className="md:w-64 md:min-h-screen md:border-r md:border-gray-200 md:dark:border-gray-700">
            <Navigation />
          </aside>
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
            <DebtList />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

