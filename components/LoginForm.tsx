"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, AlertCircle, Phone } from "lucide-react";
// import GoogleLoginButton from "./GoogleLoginButton"; // Commented out for MVP

export default function LoginForm() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithPhone, verifyOTP } = useAuth();
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    
    // Basic phone validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = phone.replace(/\s|-/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      setError("Please enter a valid phone number (e.g., +1234567890).");
      return;
    }

    setIsLoading(true);
    const result = await loginWithPhone(cleanPhone);
    
    if (result.success) {
      setOtpSent(true);
      setError("");
    } else {
      setError(result.error || "Failed to send OTP");
    }
    
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setIsLoading(true);
    const cleanPhone = phone.replace(/\s|-/g, "");
    const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`;
    
    const result = await verifyOTP(formattedPhone, otp);
    
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Invalid OTP code");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <LogIn className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* <GoogleLoginButton /> */}


        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="+923001234567"
                  required
                  autoComplete="tel"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Include country code (e.g., +1 for US, +92 for Pakistan, +264 for Namibia)</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Phone className="h-5 w-5" />
                  Send OTP
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We've sent a 6-digit code to {phone}. Please enter it below.
              </p>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OTP Code
              </label>
              <div className="relative">
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest"
                  placeholder="000000"
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
              <p className="mt-2 text-center">
                <button
                  type="button"
                  onClick={async () => {
                    setError("");
                    setIsLoading(true);
                    const cleanPhone = phone.replace(/\s|-/g, "");
                    const result = await loginWithPhone(cleanPhone);
                    if (!result.success) {
                      setError(result.error || "Failed to resend OTP");
                    } else {
                      setError("");
                    }
                    setIsLoading(false);
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  disabled={isLoading}
                >
                  Didn't receive the code? Resend
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Verify & Sign In
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError("");
              }}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              Use a different phone number
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

