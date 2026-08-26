"use client";

import { useCartStore } from "@/store/useCartStore";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

type CheckoutFormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
};

export default function CheckoutPage() {
  const { items, totalPrice } = useCartStore();
  const { user, userData } = useAuthStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CheckoutFormData>();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (items.length === 0) {
      router.push("/");
    }
  }, [items, router]);

  useEffect(() => {
    if (userData) {
      reset({
        fullName: userData.displayName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        country: userData.country || "India",
      });
    }
  }, [userData, reset]);

  const onSubmit = (data: CheckoutFormData) => {
    // Save to local storage or state to pass to payment page
    sessionStorage.setItem("checkoutData", JSON.stringify(data));
    router.push("/payment");
  };

  if (!mounted || items.length === 0) return null;

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Form */}
          <div className="md:col-span-2">
            {!user && (
              <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex justify-between items-center border border-gray-100">
                <div>
                  <h3 className="font-semibold text-[var(--color-navy)] mb-1">Have an account?</h3>
                  <p className="text-sm text-gray-500">Log in for faster checkout and order tracking.</p>
                </div>
                <Link href="/login" className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all whitespace-nowrap ml-4">
                  Log In
                </Link>
              </div>
            )}
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-[var(--color-navy)]">Shipping Details</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    {...register("fullName", { required: "Name is required" })}
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[var(--color-primary)]"
                    placeholder=""
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[var(--color-primary)]"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel"
                  {...register("phone", { required: "Phone is required" })}
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[var(--color-primary)]"
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Shipping Address</label>
                <textarea 
                  {...register("address", { required: "Address is required" })}
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[var(--color-primary)] min-h-[100px]"
                  placeholder="Street, City, State, ZIP"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select 
                  {...register("country", { required: "Country is required" })}
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[var(--color-primary)] bg-white"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="UAE">UAE</option>
                  <option value="Other">Other</option>
                </select>
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-[var(--color-navy)] text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center mt-8"
              >
                Continue to Payment <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

          {/* Order Summary */}
          <div className="bg-white p-8 rounded-2xl shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-6 text-[var(--color-navy)]">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 pr-4">{item.quantity}x {item.title}</span>
                  <span className="font-semibold text-[var(--color-navy)]">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-lg font-bold text-[var(--color-navy)]">
              <span>Total</span>
              <span className="text-[var(--color-primary)]">₹{totalPrice()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
