"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TrendingUp, Users, ShoppingBag, IndianRupee, Activity, Clock, Package } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchStatsAndLogs = async () => {
      try {
        const q = query(collection(db, "orders"));
        const querySnapshot = await getDocs(q);
        
        let ordersCount = 0;
        let revenue = 0;
        let profit = 0;
        let pending = 0;

        const allOrders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() as any }));

        allOrders.forEach((data) => {
          ordersCount += 1;
          revenue += data.totalAmount || 0;
          profit += data.netProfit || 0;
          if (data.paymentStatus === "pending") pending += 1;
        });

        setStats({ totalOrders: ordersCount, totalRevenue: revenue, totalProfit: profit, pendingOrders: pending });
        
        // Sort for recent orders view
        const sortedOrders = allOrders.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setRecentOrders(sortedOrders.slice(0, 5));

        // Fetch Audit Logs
        const logsQuery = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(20));
        const logsSnapshot = await getDocs(logsQuery);
        setLogs(logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAndLogs();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-navy)]">Overview</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Revenue</h3>
            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-navy)]">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Net Profit</h3>
            <div className="w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-navy)]">₹{stats.totalProfit.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Orders</h3>
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-navy)]">{stats.totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Pending Approvals</h3>
            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-navy)]">{stats.pendingOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center text-[var(--color-navy)]"><Package className="mr-2" /> Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                {order.items && order.items[0] && (
                  <img src={order.items[0].image} alt="Product" className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-[var(--color-navy)]">{order.customerDetails?.fullName}</p>
                  <p className="text-gray-500 text-xs">ID: {order.id.slice(0,8).toUpperCase()}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="font-bold text-[var(--color-primary)]">₹{order.totalAmount}</p>
                  <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider ${
                    order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    order.orderStatus === 'delivered' ? 'bg-purple-100 text-purple-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="p-8 text-center text-gray-400">No recent orders found.</div>
            )}
          </div>
        </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center"><Activity className="mr-2" /> Recent System Activity (Audit Log)</h2>
        </div>
        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
              <div className="mt-1 bg-blue-100 text-blue-600 p-2 rounded-full">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--color-navy)]">{log.action.replace(/_/g, ' ')}</p>
                <p className="text-gray-600 text-sm mt-1">{log.details}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>User: {log.userId}</span>
                  <span>{log.timestamp?.toDate().toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-8 text-center text-gray-400">No recent activity logged.</div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
