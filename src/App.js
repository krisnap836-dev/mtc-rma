import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { loadCollection, saveDoc, deleteDocument } from "./firebase";

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const SEED_DOWNTIMES = [
  { id: "s1", date: "2025-06-01", machine: "Mesin Press A", category: "Mekanik", duration: 3.5, description: "Bearing aus", status: "Selesai", technician: "Budi S." },
  { id: "s2", date: "2025-06-02", machine: "Kompresor B", category: "Pneumatik", duration: 2.0, description: "Kebocoran selang", status: "Selesai", technician: "Anton W." },
  { id: "s3", date: "2025-06-03", machine: "Cylinder Hidrolik C", category: "Hidrolik", duration: 5.5, description: "Seal bocor", status: "Selesai", technician: "Sari M." },
  { id: "s4", date: "2025-06-04", machine: "Panel Kontrol D", category: "Elektrik", duration: 1.5, description: "Kontaktor rusak", status: "Selesai", technician: "Dian R." },
  { id: "s5", date: "2025-06-05", machine: "Mesin CNC E", category: "Mekanik", duration: 4.0, description: "Spindle error", status: "Selesai", technician: "Budi S." },
  { id: "s6", date: "2025-06-06", machine: "Valve Pneumatik F", category: "Pneumatik", duration: 1.0, description: "Solenoid valve mati", status: "Selesai", technician: "Anton W." },
  { id: "s7", date: "2025-06-07", machine: "Pompa Hidrolik G", category: "Hidrolik", duration: 3.0, description: "Pompa overheating", status: "Proses", technician: "Sari M." },
  { id: "s8", date: "2025-06-08", machine: "Motor Listrik H", category: "Elektrik", duration: 2.5, description: "Winding terbakar", status: "Pending", technician: "Dian R." },
];
const SEED_PARTS = [
  { id: "p1", code: "SP-001", name: "Bearing 6205", category: "Mekanik", stock: 15, minStock: 5, unit: "pcs", price: 45000 },
  { id: "p2", code: "SP-002", name: "Seal Kit Hidrolik", category: "Hidrolik", stock: 8, minStock: 3, unit: "set", price: 120000 },
  { id: "p3", code: "SP-003", name: "Solenoid Valve 5/2", category: "Pneumatik", stock: 4, minStock: 2, unit: "pcs", price: 350000 },
  { id: "p4", code: "SP-004", name: "Kontaktor LC1D25", category: "Elektrik", stock: 6, minStock: 2, unit: "pcs", price: 280000 },
  { id: "p5", code: "SP-005", name: "V-Belt A42", category: "Mekanik", stock: 20, minStock: 10, unit: "pcs", price: 35000 },
  { id: "p6", code: "SP-006", name: "O-Ring NBR 50mm", category: "Hidrolik", stock: 2, minStock: 5, unit: "pcs", price: 8000 },
  { id: "p7", code: "SP-007", name: "Filter Udara 1/4", category: "Pneumatik", stock: 3, minStock: 3, unit: "pcs", price: 95000 },
  { id: "p8", code: "SP-008", name: "MCB 3P 32A", category: "Elektrik", stock: 1, minStock: 2, unit: "pcs", price: 185000 },
];
const SEED_ACTIVITIES = [
  { id: "a1", date: "2025-06-08", shift: "Pagi", technician: "Budi S.", type: "Preventive", machine: "Mesin Press A", description: "Pelumasan rutin, cek belt", status: "Selesai", duration: 2 },
  { id: "a2", date: "2025-06-08", shift: "Siang", technician: "Anton W.", type: "Inspeksi", machine: "Kompresor B", description: "Cek tekanan, drain kondensasi", status: "Selesai", duration: 1 },
  { id: "a3", date: "2025-06-07", shift: "Pagi", technician: "Sari M.", type: "Korektif", machine: "Pompa Hidrolik G", description: "Ganti seal, flush sistem", status: "Proses", duration: 4 },
];

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CATEGORIES = ["Mekanik", "Pneumatik", "Hidrolik", "Elektrik"];
const CAT_COLORS = { Mekanik: "#f59e0b", Pneumatik: "#3b82f6", Hidrolik: "#10b981", Elektrik: "#ef4444" };
const CAT_ICONS  = { Mekanik: "⚙️", Pneumatik: "💨", Hidrolik: "💧", Elektrik: "⚡" };
const PAGES = [
  { id: "dashboard", label: "Dashboard",     icon: "📊" },
  { id: "downtime",  label: "Downtime",      icon: "⏱️" },
  { id: "spareparts",label: "Spare Part",    icon: "🔩" },
  { id: "orders",    label: "Order Part",    icon: "🛒" },
  { id: "activity",  label: "Daily Activity",icon: "📋" },
];

