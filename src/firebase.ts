import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Connectivity Test
async function testConnection() {
  try {
    // We intentionally read a restricted path to verify we are talking to the server
    await getDocFromServer(doc(db, '_connection_test_', 'init'));
    console.log("Firebase initialized and connected.");
  } catch (error: any) {
    const isPermissionError = 
      error?.code === 'permission-denied' || 
      error?.message?.toLowerCase().includes('insufficient permissions') ||
      error?.message?.toLowerCase().includes('permission-denied');

    if (isPermissionError) {
      // Rule working as expected (we default-deny everything not explicitly allowed)
      console.log("Firebase connected (Security rules active).");
    } else if (error?.message?.includes('offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    } else {
      console.error("Firebase connection error:", error);
    }
  }
}

testConnection();
