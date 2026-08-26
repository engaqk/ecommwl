import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { email, password, role, storeId, displayName } = await req.json();

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // 1. Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });

    // 2. Save role and storeId to Firestore Users collection
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      storeId,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error('Error provisioning tenant admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
