"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";

export default function AdminLogin() {
  const { store } = useTenantStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isLocalAdmin = typeof window !== 'undefined' && localStorage.getItem("shaza_admin") === "true";
    if (isLocalAdmin) {
      router.push("/admin/dashboard");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/admin/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const loginEmail = email.includes("@") ? email : `${email}@admin.local`;

    try {
      await signInWithEmailAndPassword(auth, loginEmail, password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Auto-provision Tenant Admin if they don't exist (e.g. my-store_admin)
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, password);
          const { doc, setDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");
          
          const userDataObj = {
            uid: userCredential.user.uid,
            email: loginEmail,
            displayName: "Tenant Admin",
            photoURL: null,
            role: "TENANT_ADMIN" as const,
            storeId: email.split("_admin")[0] || "my-store",
            createdAt: new Date().toISOString()
          };

          await setDoc(doc(db, "users", userCredential.user.uid), userDataObj, { merge: true });

          // Fix Race Condition
          const { useAuthStore } = await import("@/store/useAuthStore");
          useAuthStore.setState({ userData: userDataObj });

          router.push("/admin/dashboard");
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            setError("Invalid password. Please try again.");
          } else {
            setError("Invalid credentials and auto-provision failed.");
          }
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8 flex flex-col items-center">
          <svg 
            width="48" height="48" viewBox="0 0 100 100" fill="none" 
            className="mb-4"
          >
            <circle cx="50" cy="50" r="48" stroke="url(#goldGradient3)" strokeWidth="1.5" className="opacity-80"/>
            <path d="M30 45 C 30 25, 70 25, 70 45 C 80 45, 85 55, 80 75 C 75 90, 25 90, 20 75 C 15 55, 20 45, 30 45 Z" stroke="var(--color-navy)" strokeWidth="2" fill="none" />
            <path d="M40 45 C 40 30, 60 30, 60 45" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
            <path d="M43 65 C 55 65, 55 55, 45 55 C 35 55, 35 45, 47 45" stroke="var(--color-navy)" strokeWidth="2" strokeLinecap="round" />
            <path d="M57 45 L 65 45 C 65 50, 58 52, 63 55 C 68 58, 60 65, 52 65" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="goldGradient3" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="50%" stopColor="#fff" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-serif text-3xl font-bold tracking-tight text-[var(--color-navy)] flex items-center gap-2">
            {store?.name || "MY STORE"}
          </span>
          <span className="text-[0.65rem] tracking-[0.3em] text-[var(--color-navy)] uppercase mt-1">
            Admin Portal
          </span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[var(--color-primary)] transition-colors"
                placeholder={`admin@${store?.id || "my-store"}.com`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[var(--color-primary)] transition-colors"
                placeholder="••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl font-bold flex items-center justify-center transition-colors mt-8"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
