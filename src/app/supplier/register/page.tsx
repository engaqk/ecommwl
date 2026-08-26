"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Store, CheckCircle2 } from "lucide-react";


export default function SupplierRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    categories: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "suppliers"), {
        ...formData,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      // Send supplier registration confirmation email
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: formData.email,
            action: 'SUPPLIER_REGISTRATION',
            data: { customerName: formData.contactName }
          })
        });
      } catch (e) {
        console.error("Failed to send supplier registration email:", e);
      }
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-[var(--color-background)] pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {success ? (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-serif font-bold text-[var(--color-navy)] mb-4">Application Received!</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Thank you for applying to join the Shaza53 Creation Marketplace. Our team will review your application and contact you within 48 hours.
              </p>
              <button 
                onClick={() => router.push("/")}
                className="px-8 py-4 bg-[var(--color-navy)] text-white font-bold tracking-[3px] uppercase text-xs hover:bg-[var(--color-primary)] transition-colors"
              >
                Return to Home
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Store className="w-48 h-48" />
              </div>
              
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-[var(--color-navy)] mb-4">Become a Supplier</h1>
              <p className="text-gray-500 mb-12 font-light max-w-xl">
                Join our curated marketplace of premium artisans. Sell your handcrafted bags and accessories alongside the Shaza53 collection.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Name *</label>
                    <input 
                      type="text" required
                      value={formData.businessName}
                      onChange={e => setFormData({...formData, businessName: e.target.value})}
                      className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent text-[var(--color-navy)]"
                      placeholder="e.g. Luna Leathercraft"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Person *</label>
                    <input 
                      type="text" required
                      value={formData.contactName}
                      onChange={e => setFormData({...formData, contactName: e.target.value})}
                      className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent text-[var(--color-navy)]"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address *</label>
                    <input 
                      type="email" required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent text-[var(--color-navy)]"
                      placeholder="hello@yourbrand.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number *</label>
                    <input 
                      type="tel" required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent text-[var(--color-navy)]"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Website / Social Media (Optional)</label>
                  <input 
                    type="url"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent text-[var(--color-navy)]"
                    placeholder="https://instagram.com/yourbrand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Categories *</label>
                  <input 
                    type="text" required
                    value={formData.categories}
                    onChange={e => setFormData({...formData, categories: e.target.value})}
                    className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent text-[var(--color-navy)]"
                    placeholder="e.g. Leather Totes, Macrame Bags"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tell us about your craft *</label>
                  <textarea 
                    required rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent text-[var(--color-navy)] resize-none"
                    placeholder="Describe your manufacturing process, materials used, and brand story..."
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-5 bg-[var(--color-navy)] text-white font-bold tracking-[4px] uppercase text-xs hover:bg-[var(--color-primary)] transition-colors disabled:opacity-70 flex justify-center items-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Application"}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    By submitting this form, you agree to our Vendor Terms & Conditions.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
  );
}
