"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const whatsappUrl2 = "https://wa.me/919238940366?text=Hello!%20I%20have%20a%20question%20about%20a%20bag.";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-4">
      <a
        href={whatsappUrl2}
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:bg-[#128C7E] hover:-translate-y-1 transition-all duration-300 group flex items-center justify-center relative"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
        <span className="absolute right-full mr-4 bg-white text-gray-800 text-xs font-bold px-3 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Support
        </span>
      </a>
    </div>
  );
}
