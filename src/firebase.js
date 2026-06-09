// Storage pakai localStorage - tidak perlu Firebase
// Data tersimpan di browser lokal

export async function loadCollection(colName) {
  try {
    const raw = localStorage.getItem("mms_" + colName);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveDoc(colName, id, data) {
  try {
    const all = await loadCollection(colName);
    const idx = all.findIndex(x => String(x.id) === String(id));
    if (idx >= 0) all[idx] = data; else all.push(data);
    localStorage.setItem("mms_" + colName, JSON.stringify(all));
  } catch {}
}

export async function deleteDocument(colName, id) {
  try {
    const all = await loadCollection(colName);
    const filtered = all.filter(x => String(x.id) !== String(id));
    localStorage.setItem("mms_" + colName, JSON.stringify(filtered));
  } catch {}
}

export function subscribeCollection(colName, callback) {
  loadCollection(colName).then(callback);
  return () => {};
}
