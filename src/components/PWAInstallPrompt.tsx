"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed as standalone app
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if user already dismissed in this session
    if (sessionStorage.getItem("pwa_dismissed")) return;

    const handler = (e: any) => {
      e.preventDefault(); // Required — prevents mini-infobar; we show our own UI
      setDeferredPrompt(e);
      // Slight delay so it doesn't pop up instantly on page load
      setTimeout(() => setShowPrompt(true), 4000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); // THIS is what actually shows the browser install banner
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
    if (outcome === "dismissed") {
      sessionStorage.setItem("pwa_dismissed", "1");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("pwa_dismissed", "1");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[340px] bg-white rounded-2xl shadow-2xl border border-[#f0e6e7] p-4 z-50 flex items-center gap-3"
        >
          {/* Logo */}
          <div className="w-12 h-12 bg-[#4A2533] rounded-xl flex-shrink-0 flex items-center justify-center shadow-inner">
            <span className="text-white font-serif font-bold text-sm leading-none text-center">
              <span>S</span>
              <span className="text-[#B76E79] text-[10px] align-top">53</span>
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#4A2533]">Install Shaza53 Creation App</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Fast access · works offline</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstall}
              className="bg-[#4A2533] text-white px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-[#B76E79] transition-colors"
            >
              Install
            </button>
            <button onClick={handleDismiss} className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
