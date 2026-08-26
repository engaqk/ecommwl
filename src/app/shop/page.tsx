"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Heart, Star } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { useTenantStore } from "@/store/useTenantStore";

const categories = ["All", "Handbags", "Totes", "Bucket Bags", "Clutches", "Crossbody", "Boho"];

export default function ShopPage() {
  const { t } = useTranslation();
  const { addItem } = useCartStore();
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const { store } = useTenantStore();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!store?.id) return;
      try {
        const q = query(collection(db, "products"), where("storeId", "==", store.id));
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [store?.id]);

  // Filter and Sort Logic
  const filteredProducts = products
    .filter(p => selectedCategory === "All" || p.category === selectedCategory)
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .filter(p => p.price <= maxPrice)
    .sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      return (b.rating || 5) - (a.rating || 5);
    });

  return (
    <div className="bg-[#fdfbf7] min-h-screen">
      {/* Header */}
      <div className="bg-[var(--color-navy)] text-white py-8 md:py-24 text-center px-6">
        <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-2 md:mb-4 font-serif">{t("curated_collection")}</h1>
        <p className="text-white/80 max-w-2xl mx-auto text-sm md:text-xl font-light">
          {t("shop_subtitle")}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-6 md:py-12">
        {/* Toolbar: Search, Filter, Sort */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6 md:mb-12">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder={t("search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full py-3 pl-12 pr-4 outline-none focus:border-[var(--color-primary)] transition-colors shadow-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-4">
            
            {/* Price Filter */}
            <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-full py-2 px-4 shadow-sm min-w-[200px] w-full sm:w-auto">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider whitespace-nowrap">Max: ₹{maxPrice}</span>
              <input 
                type="range" 
                min="0" 
                max="10000" 
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
              />
            </div>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-white border border-gray-200 rounded-full py-3 px-4 outline-none focus:border-[var(--color-primary)] transition-colors shadow-sm max-w-full truncate"
            >
              <option value="popular">{t("sort_popular") || "Popularity"}</option>
              <option value="price_low">{t("sort_price_low") || "Price: Low to High"}</option>
              <option value="price_high">{t("sort_price_high") || "Price: High to Low"}</option>
            </select>
          </div>
        </div>

        {/* Categories (Pills) */}
        <div className="flex overflow-x-auto scrollbar-hide gap-3 mb-6 md:mb-12 pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat 
                  ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/30" 
                  : "bg-white text-[var(--color-navy)] border border-gray-200 hover:border-[var(--color-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group flex flex-col bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-transparent hover:border-[var(--color-primary)]/20"
                >
                  <div className="relative overflow-hidden rounded-2xl mb-4 bg-gray-50 aspect-square group/img">
                    <Link href={`/shop/${product.id}`} className="w-full h-full block">
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-full object-contain p-4 transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Wishlist Button */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        if (isInWishlist(product.id)) {
                          removeWishlist(product.id);
                          toast.error("Removed from wishlist");
                        } else {
                          addWishlist(product);
                          toast.success("Added to wishlist!", { icon: '❤️' });
                        }
                      }}
                      className="absolute top-4 right-4 z-20 p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 opacity-100 group/btn border border-gray-100"
                    >
                      <Heart 
                        className={`w-5 h-5 transition-colors ${
                          isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-400 group-hover/btn:text-red-500"
                        }`} 
                      />
                    </button>
                  </div>
                  
                  <div className="flex-1 px-2">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold text-[var(--color-primary)] tracking-wider uppercase">{product.category}</p>
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="ml-1 text-xs font-bold">{product.rating}</span>
                      </div>
                    </div>
                    <Link href={`/shop/${product.id}`}>
                      <h3 className="font-serif font-bold text-lg text-[var(--color-navy)] hover:text-[var(--color-primary)] transition-colors">{product.title}</h3>
                    </Link>
                    <p className="text-xl font-bold text-gray-500 mb-4">₹{product.price}</p>
                    <button 
                      onClick={() => {
                        addItem(product);
                        toast.success(`${product.title} added to cart!`, {
                          style: { borderRadius: '10px', background: '#1a2b4c', color: '#fff' },
                          iconTheme: { primary: '#c9a263', secondary: '#fff' }
                        });
                      }}
                      className="w-full mt-auto py-3 border border-[var(--color-navy)] text-[var(--color-navy)] bg-transparent rounded-none text-[10px] font-bold tracking-[3px] uppercase hover:bg-[var(--color-navy)] hover:text-white transition-colors duration-500"
                    >
                      {t("add_to_cart")}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-24">
            <p className="text-2xl text-gray-400 font-medium">{t("no_bags_found")}</p>
            <button 
              onClick={() => { setSearch(""); setSelectedCategory("All"); }}
              className="mt-6 px-6 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              {t("clear_search")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
