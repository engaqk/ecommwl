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
    
    // Check if env vars are the culprit
    const missingVars = [];
    if (!process.env.FIREBASE_PROJECT_ID) missingVars.push('FIREBASE_PROJECT_ID');
    if (!process.env.FIREBASE_CLIENT_EMAIL) missingVars.push('FIREBASE_CLIENT_EMAIL');
    if (!process.env.FIREBASE_PRIVATE_KEY) missingVars.push('FIREBASE_PRIVATE_KEY');

    if (missingVars.length > 0) {
      return NextResponse.json({ 
        error: `Missing Vercel Environment Variables: ${missingVars.join(', ')}. Please add them in Vercel Project Settings and redeploy.` 
      }, { status: 500 });
    }

    return NextResponse.json({ error: error.message || error.toString() }, { status: 500 });
  }
}
