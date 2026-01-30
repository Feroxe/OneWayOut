import ProfileForm from "@/components/ProfileForm";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col md:flex-row">
          <aside className="md:w-64 md:min-h-screen md:border-r md:border-gray-200 md:dark:border-gray-700">
            <Navigation />
          </aside>
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
            <div className="max-w-2xl">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Manage your personal information and account details</p>
              </div>

              {/* Form Container */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <ProfileForm />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

