"use client";

import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function CartDrawer() {
  const { items, isDrawerOpen, toggleDrawer, updateQuantity, removeItem, totalPrice } = useCartStore();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleDrawer}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-[var(--color-navy)]">{t("cart")}</h2>
              <button onClick={toggleDrawer} className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <p>{t("empty_cart")}</p>
                  <button 
                    onClick={toggleDrawer}
                    className="mt-4 px-6 py-2 bg-[var(--color-navy)] text-white rounded-full hover:bg-gray-800 transition-colors"
                  >
                    {t("continue_shopping")}
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center bg-[var(--color-background)] p-3 rounded-xl">
                    <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                      <p className="text-[var(--color-primary)] font-bold mt-1">₹{item.price}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-300 rounded-full bg-white">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-[var(--color-primary)]"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-[var(--color-primary)]"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4 text-lg font-bold">
                  <span>{t("total")}</span>
                  <span className="text-[var(--color-primary)]">₹{totalPrice()}</span>
                </div>
                <Link 
                  href="/checkout"
                  onClick={toggleDrawer}
                  className="w-full py-4 bg-[var(--color-success)] hover:bg-[var(--color-success-dark)] text-white rounded-full flex items-center justify-center font-bold text-lg transition-colors"
                >
                  {t("checkout_button")} <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
