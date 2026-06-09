import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBclk-4IY8ihoGSdQrLil1Kmbvq0Fweg2Y",
  authDomain: "mtc-dashboard-rma.firebaseapp.com",
  projectId: "mtc-dashboard-rma",
  storageBucket: "mtc-dashboard-rma.firebasestorage.app",
  messagingSenderId: "209882606718",
  appId: "1:209882606718:web:5e5712e28c56b8599afc2f"
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
