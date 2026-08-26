"use client";

import { useTranslation } from "react-i18next";
import { Search, ShoppingCart, Heart, Menu, X, Globe, User as UserIcon, LogOut, Package } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useTenantStore } from "@/store/useTenantStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items, toggleDrawer } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, logout, initializeAuthListener } = useAuthStore();
  const { store } = useTenantStore();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeAuthListener();
    if (typeof window !== 'undefined') {
      setIsAdmin(localStorage.getItem("adminAuth") === "true");
    }
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [initializeAuthListener]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistItemCount = wishlistItems.length;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
    
    // Trigger Google Translate manually
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = lng;
      select.dispatchEvent(new Event('change'));
    }
  };

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'HI' },
    { code: 'gu', label: 'GU' }
  ];

  const { activeCurrency, currencies, setCurrency, initCurrencies } = useCurrencyStore();
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);

  useEffect(() => {
    initCurrencies();
  }, [initCurrencies]);

  const activeSymbol = currencies[activeCurrency]?.symbol || '₹';
  const availableCurrencies = Object.values(currencies).filter(c => c.enabled);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 md:max-w-[1400px] ${
        scrolled 
          ? "bg-[var(--color-background)]/90 backdrop-blur-xl border-b border-gray-200/50 py-3 shadow-sm" 
          : "bg-[var(--color-background)]/60 backdrop-blur-md py-4"
      }`}
    >
      <div className="px-6 md:px-12 flex justify-between items-center relative">
        
        {/* Left: Desktop Language (Hidden on Mobile) */}
        <div className="hidden md:flex w-1/3 items-center space-x-6">
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center text-[10px] font-medium tracking-[3px] uppercase text-[var(--color-navy)] hover:text-[var(--color-primary)] transition-colors duration-300"
            >
              <Globe className="w-3 h-3 mr-2 opacity-50" />
              {i18n.language || 'EN'}
            </button>

            <AnimatePresence>
              {langMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-4 bg-white shadow-2xl rounded-2xl py-4 px-2 flex flex-col space-y-1 min-w-[100px] border border-gray-100"
                >
                  {languages.map((lang) => (
                    <button 
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="text-[10px] tracking-[2px] px-4 py-2 hover:bg-[var(--color-background)] rounded-lg text-left transition-colors text-[var(--color-navy)]"
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative ml-6">
            <button 
              onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
              className="flex items-center text-[10px] font-medium tracking-[3px] uppercase text-[var(--color-navy)] hover:text-[var(--color-primary)] transition-colors duration-300"
            >
              <span className="w-3 h-3 mr-1 opacity-50 flex items-center justify-center font-serif">{activeSymbol}</span>
              {activeCurrency}
            </button>

            <AnimatePresence>
              {currencyMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-4 bg-white shadow-2xl rounded-2xl py-4 px-2 flex flex-col space-y-1 min-w-[100px] border border-gray-100 z-50"
                >
                  {availableCurrencies.map((cur) => (
                    <button 
                      key={cur.code}
                      onClick={() => { setCurrency(cur.code); setCurrencyMenuOpen(false); }}
                      className="text-[10px] tracking-[2px] px-4 py-2 hover:bg-[var(--color-background)] rounded-lg text-left transition-colors text-[var(--color-navy)] flex justify-between"
                    >
                      <span>{cur.code}</span>
                      <span className="text-gray-400">{cur.symbol}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Brand */}
        <div className="flex justify-center flex-1 z-10 px-2">
          <Link href="/" className="group flex flex-col items-center whitespace-nowrap">
            <div className="flex items-center gap-3">
              {/* Trendy Fashion Symbol SVG (Bag & Creativity Theme) */}
              <svg 
                width="36" height="36" viewBox="0 0 100 100" fill="none" 
                className="transform group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              >
                {/* Elegant Circular Frame */}
                <circle cx="50" cy="50" r="48" stroke="url(#goldGradient)" strokeWidth="1.5" className="opacity-80"/>
                {/* Abstract Handbag/Yarn Shape */}
                <path d="M30 45 C 30 25, 70 25, 70 45 C 80 45, 85 55, 80 75 C 75 90, 25 90, 20 75 C 15 55, 20 45, 30 45 Z" stroke="var(--color-navy)" strokeWidth="2" fill="none" />
                {/* Top Handle / Loop */}
                <path d="M40 45 C 40 30, 60 30, 60 45" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
                {/* Intertwined 'S' and '53' Monogram */}
                <path d="M43 65 C 55 65, 55 55, 45 55 C 35 55, 35 45, 47 45" stroke="var(--color-navy)" strokeWidth="2" strokeLinecap="round" />
                <path d="M57 45 L 65 45 C 65 50, 58 52, 63 55 C 68 58, 60 65, 52 65" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
                
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="50%" stopColor="#fff" />
                    <stop offset="100%" stopColor="var(--color-primary)" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="flex flex-col items-start">
                <span className="text-xl sm:text-2xl md:text-3xl font-serif text-[var(--color-navy)] font-bold tracking-tight leading-none transition-colors duration-500 flex items-baseline relative">
                  {store?.name ? store.name.split(' ')[0] : 'SHAZA'}
                  <span className="ml-1 animate-text-sparkle text-[var(--color-primary)]">
                    {store?.name ? store.name.split(' ').slice(1).join(' ') : '53'}
                  </span>
                </span>
                <span className="text-[7px] md:text-[9px] uppercase tracking-[6px] md:tracking-[8px] font-semibold text-gray-500 mt-1 pl-1">
                  Store
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right: Actions (Desktop) */}
        <div className="hidden md:flex items-center justify-end space-x-8 w-1/3">
          {isAdmin ? (
            <Link 
              href="/admin/dashboard" 
              className="text-[10px] font-bold tracking-[3px] uppercase text-[var(--color-primary)] hover:text-black transition-colors duration-300 relative group"
            >
              Admin Panel
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ) : (
            <Link 
              href="/admin" 
              className="text-[10px] font-bold tracking-[3px] uppercase text-gray-400 hover:text-[var(--color-primary)] transition-colors duration-300 relative group"
            >
              Admin Login
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[var(--color-primary)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}

          <Link 
            href="/supplier/register" 
            className="text-[10px] font-medium tracking-[3px] uppercase text-gray-500 hover:text-[var(--color-primary)] transition-colors duration-300 relative group hidden lg:block"
          >
            Become a Supplier
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[var(--color-primary)] transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link 
            href="/shop" 
            className="text-[10px] font-medium tracking-[3px] uppercase text-[var(--color-navy)] hover:text-[var(--color-primary)] transition-colors duration-300 relative group"
          >
            {t("shop_now")}
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[var(--color-primary)] transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link 
            href="/custom" 
            className="text-[10px] font-bold tracking-[3px] uppercase text-white bg-[var(--color-primary)] px-4 py-2 rounded-full shadow-[0_0_15px_rgba(201,162,99,0.5)] hover:bg-[var(--color-navy)] hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
          >
            <span className="relative z-10">Custom Design</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Link>
          
          <div className="relative group">
            <Link 
              href={user ? "/orders" : "/login"}
              className="flex items-center text-[var(--color-navy)] hover:text-[var(--color-primary)] transition-colors relative"
            >
              <UserIcon strokeWidth={1.5} className="w-5 h-5" />
            </Link>
            
            {user && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden translate-y-2 group-hover:translate-y-0">
                <Link href="/orders" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-colors">
                  <Package className="w-4 h-4 mr-3" />
                  My Orders
                </Link>
                <button 
                  onClick={() => logout()}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <Link 
            href="/wishlist"
            className="flex items-center text-[var(--color-navy)] hover:text-[var(--color-primary)] transition-colors relative"
          >
            <Heart strokeWidth={1.5} className="w-5 h-5" />
            {mounted && wishlistItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {wishlistItemCount}
              </span>
            )}
          </Link>

          <button 
            onClick={toggleDrawer}
            className="flex items-center text-[var(--color-navy)] hover:text-[var(--color-primary)] transition-colors relative"
          >
            <ShoppingCart strokeWidth={1.5} className="w-5 h-5" />
            <AnimatePresence>
              {mounted && itemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Right Actions */}
        <div className="flex items-center md:hidden w-auto justify-end space-x-3 sm:space-x-4">
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="text-[var(--color-navy)] flex items-center"
            >
              <Globe strokeWidth={1.5} className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
            </button>
            <AnimatePresence>
              {langMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-4 bg-white shadow-2xl rounded-2xl py-4 px-2 flex flex-col space-y-1 min-w-[100px] border border-gray-100 z-50"
                >
                  {languages.map((lang) => (
                    <button 
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="text-[10px] tracking-[2px] px-4 py-2 hover:bg-[var(--color-background)] rounded-lg text-left transition-colors text-[var(--color-navy)]"
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Link href={user ? "/orders" : "/login"} className="relative">
            <UserIcon strokeWidth={1.5} className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-[var(--color-navy)]" />
          </Link>
          <Link href="/wishlist" className="relative">
            <Heart strokeWidth={1.5} className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-[var(--color-navy)]" />
            {mounted && wishlistItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {wishlistItemCount}
              </span>
            )}
          </Link>
          <button onClick={toggleDrawer} className="relative">
            <ShoppingCart strokeWidth={1.5} className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-[var(--color-navy)]" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <button 
            className="text-[var(--color-navy)] focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-[var(--color-background)]/95 backdrop-blur-3xl shadow-2xl border-t border-gray-200 overflow-hidden"
          >
            <div className="flex flex-col px-8 py-8 space-y-6 text-center">
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className="text-xs tracking-[4px] uppercase text-[var(--color-navy)]"
              >
                Home
              </Link>
              {isAdmin ? (
                <Link 
                  href="/admin/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xs tracking-[4px] uppercase text-[var(--color-primary)] font-bold"
                >
                  Admin Panel
                </Link>
              ) : (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xs tracking-[4px] uppercase text-gray-400 hover:text-[var(--color-primary)]"
                >
                  Admin Login
                </Link>
              )}
              <Link 
                href="/shop" 
                onClick={() => setIsMenuOpen(false)}
                className="text-xs tracking-[4px] uppercase text-[var(--color-navy)]"
              >
                Shop
              </Link>
              
              <Link 
                href="/custom" 
                onClick={() => setIsMenuOpen(false)}
                className="text-xs tracking-[4px] uppercase text-[var(--color-primary)] font-bold mt-4 border border-[var(--color-primary)] px-6 py-3 text-center"
              >
                Custom Design
              </Link>
              <Link 
                href="/supplier/register" 
                onClick={() => setIsMenuOpen(false)}
                className="text-xs tracking-[4px] uppercase text-gray-500 hover:text-[var(--color-primary)] font-bold mt-2 text-center"
              >
                Become a Supplier
              </Link>
              
              <div className="h-[1px] w-12 bg-gray-200 mx-auto my-4"></div>
              
              <div className="flex justify-center space-x-6">
                {languages.map((lang) => (
                  <button 
                    key={lang.code}
                    onClick={() => { changeLanguage(lang.code); setIsMenuOpen(false); }}
                    className={`text-[10px] tracking-[2px] uppercase ${i18n.language === lang.code ? 'text-[var(--color-primary)] font-bold' : 'text-gray-400'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