// ─── THEME CONFIG ─────────────────────────────────────────────────────────────
const DARK = {
  bg:        "#080b12",
  sidebar:   "#0a0d14",
  card:      "rgba(255,255,255,0.04)",
  cardBorder:"rgba(255,255,255,0.08)",
  input:     "rgba(255,255,255,0.06)",
  inputBorder:"rgba(255,255,255,0.1)",
  navActive: "rgba(245,158,11,0.12)",
  navHover:  "rgba(255,255,255,0.04)",
  divider:   "rgba(255,255,255,0.06)",
  text:      "#ffffff",
  textSub:   "#9ca3af",
  textMuted: "#6b7280",
  modal:     "#0f1117",
  tableHead: "rgba(255,255,255,0.04)",
  tableRow:  "rgba(255,255,255,0.02)",
  tableBorder:"rgba(255,255,255,0.05)",
  selectBg:  "#1a1d27",
  toast:     "#10b981",
};
const LIGHT = {
  bg:        "#f1f5f9",
  sidebar:   "#ffffff",
  card:      "#ffffff",
  cardBorder:"#e2e8f0",
  input:     "#f8fafc",
  inputBorder:"#cbd5e1",
  navActive: "rgba(245,158,11,0.1)",
  navHover:  "#f8fafc",
  divider:   "#e2e8f0",
  text:      "#0f172a",
  textSub:   "#475569",
  textMuted: "#94a3b8",
  modal:     "#ffffff",
  tableHead: "#f8fafc",
  tableRow:  "#fafafa",
  tableBorder:"#e2e8f0",
  selectBg:  "#ffffff",
  toast:     "#10b981",
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmt  = n => "Rp " + Number(n).toLocaleString("id-ID");
const today= () => new Date().toISOString().split("T")[0];
const uid  = () => "id_" + Date.now() + "_" + Math.random().toString(36).slice(2);
const sid  = (a, b) => String(a) === String(b);

// ─── SHARED UI ───────────────────────────────────────────────────────────────
function Badge({ status }) {
  const c = {
    Selesai: "background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.3)",
    Proses:  "background:rgba(245,158,11,0.15);color:#f59e0b;border:1px solid rgba(245,158,11,0.3)",
    Pending: "background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3)",
  };
  return <span style={{ padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:600, display:"inline-block", ...(c[status]?Object.fromEntries(c[status].split(";").map(s=>{ const [k,v]=s.split(":"); return [k.trim().replace(/-([a-z])/g,(_,l)=>l.toUpperCase()),v?.trim()]; })):{background:"#374151",color:"#9ca3af"}) }}>{status}</span>;
}

function StatCard({ label, value, sub, color, icon, theme }) {
  const T = theme;
  return (
    <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: "20px", display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ color: T.textSub, fontSize: 13, fontWeight:500 }}>{label}</span>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: T.textMuted }}>{sub}</div>}
    </div>
  );
}

function Modal({ title, onClose, children, theme }) {
  const T = theme;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.6)" }}>
      <div style={{ background: T.modal, border:`1px solid ${T.cardBorder}`, borderRadius:20, width:"100%", maxWidth:640, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px", borderBottom:`1px solid ${T.divider}` }}>
          <h3 style={{ color: T.text, fontWeight:700, fontSize:16, margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color: T.textSub, fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

function FInput({ label, type="text", value, onChange, options, required, placeholder, theme }) {
  const T = theme;
  const base = { width:"100%", borderRadius:8, padding:"8px 12px", color: T.text, fontSize:13, outline:"none", background: T.input, border:`1px solid ${T.inputBorder}`, boxSizing:"border-box" };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontSize:11, color: T.textSub, fontWeight:600 }}>{label}{required && " *"}</label>
      {type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, background: T.selectBg }}>
          <option value="">-- Pilih --</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} style={{ ...base, minHeight:80, resize:"vertical" }} placeholder={placeholder} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={base} placeholder={placeholder} />
      )}
    </div>
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:100, padding:"12px 20px", borderRadius:12, color:"#fff", fontSize:13, fontWeight:600, background:"#10b981", boxShadow:"0 8px 32px rgba(16,185,129,0.4)", display:"flex", alignItems:"center", gap:10 }}>
      ✅ {msg}
      <button onClick={onClose} style={{ background:"none", border:"none", color:"#fff", opacity:0.7, cursor:"pointer", fontSize:16 }}>×</button>
    </div>
  );
}

