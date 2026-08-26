"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Package, Clock, Truck, CheckCircle } from "lucide-react";

export default function OrdersPage() {
  const { user, loading, initialized } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, initialized, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setFetching(false);
      }
    };
    
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading || !initialized || fetching) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!user) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "shipped": return <Truck className="w-5 h-5 text-blue-500" />;
      case "delivered": return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "shipped": return "Shipped";
      case "delivered": return "Delivered";
      default: return "Processing";
    }
  };

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Package className="w-8 h-8 text-[var(--color-navy)] mr-3" />
          <h1 className="text-3xl font-bold text-[var(--color-navy)]">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--color-navy)] mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">When you buy a bag, you will be able to track its status here.</p>
            <button 
              onClick={() => router.push("/shop")}
              className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-mono text-sm text-[var(--color-navy)]">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Date</p>
                    <p className="text-sm font-medium text-[var(--color-navy)]">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total</p>
                    <p className="text-sm font-bold text-[var(--color-primary)]">₹{order.totalAmount}</p>
                  </div>
                  <div className="flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                    {getStatusIcon(order.orderStatus)}
                    <span className="ml-2 text-sm font-bold capitalize">{getStatusLabel(order.orderStatus)}</span>
                  </div>
                </div>
                
                {order.trackingNumber && (
                  <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-900 font-medium">Tracking Number:</span>
                    <span className="text-sm font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">{order.trackingNumber}</span>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4">
                        <img src={item.image} alt={item.title} className="w-16 h-16 object-contain bg-gray-50 rounded-lg p-2" />
                        <div className="flex-1">
                          <h4 className="font-bold text-[var(--color-navy)] text-sm md:text-base">{item.title}</h4>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-[var(--color-navy)]">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
