"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, XCircle, Eye, Clock, Truck, MessageCircle, Copy, Edit2, Save, X, Mail } from "lucide-react";
import { logSystemEvent } from "@/lib/audit";

type Order = {
  id: string;
  customerDetails: any;
  items: any[];
  totalAmount: number;
  paymentScreenshotUrl: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: any;
  trackingNumber?: string;
  courierCost?: number;
  netProfit?: number;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingCourier, setEditingCourier] = useState<string | null>(null);
  const [courierData, setCourierData] = useState({ trackingNumber: '', courierCost: '' });

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, statusType: 'paymentStatus' | 'orderStatus', value: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        [statusType]: value
      });
      await logSystemEvent(
        statusType === 'paymentStatus' ? "PAYMENT_STATUS_UPDATED" : "ORDER_STATUS_UPDATED", 
        `Order ${orderId} ${statusType} changed to ${value}`, 
        "admin"
      );
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCopyRepaymentLink = (orderId: string) => {
    const link = `${window.location.origin}/repay/${orderId}`;
    navigator.clipboard.writeText(link);
    alert("Repayment link copied to clipboard!");
  };

  const handleEmailRepaymentLink = async (order: Order) => {
    if (!order.customerDetails?.email) {
      alert("Customer email not found!");
      return;
    }
    try {
      const link = `${window.location.origin}/repay/${order.id}`;
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REPAYMENT_LINK',
          to: order.customerDetails.email,
          orderId: order.id,
          data: {
            customerName: order.customerDetails.fullName,
            repaymentUrl: link
          }
        })
      });
      alert("Repayment link emailed successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to email repayment link.");
    }
  };

  const handleSaveCourier = async (order: Order) => {
    try {
      const cost = parseFloat(courierData.courierCost) || 0;
      let newNetProfit = order.netProfit;
      
      // If courier cost is being set for the first time or updated, we should adjust net profit.
      // Assuming netProfit in DB is currently totalAmount - itemCosts. 
      // We will just do a fresh calculation if possible, or assume the old netProfit needs to be reduced by the NEW cost (and old cost added back if editing).
      // Since we don't have original net profit easily, let's just do: totalAmount - totalCost - courierCost
      // We'll calculate it from items.
      const itemCosts = order.items.reduce((acc: number, item: any) => acc + (item.costPrice || item.price * 0.6) * item.quantity, 0);
      newNetProfit = order.totalAmount - itemCosts - cost;

      await updateDoc(doc(db, "orders", order.id), {
        trackingNumber: courierData.trackingNumber,
        courierCost: cost,
        netProfit: newNetProfit
      });

      await logSystemEvent("ORDER_UPDATED", `Courier details added for Order ${order.id}`, "admin");
      setEditingCourier(null);
      fetchOrders();

      if (courierData.trackingNumber && order.customerDetails?.email) {
        // Send email
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ORDER_SHIPPED',
            to: order.customerDetails.email,
            orderId: order.id,
            data: {
              customerName: order.customerDetails.fullName,
              trackingNumber: courierData.trackingNumber,
              storeUrl: window.location.origin,
              items: order.items
            }
          })
        });
      }
    } catch (error) {
      console.error("Error updating courier info:", error);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-8">Order Management</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Order ID / Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Payment Proof</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-mono text-xs text-gray-500 mb-1">{order.id}</p>
                    <p className="text-sm font-medium">{order.createdAt?.toDate().toLocaleDateString()}</p>
                  </td>
                  <td className="p-4 align-top">
                    <p className="font-semibold text-[var(--color-navy)]">{order.customerDetails?.fullName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">{order.customerDetails?.phone}</p>
                      {order.customerDetails?.phone && (
                        <a 
                          href={`https://wa.me/${order.customerDetails.phone.replace(/\D/g, '')}?text=Hello%20from%20Shaza%20Creation!%20Your%20order%20(${order.id})%20is%20currently:%20${order.orderStatus}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#25D366] hover:text-[#128C7E] transition-colors"
                          title="Message Customer on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 max-w-[200px] leading-relaxed bg-gray-50 p-2 rounded-md">
                      {order.customerDetails?.address}<br/>
                      {order.customerDetails?.city}, {order.customerDetails?.state} {order.customerDetails?.zipCode}<br/>
                      {order.customerDetails?.country}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-[var(--color-primary)]">
                    ₹{order.totalAmount}
                  </td>
                  <td className="p-4">
                    {order.paymentScreenshotUrl ? (
                      <button 
                        onClick={() => setSelectedImage(order.paymentScreenshotUrl)}
                        className="flex items-center text-sm text-blue-500 hover:underline"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View Image
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">No image</span>
                    )}
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                        order.paymentStatus === 'verified' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        Payment: {order.paymentStatus}
                      </span>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order.id, 'orderStatus', e.target.value)}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 outline-none w-fit cursor-pointer ${
                          order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.orderStatus === 'delivered' ? 'bg-purple-100 text-purple-800' :
                          order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>

                      <div className="mt-2 pt-2 border-t border-gray-100">
                        {editingCourier === order.id ? (
                          <div className="flex flex-col gap-2">
                            <input 
                              type="text" 
                              placeholder="Tracking No." 
                              className="text-xs p-1 border rounded"
                              value={courierData.trackingNumber}
                              onChange={e => setCourierData({...courierData, trackingNumber: e.target.value})}
                            />
                            <input 
                              type="number" 
                              placeholder="Courier Cost (₹)" 
                              className="text-xs p-1 border rounded"
                              value={courierData.courierCost}
                              onChange={e => setCourierData({...courierData, courierCost: e.target.value})}
                            />
                            <div className="flex gap-1">
                              <button onClick={() => handleSaveCourier(order)} className="text-green-600 bg-green-50 p-1 rounded hover:bg-green-100"><Save className="w-4 h-4"/></button>
                              <button onClick={() => setEditingCourier(null)} className="text-red-600 bg-red-50 p-1 rounded hover:bg-red-100"><X className="w-4 h-4"/></button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 group relative">
                            {order.trackingNumber ? (
                              <>
                                <p className="flex items-center gap-1"><Truck className="w-3 h-3"/> {order.trackingNumber}</p>
                                <p>Cost: ₹{order.courierCost}</p>
                              </>
                            ) : (
                              <p className="italic">No tracking info</p>
                            )}
                            <button 
                              onClick={() => {
                                setEditingCourier(order.id);
                                setCourierData({ trackingNumber: order.trackingNumber || '', courierCost: order.courierCost?.toString() || '' });
                              }}
                              className="absolute top-0 right-0 p-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right align-top">
                    <div className="flex flex-col items-end gap-2">
                      {order.paymentStatus === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'paymentStatus', 'verified')}
                            className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100" title="Approve Payment"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'paymentStatus', 'rejected')}
                            className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100" title="Reject Payment"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      
                      {(order.paymentStatus === 'pending' || order.paymentStatus === 'rejected') && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleCopyRepaymentLink(order.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                            title="Copy Link"
                          >
                            <Copy className="w-3.5 h-3.5" /> Link
                          </button>
                          <button 
                            onClick={() => handleEmailRepaymentLink(order)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-lg transition-colors border border-[var(--color-primary)]/20"
                            title="Email Link"
                          >
                            <Mail className="w-3.5 h-3.5" /> Email
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Payment Proof" className="max-w-full max-h-[90vh] rounded-lg" />
        </div>
      )}
    </div>
  );
}