function BtnPrimary({ children, onClick, style }) {
  return <button onClick={onClick} style={{ padding:"8px 20px", borderRadius:10, fontWeight:700, fontSize:13, color:"#000", background:"#f59e0b", border:"none", cursor:"pointer", ...style }}>{children}</button>;
}
function BtnSecondary({ children, onClick, theme, style }) {
  const T = theme;
  return <button onClick={onClick} style={{ padding:"8px 20px", borderRadius:10, fontWeight:500, fontSize:13, color: T.textSub, background: T.input, border:`1px solid ${T.inputBorder}`, cursor:"pointer", ...style }}>{children}</button>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ downtimes, theme }) {
  const T = theme;
  const total    = downtimes.length;
  const selesai  = downtimes.filter(d => d.status === "Selesai").length;
  const pending  = downtimes.filter(d => d.status === "Pending").length;
  const proses   = downtimes.filter(d => d.status === "Proses").length;
  const totalJam = downtimes.reduce((s, d) => s + Number(d.duration || 0), 0).toFixed(1);

  const catData = CATEGORIES.map(c => ({
    name: c,
    jam:  Number(downtimes.filter(d => d.category === c).reduce((s, d) => s + Number(d.duration || 0), 0).toFixed(1)),
    count:downtimes.filter(d => d.category === c).length,
  }));

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const years = Array.from(new Set(downtimes.map(d => d.date?.slice(0,4)).filter(Boolean)));
  const [selectedYear, setSelectedYear] = useState(() => {
    const cur = String(new Date().getFullYear());
    return years.includes(cur) ? cur : (years[0] || cur);
  });
  const trendData = MONTH_NAMES.map((m, i) => {
    const mm = String(i+1).padStart(2,"0");
    const items = downtimes.filter(d => d.date?.slice(0,4) === selectedYear && d.date?.slice(5,7) === mm);
    return {
      day: m,
      jam: Number(items.reduce((s,d) => s + Number(d.duration||0), 0).toFixed(1)),
      count: items.length,
    };
  });

  const pieData = CATEGORIES.map(c => ({
    name:  c,
    value: Number(downtimes.filter(d => d.category === c).reduce((s, d) => s + Number(d.duration || 0), 0).toFixed(1)),
  })).filter(p => p.value > 0);

  const tt = { contentStyle: { background: T.modal, border: `1px solid ${T.cardBorder}`, borderRadius: 8, color: T.text, fontSize: 12 } };
  const cardStyle = { background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 20 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div>
        <h2 style={{ color: T.text, fontWeight:700, fontSize:22, margin:0 }}>Dashboard Maintenance</h2>
        <p style={{ color: T.textSub, fontSize:13, margin:"4px 0 0" }}>Ringkasan performa dan downtime mesin</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16 }}>
        <StatCard label="Total Downtime"   value={`${totalJam} Jam`}        sub={`${total} kejadian`}  color="#f59e0b" icon="⏱️" theme={T}/>
        <StatCard label="Permintaan Masuk" value={total}                     sub="Total perbaikan"       color="#3b82f6" icon="📋" theme={T}/>
        <StatCard label="Selesai"          value={selesai}                   sub={`${total?((selesai/total)*100).toFixed(0):0}% completion`} color="#10b981" icon="✅" theme={T}/>
        <StatCard label="Pending / Proses" value={`${pending} / ${proses}`} sub="Perlu perhatian"       color="#ef4444" icon="⚠️" theme={T}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:24 }}>
        <div style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <h3 style={{ color: T.text, fontWeight:600, fontSize:13, margin:0 }}>📈 Trend Downtime Bulanan</h3>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
              style={{ background: T.selectBg, border:`1px solid ${T.inputBorder}`, borderRadius:8, padding:"4px 10px", color: T.text, fontSize:12, outline:"none" }}>
              {(years.length ? years : [String(new Date().getFullYear())]).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.tableBorder}/>
              <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize:11 }}/>
              <YAxis tick={{ fill: T.textSub, fontSize:11 }}/>
              <Tooltip {...tt}/>
              <Line type="monotone" dataKey="jam" stroke="#f59e0b" strokeWidth={2} dot={{ fill:"#f59e0b" }} name="Jam"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: T.text, fontWeight:600, fontSize:13, margin:"0 0 16px" }}>🥧 Distribusi per Kategori</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieData.map(e => <Cell key={e.name} fill={CAT_COLORS[e.name]}/>)}
              </Pie>
              <Tooltip {...tt} formatter={v => [`${v} jam`]}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: T.text, fontWeight:600, fontSize:13, margin:"0 0 16px" }}>📊 Total Jam Downtime per Kategori</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={catData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.tableBorder}/>
            <XAxis dataKey="name" tick={{ fill: T.textSub, fontSize:12 }}/>
            <YAxis tick={{ fill: T.textSub, fontSize:12 }}/>
            <Tooltip {...tt} formatter={(v, n) => [n==="jam"?`${v} jam`:`${v} kejadian`, n==="jam"?"Total Jam":"Jumlah"]}/>
            <Legend wrapperStyle={{ color: T.textSub, fontSize:12 }}/>
            <Bar dataKey="jam" name="Jam" radius={[6,6,0,0]}>{catData.map(e => <Cell key={e.name} fill={CAT_COLORS[e.name]}/>)}</Bar>
            <Bar dataKey="count" name="Kejadian" fill={T.tableBorder} radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: T.text, fontWeight:600, fontSize:13, margin:"0 0 16px" }}>🕒 Downtime Terbaru</h3>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr>{["Tanggal","Mesin","Kategori","Durasi","Status"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"0 12px 10px 0", color: T.textMuted, fontSize:11, fontWeight:600 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[...downtimes].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(d => (
                <tr key={d.id} style={{ borderTop:`1px solid ${T.tableBorder}` }}>
                  <td style={{ padding:"10px 12px 10px 0", color: T.textSub }}>{d.date}</td>
                  <td style={{ padding:"10px 12px 10px 0", color: T.text, fontWeight:500 }}>{d.machine}</td>
                  <td style={{ padding:"10px 12px 10px 0" }}>
                    <span style={{ fontSize:11, padding:"2px 8px", borderRadius:999, background:(CAT_COLORS[d.category]||"#666")+"22", color: CAT_COLORS[d.category]||"#999" }}>
                      {CAT_ICONS[d.category]} {d.category}
                    </span>
                  </td>
                  <td style={{ padding:"10px 12px 10px 0", color:"#f59e0b", fontWeight:700 }}>{d.duration}j</td>
                  <td style={{ padding:"10px 0" }}><Badge status={d.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── DOWNTIME PAGE ────────────────────────────────────────────────────────────
function DowntimePage({ downtimes, setDowntimes, toast, theme }) {
  const T = theme;
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState({ cat:"", status:"", search:"" });
  const blank = { date:today(), machine:"", category:"", duration:"", description:"", status:"Pending", technician:"" };
  const [form, setForm] = useState(blank);
  const fileRef = useRef();

  const filtered = downtimes.filter(d =>
    (!filter.cat    || d.category === filter.cat) &&
    (!filter.status || d.status   === filter.status) &&
    (!filter.search || d.machine.toLowerCase().includes(filter.search.toLowerCase()))
  );

  async function submit() {
    if (!form.machine || !form.category || !form.duration) return alert("Lengkapi: Mesin, Kategori, Durasi!");
    const item = { ...form, id: uid(), duration: Number(form.duration) };
    await saveDoc("downtimes", item.id, item);
    setDowntimes(p => [...p, item]);
    setShowForm(false); setForm(blank);
    toast("Data downtime berhasil disimpan!");
  }

  async function remove(id) {
    if (!window.confirm("Yakin hapus data ini?")) return;
    await deleteDocument("downtimes", id);
    setDowntimes(p => p.filter(d => !sid(d.id, id)));
    toast("Data berhasil dihapus!");
  }

  function importExcel(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const wb   = XLSX.read(new Uint8Array(ev.target.result), { type:"array" });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval:"" });
        const imported = rows.map(r => ({
          id: uid(),
          date:        String(r.date || r.Tanggal || today()).trim(),
          machine:     String(r.machine || r.Mesin || "").trim(),
          category:    String(r.category || r.Kategori || "Mekanik").trim(),
          duration:    Number(r.duration || r.Durasi || r["Durasi (jam)"] || 0),
          description: String(r.description || r.Deskripsi || "").trim(),
          status:      String(r.status || r.Status || "Pending").trim(),
          technician:  String(r.technician || r.Teknisi || "").trim(),
        })).filter(r => r.machine);
        if (!imported.length) return alert("Tidak ada data valid. Download Template dulu!");
        for (const item of imported) await saveDoc("downtimes", item.id, item);
        setDowntimes(p => [...p, ...imported]);
        toast(`${imported.length} data berhasil diimport!`);
      } catch(err) { alert("Gagal baca file: " + err.message); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }

  function exportExcel() {
    const data = downtimes.map(d => ({ Tanggal:d.date, Mesin:d.machine, Kategori:d.category, "Durasi (jam)":d.duration, Deskripsi:d.description, Status:d.status, Teknisi:d.technician }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Downtime");
    XLSX.writeFile(wb, `downtime_${today()}.xlsx`);
    toast("Export Excel berhasil!");
  }

  function downloadTemplate() {
    const data = [
      { Tanggal:"2025-06-01", Mesin:"Mesin Press A", Kategori:"Mekanik", "Durasi (jam)":3.5, Deskripsi:"Bearing aus", Status:"Selesai", Teknisi:"Budi S." },
      { Tanggal:"2025-06-02", Mesin:"Kompresor B",   Kategori:"Pneumatik","Durasi (jam)":2,   Deskripsi:"Contoh isi", Status:"Pending", Teknisi:"Anton W." },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Template");
    XLSX.writeFile(wb, "template_downtime.xlsx");
    toast("Template didownload!");
  }

  const cardStyle = { background: T.card, border:`1px solid ${T.cardBorder}`, borderRadius:16, overflow:"hidden" };
  const inputSt   = { background: T.input, border:`1px solid ${T.inputBorder}`, borderRadius:8, padding:"8px 12px", color: T.text, fontSize:13, outline:"none" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <div>
          <h2 style={{ color: T.text, fontWeight:700, fontSize:22, margin:0 }}>Data Downtime</h2>
          <p style={{ color: T.textSub, fontSize:13, margin:"4px 0 0" }}>{downtimes.length} total • {filtered.length} ditampilkan</p>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <BtnSecondary onClick={downloadTemplate} theme={T}>📄 Template</BtnSecondary>
          <BtnSecondary onClick={() => fileRef.current.click()} theme={T}>📥 Import Excel</BtnSecondary>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={importExcel} style={{ display:"none" }}/>
          <BtnSecondary onClick={exportExcel} theme={T}>📤 Export Excel</BtnSecondary>
          <BtnPrimary onClick={() => setShowForm(true)}>+ Tambah</BtnPrimary>
        </div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
        <input placeholder="🔍 Cari mesin..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search:e.target.value }))} style={inputSt}/>
        <select value={filter.cat} onChange={e => setFilter(f => ({ ...f, cat:e.target.value }))} style={{ ...inputSt, background: T.selectBg }}>
          <option value="">Semua Kategori</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status:e.target.value }))} style={{ ...inputSt, background: T.selectBg }}>
          <option value="">Semua Status</option>{["Selesai","Proses","Pending"].map(s => <option key={s}>{s}</option>)}
        </select>
        {(filter.cat || filter.status || filter.search) && (
          <button onClick={() => setFilter({ cat:"", status:"", search:"" })} style={{ padding:"8px 12px", borderRadius:8, fontSize:12, color:"#ef4444", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", cursor:"pointer" }}>× Reset</button>
        )}
      </div>

      <div style={cardStyle}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead style={{ background: T.tableHead }}>
              <tr>{["Tanggal","Mesin","Kategori","Durasi","Deskripsi","Teknisi","Status","Aksi"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"12px 16px", color: T.textSub, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding:"40px 16px", textAlign:"center", color: T.textMuted }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>📭</div>Tidak ada data
                </td></tr>
              ) : [...filtered].sort((a,b) => b.date.localeCompare(a.date)).map(d => (
                <tr key={d.id} style={{ borderTop:`1px solid ${T.tableBorder}` }}>
                  <td style={{ padding:"12px 16px", color: T.textSub, whiteSpace:"nowrap" }}>{d.date}</td>
                  <td style={{ padding:"12px 16px", color: T.text, fontWeight:500 }}>{d.machine}</td>
                  <td style={{ padding:"12px 16px", whiteSpace:"nowrap" }}>
                    <span style={{ fontSize:11, padding:"3px 8px", borderRadius:999, background:(CAT_COLORS[d.category]||"#666")+"22", color:CAT_COLORS[d.category]||"#999" }}>
                      {CAT_ICONS[d.category]} {d.category}
                    </span>
                  </td>
                  <td style={{ padding:"12px 16px", color:"#f59e0b", fontWeight:700 }}>{d.duration}j</td>
                  <td style={{ padding:"12px 16px", color: T.textSub, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.description}</td>
                  <td style={{ padding:"12px 16px", color: T.text, whiteSpace:"nowrap" }}>{d.technician}</td>
                  <td style={{ padding:"12px 16px" }}><Badge status={d.status}/></td>
                  <td style={{ padding:"12px 16px" }}>
                    <button onClick={() => remove(d.id)} style={{ padding:"4px 10px", borderRadius:6, fontSize:12, color:"#ef4444", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", cursor:"pointer" }}>🗑 Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal title="Tambah Data Downtime" onClose={() => setShowForm(false)} theme={T}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <FInput label="Tanggal" type="date" value={form.date} onChange={v => setForm(f=>({...f,date:v}))} required theme={T}/>
            <FInput label="Nama Mesin" value={form.machine} onChange={v => setForm(f=>({...f,machine:v}))} required placeholder="Contoh: Mesin Press A" theme={T}/>
            <FInput label="Kategori" type="select" options={CATEGORIES} value={form.category} onChange={v => setForm(f=>({...f,category:v}))} required theme={T}/>
            <FInput label="Durasi (jam)" type="number" value={form.duration} onChange={v => setForm(f=>({...f,duration:v}))} required placeholder="2.5" theme={T}/>
            <FInput label="Teknisi" value={form.technician} onChange={v => setForm(f=>({...f,technician:v}))} placeholder="Nama teknisi" theme={T}/>
            <FInput label="Status" type="select" options={["Pending","Proses","Selesai"]} value={form.status} onChange={v => setForm(f=>({...f,status:v}))} theme={T}/>
            <div style={{ gridColumn:"span 2" }}>
              <FInput label="Deskripsi Kerusakan" type="textarea" value={form.description} onChange={v => setForm(f=>({...f,description:v}))} placeholder="Jelaskan kerusakan..." theme={T}/>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
            <BtnSecondary onClick={() => setShowForm(false)} theme={T}>Batal</BtnSecondary>
            <BtnPrimary onClick={submit}>💾 Simpan</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SPARE PARTS ─────────────────────────────────────────────────────────────
function SparePartsPage({ parts, setParts, toast, theme }) {
  const T = theme;
  const [showForm, setShowForm] = useState(false);
  const blank = { code:"", name:"", category:"", stock:"", minStock:"", unit:"pcs", price:"" };
  const [form, setForm] = useState(blank);

  async function submit() {
    if (!form.code || !form.name) return alert("Kode dan nama wajib!");
    const item = { ...form, id:uid(), stock:Number(form.stock), minStock:Number(form.minStock), price:Number(form.price) };
    await saveDoc("spareparts", item.id, item);
    setParts(p => [...p, item]); setShowForm(false); setForm(blank);
    toast("Spare part ditambahkan!");
  }

  async function remove(id) {
    if (!window.confirm("Hapus spare part ini?")) return;
    await deleteDocument("spareparts", id);
    setParts(p => p.filter(x => !sid(x.id, id)));
    toast("Spare part dihapus!");
  }

  async function updateStock(id, delta) {
    const updated = parts.map(p => sid(p.id, id) ? { ...p, stock: Math.max(0, p.stock + delta) } : p);
    const item = updated.find(p => sid(p.id, id));
    await saveDoc("spareparts", id, item);
    setParts(updated);
  }

  const low = parts.filter(p => p.stock <= p.minStock);
  const cardStyle = { background: T.card, border:`1px solid ${T.cardBorder}`, borderRadius:16, padding:16 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <div>
          <h2 style={{ color: T.text, fontWeight:700, fontSize:22, margin:0 }}>Inventori Spare Part</h2>
          <p style={{ color: T.textSub, fontSize:13, margin:"4px 0 0" }}>{parts.length} item • <span style={{ color:"#ef4444" }}>{low.length} stok rendah</span></p>
        </div>
        <BtnPrimary onClick={() => setShowForm(true)}>+ Tambah Part</BtnPrimary>
      </div>

      {low.length > 0 && (
        <div style={{ borderRadius:12, padding:16, display:"flex", gap:12, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)" }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div>
            <div style={{ color:"#ef4444", fontWeight:600, fontSize:13, marginBottom:4 }}>Stok Menipis — Segera Order!</div>
            <div style={{ color: T.textSub, fontSize:12 }}>{low.map(p => `${p.name} (${p.stock} ${p.unit})`).join(" • ")}</div>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
        {parts.map(p => (
          <div key={p.id} style={{ ...cardStyle, border:`1px solid ${p.stock <= p.minStock ? "rgba(239,68,68,0.4)" : T.cardBorder}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, color: T.textMuted, fontFamily:"monospace", marginBottom:2 }}>{p.code}</div>
                <div style={{ color: T.text, fontWeight:600 }}>{p.name}</div>
              </div>
              <span style={{ fontSize:11, padding:"3px 8px", borderRadius:999, background:(CAT_COLORS[p.category]||"#666")+"22", color:CAT_COLORS[p.category]||"#999", flexShrink:0 }}>
                {CAT_ICONS[p.category]} {p.category}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <button onClick={() => updateStock(p.id, -1)} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${T.inputBorder}`, background: T.input, color: T.text, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
              <div style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:24, fontWeight:700, color: p.stock <= p.minStock ? "#ef4444" : "#10b981" }}>{p.stock}</div>
                <div style={{ fontSize:11, color: T.textMuted }}>{p.unit} • min: {p.minStock}</div>
              </div>
              <button onClick={() => updateStock(p.id, 1)} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${T.inputBorder}`, background: T.input, color: T.text, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:10, borderTop:`1px solid ${T.divider}` }}>
              <div style={{ fontSize:13, color: T.textSub }}>{fmt(p.price)} / {p.unit}</div>
              <button onClick={() => remove(p.id)} style={{ padding:"3px 10px", borderRadius:6, fontSize:12, color:"#ef4444", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", cursor:"pointer" }}>🗑 Hapus</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title="Tambah Spare Part" onClose={() => setShowForm(false)} theme={T}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <FInput label="Kode Part" value={form.code} onChange={v => setForm(f=>({...f,code:v}))} required placeholder="SP-009" theme={T}/>
            <FInput label="Nama Part" value={form.name} onChange={v => setForm(f=>({...f,name:v}))} required placeholder="Bearing 6206" theme={T}/>
            <FInput label="Kategori" type="select" options={CATEGORIES} value={form.category} onChange={v => setForm(f=>({...f,category:v}))} theme={T}/>
            <FInput label="Unit" type="select" options={["pcs","set","roll","liter","meter","box","kg"]} value={form.unit} onChange={v => setForm(f=>({...f,unit:v}))} theme={T}/>
            <FInput label="Stok Awal" type="number" value={form.stock} onChange={v => setForm(f=>({...f,stock:v}))} required placeholder="0" theme={T}/>
            <FInput label="Stok Minimum" type="number" value={form.minStock} onChange={v => setForm(f=>({...f,minStock:v}))} required placeholder="0" theme={T}/>
            <div style={{ gridColumn:"span 2" }}>
              <FInput label="Harga Satuan (Rp)" type="number" value={form.price} onChange={v => setForm(f=>({...f,price:v}))} placeholder="0" theme={T}/>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
            <BtnSecondary onClick={() => setShowForm(false)} theme={T}>Batal</BtnSecondary>
            <BtnPrimary onClick={submit}>💾 Simpan</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ORDER PAGE ───────────────────────────────────────────────────────────────
function OrderPage({ orders, setOrders, toast, theme }) {
  const T = theme;
  const [showForm, setShowForm] = useState(false);
  const blank = { date:today(), partCode:"", partName:"", qty:"", unit:"pcs", supplier:"", price:"", status:"Draft", notes:"" };
  const [form, setForm] = useState(blank);

  async function submit() {
    if (!form.partName || !form.qty) return alert("Nama part dan qty wajib!");
    const item = { ...form, id:uid(), qty:Number(form.qty), price:Number(form.price), total:Number(form.qty)*Number(form.price) };
    await saveDoc("orders", item.id, item);
    setOrders(p => [...p, item]); setShowForm(false); setForm(blank);
    toast("Order berhasil dibuat!");
  }

  async function updateStatus(id, status) {
    const item = orders.find(o => sid(o.id, id));
    if (item) { await saveDoc("orders", id, { ...item, status }); setOrders(p => p.map(o => sid(o.id,id) ? {...o,status} : o)); toast("Status diupdate!"); }
  }

  async function remove(id) {
    if (!window.confirm("Hapus order ini?")) return;
    await deleteDocument("orders", id);
    setOrders(p => p.filter(o => !sid(o.id, id)));
    toast("Order dihapus!");
  }

  const totalVal = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const cardStyle = { background: T.card, border:`1px solid ${T.cardBorder}`, borderRadius:16 };
  const inputSt   = { background: T.selectBg, border:`1px solid ${T.inputBorder}`, borderRadius:6, padding:"4px 8px", color: T.text, fontSize:12, outline:"none" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <div>
          <h2 style={{ color: T.text, fontWeight:700, fontSize:22, margin:0 }}>Order Spare Part</h2>
          <p style={{ color: T.textSub, fontSize:13, margin:"4px 0 0" }}>{orders.length} order • Total: {fmt(totalVal)}</p>
        </div>
        <BtnPrimary onClick={() => setShowForm(true)}>+ Buat Order</BtnPrimary>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:16 }}>
        {[{s:"Draft",c:"#6b7280",i:"📝"},{s:"Diajukan",c:"#3b82f6",i:"📤"},{s:"Disetujui",c:"#f59e0b",i:"✔️"},{s:"Diterima",c:"#10b981",i:"✅"}].map(({s,c,i}) => (
          <StatCard key={s} label={s} value={orders.filter(o=>o.status===s).length} color={c} icon={i} theme={T}/>
        ))}
      </div>

      <div style={{ ...cardStyle, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead style={{ background: T.tableHead }}>
              <tr>{["Tanggal","Kode","Nama Part","Qty","Supplier","Harga","Total","Status","Aksi"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"12px 16px", color: T.textSub, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={9} style={{ padding:"40px", textAlign:"center", color: T.textMuted }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>🛒</div>Belum ada order
                </td></tr>
              ) : orders.map(o => (
                <tr key={o.id} style={{ borderTop:`1px solid ${T.tableBorder}` }}>
                  <td style={{ padding:"12px 16px", color: T.textSub, whiteSpace:"nowrap" }}>{o.date}</td>
                  <td style={{ padding:"12px 16px", color: T.textMuted, fontFamily:"monospace", fontSize:11 }}>{o.partCode||"—"}</td>
                  <td style={{ padding:"12px 16px", color: T.text }}>{o.partName}</td>
                  <td style={{ padding:"12px 16px", color: T.text, whiteSpace:"nowrap" }}>{o.qty} {o.unit}</td>
                  <td style={{ padding:"12px 16px", color: T.textSub }}>{o.supplier||"—"}</td>
                  <td style={{ padding:"12px 16px", color: T.textSub, whiteSpace:"nowrap" }}>{o.price?fmt(o.price):"—"}</td>
                  <td style={{ padding:"12px 16px", color:"#f59e0b", fontWeight:600, whiteSpace:"nowrap" }}>{o.total?fmt(o.total):"—"}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} style={inputSt}>
                      {["Draft","Diajukan","Disetujui","Diterima"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    <button onClick={() => remove(o.id)} style={{ padding:"4px 10px", borderRadius:6, fontSize:12, color:"#ef4444", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", cursor:"pointer" }}>🗑 Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal title="Buat Order Spare Part" onClose={() => setShowForm(false)} theme={T}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <FInput label="Tanggal" type="date" value={form.date} onChange={v => setForm(f=>({...f,date:v}))} required theme={T}/>
            <FInput label="Kode Part" value={form.partCode} onChange={v => setForm(f=>({...f,partCode:v}))} placeholder="Opsional" theme={T}/>
            <FInput label="Nama Part" value={form.partName} onChange={v => setForm(f=>({...f,partName:v}))} required placeholder="Nama spare part" theme={T}/>
            <FInput label="Qty" type="number" value={form.qty} onChange={v => setForm(f=>({...f,qty:v}))} required theme={T}/>
            <FInput label="Unit" type="select" options={["pcs","set","roll","liter","meter","box","kg"]} value={form.unit} onChange={v => setForm(f=>({...f,unit:v}))} theme={T}/>
            <FInput label="Supplier" value={form.supplier} onChange={v => setForm(f=>({...f,supplier:v}))} placeholder="Nama supplier" theme={T}/>
            <FInput label="Harga Satuan (Rp)" type="number" value={form.price} onChange={v => setForm(f=>({...f,price:v}))} placeholder="0" theme={T}/>
            <FInput label="Status" type="select" options={["Draft","Diajukan","Disetujui","Diterima"]} value={form.status} onChange={v => setForm(f=>({...f,status:v}))} theme={T}/>
            <div style={{ gridColumn:"span 2" }}>
              <FInput label="Catatan" type="textarea" value={form.notes} onChange={v => setForm(f=>({...f,notes:v}))} placeholder="Catatan tambahan..." theme={T}/>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
            <BtnSecondary onClick={() => setShowForm(false)} theme={T}>Batal</BtnSecondary>
            <BtnPrimary onClick={submit}>💾 Simpan</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DAILY ACTIVITY ───────────────────────────────────────────────────────────
function ActivityPage({ activities, setActivities, toast, theme }) {
  const T = theme;
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState(today());
  const blank = { date:today(), shift:"Pagi", technician:"", type:"Preventive", machine:"", description:"", status:"Proses", duration:"" };
  const [form, setForm] = useState(blank);

  async function submit() {
    if (!form.technician || !form.machine || !form.description) return alert("Teknisi, Mesin, Deskripsi wajib!");
    const item = { ...form, id:uid(), duration:Number(form.duration) };
    await saveDoc("activities", item.id, item);
    setActivities(p => [...p, item]); setShowForm(false); setForm(blank);
    toast("Aktivitas berhasil dicatat!");
  }

  async function remove(id) {
    if (!window.confirm("Hapus aktivitas ini?")) return;
    await deleteDocument("activities", id);
    setActivities(p => p.filter(a => !sid(a.id, id)));
    toast("Aktivitas dihapus!");
  }

  const filtered  = filterDate ? activities.filter(a => a.date === filterDate) : activities;
  const tIcons    = { Preventive:"🛡", Korektif:"🔧", Inspeksi:"🔍", Kalibrasi:"📐", Cleaning:"🧹" };
  const shiftIcons= { Pagi:"🌅", Siang:"☀️", Malam:"🌙" };
  const inputSt   = { background: T.selectBg, border:`1px solid ${T.inputBorder}`, borderRadius:8, padding:"8px 12px", color: T.text, fontSize:13, outline:"none" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <div>
          <h2 style={{ color: T.text, fontWeight:700, fontSize:22, margin:0 }}>Daily Activity</h2>
          <p style={{ color: T.textSub, fontSize:13, margin:"4px 0 0" }}>Log aktivitas harian teknisi • {activities.length} total</p>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={inputSt}/>
          <BtnPrimary onClick={() => setShowForm(true)}>+ Log Aktivitas</BtnPrimary>
        </div>
      </div>

      {["Pagi","Siang","Malam"].map(shift => {
        const items = filtered.filter(a => a.shift === shift);
        if (!items.length) return null;
        return (
          <div key={shift}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <div style={{ color: T.text, fontWeight:600, fontSize:14 }}>{shiftIcons[shift]} Shift {shift}</div>
              <div style={{ flex:1, height:1, background: T.divider }}/>
              <div style={{ fontSize:12, color: T.textMuted }}>{items.length} aktivitas</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {items.map(a => (
                <div key={a.id} style={{ background: T.card, border:`1px solid ${T.cardBorder}`, borderRadius:14, padding:16, display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ flexShrink:0, width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, background:"rgba(245,158,11,0.12)" }}>
                    {tIcons[a.type] || "📋"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ color: T.text, fontWeight:600, fontSize:14 }}>{a.machine}</span>
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:999, background:"rgba(59,130,246,0.15)", color:"#60a5fa" }}>{a.type}</span>
                      <Badge status={a.status}/>
                    </div>
                    <div style={{ color: T.textSub, fontSize:13, marginBottom:4 }}>{a.description}</div>
                    <div style={{ color: T.textMuted, fontSize:12 }}>👤 {a.technician}{a.duration ? ` • ⏱ ${a.duration} jam` : ""}</div>
                  </div>
                  <button onClick={() => remove(a.id)} style={{ flexShrink:0, padding:"4px 10px", borderRadius:6, fontSize:12, color:"#ef4444", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", cursor:"pointer" }}>🗑</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ background: T.card, border:`1px solid ${T.cardBorder}`, borderRadius:16, padding:"48px 16px", textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          <div style={{ color: T.textSub, marginBottom:16 }}>Tidak ada aktivitas pada tanggal ini</div>
          <BtnPrimary onClick={() => setShowForm(true)}>+ Tambah Aktivitas</BtnPrimary>
        </div>
      )}

      {showForm && (
        <Modal title="Log Daily Activity" onClose={() => setShowForm(false)} theme={T}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <FInput label="Tanggal" type="date" value={form.date} onChange={v => setForm(f=>({...f,date:v}))} required theme={T}/>
            <FInput label="Shift" type="select" options={["Pagi","Siang","Malam"]} value={form.shift} onChange={v => setForm(f=>({...f,shift:v}))} required theme={T}/>
            <FInput label="Teknisi" value={form.technician} onChange={v => setForm(f=>({...f,technician:v}))} required placeholder="Nama teknisi" theme={T}/>
            <FInput label="Jenis Aktivitas" type="select" options={["Preventive","Korektif","Inspeksi","Kalibrasi","Cleaning"]} value={form.type} onChange={v => setForm(f=>({...f,type:v}))} theme={T}/>
            <FInput label="Mesin / Aset" value={form.machine} onChange={v => setForm(f=>({...f,machine:v}))} required placeholder="Nama mesin" theme={T}/>
            <FInput label="Durasi (jam)" type="number" value={form.duration} onChange={v => setForm(f=>({...f,duration:v}))} placeholder="0" theme={T}/>
            <FInput label="Status" type="select" options={["Proses","Selesai","Pending"]} value={form.status} onChange={v => setForm(f=>({...f,status:v}))} theme={T}/>
            <div style={{ gridColumn:"span 2" }}>
              <FInput label="Deskripsi Pekerjaan" type="textarea" value={form.description} onChange={v => setForm(f=>({...f,description:v}))} required placeholder="Jelaskan pekerjaan..." theme={T}/>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
            <BtnSecondary onClick={() => setShowForm(false)} theme={T}>Batal</BtnSecondary>
            <BtnPrimary onClick={submit}>💾 Simpan</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]             = useState("dashboard");
  const [downtimes, setDowntimes]   = useState([]);
  const [parts, setParts]           = useState([]);
  const [orders, setOrders]         = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [toastMsg, setToastMsg]     = useState(null);
  const [darkMode, setDarkMode]     = useState(true);

  const T = darkMode ? DARK : LIGHT;
  const toast = msg => setToastMsg(msg);

  useEffect(() => {
    (async () => {
      try {
        const [dt, sp, ord, act] = await Promise.all([
          loadCollection("downtimes"), loadCollection("spareparts"),
          loadCollection("orders"),    loadCollection("activities"),
        ]);
        if (dt.length)  { setDowntimes(dt); } else { for (const x of SEED_DOWNTIMES)  await saveDoc("downtimes",  x.id, x); setDowntimes(SEED_DOWNTIMES); }
        if (sp.length)  { setParts(sp); }    else { for (const x of SEED_PARTS)        await saveDoc("spareparts", x.id, x); setParts(SEED_PARTS); }
        if (act.length) { setActivities(act);} else { for (const x of SEED_ACTIVITIES) await saveDoc("activities", x.id, x); setActivities(SEED_ACTIVITIES); }
        setOrders(ord);
      } catch(e) { console.error("Load error:", e); }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div style={{ background: T.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚙️</div>
        <div style={{ color: T.text, fontWeight:600, fontSize:16, marginBottom:8 }}>Memuat Sistem...</div>
        <div style={{ color: T.textSub, fontSize:13 }}>Menghubungkan ke Firebase...</div>
      </div>
    </div>
  );

  function navTo(id) { setPage(id); setMenuOpen(false); }

  // ── THEME TOGGLE BUTTON ──
  const ThemeBtn = () => (
    <button onClick={() => setDarkMode(d => !d)} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{ padding:"8px 14px", borderRadius:10, border:`1px solid ${T.cardBorder}`, background: T.card, color: T.text, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", gap:6 }}>
      {darkMode ? "☀️" : "🌙"}
      <span style={{ fontSize:12, fontWeight:500 }}>{darkMode ? "Day" : "Night"}</span>
    </button>
  );

  return (
    <div style={{ background: T.bg, minHeight:"100vh", fontFamily:"'DM Sans','Nunito',system-ui,sans-serif", color: T.text }}>
      {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg(null)}/>}

      {/* Mobile top bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", position:"sticky", top:0, zIndex:40, background: T.sidebar, borderBottom:`1px solid ${T.divider}` }} className="lg-hidden">
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20 }}>⚙️</span>
          <span style={{ color: T.text, fontWeight:700, fontSize:14 }}>MMS Dashboard</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <ThemeBtn/>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: T.card, border:`1px solid ${T.cardBorder}`, color: T.text, padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:16 }}>☰</button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,0.6)" }} onClick={() => setMenuOpen(false)}>
          <div style={{ height:"100%", width:240, padding:20, background: T.sidebar, display:"flex", flexDirection:"column", gap:4 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:11, color: T.textMuted, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:12, padding:"0 12px" }}>Menu</div>
            {PAGES.map(p => (
              <button key={p.id} onClick={() => navTo(p.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:"none", cursor:"pointer", textAlign:"left", width:"100%", fontWeight:500, fontSize:13, background: page===p.id ? T.navActive : "transparent", color: page===p.id ? "#f59e0b" : T.textSub }}>
                <span>{p.icon}</span><span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"flex" }}>
        {/* Desktop sidebar */}
        <aside style={{ width:240, flexShrink:0, height:"100vh", position:"sticky", top:0, background: T.sidebar, borderRight:`1px solid ${T.divider}`, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"20px 24px", borderBottom:`1px solid ${T.divider}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, background:"rgba(245,158,11,0.15)" }}>⚙️</div>
              <div>
                <div style={{ color: T.text, fontWeight:700, fontSize:13 }}>Maintenance</div>
                <div style={{ color: T.textMuted, fontSize:11 }}>Management System</div>
              </div>
            </div>
          </div>

          <nav style={{ flex:1, padding:12, display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
            {PAGES.map(p => (
              <button key={p.id} onClick={() => navTo(p.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:"none", cursor:"pointer", textAlign:"left", width:"100%", fontWeight:500, fontSize:13, background: page===p.id ? T.navActive : "transparent", color: page===p.id ? "#f59e0b" : T.textSub, borderLeft: page===p.id ? "2px solid #f59e0b" : "2px solid transparent" }}>
                <span>{p.icon}</span><span>{p.label}</span>
              </button>
            ))}
          </nav>

          {/* Theme toggle di sidebar */}
          <div style={{ padding:16, borderTop:`1px solid ${T.divider}` }}>
            <button onClick={() => setDarkMode(d => !d)}
              style={{ width:"100%", padding:"10px", borderRadius:10, border:`1px solid ${T.cardBorder}`, background: T.card, color: T.text, cursor:"pointer", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {darkMode ? "☀️ Mode Siang" : "🌙 Mode Malam"}
            </button>
            <div style={{ fontSize:11, color: T.textMuted, textAlign:"center", marginTop:8, lineHeight:1.5 }}>
              🌐 Data real-time via Firebase
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex:1, overflowY:"auto", minHeight:"100vh" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>
            {page === "dashboard"  && <Dashboard     downtimes={downtimes} theme={T}/>}
            {page === "downtime"   && <DowntimePage  downtimes={downtimes}  setDowntimes={setDowntimes} toast={toast} theme={T}/>}
            {page === "spareparts" && <SparePartsPage parts={parts}         setParts={setParts}         toast={toast} theme={T}/>}
            {page === "orders"     && <OrderPage      orders={orders}        setOrders={setOrders}       toast={toast} theme={T}/>}
            {page === "activity"   && <ActivityPage   activities={activities} setActivities={setActivities} toast={toast} theme={T}/>}
          </div>
        </main>
      </div>
    </div>
  );
}
