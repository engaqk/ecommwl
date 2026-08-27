"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SuperAdminLoginPage() {
  const { user, userData, loading, initializeAuthListener } = useAuthStore();
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initializeAuthListener();
  }, [initializeAuthListener]);

  useEffect(() => {
    if (user && userData && !loading) {
      if (userData.role === 'SUPER_ADMIN') {
        router.push("/super-admin");
      } else {
        setError("You are logged in, but you do not have Super Admin privileges.");
      }
    }
  }, [user, userData, loading, router]);

  const handleSuperAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    const superEmail = "abdulqadir53@admin.local";

    try {
      // Step 1: Try to login normally
      await signInWithEmailAndPassword(auth, superEmail, password);
    } catch (err: any) {
      // Step 2: If the user doesn't exist yet, we catch it and CREATE IT dynamically!
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, superEmail, password);
          
          const userDataObj = {
            uid: userCredential.user.uid,
            email: superEmail,
            displayName: "Super Admin",
            photoURL: null,
            role: "SUPER_ADMIN" as const,
            storeId: "my-store",
            createdAt: new Date().toISOString()
          };
          
          await setDoc(doc(db, "users", userCredential.user.uid), userDataObj, { merge: true });
          
          // Fix Race Condition: Force update the store so the redirect happens immediately
          useAuthStore.setState({ userData: userDataObj });

          // Login will now proceed to redirect via the useEffect
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            setError("Invalid password. Please try again.");
          } else {
            setError("Failed to provision Super Admin: " + createErr.message);
          }
          setAuthLoading(false);
        }
      } else {
        setError("Invalid password or credentials. Please try again.");
        setAuthLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-700">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Master Portal</h1>
          <p className="text-slate-400 text-sm">
            Enter the master password for <b>abdulqadir53</b>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSuperAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Master Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all text-sm text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={authLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-500 transition-colors flex items-center justify-center disabled:opacity-70 mt-6 shadow-lg shadow-indigo-600/20"
          >
            {authLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Authenticate <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            &larr; Return to Store
          </Link>
        </div>

      </div>
    </div>
  );
}
