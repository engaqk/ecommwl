"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Trash2, Loader2, Image as ImageIcon, Edit2, X, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { logSystemEvent } from "@/lib/audit";
import { useTenantStore } from "@/store/useTenantStore";
import { useAuthStore } from "@/store/useAuthStore";

type ProductForm = {
  title: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const { register, handleSubmit, reset, setValue } = useForm<ProductForm>();
  const { store } = useTenantStore();
  const { userData } = useAuthStore();

  const fetchProducts = async () => {
    const activeStoreId = userData?.role === 'SUPER_ADMIN' ? (store?.id || 'my-store') : (userData?.storeId || store?.id || 'my-store');
    
    try {
      const q = query(collection(db, "products"), where("storeId", "==", activeStoreId));
      const querySnapshot = await getDocs(q);
      const prods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store?.id || userData?.storeId) {
      fetchProducts();
    }
  }, [store?.id, userData?.storeId, userData?.role]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const onSubmit = async (data: ProductForm) => {
    if (!imageFile && !editingId) return alert("Please upload an image");
    setIsAdding(true);

    try {
      let base64Image = undefined;
      if (imageFile) {
        base64Image = await compressImage(imageFile);
      }

      const payload: any = {
        title: data.title,
        category: data.category,
        price: Number(data.price),
        costPrice: Number(data.costPrice),
        stock: Number(data.stock),
        storeId: userData?.storeId || store?.id || 'my-store'
      };

      if (base64Image) {
        payload.image = base64Image;
      }

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload);
        await logSystemEvent("PRODUCT_EDITED", `Updated product: ${data.title}`, "admin");
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "products"), payload);
        await logSystemEvent("PRODUCT_ADDED", `Added new product: ${data.title}`, "admin");
      }

      handleCancelEdit();
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Error saving product");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setValue("title", product.title);
    setValue("price", product.price);
    setValue("costPrice", product.costPrice);
    setValue("category", product.category);
    setValue("stock", product.stock);
    setImageFile(null); // Optional: They can upload a new image to overwrite
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
    setImageFile(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const product = products.find(p => p.id === id);
      await deleteDoc(doc(db, "products", id));
      await logSystemEvent("PRODUCT_DELETED", `Deleted product: ${product?.title}`, "admin");
      fetchProducts();
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`Are you sure you want to bulk upload products from ${file.name}?`)) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        // Simple CSV parser (assuming comma separated, no commas in values for simplicity)
        const lines = text.split('\n').filter(l => l.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newProducts = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length !== headers.length) continue;
          
          const p: any = {};
          headers.forEach((h, idx) => {
            p[h] = values[idx].trim();
          });

          const activeStoreId = userData?.role === 'SUPER_ADMIN' ? (store?.id || 'my-store') : (userData?.storeId || store?.id || 'my-store');
          newProducts.push({
            title: p.title || "Unnamed Product",
            price: Number(p.price) || 0,
            costPrice: Number(p.costprice || p.cost) || 0,
            category: p.category || "General",
            stock: Number(p.stock) || 0,
            image: p.image || "https://placehold.co/800x800",
            storeId: activeStoreId,
            createdAt: serverTimestamp()
          });
        }

        if (newProducts.length === 0) return alert("No valid products found in CSV");

        // Insert products one by one
        for (const prod of newProducts) {
          await addDoc(collection(db, "products"), prod);
        }

        await logSystemEvent("BULK_UPLOAD", `Bulk uploaded ${newProducts.length} products`, "admin");
        alert(`Successfully uploaded ${newProducts.length} products!`);
        fetchProducts();
      } catch (error) {
        console.error("Bulk upload error:", error);
        alert("Failed to process CSV file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-8">Manage Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add/Edit Product Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              {editingId ? <><Edit2 className="mr-2 w-5 h-5" /> Edit Bag</> : <><Plus className="mr-2" /> Add New Bag</>}
            </h2>
            {editingId && (
              <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input {...register("title", { required: true })} className="w-full border p-2 rounded-lg" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Selling Price (₹)</label>
                <input type="number" {...register("price", { required: true })} className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost Price (₹)</label>
                <input type="number" {...register("costPrice", { required: true })} className="w-full border p-2 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input {...register("category", { required: true })} className="w-full border p-2 rounded-lg" placeholder="e.g. Totes" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input type="number" {...register("stock", { required: true })} className="w-full border p-2 rounded-lg" defaultValue={10} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Product Image</label>
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                {imageFile ? <span className="text-sm font-medium">{imageFile.name}</span> : <div className="flex flex-col items-center"><ImageIcon className="text-gray-400 mb-2" /><span className="text-sm text-gray-500">Upload Image</span></div>}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <button type="submit" disabled={isAdding} className="w-full py-3 bg-[var(--color-navy)] text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">
              {isAdding ? <Loader2 className="animate-spin mx-auto" /> : (editingId ? "Update Product" : "Add Product")}
            </button>
          </form>
        </div>

        {/* Product List */}
        <div className="lg:col-span-2">
          {/* Header & Bulk Upload */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-[var(--color-navy)]">Product Inventory</h2>
            
            <label className="w-full sm:w-auto px-6 py-2.5 bg-green-50 text-green-700 border border-green-200 font-bold rounded-lg hover:bg-green-100 transition-colors text-sm uppercase tracking-wider flex items-center justify-center cursor-pointer">
              <Upload className="w-4 h-4 mr-2" /> Bulk CSV Upload
              <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4 items-start mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--color-navy)] text-sm leading-tight mb-1 truncate">{p.title}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{p.category}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-[var(--color-navy)]">₹{p.price}</p>
                        <p className="text-[10px] text-gray-400">Cost: ₹{p.costPrice || 0}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Stock</span>
                        <span className={`text-sm font-bold ${p.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>{p.stock}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-4 mt-auto">
                  <button onClick={() => handleEdit(p)} className="flex items-center justify-center py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold uppercase tracking-wider">
                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="flex items-center justify-center py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold uppercase tracking-wider">
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
