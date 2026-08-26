const fs = require('fs');
const shopCode = fs.readFileSync('src/app/shop/page.tsx', 'utf8');
const homeCode = fs.readFileSync('src/app/page.tsx', 'utf8');

// Extract the toolbar + categories + grid from shop
const gridMatch = shopCode.match(/<div className="max-w-7xl mx-auto px-4 md:px-12 py-6 md:py-12">\s*{\/\* Toolbar.*?\n      <\/div>/s);
const gridHtml = gridMatch ? gridMatch[0] : '';

// Extract hero from home
const heroMatch = homeCode.match(/({\/\* Hero Section.*?<\/section>)/s);
const heroHtml = heroMatch ? heroMatch[1] : '';

let newHome = `"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Heart, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { useCurrencyFormatter } from "@/store/useCurrencyStore";

const categories = ["All", "Handbags", "Totes", "Bucket Bags", "Clutches", "Crossbody", "Boho"];

export default function Home() {
  const { t } = useTranslation();
  const { addItem } = useCartStore();
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyFormatter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
      <section className="pt-32 pb-4 px-6">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--color-navy)] font-serif mb-3 tracking-tight">
            New Arrivals
          </h2>
          <p className="text-gray-400 font-light text-xs uppercase tracking-[3px]">Explore Our Latest Additions</p>
        </div>
      </section>

` + gridHtml.replace(/₹\$\{product\.price\}/g, '{formatPrice(product.price)}').replace(/Max: ₹\$\{maxPrice\}/g, 'Max: {formatPrice(maxPrice)}') + `

      ` + heroHtml + `
    </div>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', newHome);
console.log('done');
