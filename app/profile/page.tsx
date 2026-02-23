import ProfileForm from "@/components/ProfileForm";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
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
      </AppLayout>
    </ProtectedRoute>
  );
}

