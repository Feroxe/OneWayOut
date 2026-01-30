import LoginForm from "@/components/LoginForm";
import AuthRedirect from "@/components/AuthRedirect";

export default function LoginPage() {
  return (
    <AuthRedirect>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </AuthRedirect>
  );
}

