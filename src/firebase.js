import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAN7wD1jNrV_a5owR-1vMJRrVy2OFOvF_E",
  authDomain: "mtcrma-892a2.firebaseapp.com",
  projectId: "mtcrma-892a2",
  storageBucket: "mtcrma-892a2.firebasestorage.app",
  messagingSenderId: "763912940438",
  appId: "1:763912940438:web:93cd3b4e1d9eadddbb8bb7",
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
