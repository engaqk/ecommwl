"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Paintbrush, Calendar, User, Scissors, Palette, Quote, ArrowLeft, Download, Shield, Loader2 } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CustomRequestViewPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        if (!params.id) return;
        const docRef = doc(db, "customOrders", params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRequest({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push("/custom");
        }
      } catch (error) {
        console.error("Error fetching custom request", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!request) return null;

  const date = request.createdAt?.toDate ? request.createdAt.toDate().toLocaleDateString() : 'Unknown Date';

  return (
    <div className="bg-[#fdfbf7] min-h-screen pt-24 pb-32 px-6">
      <div className="max-w-[1000px] mx-auto">
        <Link 
          href="/custom" 
          className="flex items-center text-gray-500 hover:text-[var(--color-navy)] transition-colors mb-12 uppercase text-xs tracking-widest font-bold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Custom Studio
        </Link>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--color-navy)] p-8 md:p-12 flex flex-col md:flex-row items-center md:justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <Paintbrush className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <div>
                <h1 className="text-3xl font-serif text-white font-bold mb-2">Custom Design Request</h1>
                <p className="text-[var(--color-primary)] font-bold tracking-widest uppercase text-xs flex items-center">
                  #{request.id.slice(0, 8)}
                </p>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-4">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm">
                <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Requested On</p>
                  <p className="text-white font-medium text-sm">{date}</p>
                </div>
              </div>
              <ShareButton 
                title={`Custom Design Request #${request.id.slice(0, 8)}`} 
                text={`Check out my custom bag design request on Shaza53 Creation!`}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              />
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Left Col: Details */}
              <div className="space-y-10">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[3px] mb-6 flex items-center gap-2">
                    Customer Details
                    <Shield className="w-4 h-4 text-green-500" />
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-gray-700 bg-gray-50 p-4 rounded-2xl">
                      <User className="w-5 h-5 text-[var(--color-primary)]" />
                      <span className="font-medium">{request.customerName}</span>
                    </div>
                    <p className="text-xs text-gray-400 italic">Contact details are hidden for privacy.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[3px] mb-6">Design Requirements</h3>
                  <div className="bg-[#fdfbf7] p-6 rounded-2xl border border-[var(--color-primary)]/20 shadow-inner">
                    <p className="text-[var(--color-navy)] font-serif leading-relaxed whitespace-pre-wrap text-lg">
                      {request.requirements || "No specific text requirements provided. Refer to image."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Col: Image */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[3px] mb-6">Reference Image</h3>
                {request.referenceImage ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-md bg-gray-50"
                  >
                    <img 
                      src={request.referenceImage} 
                      alt="Custom Design Reference" 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ) : (
                  <div className="w-full aspect-square rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <Paintbrush className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-medium">No reference image provided</p>
                  </div>
                )}
                
                <div className="mt-8 flex justify-center">
                  <div className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest ${
                    request.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                    request.status === 'quoted' ? 'bg-blue-100 text-blue-600' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Status: {request.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
