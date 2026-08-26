import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid payload, expected array of products" }, { status: 400 });
    }

    const results = [];
    for (const p of products) {
      const docRef = await addDoc(collection(db, "products"), {
        ...p,
        createdAt: serverTimestamp()
      });
      results.push(docRef.id);
    }

    return NextResponse.json({ success: true, insertedIds: results }, { status: 200 });
  } catch (error: any) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
