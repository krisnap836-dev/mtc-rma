import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc,oneSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA8lVbQRIecsgjzHidHMA_pupX1E1maW5Y",
  authDomain: "kris-86792.firebaseapp.com",
  projectId: "kris-86792",
  storageBucket: "kris-86792.firebasestorage.app",
  messagingSenderId: "948609200783",
  appId: "1:948609200783:web:a8bd292f8b538b32e676fa",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function loadCollection(colName) {
  try {
    const snap = await getDocs(collection(db, colName));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch(e) { console.error(e); return []; }
}

export async function saveDoc(colName, id, data) {
  try {
    await setDoc(doc(db, colName, String(id)), data);
  } catch(e) { console.error(e); }
}

export async function deleteDocument(colName, id) {
  try {
    await deleteDoc(doc(db, colName, String(id)));
  } catch(e) { console.error(e); }
}

export function subscribeCollection(colName, callback) {
  return () => {};
}
