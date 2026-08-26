"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, ShieldCheck, Truck, RotateCcw, Heart, Share2, Star, ClipboardCopy } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCurrencyFormatter } from "@/store/useCurrencyStore";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { addItem } = useCartStore();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyFormatter();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const [reviewLinkCopied, setReviewLinkCopied] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.8)' });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.title} added to cart!`, {
      style: {
        borderRadius: '10px',
        background: '#1a2b4c',
        color: '#fff',
      },
      iconTheme: {
        primary: '#c9a263',
        secondary: '#fff',
      }
    });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params.id) return;
        const docRef = doc(db, "products", params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const prodData: any = { id: docSnap.id, ...docSnap.data() };
          setProduct(prodData);

          // Fetch related products in the same category
          if (prodData.category && typeof window !== 'undefined') {
            const currentStoreId = window.location.pathname.split('/')[1] || 'my-store';
            const q = query(
              collection(db, "products"), 
              where("category", "==", prodData.category),
              where("storeId", "==", currentStoreId),
              limit(4)
            );
            const relatedSnap = await getDocs(q);
            const related = relatedSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(p => p.id !== docSnap.id);
            setRelatedProducts(related);
          }

          // Fetch real reviews for this product
          const reviewsQ = query(
            collection(db, "reviews"),
            where("productId", "==", docSnap.id),
            orderBy("createdAt", "desc")
          );
          const reviewsSnap = await getDocs(reviewsQ);
          setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          router.push("/shop"); // Not found
        }
      } catch (error) {
        console.error("Error fetching product details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-[#fdfbf7] min-h-screen pt-24 pb-32 px-6">
      <div className="max-w-[1200px] mx-auto">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-500 hover:text-[var(--color-navy)] transition-colors mb-12 uppercase text-xs tracking-widest font-bold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-full aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex items-center justify-center cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-full object-contain p-8 transition-transform duration-200 ease-out"
              style={zoomStyle}
            />
            {product.stock <= 0 && (
              <div className="absolute top-6 left-6 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest z-10">
                Out of Stock
              </div>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <div className="absolute top-6 left-6 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest z-10 shadow-lg animate-pulse">
                Only {product.stock} Left!
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-[4px]">
                {product.category || "Artisan Collection"}
              </span>
              <ShareButton 
                title={product.title} 
                text={`Check out this amazing ${product.title} from Shaza53 Creation!`} 
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-navy)] font-bold leading-tight mb-4">
              {product.title}
            </h1>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-light text-gray-900">{formatPrice(product.price)}</span>
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-sm text-gray-500 underline cursor-pointer">12 Reviews</span>
            </div>


            <div className="prose text-gray-500 font-light mb-10 leading-relaxed">
              <p>
                Handcrafted with precision and elegance. This piece is designed to be your perfect companion, seamlessly blending luxury with everyday practicality. Elevate your wardrobe instantly.
              </p>
            </div>

            <div className="flex gap-4 mb-12">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-5 bg-[var(--color-navy)] text-white rounded-full font-bold uppercase tracking-[3px] text-sm hover:bg-[var(--color-primary)] transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden group"
              >
                <span className="relative z-10">{product.stock <= 0 ? "Out of Stock" : t("add_to_cart") || "Add to Cart"}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button
                onClick={() => {
                  const url = window.location.href;
                  if (navigator.share) {
                    navigator.share({
                      title: product.title,
                      text: `Check out ${product.title} from Shaza53 Creation!`,
                      url: url,
                    }).catch((error) => console.log('Error sharing', error));
                  } else {
                    navigator.clipboard.writeText(url);
                    alert("Product link copied to clipboard!");
                  }
                }}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors shadow-sm"
                title="Share this product"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-gray-200">
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="w-6 h-6 text-[var(--color-primary)] mb-2" />
                <h4 className="text-sm font-bold text-[var(--color-navy)]">Secure Payment</h4>
                <p className="text-xs text-gray-500 mt-1">100% encrypted</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-[var(--color-primary)] mb-2" />
                <h4 className="text-sm font-bold text-[var(--color-navy)]">Fast Shipping</h4>
                <p className="text-xs text-gray-500 mt-1">Direct to your door</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-24 pt-16 border-t border-gray-200">
          {(() => {
            const defaultReviews = [
              { id: '__d1', name: "Fatima R.", date: "3 weeks ago", title: "Absolutely Stunning!", content: "The craftsmanship on this bag is beyond words. The yarn is so thick and premium, and the rose gold hardware gives it such a luxury feel. I get compliments every time I step out!", rating: 5, verified: true },
              { id: '__d2', name: "Priya R.", date: "1 month ago", title: "Perfect everyday bag", content: "I was worried it wouldn't hold its shape, but it's incredibly structured and sturdy. The color is exactly as pictured. Worth every penny.", rating: 5, verified: true },
              { id: '__d3', name: "Sarah M.", date: "6 weeks ago", title: "Luxury in every stitch", content: "This is my second purchase from Shaza53 and they never disappoint. The unboxing experience itself feels so high-end.", rating: 5, verified: true },
            ];
            const allReviews = [...reviews, ...defaultReviews];
            const avgRating = (allReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / allReviews.length);
            return (
              <div className="flex flex-col md:flex-row gap-16">
                <div className="md:w-1/3">
                  <h3 className="text-3xl font-serif text-[var(--color-navy)] font-bold mb-6">Customer Reviews</h3>

                  {/* Average Rating */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-6xl font-light text-[var(--color-navy)]">{avgRating.toFixed(1)}</div>
                    <div>
                      <div className="flex text-yellow-400 mb-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? 'fill-current' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">Based on {allReviews.length} reviews</div>
                    </div>
                  </div>

                  {/* Write Review Button */}
                  <Link
                    href={`/review/${product?.id}`}
                    className="block w-full py-4 text-center border-2 border-[var(--color-navy)] text-[var(--color-navy)] rounded-xl font-bold uppercase tracking-[2px] text-xs hover:bg-[var(--color-navy)] hover:text-white transition-colors mb-3"
                  >
                    Write a Review
                  </Link>

                  {/* Copy Review Link */}
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/review/${product?.id}`;
                      navigator.clipboard.writeText(link);
                      setReviewLinkCopied(true);
                      setTimeout(() => setReviewLinkCopied(false), 2500);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold uppercase tracking-[2px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    <ClipboardCopy className="w-4 h-4" />
                    {reviewLinkCopied ? "Link Copied! ✓" : "Copy Review Link"}
                  </button>
                  <p className="text-xs text-gray-400 mt-2 text-center">Share this link with customers to collect reviews</p>
                </div>

                <div className="md:w-2/3 space-y-8">
                  {/* Real reviews first, then 3 default reviews — same UI, no distinction */}
                  {allReviews.map((review, idx) => (
                    <div key={review.id || idx} className="border-b border-gray-100 pb-8 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex text-yellow-400 mb-1">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-3 h-3 ${i <= (review.rating || 5) ? 'fill-current' : 'fill-gray-200 text-gray-200'}`} />
                            ))}
                          </div>
                          {review.title && <h4 className="font-bold text-[var(--color-navy)]">{review.title}</h4>}
                        </div>
                        <span className="text-xs text-gray-400">
                          {review.createdAt?.toDate
                            ? new Date(review.createdAt.toDate()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : review.date || 'Recently'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-light leading-relaxed mb-3">{review.content}</p>
                      {/* Review photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {review.photos.map((url: string, pIdx: number) => (
                            <a key={pIdx} href={url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={url}
                                alt={`Review photo ${pIdx + 1}`}
                                className="w-20 h-20 object-cover rounded-xl border border-[#f0e6e7] hover:opacity-90 transition-opacity cursor-zoom-in"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {review.name}
                        {review.verified
                          ? <span className="ml-2 text-[10px] bg-green-50 text-green-600 border border-green-200 rounded-full px-2 py-0.5 normal-case tracking-normal font-semibold">✓ Verified Buyer</span>
                          : <span className="ml-2 text-[10px] text-gray-300 normal-case tracking-normal font-normal">Guest Review</span>
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-20 border-t border-gray-200">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-serif text-[var(--color-navy)] font-bold mb-4">You May Also Like</h3>
              <div className="w-12 h-[2px] bg-[var(--color-primary)] mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(prod => (
                <Link key={prod.id} href={`/shop/${prod.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl mb-4 bg-white border border-gray-100 aspect-square flex items-center justify-center p-4">
                    <img 
                      src={prod.image} 
                      alt={prod.title}
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="text-center">
                    <h4 className="font-serif text-[var(--color-navy)] font-bold text-lg mb-1">{prod.title}</h4>
                    <p className="text-gray-500 text-sm tracking-widest font-light">₹{prod.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
