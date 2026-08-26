"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { user, signInWithGoogle, loading, initializeAuthListener } = useAuthStore();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initializeAuthListener();
  }, [initializeAuthListener]);

  const { userData } = useAuthStore();

  useEffect(() => {
    if (user && userData && !loading) {
      if (userData.role === 'SUPER_ADMIN') router.push("/super-admin");
      else if (userData.role === 'TENANT_ADMIN' || userData.role === 'TENANT_STAFF') router.push("/admin");
      else router.push("/shop");
    }
  }, [user, userData, loading, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    // Detect if identifier is email or username
    const isEmail = identifier.includes("@");
    const firebaseEmail = isEmail ? identifier : `${identifier}@admin.local`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, firebaseEmail, password);
      } else {
        if (!isEmail) throw new Error("Please use an email address to create a customer account.");
        await createUserWithEmailAndPassword(auth, firebaseEmail, password);
        // Send welcome email for new registrations
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: firebaseEmail,
              action: 'WELCOME_REGISTRATION',
              data: { customerName: firebaseEmail.split('@')[0] }
            })
          });
        } catch (e) {
          console.error("Failed to send welcome email:", e);
        }
      }
      // Redirection is handled by the useEffect above
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
      setAuthLoading(false); // Only stop loading if error, otherwise let useEffect handle redirect
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    try {
      await signInWithGoogle();
      // Redirection is handled by useEffect
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  if ((loading || authLoading) && !error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] py-20 px-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-serif text-[var(--color-navy)] font-bold tracking-tight">
              SHAZA<span className="text-[var(--color-primary)] text-sm ml-1 align-top">53</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-navy)] mb-2">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLogin ? "Sign in to access your account." : "Join us to save your wishlist and track orders."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              {isLogin ? "Email or Username" : "Email"}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm"
                placeholder={isLogin ? "you@example.com or admin" : "you@example.com"}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all text-sm"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={authLoading}
            className="w-full bg-[var(--color-navy)] text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-70 mt-6"
          >
            {authLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 mb-6 flex items-center justify-center space-x-4">
          <div className="flex-1 h-[1px] bg-gray-200"></div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Or continue with</span>
          <div className="flex-1 h-[1px] bg-gray-200"></div>
        </div>

        <button 
          onClick={handleGoogleAuth}
          disabled={authLoading}
          className="w-full bg-white border-2 border-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <div className="mt-8 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[var(--color-primary)] font-bold hover:underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>

      </div>
    </div>
  );
}
