"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, ExternalLink, Calendar, Mail, Phone, User, Paintbrush, ChevronDown } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "customOrders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching custom orders:", error);
      toast.error("Failed to load custom orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "customOrders", orderId), { status: newStatus });
      toast.success("Status updated");
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-2">Custom Design Requests</h1>
        <p className="text-gray-500">Manage bespoke orders and customer customization requests.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-500 text-sm uppercase tracking-wider">Date / ID</th>
                <th className="p-4 font-semibold text-gray-500 text-sm uppercase tracking-wider">Customer</th>
                <th className="p-4 font-semibold text-gray-500 text-sm uppercase tracking-wider">Reference</th>
                <th className="p-4 font-semibold text-gray-500 text-sm uppercase tracking-wider">Status</th>
                <th className="p-4 font-semibold text-gray-500 text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No custom orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">#{order.id.slice(0, 8)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {order.customerName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex flex-col gap-1">
                        <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {order.customerEmail}</span>
                        {order.customerPhone && <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {order.customerPhone}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      {order.referenceImage ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img src={order.referenceImage} alt="Reference" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <Paintbrush className="w-6 h-6" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="relative inline-block group">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`appearance-none text-xs font-bold uppercase tracking-wider px-4 py-2 pr-8 rounded-full outline-none cursor-pointer transition-colors ${
                            order.status === 'pending' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                            order.status === 'quoted' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                            order.status === 'accepted' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                            order.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                            'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="quoted">Quoted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="completed">Completed</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/custom/${order.id}`}
                        target="_blank"
                        className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                        title="View Public Share Link"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
