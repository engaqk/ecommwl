"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Store, CheckCircle, XCircle, Mail, Phone, Globe, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<Record<string, string>>({});

  const fetchVendors = async () => {
    try {
      const q = query(collection(db, "suppliers"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setVendors(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const updateStatus = async (vendorId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      // If approving, enforce the commission rate
      if (newStatus === 'approved') {
        const rate = parseFloat(commissions[vendorId] || "15"); // Default 15%
        updateData.commissionRate = rate;
      }
      
      await updateDoc(doc(db, "suppliers", vendorId), updateData);
      toast.success(`Vendor ${newStatus} successfully!`);
      fetchVendors();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update vendor status");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-2">Vendor Verification Hub</h1>
        <p className="text-gray-500">Review applications from artisans wanting to join Shaza53 Marketplace.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {vendors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[var(--color-navy)] mb-2">No Applications Yet</h3>
            <p className="text-gray-500">When suppliers register, their applications will appear here.</p>
          </div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
              <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-navy)]">{vendor.businessName}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Store className="w-4 h-4 mr-2" />
                      {vendor.categories}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    vendor.status === 'approved' ? 'bg-green-100 text-green-700' :
                    vendor.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {vendor.status || 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 flex items-center">
                      <span className="font-bold text-[var(--color-navy)] w-20">Contact:</span>
                      {vendor.contactName}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <span className="font-bold text-[var(--color-navy)] w-20">Email:</span>
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {vendor.email}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <span className="font-bold text-[var(--color-navy)] w-20">Phone:</span>
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {vendor.phone}
                    </p>
                  </div>
                  <div>
                    {vendor.website && (
                      <p className="text-sm text-gray-600 flex items-center mb-2">
                        <span className="font-bold text-[var(--color-navy)] w-20">Website:</span>
                        <Globe className="w-4 h-4 mr-2 text-gray-400" />
                        <a href={vendor.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">
                          {vendor.website}
                        </a>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 flex items-center mt-4">
                      Applied: {vendor.createdAt?.toDate ? vendor.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center mb-2">
                    <Info className="w-4 h-4 mr-2" />
                    Brand Story & Craft
                  </h4>
                  <p className="text-sm text-gray-700 italic">"{vendor.description}"</p>
                </div>
              </div>

              <div className="p-6 md:w-1/3 flex flex-col justify-center space-y-3 bg-gray-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)] text-center mb-2">Action Required</h4>
                
                {vendor.status !== 'approved' && (
                  <div className="bg-white p-3 rounded-xl border border-gray-200 mb-3">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Commission Rate (%)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 15"
                      value={commissions[vendor.id] || ""}
                      onChange={(e) => setCommissions(prev => ({ ...prev, [vendor.id]: e.target.value }))}
                      className="w-full border border-gray-200 p-2 rounded-lg text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                    <button 
                      onClick={() => updateStatus(vendor.id, 'approved')}
                      className="w-full flex items-center justify-center py-2 mt-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors shadow-sm text-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                  </div>
                )}
                
                {vendor.status !== 'rejected' && (
                  <button 
                    onClick={() => updateStatus(vendor.id, 'rejected')}
                    className="w-full flex items-center justify-center py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject Application
                  </button>
                )}

                {vendor.status === 'approved' && (
                  <div className="mt-2 pt-4 border-t border-gray-200">
                    <p className="text-xs text-center font-bold text-[var(--color-primary)] mb-1">Commission: {vendor.commissionRate || 15}%</p>
                    <p className="text-xs text-center text-gray-500 mb-2">This vendor is approved and can now upload products.</p>
                    <button 
                      onClick={() => updateStatus(vendor.id, 'suspended')}
                      className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 transition-colors"
                    >
                      Suspend Vendor
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
