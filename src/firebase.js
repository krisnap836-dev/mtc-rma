// ============================================================
// KONFIGURASI FIREBASE
// ============================================================
// CARA SETUP:
// 1. Buka https://console.firebase.google.com
// 2. Klik "Add project" → beri nama → buat project
// 3. Di sidebar klik "Firestore Database" → Create database → Start in test mode
// 4. Di sidebar klik ⚙️ Project Settings → scroll ke "Your apps" → klik </> (Web)
// 5. Daftarkan app → copy nilai firebaseConfig di bawah ini
// 6. Ganti semua nilai "GANTI_INI" dengan nilai dari Firebase Console

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  // For Firebase JS SDK v7.20
  apiKey: "AIzaSyBclk-4IY8ihoGSdQrLil1Kmbvq0Fweg2Y",
  authDomain: "mtc-dashboard-rma.firebaseapp.com",
  projectId: "mtc-dashboard-rma",
  storageBucket: "mtc-dashboard-rma.firebasestorage.app",
  messagingSenderId: "209882606718",
  appId: "1:209882606718:web:dded34cab0ee9c2e9afc2f",
  measurementId: "G-1T6H9KX2TC"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ─── HELPERS FIRESTORE ────────────────────────────────────
export async function loadCollection(colName) {
  try {
    const snap = await getDocs(collection(db, colName));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (e) {
    console.error("loadCollection error:", e);
    return [];
  }
}

export async function saveDoc(colName, id, data) {
  try {
    await setDoc(doc(db, colName, String(id)), data);
  } catch (e) {
    console.error("saveDoc error:", e);
  }
}

export async function deleteDocument(colName, id) {
  try {
    await deleteDoc(doc(db, colName, String(id)));
  } catch (e) {
    console.error("deleteDoc error:", e);
  }
}

export function subscribeCollection(colName, callback) {
  return onSnapshot(collection(db, colName), snap => {
    callback(snap.docs.map(d => ({ ...d.data(), id: d.id })));
  });
}
