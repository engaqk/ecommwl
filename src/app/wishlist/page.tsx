"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { HeartOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const { t } = useTranslation();

  return (
    <div className="bg-[#fdfbf7] min-h-screen pt-24 pb-32 px-6">
      <div className="max-w-[1200px] mx-auto">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-navy)] font-bold mb-4">My Wishlist</h1>
          <div className="w-12 h-[2px] bg-[var(--color-primary)] mx-auto"></div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <HeartOff className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-bold text-[var(--color-navy)] mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Save your favorite bags here to quickly find them later when you're ready to buy.</p>
            <Link 
              href="/shop" 
              className="inline-flex items-center px-8 py-4 bg-[var(--color-navy)] text-white font-bold rounded-full hover:bg-[var(--color-primary)] transition-colors uppercase tracking-widest text-sm"
            >
              Discover Bags <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {items.map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group flex flex-col bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                >
                  <Link href={`/shop/${product.id}`} className="block relative overflow-hidden rounded-2xl mb-4 bg-gray-50 aspect-[4/5]">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-full object-contain p-4 transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  
                  <div className="flex-1 px-2 flex flex-col">
                    <Link href={`/shop/${product.id}`}>
                      <h3 className="font-serif font-bold text-lg text-[var(--color-navy)] hover:text-[var(--color-primary)] transition-colors line-clamp-1">{product.title}</h3>
                    </Link>
                    <p className="text-xl font-bold text-gray-500 mb-4 mt-1">₹{product.price}</p>
                    
                    <div className="mt-auto space-y-2">
                      <button 
                        onClick={() => addItem(product as any)}
                        className="w-full py-3 bg-[var(--color-navy)] text-white rounded-lg text-xs font-bold tracking-[2px] uppercase hover:bg-[var(--color-primary)] transition-colors"
                      >
                        {t("add_to_cart") || "Add to Cart"}
                      </button>
                      <button 
                        onClick={() => removeItem(product.id)}
                        className="w-full py-3 bg-red-50 text-red-500 rounded-lg text-xs font-bold tracking-[2px] uppercase hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
