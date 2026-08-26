"use client";

import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, Upload, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { logSystemEvent } from "@/lib/audit";

export default function PaymentPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = sessionStorage.getItem("checkoutData");
    if (!data || items.length === 0) {
      if (!orderConfirmed) router.push("/");
    } else {
      setCheckoutData(JSON.parse(data));
    }
  }, [items, router, orderConfirmed]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleConfirmOrder = async () => {
    if (!file || !checkoutData) return;
    setIsSubmitting(true);

    try {
      // 1. Compress image to Base64 (to fit well within Firestore 1MB limit)
      const base64Image = await compressImage(file);

      // Calculate total cost
      const totalCost = items.reduce((acc, item) => acc + ((item as any).costPrice || item.price * 0.6) * item.quantity, 0);
      const totalAmount = totalPrice();
      const netProfit = totalAmount - totalCost;

      // 2. Save order to Firestore directly with Base64 image string
      const docRef = await addDoc(collection(db, "orders"), {
        userId: user?.uid || null,
        customerDetails: checkoutData,
        items: items,
        totalAmount,
        totalCost,
        netProfit,
        paymentScreenshotUrl: base64Image,
        paymentStatus: "pending", // pending, verified, rejected
        orderStatus: "processing", // processing, shipped, delivered
        createdAt: serverTimestamp()
      });

      await logSystemEvent("ORDER_PLACED", `New order placed for ₹${totalAmount} by ${checkoutData.fullName}`, user?.uid || "guest");

      // 3. Send Confirmation Email
      if (checkoutData.email) {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ORDER_CONFIRMATION',
            to: checkoutData.email,
            orderId: docRef.id,
            data: {
              customerName: checkoutData.fullName,
              totalAmount: totalAmount,
              storeUrl: window.location.origin,
              items: items
            }
          })
        }).catch(err => console.error("Failed to send order confirmation email", err));
      }

      // 4. Update user profile with latest shipping address if logged in
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          phone: checkoutData.phone,
          address: checkoutData.address,
          country: checkoutData.country,
          displayName: checkoutData.fullName,
        }, { merge: true });
      }

      // 3. Clear cart and show success
      clearCart();
      sessionStorage.removeItem("checkoutData");
      setOrderConfirmed(true);

    } catch (error) {
      console.error("Error submitting order:", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || (!checkoutData && !orderConfirmed)) return null;

  if (orderConfirmed) {
    return (
      <div className="bg-[var(--color-background)] min-h-screen py-24 flex items-center justify-center px-6">
        <div className="bg-white p-12 rounded-3xl shadow-lg max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-4">Order Received!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for shopping at Shaza Creation. Your payment screenshot is under verification. We will notify you once confirmed and shipped!
          </p>
          <button 
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-8">Complete Payment</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* QR Code Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-2 text-[var(--color-navy)]">Scan to Pay</h2>
            <p className="text-gray-500 mb-6 text-sm">Pay securely via UPI (Google Pay, PhonePe, Paytm)</p>
            
            <div className="bg-gray-50 p-6 rounded-2xl inline-block mb-6 border-2 border-dashed border-gray-200">
              <img 
                src="/payment-qr.jpg"
                alt="Payment QR Code"
                className="w-48 h-48 mx-auto mix-blend-multiply object-contain"
              />
            </div>
            
            <div className="bg-[var(--color-navy)]/5 p-4 rounded-xl">
              <p className="text-lg text-[var(--color-navy)] font-medium">Amount to Pay</p>
              <p className="text-3xl font-bold text-[var(--color-primary)] mt-1">₹{totalPrice()}</p>
            </div>
          </div>

          {/* Upload Screenshot Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-4 text-[var(--color-navy)]">Upload Payment Proof</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Once you've made the payment, please upload a screenshot of the successful transaction to confirm your order.
            </p>

            <div className="mb-8">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-[var(--color-primary)] border-dashed rounded-xl cursor-pointer bg-[var(--color-background)] hover:bg-[#f4ecd8] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <p className="text-[var(--color-navy)] font-medium">{file.name}</p>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-[var(--color-primary)] mb-3" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-[var(--color-primary)]">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-400">PNG, JPG, JPEG</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <button 
              disabled={!file || isSubmitting}
              onClick={handleConfirmOrder}
              className={`w-full py-4 text-white rounded-xl font-bold flex items-center justify-center transition-colors ${
                !file || isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-[var(--color-success)] hover:bg-[var(--color-success-dark)]"
              }`}
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin mr-2 w-5 h-5" /> Verifying...</>
              ) : (
                "Confirm Payment & Place Order"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
