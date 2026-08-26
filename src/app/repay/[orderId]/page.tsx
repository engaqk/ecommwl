"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { Upload, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { logSystemEvent } from "@/lib/audit";

export default function RepaymentPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", orderId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

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

  const handleSubmit = async () => {
    if (!file || !order) return;
    setIsSubmitting(true);

    try {
      const base64Image = await compressImage(file);
      
      await updateDoc(doc(db, "orders", orderId as string), {
        paymentScreenshotUrl: base64Image,
        paymentStatus: "pending"
      });

      await logSystemEvent("PAYMENT_STATUS_UPDATED", `Repayment submitted for Order ${orderId}`, order.customerDetails?.fullName || "customer");

      setSuccess(true);
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to submit repayment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" /></div>;
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-orange-400 mb-4" />
        <h1 className="text-2xl font-bold text-[var(--color-navy)] mb-2">Order Not Found</h1>
        <p className="text-gray-500 max-w-md">The order link you clicked seems to be invalid or expired.</p>
      </div>
    );
  }

  if (order.paymentStatus === "verified" || success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-4">Payment {success ? "Submitted" : "Verified"}!</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {success 
            ? "Your new payment proof has been successfully submitted and is under review."
            : "Your payment for this order has already been successfully verified. No further action is required."}
        </p>
        <button onClick={() => router.push("/")} className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold">
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-2">Complete Your Payment</h1>
          <p className="text-gray-500">Order #{orderId}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* QR Code Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-orange-100">
            <div className="bg-orange-50 text-orange-600 p-3 rounded-lg mb-6 text-sm font-medium">
              Your previous payment was not confirmed. Please ensure you transfer the exact amount and upload a clear screenshot.
            </div>
            
            <h2 className="text-xl font-semibold mb-2 text-[var(--color-navy)]">Scan to Pay</h2>
            <p className="text-gray-500 mb-6 text-sm">Pay securely via UPI (Google Pay, PhonePe, Paytm)</p>
            
            <div className="bg-gray-50 p-6 rounded-2xl inline-block mb-6 border-2 border-dashed border-gray-200">
              <img src="/payment-qr.jpg" alt="Payment QR Code" className="w-48 h-48 mx-auto mix-blend-multiply object-contain" />
            </div>
            
            <div className="bg-[var(--color-navy)]/5 p-4 rounded-xl">
              <p className="text-lg text-[var(--color-navy)] font-medium">Amount Due</p>
              <p className="text-3xl font-bold text-[var(--color-primary)] mt-1">₹{order.totalAmount}</p>
            </div>
          </div>

          {/* Upload Screenshot Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-4 text-[var(--color-navy)]">Upload New Proof</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Please upload a screenshot of your successful transaction.
            </p>

            <div className="mb-8">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-[var(--color-primary)] border-dashed rounded-xl cursor-pointer bg-[var(--color-background)] hover:bg-[#f4ecd8] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  {file ? (
                    <p className="text-[var(--color-navy)] font-medium break-all">{file.name}</p>
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
              onClick={handleSubmit}
              className={`w-full py-4 text-white rounded-xl font-bold flex items-center justify-center transition-colors ${
                !file || isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-[var(--color-success)] hover:bg-[var(--color-success-dark)]"
              }`}
            >
              {isSubmitting ? <><Loader2 className="animate-spin mr-2 w-5 h-5" /> Submitting...</> : "Submit Payment Proof"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
