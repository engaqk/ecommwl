"use client";

import { useState } from "react";
import { Megaphone, Send, Mail, Users, ImageIcon, Loader2, LayoutTemplate } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function MarketingPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("banner_clean");
  const [loading, setLoading] = useState(false);

  const templates = [
    { id: "banner_clean", name: "Clean Banner", desc: "Minimalist header" },
    { id: "banner_top_right_logo", name: "Top Right Logo", desc: "Logo aligned to right" },
    { id: "stunning_bag_banner", name: "Stunning Bag", desc: "Hero image focused" },
  ];

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: "all-subscribers@shazabags.com", // Mock list for now. In prod, fetch real subscribers or send to bcc list
          action: "MARKETING",
          data: {
            subject,
            message,
            template: selectedTemplate
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      toast.success("Marketing email successfully queued for all subscribers!");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send marketing campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-[var(--color-navy)] font-bold mb-2 flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-[var(--color-primary)]" />
          Email Marketing Engine
        </h1>
        <p className="text-gray-500">Create and send stunning promotional campaigns to your subscribers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Composer */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSendEmail} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-gray-400" />
                Select Banner Template
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map(tmpl => (
                  <div 
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`cursor-pointer border-2 rounded-2xl p-4 transition-all duration-300 ${
                      selectedTemplate === tmpl.id 
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" 
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <ImageIcon className={`w-6 h-6 mb-2 ${selectedTemplate === tmpl.id ? "text-[var(--color-primary)]" : "text-gray-400"}`} />
                    <h3 className="font-bold text-sm text-[var(--color-navy)]">{tmpl.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{tmpl.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Exclusive 20% Off Spring Collection!"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[var(--color-primary)] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Body (Markdown supported)</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your promotional message here..."
                rows={8}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
                required
              />
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="flex items-center px-8 py-3 bg-[var(--color-navy)] text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {loading ? "Sending..." : "Send Campaign"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Stats & Preview */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-navy)] text-white rounded-3xl p-6 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-primary)]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold mb-1">Total Emails Sent</p>
                <p className="text-2xl font-serif font-bold">14,250</p>
              </div>
            </div>

            <div className="bg-[var(--color-primary)] text-white rounded-3xl p-6 relative overflow-hidden shadow-lg">
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative z-10">
                <p className="text-[10px] text-white/90 uppercase tracking-widest font-bold mb-1">Consumers Received</p>
                <p className="text-2xl font-serif font-bold">13,902</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Live Preview
            </h3>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="p-4 bg-white min-h-[300px]">
                {/* Simulated Email Render */}
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-6 border-2 border-dashed border-gray-200">
                  [{templates.find(t => t.id === selectedTemplate)?.name} Placeholder]
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  {subject || "Subject line will appear here..."}
                </h2>
                <div className="text-sm text-gray-600 whitespace-pre-wrap font-light">
                  {message || "Your beautiful marketing message will be rendered right here."}
                </div>
                <div className="mt-8 text-center pt-6 border-t border-gray-100">
                  <button className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-full text-xs font-bold uppercase tracking-widest">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
