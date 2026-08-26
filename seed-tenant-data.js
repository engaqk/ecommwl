const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (requires service account key)
// For this script, we assume the user will run it when they have their service account setup.
// If you run it locally with the right credentials it will seed the default store.

async function seedData() {
  try {
    const serviceAccount = require('./serviceAccountKey.json');
    initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore();

    const DEFAULT_STORE_ID = 'my-store';

    // 1. Create the default store config
    await db.collection('stores').doc(DEFAULT_STORE_ID).set({
      name: 'Default Store',
      theme: {
        primary: '#4A2533',
        secondary: '#B76E79',
        background: '#FFF8F7'
      },
      createdAt: new Date().toISOString()
    });
    console.log("✅ Default store config created");

    // 2. We don't have existing products because this is a new Firebase account.
    console.log("ℹ️ Database is ready for new multi-tenant products!");
    
  } catch (err) {
    console.error("Migration failed (Make sure you have serviceAccountKey.json from the NEW Firebase project):", err.message);
  }
}

seedData();
