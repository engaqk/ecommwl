"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2, CheckCircle2, ArrowLeft, ImagePlus, X, User, LogIn } from "lucide-react";
import Link from "next/link";

// Compress + convert image to base64 (JPEG, max 800px, 70% quality ≈ ~80-150KB each)
const compressToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, userData, initializeAuthListener, loading: authLoading } = useAuthStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const isLoggedIn = !!user;

  useEffect(() => { initializeAuthListener(); }, [initializeAuthListener]);

  useEffect(() => {
    if (isLoggedIn) {
      setName(userData?.displayName || user?.displayName || user?.email?.split("@")[0] || "");
    }
  }, [isLoggedIn, userData, user]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docSnap = await getDoc(doc(db, "products", productId));
        if (docSnap.exists()) setProduct({ id: docSnap.id, ...docSnap.data() });
        else router.push("/shop");
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (productId) fetchProduct();
  }, [productId, router]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    const combined = [...photos, ...files].slice(0, 4);
    setPhotos(combined);
    // Generate previews
    const previews: string[] = [];
    combined.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        previews.push(ev.target?.result as string);
        if (previews.length === combined.length) setPhotoPreviews([...previews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please pick a star rating."); return; }
    if (!content.trim()) { setError("Please write your review."); return; }
    if (!isLoggedIn && !name.trim()) { setError("Please enter your name."); return; }
    setError("");
    setSubmitting(true);

    try {
      // Convert each photo to compressed base64 — stored directly in Firestore
      const photoBase64: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        setUploadProgress(`Processing photo ${i + 1} of ${photos.length}...`);
        const b64 = await compressToBase64(photos[i]);
        photoBase64.push(b64);
      }

      setUploadProgress("Saving review...");
      await addDoc(collection(db, "reviews"), {
        productId,
        productName: product?.title || "",
        name: isLoggedIn
          ? (userData?.displayName || user?.displayName || user?.email?.split("@")[0] || name.trim())
          : name.trim(),
        email: isLoggedIn ? (user?.email || "") : (email.trim() || ""),
        title: title.trim(),
        content: content.trim(),
        rating,
        photos: photoBase64,   // base64 strings — no Storage, no CORS
        verified: isLoggedIn,
        userId: isLoggedIn ? user?.uid : null,
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress("");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F7]">
        <Loader2 className="w-10 h-10 animate-spin text-[#B76E79]" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FFF8F7] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-[#B76E79]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-[#B76E79]" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#4A2533] mb-3">Thank You!</h2>
          <p className="text-gray-400 mb-8 font-light leading-relaxed text-sm">
            Your review is live and will help other customers discover this product.
          </p>
          <Link href={`/shop/${productId}`} className="inline-flex items-center justify-center px-8 py-4 bg-[#4A2533] text-white rounded-full text-xs font-bold tracking-[3px] uppercase hover:bg-[#B76E79] transition-colors">
            Back to Product
          </Link>
        </motion.div>
      </div>
    );
  }

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"];

  return (
    <div className="min-h-screen bg-[#FFF8F7]">
      {/* Header */}
      <div className="text-center pt-10 pb-6 border-b border-[#f0e6e7]">
        <Link href="/" className="inline-block">
          <span className="text-2xl font-serif text-[#4A2533] font-bold tracking-tight">
            SHAZA<span className="text-[#B76E79] text-sm ml-1 align-top">53</span>
          </span>
          <div className="text-[8px] font-sans uppercase tracking-[6px] text-gray-400 mt-1">Creation</div>
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-5 py-10">
        <Link href={`/shop/${productId}`} className="inline-flex items-center text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-[#4A2533] transition-colors mb-8">
          <ArrowLeft className="w-3 h-3 mr-2" /> Back
        </Link>

        {/* Product Card */}
        {product && (
          <div className="flex items-center gap-4 bg-white border border-[#f0e6e7] rounded-2xl p-4 mb-8 shadow-sm">
            <img src={product.image} alt={product.title} className="w-16 h-16 object-contain rounded-xl bg-[#FFF8F7] p-1 border border-[#f0e6e7] shrink-0" />
            <div>
              <p className="text-[10px] text-[#B76E79] font-bold uppercase tracking-[3px] mb-0.5">{product.category}</p>
              <h2 className="text-base font-serif font-bold text-[#4A2533] leading-tight">{product.title}</h2>
            </div>
          </div>
        )}

        {/* User Status Badge */}
        <div className={`flex items-center gap-2 text-xs font-bold rounded-full px-4 py-2 mb-8 w-fit ${isLoggedIn ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
          {isLoggedIn
            ? <><User className="w-3 h-3" /> Reviewing as {userData?.displayName || user?.displayName || user?.email?.split("@")[0]} &nbsp;·&nbsp; <span className="text-green-600">Verified Buyer</span></>
            : <><LogIn className="w-3 h-3" /> Guest &nbsp;·&nbsp; <Link href="/login" className="underline text-[#B76E79]">Sign in</Link> for Verified tag</>
          }
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3 bg-red-50 border border-red-100 text-red-500 text-xs rounded-xl text-center">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ⭐ Star Rating */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-[3px] font-bold text-gray-400 mb-5">How would you rate it?</p>
            <div className="flex justify-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95">
                  <Star className={`w-12 h-12 transition-all duration-150 ${star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" : "text-gray-200 fill-gray-200"}`} />
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {(hoveredRating || rating) > 0 && (
                <motion.span key={hoveredRating || rating} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm font-bold text-[#4A2533]">
                  {ratingLabels[hoveredRating || rating]}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Review Text */}
          <div>
            <textarea required value={content} onChange={e => setContent(e.target.value)}
              placeholder="Tell us what you loved — quality, packaging, style, how it looked in real life..."
              rows={5} maxLength={1000}
              className="w-full border-2 border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-[#B76E79] transition-colors bg-white text-[#4A2533] text-sm resize-none leading-relaxed placeholder:text-gray-300" />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-300">Share your honest experience</span>
              <span className="text-xs text-gray-300">{content.length}/1000</span>
            </div>
          </div>

          {/* Title (optional) */}
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Give your review a title (optional)" maxLength={80}
            className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[#B76E79] transition-colors bg-transparent text-[#4A2533] text-sm placeholder:text-gray-300" />

          {/* Name — guests only */}
          {!isLoggedIn && (
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name *"
              className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[#B76E79] transition-colors bg-transparent text-[#4A2533] text-sm placeholder:text-gray-300" />
          )}

          {/* Email — guests only, optional */}
          {!isLoggedIn && (
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email (optional — never published)"
              className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[#B76E79] transition-colors bg-transparent text-[#4A2533] text-sm placeholder:text-gray-300" />
          )}

          {/* Photo Upload */}
          <div>
            <p className="text-xs uppercase tracking-[3px] font-bold text-gray-400 mb-3">
              Add Photos <span className="normal-case tracking-normal font-normal text-gray-300">(optional · up to 4)</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {photoPreviews.map((preview, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#f0e6e7] group">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < 4 && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-[#B76E79]/30 flex flex-col items-center justify-center gap-1 text-[#B76E79]/50 hover:border-[#B76E79] hover:text-[#B76E79] transition-colors bg-white">
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wide">Photo</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
            {photos.length > 0 && (
              <p className="text-xs text-gray-300 mt-2">{photos.length} photo{photos.length > 1 ? 's' : ''} selected · compressed before saving</p>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting || rating === 0}
            className="w-full py-4 bg-[#4A2533] text-white rounded-full font-bold uppercase tracking-[3px] text-xs hover:bg-[#B76E79] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {uploadProgress || "Submitting..."}</>
              : "Submit Review"
            }
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-300 mt-6">Your review is public. Email is never shown.</p>
      </div>
    </div>
  );
}
