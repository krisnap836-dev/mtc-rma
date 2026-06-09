import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import {
  loadCollection, saveDoc, deleteDocument, subscribeCollection
} from "./firebase";

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
  { id: "downtime",  label: "Downtime",       icon: "⏱️" },
  { id: "spareparts",label: "Spare Part",     icon: "🔩" },
  { id: "orders",    label: "Order Part",     icon: "🛒" },
  { id: "activity",  label: "Daily Activity", icon: "📋" },
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmt  = n => "Rp " + Number(n).toLocaleString("id-ID");
const today= () => new Date().toISOString().split("T")[0];
const uid  = () => "id_" + Date.now() + "_" + Math.random().toString(36).slice(2);
const sid  = (a,b) => String(a) === String(b);

// ─── SHARED UI ───────────────────────────────────────────────────────────────
function Badge({ status }) {
  const c = { Selesai:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30", Proses:"bg-amber-500/20 text-amber-400 border-amber-500/30", Pending:"bg-red-500/20 text-red-400 border-red-500/30" };
  return <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${c[status]||"bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>{status}</span>;
}
function Card({ label, value, sub, color, icon }) {
  return (
    <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}} className="rounded-2xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">{label}</span><span className="text-2xl">{icon}</span></div>
      <div className="text-3xl font-bold" style={{color}}>{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.75)"}}>
      <div style={{background:"#0f1117",border:"1px solid rgba(255,255,255,0.1)",maxHeight:"90vh"}} className="rounded-2xl w-full max-w-2xl overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b" style={{borderColor:"rgba(255,255,255,0.08)"}}>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
function FInput({ label, type="text", value, onChange, options, required, placeholder }) {
  const cls = "w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50";
  const st  = {background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"};
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}{required&&" *"}</label>
      {type==="select" ? (
        <select value={value} onChange={e=>onChange(e.target.value)} className={cls} style={{...st,background:"#1a1d27"}}>
          <option value="">-- Pilih --</option>
          {options.map(o=><option key={o}>{o}</option>)}
        </select>
      ) : type==="textarea" ? (
        <textarea value={value} onChange={e=>onChange(e.target.value)} className={cls} style={st} rows={3} placeholder={placeholder}/>
      ) : (
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} className={cls} style={st} placeholder={placeholder}/>
      )}
    </div>
  );
}
function Toast({ msg, onClose }) {
  useEffect(()=>{ const t=setTimeout(onClose,3000); return ()=>clearTimeout(t); },[onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl text-white text-sm font-medium shadow-2xl flex items-center gap-3"
      style={{background:"#10b981",boxShadow:"0 8px 32px rgba(16,185,129,0.4)"}}>
      ✅ {msg}
      <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-1">×</button>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ downtimes }) {
  const total   = downtimes.length;
  const selesai = downtimes.filter(d=>d.status==="Selesai").length;
  const pending = downtimes.filter(d=>d.status==="Pending").length;
  const proses  = downtimes.filter(d=>d.status==="Proses").length;
  const totalJam= downtimes.reduce((s,d)=>s+Number(d.duration||0),0).toFixed(1);

  const catData = CATEGORIES.map(c=>({
    name: c,
    jam:  Number(downtimes.filter(d=>d.category===c).reduce((s,d)=>s+Number(d.duration||0),0).toFixed(1)),
    count:downtimes.filter(d=>d.category===c).length,
  }));
  const days = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d.toISOString().split("T")[0];});
  const trendData = days.map(day=>({
    day:  day.slice(5),
    jam:  Number(downtimes.filter(d=>d.date===day).reduce((s,d)=>s+Number(d.duration||0),0).toFixed(1)),
    count:downtimes.filter(d=>d.date===day).length,
  }));
  const pieData = CATEGORIES.map(c=>({
    name: c, value:Number(downtimes.filter(d=>d.category===c).reduce((s,d)=>s+Number(d.duration||0),0).toFixed(1))
  })).filter(p=>p.value>0);

  const tt = {contentStyle:{background:"#1a1d27",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}};

  return (
    <div className="flex flex-col gap-6">
      <div><h2 className="text-2xl font-bold text-white mb-1">Dashboard Maintenance</h2><p className="text-gray-500 text-sm">Ringkasan performa dan downtime mesin</p></div>
      <div className="grid gap-4" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
        <Card label="Total Downtime"    value={`${totalJam} Jam`}    sub={`${total} kejadian`}         color="#f59e0b" icon="⏱️"/>
        <Card label="Permintaan Masuk"  value={total}                 sub="Total perbaikan"             color="#3b82f6" icon="📋"/>
        <Card label="Selesai"           value={selesai}               sub={`${total?((selesai/total)*100).toFixed(0):0}% completion`} color="#10b981" icon="✅"/>
        <Card label="Pending / Proses"  value={`${pending} / ${proses}`} sub="Perlu perhatian"         color="#ef4444" icon="⚠️"/>
      </div>
      <div className="grid gap-6" style={{gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))"}}>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}} className="rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">📈 Trend Downtime 7 Hari</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="day" tick={{fill:"#9ca3af",fontSize:11}}/><YAxis tick={{fill:"#9ca3af",fontSize:11}}/>
              <Tooltip {...tt}/><Line type="monotone" dataKey="jam" stroke="#f59e0b" strokeWidth={2} dot={{fill:"#f59e0b"}} name="Jam"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}} className="rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">🥧 Distribusi per Kategori</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieData.map(e=><Cell key={e.name} fill={CAT_COLORS[e.name]}/>)}
              </Pie>
              <Tooltip {...tt} formatter={v=>[`${v} jam`]}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}} className="rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4 text-sm">📊 Total Jam Downtime per Kategori</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={catData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
            <XAxis dataKey="name" tick={{fill:"#9ca3af",fontSize:12}}/><YAxis tick={{fill:"#9ca3af",fontSize:12}}/>
            <Tooltip {...tt} formatter={(v,n)=>[n==="jam"?`${v} jam`:`${v} kejadian`,n==="jam"?"Total Jam":"Jumlah"]}/>
            <Legend wrapperStyle={{color:"#9ca3af",fontSize:12}}/>
            <Bar dataKey="jam" name="Jam" radius={[6,6,0,0]}>{catData.map(e=><Cell key={e.name} fill={CAT_COLORS[e.name]}/>)}</Bar>
            <Bar dataKey="count" name="Kejadian" fill="rgba(255,255,255,0.15)" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}} className="rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4 text-sm">🕒 Downtime Terbaru</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-gray-500 text-xs">{["Tanggal","Mesin","Kategori","Durasi","Status"].map(h=><th key={h} className="text-left pb-3 pr-4">{h}</th>)}</tr></thead>
            <tbody>
              {[...downtimes].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(d=>(
                <tr key={d.id} style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                  <td className="py-2 pr-4 text-gray-400">{d.date}</td>
                  <td className="py-2 pr-4 text-white">{d.machine}</td>
                  <td className="py-2 pr-4"><span className="text-xs px-2 py-0.5 rounded-full" style={{background:(CAT_COLORS[d.category]||"#666")+"30",color:CAT_COLORS[d.category]||"#999"}}>{CAT_ICONS[d.category]} {d.category}</span></td>
                  <td className="py-2 pr-4 text-amber-400 font-medium">{d.duration}j</td>
                  <td className="py-2"><Badge status={d.status}/></td>
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
function DowntimePage({ downtimes, setDowntimes, toast }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({cat:"",status:"",search:""});
  const blank = {date:today(),machine:"",category:"",duration:"",description:"",status:"Pending",technician:""};
  const [form, setForm] = useState(blank);
  const fileRef = useRef();

  const filtered = downtimes.filter(d=>
    (!filter.cat||d.category===filter.cat) &&
    (!filter.status||d.status===filter.status) &&
    (!filter.search||d.machine.toLowerCase().includes(filter.search.toLowerCase()))
  );

  async function submit() {
    if (!form.machine||!form.category||!form.duration) return alert("Lengkapi: Mesin, Kategori, Durasi!");
    const item = {...form, id:uid(), duration:Number(form.duration)};
    await saveDoc("downtimes", item.id, item);
    setDowntimes(p=>[...p, item]);
    setShowForm(false); setForm(blank);
    toast("Data downtime berhasil disimpan!");
  }

  async function remove(id) {
    if (!window.confirm("Yakin hapus data ini?")) return;
    await deleteDocument("downtimes", id);
    setDowntimes(p=>p.filter(d=>!sid(d.id,id)));
    toast("Data berhasil dihapus!");
  }

  function importExcel(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const wb  = XLSX.read(new Uint8Array(ev.target.result), {type:"array"});
        const rows= XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {defval:""});
        const imported = rows.map(r=>({
          id:uid(),
          date: String(r.date||r.Tanggal||today()).trim(),
          machine: String(r.machine||r.Mesin||"").trim(),
          category: String(r.category||r.Kategori||"Mekanik").trim(),
          duration: Number(r.duration||r.Durasi||r["Durasi (jam)"]||0),
          description: String(r.description||r.Deskripsi||"").trim(),
          status: String(r.status||r.Status||"Pending").trim(),
          technician: String(r.technician||r.Teknisi||"").trim(),
        })).filter(r=>r.machine);
        if (!imported.length) return alert("Tidak ada data valid. Download Template dulu!");
        for (const item of imported) await saveDoc("downtimes", item.id, item);
        setDowntimes(p=>[...p,...imported]);
        toast(`${imported.length} data berhasil diimport!`);
      } catch(err){ alert("Gagal baca file: "+err.message); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value="";
  }

  function exportExcel() {
    const data = downtimes.map(d=>({Tanggal:d.date,Mesin:d.machine,Kategori:d.category,"Durasi (jam)":d.duration,Deskripsi:d.description,Status:d.status,Teknisi:d.technician}));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Downtime");
    XLSX.writeFile(wb, `downtime_${today()}.xlsx`);
    toast("Export Excel berhasil!");
  }

  function downloadTemplate() {
    const data = [
      {Tanggal:"2025-06-01",Mesin:"Mesin Press A",Kategori:"Mekanik","Durasi (jam)":3.5,Deskripsi:"Bearing aus",Status:"Selesai",Teknisi:"Budi S."},
      {Tanggal:"2025-06-02",Mesin:"Kompresor B",Kategori:"Pneumatik","Durasi (jam)":2,Deskripsi:"Contoh isi sini",Status:"Pending",Teknisi:"Anton W."},
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Template");
    XLSX.writeFile(wb, "template_downtime.xlsx");
    toast("Template didownload!");
  }

  const btnStyle = {background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"};
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-bold text-white mb-1">Data Downtime</h2><p className="text-gray-500 text-sm">{downtimes.length} total • {filtered.length} ditampilkan</p></div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={downloadTemplate} className="px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white" style={btnStyle}>📄 Template</button>
          <button onClick={()=>fileRef.current.click()} className="px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white" style={btnStyle}>📥 Import Excel</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={importExcel} className="hidden"/>
          <button onClick={exportExcel} className="px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white" style={btnStyle}>📤 Export Excel</button>
          <button onClick={()=>setShowForm(true)} className="px-4 py-2 rounded-xl text-sm font-bold text-black" style={{background:"#f59e0b"}}>+ Tambah</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <input placeholder="🔍 Cari mesin..." value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))} className="px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={btnStyle}/>
        <select value={filter.cat} onChange={e=>setFilter(f=>({...f,cat:e.target.value}))} className="px-3 py-2 rounded-lg text-sm text-white" style={{background:"#1a1d27",border:"1px solid rgba(255,255,255,0.1)"}}>
          <option value="">Semua Kategori</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
        <select value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))} className="px-3 py-2 rounded-lg text-sm text-white" style={{background:"#1a1d27",border:"1px solid rgba(255,255,255,0.1)"}}>
          <option value="">Semua Status</option>{["Selesai","Proses","Pending"].map(s=><option key={s}>{s}</option>)}
        </select>
        {(filter.cat||filter.status||filter.search)&&<button onClick={()=>setFilter({cat:"",status:"",search:""})} className="px-3 py-2 rounded-lg text-xs text-red-400" style={{background:"rgba(239,68,68,0.1)"}}>× Reset</button>}
      </div>
      <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}} className="rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{background:"rgba(255,255,255,0.04)"}}>
              <tr className="text-gray-400 text-xs">{["Tanggal","Mesin","Kategori","Durasi","Deskripsi","Teknisi","Status","Aksi"].map(h=><th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length===0?(
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-600"><div className="text-3xl mb-2">📭</div>Tidak ada data</td></tr>
              ):[...filtered].sort((a,b)=>b.date.localeCompare(a.date)).map(d=>(
                <tr key={d.id} style={{borderTop:"1px solid rgba(255,255,255,0.05)"}} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{d.date}</td>
                  <td className="px-4 py-3 text-white font-medium">{d.machine}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><span className="text-xs px-2 py-1 rounded-full" style={{background:(CAT_COLORS[d.category]||"#666")+"25",color:CAT_COLORS[d.category]||"#999"}}>{CAT_ICONS[d.category]} {d.category}</span></td>
                  <td className="px-4 py-3 text-amber-400 font-bold">{d.duration}j</td>
                  <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{d.description}</td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{d.technician}</td>
                  <td className="px-4 py-3"><Badge status={d.status}/></td>
                  <td className="px-4 py-3"><button onClick={()=>remove(d.id)} className="px-2 py-1 rounded-lg text-xs text-red-400 hover:text-white hover:bg-red-500/20">🗑 Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showForm&&(
        <Modal title="Tambah Data Downtime" onClose={()=>setShowForm(false)}>
          <div className="grid grid-cols-2 gap-4">
            <FInput label="Tanggal" type="date" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} required/>
            <FInput label="Nama Mesin" value={form.machine} onChange={v=>setForm(f=>({...f,machine:v}))} required placeholder="Contoh: Mesin Press A"/>
            <FInput label="Kategori" type="select" options={CATEGORIES} value={form.category} onChange={v=>setForm(f=>({...f,category:v}))} required/>
            <FInput label="Durasi (jam)" type="number" value={form.duration} onChange={v=>setForm(f=>({...f,duration:v}))} required placeholder="2.5"/>
            <FInput label="Teknisi" value={form.technician} onChange={v=>setForm(f=>({...f,technician:v}))} placeholder="Nama teknisi"/>
            <FInput label="Status" type="select" options={["Pending","Proses","Selesai"]} value={form.status} onChange={v=>setForm(f=>({...f,status:v}))}/>
            <div className="col-span-2"><FInput label="Deskripsi Kerusakan" type="textarea" value={form.description} onChange={v=>setForm(f=>({...f,description:v}))} placeholder="Jelaskan kerusakan..."/></div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button onClick={()=>setShowForm(false)} className="px-5 py-2 rounded-xl text-sm text-gray-400" style={{background:"rgba(255,255,255,0.06)"}}>Batal</button>
            <button onClick={submit} className="px-5 py-2 rounded-xl text-sm font-bold text-black" style={{background:"#f59e0b"}}>💾 Simpan</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SPARE PARTS PAGE ─────────────────────────────────────────────────────────
function SparePartsPage({ parts, setParts, toast }) {
  const [showForm, setShowForm] = useState(false);
  const blank = {code:"",name:"",category:"",stock:"",minStock:"",unit:"pcs",price:""};
  const [form, setForm] = useState(blank);

  async function submit() {
    if (!form.code||!form.name) return alert("Kode dan nama wajib!");
    const item = {...form, id:uid(), stock:Number(form.stock), minStock:Number(form.minStock), price:Number(form.price)};
    await saveDoc("spareparts", item.id, item);
    setParts(p=>[...p,item]); setShowForm(false); setForm(blank);
    toast("Spare part ditambahkan!");
  }

  async function remove(id) {
    if (!window.confirm("Hapus spare part ini?")) return;
    await deleteDocument("spareparts", id);
    setParts(p=>p.filter(x=>!sid(x.id,id)));
    toast("Spare part dihapus!");
  }

  async function updateStock(id, delta) {
    const updated = parts.map(p=>sid(p.id,id)?{...p,stock:Math.max(0,p.stock+delta)}:p);
    const item = updated.find(p=>sid(p.id,id));
    await saveDoc("spareparts", id, item);
    setParts(updated);
  }

  const low = parts.filter(p=>p.stock<=p.minStock);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-bold text-white mb-1">Inventori Spare Part</h2><p className="text-gray-500 text-sm">{parts.length} item • <span className="text-red-400">{low.length} stok rendah</span></p></div>
        <button onClick={()=>setShowForm(true)} className="px-4 py-2 rounded-xl text-sm font-bold text-black" style={{background:"#f59e0b"}}>+ Tambah Part</button>
      </div>
      {low.length>0&&(
        <div className="rounded-xl p-4 flex gap-3 items-start" style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)"}}>
          <span className="text-xl">⚠️</span>
          <div><div className="text-red-400 font-semibold text-sm mb-1">Stok Menipis — Segera Order!</div>
          <div className="text-gray-400 text-xs">{low.map(p=>`${p.name} (${p.stock} ${p.unit})`).join(" • ")}</div></div>
        </div>
      )}
      <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))"}}>
        {parts.map(p=>(
          <div key={p.id} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${p.stock<=p.minStock?"rgba(239,68,68,0.35)":"rgba(255,255,255,0.08)"}`}} className="rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div><div className="text-xs text-gray-500 font-mono mb-0.5">{p.code}</div><div className="text-white font-semibold">{p.name}</div></div>
              <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{background:(CAT_COLORS[p.category]||"#666")+"25",color:CAT_COLORS[p.category]||"#999"}}>{CAT_ICONS[p.category]} {p.category}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <button onClick={()=>updateStock(p.id,-1)} className="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center hover:bg-white/20" style={{background:"rgba(255,255,255,0.1)"}}>−</button>
              <div className="flex-1 text-center">
                <div className={`text-2xl font-bold ${p.stock<=p.minStock?"text-red-400":"text-emerald-400"}`}>{p.stock}</div>
                <div className="text-xs text-gray-500">{p.unit} • min: {p.minStock}</div>
              </div>
              <button onClick={()=>updateStock(p.id,1)} className="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center hover:bg-white/20" style={{background:"rgba(255,255,255,0.1)"}}>+</button>
            </div>
            <div className="flex items-center justify-between pt-2" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="text-sm text-gray-400">{fmt(p.price)} / {p.unit}</div>
              <button onClick={()=>remove(p.id)} className="text-xs px-2 py-1 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20">🗑 Hapus</button>
            </div>
          </div>
        ))}
      </div>
      {showForm&&(
        <Modal title="Tambah Spare Part" onClose={()=>setShowForm(false)}>
          <div className="grid grid-cols-2 gap-4">
            <FInput label="Kode Part" value={form.code} onChange={v=>setForm(f=>({...f,code:v}))} required placeholder="SP-009"/>
            <FInput label="Nama Part" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required placeholder="Bearing 6206"/>
            <FInput label="Kategori" type="select" options={CATEGORIES} value={form.category} onChange={v=>setForm(f=>({...f,category:v}))}/>
            <FInput label="Unit" type="select" options={["pcs","set","roll","liter","meter","box","kg"]} value={form.unit} onChange={v=>setForm(f=>({...f,unit:v}))}/>
            <FInput label="Stok Awal" type="number" value={form.stock} onChange={v=>setForm(f=>({...f,stock:v}))} required placeholder="0"/>
            <FInput label="Stok Minimum" type="number" value={form.minStock} onChange={v=>setForm(f=>({...f,minStock:v}))} required placeholder="0"/>
            <div className="col-span-2"><FInput label="Harga Satuan (Rp)" type="number" value={form.price} onChange={v=>setForm(f=>({...f,price:v}))} placeholder="0"/></div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button onClick={()=>setShowForm(false)} className="px-5 py-2 rounded-xl text-sm text-gray-400" style={{background:"rgba(255,255,255,0.06)"}}>Batal</button>
            <button onClick={submit} className="px-5 py-2 rounded-xl text-sm font-bold text-black" style={{background:"#f59e0b"}}>💾 Simpan</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ORDER PAGE ───────────────────────────────────────────────────────────────
function OrderPage({ orders, setOrders, toast }) {
  const [showForm, setShowForm] = useState(false);
  const blank = {date:today(),partCode:"",partName:"",qty:"",unit:"pcs",supplier:"",price:"",status:"Draft",notes:""};
  const [form, setForm] = useState(blank);

  async function submit() {
    if (!form.partName||!form.qty) return alert("Nama part dan qty wajib!");
    const item = {...form, id:uid(), qty:Number(form.qty), price:Number(form.price), total:Number(form.qty)*Number(form.price)};
    await saveDoc("orders", item.id, item);
    setOrders(p=>[...p,item]); setShowForm(false); setForm(blank);
    toast("Order berhasil dibuat!");
  }

  async function updateStatus(id, status) {
    const item = orders.find(o=>sid(o.id,id));
    if (item) { await saveDoc("orders", id, {...item,status}); setOrders(p=>p.map(o=>sid(o.id,id)?{...o,status}:o)); toast("Status diupdate!"); }
  }

  async function remove(id) {
    if (!window.confirm("Hapus order ini?")) return;
    await deleteDocument("orders", id);
    setOrders(p=>p.filter(o=>!sid(o.id,id)));
    toast("Order dihapus!");
  }

  const totalVal = orders.reduce((s,o)=>s+Number(o.total||0),0);
  const stL = {background:"#1a1d27",border:"1px solid rgba(255,255,255,0.1)"};
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-bold text-white mb-1">Order Spare Part</h2><p className="text-gray-500 text-sm">{orders.length} order • Total: {fmt(totalVal)}</p></div>
        <button onClick={()=>setShowForm(true)} className="px-4 py-2 rounded-xl text-sm font-bold text-black" style={{background:"#f59e0b"}}>+ Buat Order</button>
      </div>
      <div className="grid gap-4" style={{gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))"}}>
        {[{s:"Draft",c:"#6b7280",i:"📝"},{s:"Diajukan",c:"#3b82f6",i:"📤"},{s:"Disetujui",c:"#f59e0b",i:"✔️"},{s:"Diterima",c:"#10b981",i:"✅"}].map(({s,c,i})=>(
          <Card key={s} label={s} value={orders.filter(o=>o.status===s).length} color={c} icon={i}/>
        ))}
      </div>
      <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}} className="rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{background:"rgba(255,255,255,0.04)"}}><tr className="text-gray-400 text-xs">{["Tanggal","Kode","Nama Part","Qty","Supplier","Harga","Total","Status","Aksi"].map(h=><th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {orders.length===0?<tr><td colSpan={9} className="px-4 py-10 text-center text-gray-600"><div className="text-3xl mb-2">🛒</div>Belum ada order</td></tr>
              :orders.map(o=>(
                <tr key={o.id} style={{borderTop:"1px solid rgba(255,255,255,0.05)"}} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{o.date}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{o.partCode||"—"}</td>
                  <td className="px-4 py-3 text-white">{o.partName}</td>
                  <td className="px-4 py-3 text-white whitespace-nowrap">{o.qty} {o.unit}</td>
                  <td className="px-4 py-3 text-gray-400">{o.supplier||"—"}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{o.price?fmt(o.price):"—"}</td>
                  <td className="px-4 py-3 text-amber-400 font-medium whitespace-nowrap">{o.total?fmt(o.total):"—"}</td>
                  <td className="px-4 py-3"><select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)} className="text-xs px-2 py-1 rounded-lg text-white" style={stL}>{["Draft","Diajukan","Disetujui","Diterima"].map(s=><option key={s}>{s}</option>)}</select></td>
                  <td className="px-4 py-3"><button onClick={()=>remove(o.id)} className="px-2 py-1 rounded-lg text-xs text-red-400 hover:text-white hover:bg-red-500/20">🗑 Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showForm&&(
        <Modal title="Buat Order Spare Part" onClose={()=>setShowForm(false)}>
          <div className="grid grid-cols-2 gap-4">
            <FInput label="Tanggal" type="date" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} required/>
            <FInput label="Kode Part" value={form.partCode} onChange={v=>setForm(f=>({...f,partCode:v}))} placeholder="Opsional"/>
            <FInput label="Nama Part" value={form.partName} onChange={v=>setForm(f=>({...f,partName:v}))} required placeholder="Nama spare part"/>
            <FInput label="Qty" type="number" value={form.qty} onChange={v=>setForm(f=>({...f,qty:v}))} required/>
            <FInput label="Unit" type="select" options={["pcs","set","roll","liter","meter","box","kg"]} value={form.unit} onChange={v=>setForm(f=>({...f,unit:v}))}/>
            <FInput label="Supplier" value={form.supplier} onChange={v=>setForm(f=>({...f,supplier:v}))} placeholder="Nama supplier"/>
            <FInput label="Harga Satuan (Rp)" type="number" value={form.price} onChange={v=>setForm(f=>({...f,price:v}))} placeholder="0"/>
            <FInput label="Status" type="select" options={["Draft","Diajukan","Disetujui","Diterima"]} value={form.status} onChange={v=>setForm(f=>({...f,status:v}))}/>
            <div className="col-span-2"><FInput label="Catatan" type="textarea" value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} placeholder="Catatan tambahan..."/></div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button onClick={()=>setShowForm(false)} className="px-5 py-2 rounded-xl text-sm text-gray-400" style={{background:"rgba(255,255,255,0.06)"}}>Batal</button>
            <button onClick={submit} className="px-5 py-2 rounded-xl text-sm font-bold text-black" style={{background:"#f59e0b"}}>💾 Simpan</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DAILY ACTIVITY PAGE ──────────────────────────────────────────────────────
function ActivityPage({ activities, setActivities, toast }) {
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState(today());
  const blank = {date:today(),shift:"Pagi",technician:"",type:"Preventive",machine:"",description:"",status:"Proses",duration:""};
  const [form, setForm] = useState(blank);

  async function submit() {
    if (!form.technician||!form.machine||!form.description) return alert("Teknisi, Mesin, Deskripsi wajib!");
    const item = {...form, id:uid(), duration:Number(form.duration)};
    await saveDoc("activities", item.id, item);
    setActivities(p=>[...p,item]); setShowForm(false); setForm(blank);
    toast("Aktivitas berhasil dicatat!");
  }

  async function remove(id) {
    if (!window.confirm("Hapus aktivitas ini?")) return;
    await deleteDocument("activities", id);
    setActivities(p=>p.filter(a=>!sid(a.id,id)));
    toast("Aktivitas dihapus!");
  }

  const filtered = filterDate ? activities.filter(a=>a.date===filterDate) : activities;
  const tIcons = {Preventive:"🛡",Korektif:"🔧",Inspeksi:"🔍",Kalibrasi:"📐",Cleaning:"🧹"};
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-bold text-white mb-1">Daily Activity</h2><p className="text-gray-500 text-sm">Log aktivitas harian teknisi • {activities.length} total</p></div>
        <div className="flex gap-2 flex-wrap">
          <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} className="px-3 py-2 rounded-lg text-sm text-white" style={{background:"#1a1d27",border:"1px solid rgba(255,255,255,0.1)"}}/>
          <button onClick={()=>setShowForm(true)} className="px-4 py-2 rounded-xl text-sm font-bold text-black" style={{background:"#f59e0b"}}>+ Log Aktivitas</button>
        </div>
      </div>
      {["Pagi","Siang","Malam"].map(shift=>{
        const items = filtered.filter(a=>a.shift===shift);
        if (!items.length) return null;
        return (
          <div key={shift}>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-sm font-semibold text-gray-300">{{Pagi:"🌅",Siang:"☀️",Malam:"🌙"}[shift]} Shift {shift}</div>
              <div className="flex-1 h-px" style={{background:"rgba(255,255,255,0.08)"}}/>
              <div className="text-xs text-gray-500">{items.length} aktivitas</div>
            </div>
            <div className="flex flex-col gap-3">
              {items.map(a=>(
                <div key={a.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}} className="rounded-xl p-4 flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{background:"rgba(245,158,11,0.12)"}}>{tIcons[a.type]||"📋"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-white font-semibold text-sm">{a.machine}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{background:"rgba(59,130,246,0.2)",color:"#60a5fa"}}>{a.type}</span>
                      <Badge status={a.status}/>
                    </div>
                    <div className="text-gray-400 text-sm mb-1">{a.description}</div>
                    <div className="text-xs text-gray-500">👤 {a.technician}{a.duration?` • ⏱ ${a.duration} jam`:""}</div>
                  </div>
                  <button onClick={()=>remove(a.id)} className="flex-shrink-0 px-2 py-1 rounded-lg text-xs text-red-400 hover:text-white hover:bg-red-500/20">🗑</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {filtered.length===0&&(
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}} className="rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-gray-500 mb-4">Tidak ada aktivitas pada tanggal ini</div>
          <button onClick={()=>setShowForm(true)} className="px-5 py-2 rounded-xl text-sm font-bold text-black" style={{background:"#f59e0b"}}>+ Tambah Aktivitas</button>
        </div>
      )}
      {showForm&&(
        <Modal title="Log Daily Activity" onClose={()=>setShowForm(false)}>
          <div className="grid grid-cols-2 gap-4">
            <FInput label="Tanggal" type="date" value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} required/>
            <FInput label="Shift" type="select" options={["Pagi","Siang","Malam"]} value={form.shift} onChange={v=>setForm(f=>({...f,shift:v}))} required/>
            <FInput label="Teknisi" value={form.technician} onChange={v=>setForm(f=>({...f,technician:v}))} required placeholder="Nama teknisi"/>
            <FInput label="Jenis Aktivitas" type="select" options={["Preventive","Korektif","Inspeksi","Kalibrasi","Cleaning"]} value={form.type} onChange={v=>setForm(f=>({...f,type:v}))}/>
            <FInput label="Mesin / Aset" value={form.machine} onChange={v=>setForm(f=>({...f,machine:v}))} required placeholder="Nama mesin"/>
            <FInput label="Durasi (jam)" type="number" value={form.duration} onChange={v=>setForm(f=>({...f,duration:v}))} placeholder="0"/>
            <FInput label="Status" type="select" options={["Proses","Selesai","Pending"]} value={form.status} onChange={v=>setForm(f=>({...f,status:v}))}/>
            <div className="col-span-2"><FInput label="Deskripsi Pekerjaan" type="textarea" value={form.description} onChange={v=>setForm(f=>({...f,description:v}))} required placeholder="Jelaskan pekerjaan..."/></div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button onClick={()=>setShowForm(false)} className="px-5 py-2 rounded-xl text-sm text-gray-400" style={{background:"rgba(255,255,255,0.06)"}}>Batal</button>
            <button onClick={submit} className="px-5 py-2 rounded-xl text-sm font-bold text-black" style={{background:"#f59e0b"}}>💾 Simpan</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]           = useState("dashboard");
  const [downtimes, setDowntimes] = useState([]);
  const [parts, setParts]         = useState([]);
  const [orders, setOrders]       = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [toastMsg, setToastMsg]   = useState(null);

  const toast = msg => setToastMsg(msg);

  // Load dari Firestore, lalu seed jika kosong
  useEffect(()=>{
    (async()=>{
      const [dt,sp,ord,act] = await Promise.all([
        loadCollection("downtimes"), loadCollection("spareparts"),
        loadCollection("orders"),    loadCollection("activities"),
      ]);
      // Downtime
      if (dt.length) { setDowntimes(dt); } else {
        for (const x of SEED_DOWNTIMES) await saveDoc("downtimes", x.id, x);
        setDowntimes(SEED_DOWNTIMES);
      }
      // Spare parts
      if (sp.length) { setParts(sp); } else {
        for (const x of SEED_PARTS) await saveDoc("spareparts", x.id, x);
        setParts(SEED_PARTS);
      }
      setOrders(ord);
      // Activities
      if (act.length) { setActivities(act); } else {
        for (const x of SEED_ACTIVITIES) await saveDoc("activities", x.id, x);
        setActivities(SEED_ACTIVITIES);
      }
      setLoading(false);
    })();
  },[]);

  if (loading) return (
    <div style={{background:"#080b12",minHeight:"100vh"}} className="flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">⚙️</div>
        <div className="text-white font-semibold mb-2">Memuat Sistem...</div>
        <div className="text-gray-500 text-sm">Menghubungkan ke Firebase...</div>
      </div>
    </div>
  );

  function navTo(id){ setPage(id); setMenuOpen(false); }

  return (
    <div style={{background:"#080b12",minHeight:"100vh",fontFamily:"'DM Sans','Nunito',system-ui,sans-serif"}}>
      {toastMsg&&<Toast msg={toastMsg} onClose={()=>setToastMsg(null)}/>}

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40" style={{background:"rgba(8,11,18,0.96)",borderBottom:"1px solid rgba(255,255,255,0.06)",backdropFilter:"blur(12px)"}}>
        <div className="flex items-center gap-2"><span className="text-xl">⚙️</span><span className="text-white font-bold text-sm">MMS Dashboard</span></div>
        <button onClick={()=>setMenuOpen(!menuOpen)} className="text-gray-400 hover:text-white px-2 py-1 rounded-lg text-lg" style={{background:"rgba(255,255,255,0.06)"}}>☰</button>
      </div>

      {/* Mobile drawer */}
      {menuOpen&&(
        <div className="lg:hidden fixed inset-0 z-50" style={{background:"rgba(0,0,0,0.8)"}} onClick={()=>setMenuOpen(false)}>
          <div className="h-full w-64 p-5 flex flex-col gap-1" style={{background:"#0f1117"}} onClick={e=>e.stopPropagation()}>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-4 px-3">Menu</div>
            {PAGES.map(p=>(
              <button key={p.id} onClick={()=>navTo(p.id)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left w-full"
                style={{background:page===p.id?"rgba(245,158,11,0.15)":"transparent",color:page===p.id?"#f59e0b":"#9ca3af"}}>
                <span>{p.icon}</span><span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex" style={{minHeight:"calc(100vh - 53px)"}}>
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen" style={{background:"#0a0d14",borderRight:"1px solid rgba(255,255,255,0.06)"}}>
          <div className="p-6 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:"rgba(245,158,11,0.15)"}}>⚙️</div>
              <div><div className="text-white font-bold text-sm">Maintenance</div><div className="text-gray-500 text-xs">Management System</div></div>
            </div>
          </div>
          <nav className="flex-1 p-4 flex flex-col gap-1">
            {PAGES.map(p=>(
              <button key={p.id} onClick={()=>navTo(p.id)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left w-full"
                style={{background:page===p.id?"rgba(245,158,11,0.12)":"transparent",color:page===p.id?"#f59e0b":"#6b7280",borderLeft:page===p.id?"2px solid #f59e0b":"2px solid transparent"}}>
                <span>{p.icon}</span><span>{p.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t" style={{borderColor:"rgba(255,255,255,0.06)"}}>
            <div className="text-xs text-gray-600 text-center leading-relaxed">🌐 Data real-time via Firebase<br/>Akses dari device manapun</div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-5 lg:p-6">
            {page==="dashboard"  && <Dashboard    downtimes={downtimes}/>}
            {page==="downtime"   && <DowntimePage  downtimes={downtimes}  setDowntimes={setDowntimes} toast={toast}/>}
            {page==="spareparts" && <SparePartsPage parts={parts}         setParts={setParts}         toast={toast}/>}
            {page==="orders"     && <OrderPage      orders={orders}        setOrders={setOrders}       toast={toast}/>}
            {page==="activity"   && <ActivityPage   activities={activities} setActivities={setActivities} toast={toast}/>}
          </div>
        </main>
      </div>
    </div>
  );
}
