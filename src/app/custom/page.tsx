"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X, Loader2, Link2, Copy, CheckCircle, Paintbrush } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CustomDesignPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [requirements, setRequirements] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
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
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !requirements) {
      toast.error("Please provide an image or detailed requirements");
      return;
    }

    setIsSubmitting(true);
    try {
      let base64Image = null;
      if (file) {
        base64Image = await compressImage(file);
      }

      const docRef = await addDoc(collection(db, "customOrders"), {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        requirements: requirements,
        referenceImage: base64Image,
        status: "pending",
        createdAt: serverTimestamp()
      });

      setShareId(docRef.id);
      toast.success("Custom design request submitted successfully!");
    } catch (error) {
      console.error("Error submitting custom design", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = () => {
    if (shareId) {
      const url = `${window.location.origin}/custom/${shareId}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (shareId) {
    return (
      <div className="bg-[var(--color-background)] min-h-screen pt-32 pb-24 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-[var(--color-primary)]/20"
        >
          <div className="w-20 h-20 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[var(--color-navy)] mb-4">Request Received!</h2>
          <p className="text-gray-500 mb-8 font-light">
            Our artisans will review your custom design request and get back to you with a quote shortly.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 relative">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Your Shareable Link</p>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
              <Link2 className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/custom/${shareId}`} 
                className="w-full outline-none text-sm text-gray-600 bg-transparent truncate"
              />
              <button 
                onClick={copyLink}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[var(--color-navy)]"
                title="Copy Link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/" className="flex-1 py-4 border border-[var(--color-navy)] text-[var(--color-navy)] rounded-full font-bold uppercase tracking-wider text-xs hover:bg-gray-50 transition-colors">
              Return Home
            </Link>
            <Link href={`/custom/${shareId}`} className="flex-1 py-4 bg-[var(--color-navy)] text-white rounded-full font-bold uppercase tracking-wider text-xs hover:bg-[var(--color-primary)] transition-colors shadow-lg">
              View Request
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfbf7] min-h-screen pt-24 pb-32">
      {/* Header Banner */}
      <div className="bg-[var(--color-navy)] text-white py-16 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-navy)] to-[#1a2b4c] z-0"></div>
        
        {/* Abstract shapes for premium feel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center border border-[var(--color-primary)]/30 backdrop-blur-sm">
              <Paintbrush className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 font-serif text-white">Custom Design Studio</h1>
          <p className="text-white/80 text-lg md:text-xl font-light">
            Bring your dream bag to life. Upload an inspiration photo or describe your perfect accessory, and our artisans will craft it exclusively for you.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <form onSubmit={handleSubmit} className="space-y-12 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 relative z-20 -mt-12">
          
          {/* Contact Info */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif text-[var(--color-navy)] font-bold flex items-center">
                <span className="w-8 h-8 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                Your Information
              </h3>
              <p className="text-sm text-gray-500 hidden md:block">Need help? Call us at <a href="tel:+919238940366" className="font-bold text-[var(--color-primary)] hover:underline">+91 92389 40366</a></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent text-[var(--color-navy)]"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent text-[var(--color-navy)]"
                  placeholder="jane@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent text-[var(--color-navy)]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Design Details */}
          <div>
            <h3 className="text-xl font-serif text-[var(--color-navy)] font-bold mb-6 flex items-center">
              <span className="w-8 h-8 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center mr-3 text-sm">2</span>
              Design Inspiration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Reference Image (Optional)</label>
                
                <div className="relative">
                  {!preview ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-[var(--color-primary)] transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        <Upload className="w-10 h-10 text-gray-400 group-hover:text-[var(--color-primary)] mb-3 transition-colors" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-[var(--color-primary)]">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  ) : (
                    <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-md group border border-gray-200">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button"
                          onClick={() => { setFile(null); setPreview(null); }}
                          className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Specific Requirements *</label>
                <textarea 
                  required={!file}
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  className="w-full h-64 border border-gray-200 rounded-2xl p-4 outline-none focus:border-[var(--color-primary)] transition-colors bg-gray-50/50 resize-none text-[var(--color-navy)]"
                  placeholder="Describe your dream bag...&#10;&#10;E.g., I want a chunky yarn tote bag in emerald green with gold hardware. I'd love a pearl handle similar to the one in the photo I attached."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting || (!file && !requirements)}
              className="px-12 py-5 bg-[var(--color-navy)] text-white rounded-full font-bold uppercase tracking-[3px] text-sm hover:bg-[var(--color-primary)] transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-3" /> Submitting...</>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
