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
    const auth = require('firebase-admin/auth').getAuth();

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

    // 2. Create the SUPER_ADMIN user
    const superAdminEmail = 'abdulqadir53@admin.local';
    const superAdminPassword = 'admin'; // User requested this exact password
    let userRecord;

    try {
      userRecord = await auth.getUserByEmail(superAdminEmail);
      console.log("ℹ️ Super Admin already exists in Auth.");
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email: superAdminEmail,
          password: superAdminPassword,
          displayName: 'Super Admin',
        });
        console.log("✅ Super Admin created in Auth!");
      } else {
        throw e;
      }
    }

    // 3. Assign SUPER_ADMIN role in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: superAdminEmail,
      displayName: 'Super Admin',
      role: 'SUPER_ADMIN',
      storeId: DEFAULT_STORE_ID,
      createdAt: new Date().toISOString()
    }, { merge: true });

    console.log("✅ Super Admin role assigned in Firestore!");
    console.log(`\n🎉 SETUP COMPLETE!`);
    console.log(`You can now log in at /login with:`);
    console.log(`Username: abdulqadir53`);
    console.log(`Password: admin\n`);
    
  } catch (err) {
    console.error("Setup failed (Make sure you have serviceAccountKey.json from the NEW Firebase project):", err.message);
  }
}

seedData();
