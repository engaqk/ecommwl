"use client";

import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export default function ShareButton({ title, text, url, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        return; // Success Native Share
      } catch (err) {
        // Fallback to copy if user cancels or it fails
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing:", err);
        } else {
          return; // User cancelled
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  return (
    <button 
      onClick={handleShare}
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full font-bold text-xs uppercase tracking-wider transition-colors border border-gray-200 ${className}`}
      title="Share this page"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
      <span>{copied ? "Copied" : "Share"}</span>
    </button>
  );
}
