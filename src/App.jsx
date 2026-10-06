import React, { useEffect, useMemo, useState } from "react";
import {
 Activity, ArrowUpRight, BarChart3, Bell, CalendarDays, Check,
 ChevronDown, ChevronRight, CircleDollarSign, ClipboardList, Clock3,
 Download, FileBarChart, Leaf, Menu, MoreHorizontal, Plus, Search,
 Settings, Sparkles, TrendingUp, User, UserPlus, Users, Upload, Wallet, X, Zap
} from "lucide-react";

const STORAGE_KEY = "anor_bogi_v3";

const DEFAULT_CATEGORY_RATES = {
 anor_uzish: 150000,
 salafanlash: 150000,
 ortish: 150000,
 tashuvchi: 150000,
};

const DEFAULT_TAXI_RATES = {
 anor_uzish: 10000,
 salafanlash: 10000,
 ortish: 10000,
 tashuvchi: 10000,
};

const DEFAULT_BRIGADIER_RATE = 5000;

const CATEGORY_META = {
 anor_uzish: { name: "Anor uzuvchi", icon: "🍎" },
 salafanlash: { name: "Salafan qiluvchi", icon: "📦" },
 ortish: { name: "Mashinaga ortuvchi", icon: "🚚" },
 tashuvchi: { name: "Tashuvchi", icon: "👷" },
};

const emptyBrigadier = { name: "", phone: "", note: "" };

const money = (value = 0) =>
 new Intl.NumberFormat("uz-UZ").format(Math.round(Number(value) || 0)) + " so'm";

const number = (value = 0) =>
 new Intl.NumberFormat("uz-UZ").format(Number(value) || 0);

const todayISO = () => {
 const d = new Date();
 return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const uid = (prefix = "id") =>
 `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const formatDate = (date) =>
 date
 ? new Date(`${date}T12:00:00`).toLocaleDateString("uz-UZ", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 })
 : "—";

const getLast7DayLabels = () => {
 const weekdays = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
 const d = new Date();
 d.setHours(12, 0, 0, 0);
 return Array.from({ length: 7 }, (_, i) => {
 const x = new Date(d);
 x.setDate(d.getDate() - (6 - i));
 return weekdays[x.getDay()];
 });
};

const getCategoryName = (category) =>
 CATEGORY_META[category]?.name || CATEGORY_META.anor_uzish.name;

const getCategoryRate = (rates, category) =>
 Number(rates?.[category]) || 0;

const getTaxiRate = (rates, category) =>
 Number(rates?.[category]) || 0;

const getLogPortion = (log) => {
 const value = Number(log?.portion);
 return value > 0 ? value : 1;
};

const getLogRate = (log, categoryRates) => {
 const saved = Number(log?.rate);
 return saved >= 0 && Number.isFinite(saved) && log?.rate !== undefined
 ? saved
 : getCategoryRate(categoryRates, log?.category || "anor_uzish");
};

const getLogTaxiRate = (log, taxiRates) => {
 const saved = Number(log?.taxiRate);
 return saved >= 0 && Number.isFinite(saved) && log?.taxiRate !== undefined
 ? saved
 : 0;
};

const getLogBrigadierRate = (log, defaultRate) => {
 const saved = Number(log?.brigadierRate);
 return saved >= 0 && Number.isFinite(saved) && log?.brigadierRate !== undefined
 ? saved
 : 0;
};

const getLogEarned = (
 log,
 categoryRates,
 taxiRates = DEFAULT_TAXI_RATES,
 brigadierRate = DEFAULT_BRIGADIER_RATE
) => {
 const workers = Number(log?.workers) || 0;
 if (!workers) return 0;
 const portion = getLogPortion(log);
 const rate = getLogRate(log, categoryRates);
 const taxi = getLogTaxiRate(log, taxiRates);
 const brig = getLogBrigadierRate(log, brigadierRate);
 return workers * portion * (rate + taxi + brig);
};

function StatCard({ icon: Icon, label, value, hint, tone = "green", onClick }) {
 const tones = {
 green: "bg-emerald-50 text-emerald-700",
 blue: "bg-blue-50 text-blue-700",
 orange: "bg-orange-50 text-orange-700",
 purple: "bg-violet-50 text-violet-700",
 cyan: "bg-cyan-50 text-cyan-700",
 };
 return (
 <button
 onClick={onClick}
 className="group text-left bg-white rounded-[22px] p-5 shadow-[0_6px_30px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition-all w-full"
 >
 <div className="flex items-start justify-between">
 <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tones[tone]}`}>
 <Icon size={21} />
 </div>
 <ArrowUpRight size={17} className="text-slate-300 group-hover:text-emerald-600" />
 </div>
 <p className="mt-5 text-[13px] font-medium text-slate-500">{label}</p>
 <p className="mt-1 text-[24px] font-black tracking-tight text-slate-900">{value}</p>
 <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
 </button>
 );
}

function EmptyState({ icon: Icon = Leaf, title, description, action, onAction }) {
 return (
 <div className="py-14 px-6 flex flex-col items-center text-center">
 <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
 <Icon size={29} />
 </div>
 <h3 className="mt-5 text-lg font-extrabold text-slate-900">{title}</h3>
 <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
 {action && (
 <button
 onClick={onAction}
 className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b6b43] text-white text-sm font-bold"
 >
 <Plus size={17} /> {action}
 </button>
 )}
 </div>
 );
}

function Modal({ open, title, subtitle, onClose, children, wide = false }) {
 if (!open) return null;
 return (
 <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm p-4 flex items-center justify-center">
 <div className={`w-full ${wide ? "max-w-5xl" : "max-w-lg"} max-h-[92vh] overflow-auto bg-white rounded-[28px] shadow-2xl`}>
 <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-5 flex items-start justify-between">
 <div>
 <h3 className="text-lg font-black text-slate-900">{title}</h3>
 {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
 </div>
 <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
 <X size={18} />
 </button>
 </div>
 {children}
 </div>
 </div>
 );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
 return (
 <label className="block">
 {label && <span className="block text-xs font-bold text-slate-600 mb-2">{label}</span>}
 <input
 type={type}
 value={value}
 onChange={(e) => onChange(e.target.value)}
 placeholder={placeholder}
 className="w-full h-11 px-3.5 rounded-xl bg-slate-50/60 outline-none focus:bg-white focus: text-sm text-slate-800"
 />
 </label>
 );
}

function SectionTitle({ eyebrow, title, description, action, onAction }) {
 return (
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
 <div>
 {eyebrow && <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-600">{eyebrow}</p>}
 <h1 className="mt-1 text-2xl md:text-[28px] font-black tracking-tight text-slate-900">{title}</h1>
 {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
 </div>
 {action && (
 <button onClick={onAction} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b6b43] text-white text-sm font-bold">
 <Plus size={17} /> {action}
 </button>
 )}
 </div>
 );
}

function MiniBarChart({ values }) {
 const max = Math.max(...values.map((v) => v.value), 1);
 return (
 <div className="h-48 flex items-end gap-2 sm:gap-4">
 {values.map((item, index) => {
 const height = Math.max((item.value / max) * 100, item.value ? 8 : 2);
 return (
 <div key={`${item.label}-${index}`} className="flex-1 h-full flex flex-col justify-end">
 <div className="text-[10px] text-slate-400 text-center mb-1">{item.value ? number(item.value) : ""}</div>
 <div className="w-full bg-emerald-500/80 rounded-t-lg" style={{ height: `${height}%` }} />
 <div className="mt-2 text-[10px] text-slate-400 text-center">{item.label}</div>
 </div>
 );
 })}
 </div>
 );
}

function Donut({ income, expense }) {
 const total = income + expense;
 const pct = total ? expense / total : 0;
 const r = 42;
 const c = 2 * Math.PI * r;
 return (
 <div className="relative w-40 h-40 shrink-0">
 <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
 <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="13" />
 <circle cx="60" cy="60" r={r} fill="none" stroke="#0b6b43" strokeWidth="13" strokeLinecap="round" strokeDasharray={`${c * (1 - pct)} ${c}`} />
 <circle cx="60" cy="60" r={r} fill="none" stroke="#f59e0b" strokeWidth="13" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} strokeDashoffset={-c * (1 - pct)} />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-[10px] text-slate-400">Jami</span>
 <span className="text-sm font-black text-slate-900">{money(total)}</span>
 </div>
 </div>
 );
}

function Dashboard({ stats, recent, onAddBrigadier, onAddWorkers, onAdvance, onOpenBrigadiers, onOpenFinance }) {
 const labels = getLast7DayLabels();
 return (
 <div className="space-y-6">
 <section className="relative overflow-hidden rounded-[28px] min-h-[235px] bg-[#0a5d3a] text-white">
 <div className="absolute inset-0 bg-gradient-to-r from-[#06482d]/95 to-[#0a5d3a]/40" />
 <div className="relative z-10 p-7 md:p-9">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold">
 <Sparkles size={14} /> Anor bog'i boshqaruv tizimi
 </div>
 <h2 className="mt-5 text-3xl md:text-[38px] leading-tight font-black">
 Assalomu alaykum,<br />bog‘ingiz nazorat ostida.
 </h2>
 <p className="mt-3 text-sm text-emerald-50/80">Bugungi ishlar, brigadirlar va moliyaviy holatni bitta joydan boshqaring.</p>
 </div>
 </section>

 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
 <StatCard icon={Users} label="Jami brigadirlar" value={number(stats.brigadiers)} hint="Tizimdagi brigadirlar" onClick={onOpenBrigadiers} />
 <StatCard icon={User} label="Bugun ishlayotganlar" value={number(stats.todayWorkers)} hint={`Jami: ${number(stats.allWorkers)}`} tone="blue" onClick={onAddWorkers} />
 <StatCard icon={Wallet} label="Bugungi xarajat" value={money(stats.todayEarned)} hint="Ish + taxi + brigadir" tone="purple" onClick={onOpenFinance} />
 <StatCard icon={CircleDollarSign} label="Berilgan avans" value={money(stats.totalAdvance)} hint={`${number(stats.advanceCount)} ta operatsiya`} tone="orange" onClick={onAdvance} />
 <StatCard icon={TrendingUp} label="Jami hisoblangan" value={money(stats.totalEarned)} hint={`Qolgan: ${money(Math.max(stats.totalEarned - stats.totalAdvance, 0))}`} tone="cyan" onClick={onOpenFinance} />
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_0.95fr] gap-5">
 <div className="bg-white rounded-[24px] p-6">
 <h3 className="font-black text-slate-900">Haftalik ish faolligi</h3>
 <p className="text-xs text-slate-500 mt-1">Oxirgi 7 kun bo‘yicha ishchilar</p>
 <div className="mt-6"><MiniBarChart values={stats.dailyWorkers.map((v, i) => ({ label: labels[i], value: v }))} /></div>
 </div>
 <div className="bg-white rounded-[24px] p-6">
 <h3 className="font-black text-slate-900">Daromad va avans</h3>
 <div className="mt-5 flex items-center gap-5">
 <Donut income={stats.totalEarned} expense={stats.totalAdvance} />
 <div className="space-y-4">
 <div><p className="text-xs text-slate-500">Hisoblangan</p><b>{money(stats.totalEarned)}</b></div>
 <div><p className="text-xs text-slate-500">Avans</p><b>{money(stats.totalAdvance)}</b></div>
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
 <div className="bg-white rounded-[24px] overflow-hidden">
 <div className="px-6 py-5 "><h3 className="font-black">So‘nggi faoliyat</h3></div>
 {recent.length ? recent.slice(0, 8).map((item) => (
 <div key={item.id} className="px-6 py-4 flex items-center gap-3 ">
 <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">{item.type === "advance" ? <Wallet size={16} /> : <Users size={16} />}</div>
 <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{item.title}</p><p className="text-[11px] text-slate-400">{item.subtitle}</p></div>
 <span className="text-[11px] text-slate-400">{formatDate(item.date)}</span>
 </div>
 )) : <EmptyState icon={Activity} title="Hali faoliyat yo‘q" description="Birinchi brigadir yoki ishchini kiriting." action="Brigadir qo‘shish" onAction={onAddBrigadier} />}
 </div>

 <div className="bg-[#f3faf6] rounded-[24px] p-6">
 <div className="flex items-center gap-2 text-emerald-700"><Zap size={18} /><span className="text-xs font-black">TEZKOR BOSHQARUV</span></div>
 <h3 className="mt-3 text-xl font-black">Bugungi ishni tez boshlang</h3>
 <div className="mt-5 grid grid-cols-2 gap-3">
 <button onClick={onAddBrigadier} className="p-4 bg-white rounded-2xl text-left"><UserPlus className="text-emerald-700" size={20} /><p className="mt-3 text-sm font-extrabold">Brigadir</p></button>
 <button onClick={onAddWorkers} className="p-4 bg-white rounded-2xl text-left"><Users className="text-blue-600" size={20} /><p className="mt-3 text-sm font-extrabold">Ishchilar</p></button>
 <button onClick={onAdvance} className="p-4 bg-white rounded-2xl text-left"><Wallet className="text-orange-600" size={20} /><p className="mt-3 text-sm font-extrabold">Avans</p></button>
 <button onClick={onOpenFinance} className="p-4 bg-white rounded-2xl text-left"><FileBarChart className="text-violet-600" size={20} /><p className="mt-3 text-sm font-extrabold">Hisobot</p></button>
 </div>
 </div>
 </div>
 </div>
 );
}

function BrigadiersPage({ brigadiers, onAdd, onOpen, categoryRates, taxiRates, brigadierRate }) {
 const [query, setQuery] = useState("");
 const filtered = brigadiers.filter((b) => `${b.name} ${b.phone}`.toLowerCase().includes(query.toLowerCase()));

 return (
 <div className="space-y-6">
 <SectionTitle eyebrow="Jamoa boshqaruvi" title="Brigadirlar" description="Brigadirni bosganda uning ichki ma’lumotlari ochiladi." action="Brigadir qo‘shish" onAction={onAdd} />
 <div className="bg-white rounded-[24px] p-4"><div className="relative"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Qidiring..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 outline-none text-sm" /></div></div>
 {!filtered.length ? (
 <div className="bg-white rounded-[24px]"><EmptyState icon={Users} title={brigadiers.length ? "Natija topilmadi" : "Hali brigadir yo‘q"} description={brigadiers.length ? "Qidiruvni o‘zgartiring." : "Birinchi brigadirni qo‘shing."} action={!brigadiers.length ? "Brigadir qo‘shish" : undefined} onAction={onAdd} /></div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {filtered.map((b) => {
 const earned = b.logs.reduce((s, l) => s + getLogEarned(l, categoryRates, taxiRates, brigadierRate), 0);
 const advances = b.logs.reduce((s, l) => s + (Number(l.advance) || 0), 0);
 const counts = Object.fromEntries(Object.keys(CATEGORY_META).map((id) => [id, 0]));
 b.logs.forEach((l) => { const c = l.category || "anor_uzish"; if (counts[c] !== undefined) counts[c] += Number(l.workers) || 0; });

 return (
 <button key={b.id} onClick={() => onOpen(b.id)} className="group text-left bg-white rounded-[24px] p-5 hover: hover:-translate-y-0.5 transition">
 <div className="flex items-start justify-between"><div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg">{b.name?.trim()?.charAt(0)?.toUpperCase() || "B"}</div><MoreHorizontal size={19} className="text-slate-300" /></div>
 <h3 className="mt-5 text-lg font-black">{b.name}</h3>
 <p className="text-xs text-slate-400 mt-1">{b.phone || "Telefon kiritilmagan"}</p>
 <div className="mt-5 grid grid-cols-2 gap-2">
 {Object.entries(CATEGORY_META).map(([id, meta]) => <div key={id} className="rounded-xl bg-slate-50 p-3"><p>{meta.icon}</p><p className="mt-1 text-[10px] leading-4 text-slate-400">{meta.name}</p><p className="mt-1 font-black">{number(counts[id])}</p></div>)}
 </div>
 <div className="mt-4 pt-4 flex items-center justify-between"><span className="text-xs text-slate-400">Hisoblangan</span><b className="text-xs">{money(earned)}</b></div>
 <p className="mt-2 text-[11px] text-slate-400">Avans: {money(advances)}</p>
 </button>
 );
 })}
 </div>
 )}
 </div>
 );
}

function BrigadierDetail({ brigadier, categoryRates, taxiRates, brigadierRate, onBack, onAddWorkers, onAdvance, onDelete }) {
 if (!brigadier) return null;
 const counts = Object.fromEntries(Object.keys(CATEGORY_META).map((id) => [id, 0]));
 brigadier.logs.forEach((l) => { const c = l.category || "anor_uzish"; if (counts[c] !== undefined) counts[c] += Number(l.workers) || 0; });
 const earned = brigadier.logs.reduce((s, l) => s + getLogEarned(l, categoryRates, taxiRates, brigadierRate), 0);
 const advance = brigadier.logs.reduce((s, l) => s + (Number(l.advance) || 0), 0);

 return (
 <div className="space-y-6">
 <button onClick={onBack} className="text-sm font-bold text-slate-500 hover:text-emerald-700">← Brigadirlar ro‘yxatiga qaytish</button>
 <section className="bg-white rounded-[26px] p-6">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
 <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-[20px] bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-black">{brigadier.name.charAt(0).toUpperCase()}</div><div><p className="text-[11px] font-extrabold uppercase text-emerald-600">Brigadir</p><h1 className="mt-1 text-2xl font-black">{brigadier.name}</h1><p className="mt-1 text-sm text-slate-400">{brigadier.phone || "Telefon kiritilmagan"}</p></div></div>
 <div className="flex flex-wrap gap-2"><button onClick={onAddWorkers} className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center gap-2"><Users size={16} /> Ishchi kiritish</button><button onClick={onAdvance} className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold flex items-center gap-2"><Wallet size={16} /> Avans</button></div>
 </div>

 <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
 {Object.entries(CATEGORY_META).map(([id, meta]) => (
 <div key={id} className="rounded-2xl bg-slate-50 p-4">
 <div className="flex items-center justify-between"><span className="text-xl">{meta.icon}</span><span className="text-[10px] font-bold text-slate-400">{money(getCategoryRate(categoryRates, id))}</span></div>
 <p className="mt-3 text-[11px] text-slate-400">{meta.name}</p>
 <p className="mt-1 text-2xl font-black">{number(counts[id])}</p>
 </div>
 ))}
 </div>
 <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-[11px] text-emerald-700/70">Jami hisoblangan</p><p className="mt-1 text-lg font-black text-emerald-800">{money(earned)}</p></div>
 <div className="rounded-2xl bg-orange-50 p-4"><p className="text-[11px] text-orange-700/70">Avans</p><p className="mt-1 text-lg font-black text-orange-800">{money(advance)}</p></div>
 <div className="rounded-2xl bg-blue-50 p-4"><p className="text-[11px] text-blue-700/70">Qolgan haq</p><p className="mt-1 text-lg font-black text-blue-800">{money(Math.max(earned - advance, 0))}</p></div>
 </div>
 </section>

 <div className="bg-white rounded-[24px] overflow-hidden">
 <div className="px-6 py-5 "><h3 className="font-black">Faoliyat tarixi</h3><p className="text-xs text-slate-500 mt-1">Har bir yozuvning o‘z stavkasi saqlanadi.</p></div>
 {!brigadier.logs.length ? <EmptyState icon={ClipboardList} title="Hali ma’lumot yo‘q" description="Ishchilar yoki avans kiriting." /> : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm min-w-[950px]">
 <thead className="bg-slate-50 text-[11px] uppercase text-slate-400"><tr><th className="text-left px-6 py-3">Sana</th><th className="text-left px-6 py-3">Turi</th><th className="text-left px-6 py-3">Soni</th><th className="text-left px-6 py-3">Stavka</th><th className="text-left px-6 py-3">Taxi</th><th className="text-left px-6 py-3">Brigadir</th><th className="text-left px-6 py-3">Jami</th><th className="text-left px-6 py-3">Avans</th></tr></thead>
 <tbody className="divide-y divide-slate-100">
 {[...brigadier.logs].sort((a,b)=>b.date.localeCompare(a.date)).map((log) => (
 <tr key={log.id}>
 <td className="px-6 py-4 font-bold">{formatDate(log.date)}</td>
 <td className="px-6 py-4">{Number(log.workers)>0 ? getCategoryName(log.category || "anor_uzish") : "Avans"}</td>
 <td className="px-6 py-4">{Number(log.workers)>0 ? `${number(log.workers)} × ${getLogPortion(log)}` : "—"}</td>
 <td className="px-6 py-4">{Number(log.workers)>0 ? money(getLogRate(log, categoryRates)) : "—"}</td>
 <td className="px-6 py-4">{Number(log.workers)>0 ? money(getLogTaxiRate(log, taxiRates)) : "—"}</td>
 <td className="px-6 py-4">{Number(log.workers)>0 ? money(getLogBrigadierRate(log, brigadierRate)) : "—"}</td>
 <td className="px-6 py-4 font-black text-emerald-700">{Number(log.workers)>0 ? money(getLogEarned(log, categoryRates, taxiRates, brigadierRate)) : "—"}</td>
 <td className="px-6 py-4 font-bold text-orange-600">{log.advance ? money(log.advance) : "—"}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 <div className="flex justify-end"><button onClick={onDelete} className="text-xs font-bold text-rose-500 hover:text-rose-700">Ushbu brigadirni o‘chirish</button></div>
 </div>
 );
}

function ReportsPage({ stats, brigadiers, categoryRates, taxiRates, brigadierRate }) {
 const rows = brigadiers.map((b) => {
 const counts = Object.fromEntries(Object.keys(CATEGORY_META).map((id) => [id, 0]));
 const earned = b.logs.reduce((s,l)=>s+getLogEarned(l, categoryRates, taxiRates, brigadierRate),0);
 b.logs.forEach(l=>{const c=l.category||"anor_uzish"; if(counts[c]!==undefined) counts[c]+=Number(l.workers)||0;});
 const advance=b.logs.reduce((s,l)=>s+(Number(l.advance)||0),0);
 return { name:b.name, counts, workers:Object.values(counts).reduce((a,v)=>a+v,0), earned, advance, balance:Math.max(earned-advance,0) };
 });

 return (
 <div className="space-y-6">
 <SectionTitle eyebrow="Nazorat va tahlil" title="Hisobotlar" description="Har bir brigadir va ish turi bo‘yicha hisob-kitob." />
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <StatCard icon={Users} label="Jami ishchilar" value={number(stats.allWorkers)} hint="Barcha kiritilganlar" />
 <StatCard icon={Wallet} label="Hisoblangan" value={money(stats.totalEarned)} hint="Ish + taxi + brigadir" tone="purple" />
 <StatCard icon={CircleDollarSign} label="Qolgan" value={money(Math.max(stats.totalEarned-stats.totalAdvance,0))} hint="Avansdan keyin" tone="orange" />
 </div>
 <div className="bg-white rounded-[24px] overflow-hidden">
 {!rows.length ? <EmptyState icon={FileBarChart} title="Hisobot uchun ma’lumot yetarli emas" description="Avval brigadirlar va ishchilarni kiriting." /> : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm min-w-[1050px]">
 <thead className="bg-slate-50 text-[11px] uppercase text-slate-400"><tr><th className="text-left px-6 py-3">Brigadir</th>{Object.entries(CATEGORY_META).map(([id,m])=><th key={id} className="text-left px-6 py-3">{m.icon} {m.name}</th>)}<th className="text-left px-6 py-3">Jami</th><th className="text-left px-6 py-3">Hisoblangan</th><th className="text-left px-6 py-3">Avans</th><th className="text-left px-6 py-3">Qolgan</th></tr></thead>
 <tbody className="divide-y divide-slate-100">{rows.map(r=><tr key={r.name}><td className="px-6 py-4 font-bold">{r.name}</td>{Object.keys(CATEGORY_META).map(id=><td key={id} className="px-6 py-4">{number(r.counts[id])} ta</td>)}<td className="px-6 py-4 font-bold">{number(r.workers)} ta</td><td className="px-6 py-4 font-semibold">{money(r.earned)}</td><td className="px-6 py-4 text-orange-600 font-semibold">{money(r.advance)}</td><td className="px-6 py-4 text-emerald-700 font-bold">{money(r.balance)}</td></tr>)}</tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 );
}

function FinancePage({ stats, brigadiers, categoryRates, taxiRates, brigadierRate }) {
 const categorySummary = Object.entries(CATEGORY_META).map(([id, meta]) => {
 let workers=0, earned=0;
 brigadiers.forEach(b=>b.logs.forEach(l=>{
 if((l.category||"anor_uzish")===id){workers+=Number(l.workers)||0; earned+=getLogEarned(l,categoryRates,taxiRates,brigadierRate);}
 }));
 return {id,meta,workers,earned,share:stats.totalEarned?Math.round(earned/stats.totalEarned*100):0,rate:getCategoryRate(categoryRates,id)};
 });
 const transactions=[];
 brigadiers.forEach(b=>b.logs.forEach(l=>{if(Number(l.advance)>0)transactions.push({id:l.id,name:b.name,date:l.date,amount:Number(l.advance),note:l.note||"Avans"});}));
 transactions.sort((a,b)=>b.date.localeCompare(a.date));

 return (
 <div className="space-y-6">
 <SectionTitle eyebrow="Moliya" title="Moliyaviy boshqaruv" description="Ish, taxi, brigadir puli va avanslarni kuzating." />
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <StatCard icon={TrendingUp} label="Jami hisoblangan" value={money(stats.totalEarned)} hint="Barcha xarajatlar" />
 <StatCard icon={Wallet} label="Berilgan avans" value={money(stats.totalAdvance)} hint={`${number(stats.advanceCount)} ta operatsiya`} tone="orange" />
 <StatCard icon={CircleDollarSign} label="Qolgan haq" value={money(Math.max(stats.totalEarned-stats.totalAdvance,0))} hint="Hisoblangan − avans" tone="blue" />
 </div>
 <div className="bg-white rounded-[24px] overflow-hidden">
 <div className="px-6 py-5 "><h3 className="font-black">Kategoriya bo‘yicha haqiqiy hisob</h3><p className="text-xs text-slate-500 mt-1">Eski yozuvlar o‘zida saqlangan stavka bilan hisoblanadi.</p></div>
 <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
 {categorySummary.map(({id,meta,workers,earned,share,rate})=><div key={id} className="rounded-2xl bg-slate-50/60 p-5"><div className="flex justify-between"><span className="text-2xl">{meta.icon}</span><span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">{share}%</span></div><p className="mt-3 font-black">{meta.name}</p><p className="text-xs text-slate-400">{number(workers)} ta ishchi</p><p className="mt-4 text-2xl font-black">{money(earned)}</p><div className="mt-3 pt-3 flex justify-between text-xs"><span className="text-slate-400">Standart stavka</span><b>{money(rate)}</b></div></div>)}
 </div>
 </div>
 <div className="bg-white rounded-[24px] overflow-hidden">
 <div className="px-6 py-5 "><h3 className="font-black">Avans operatsiyalari</h3></div>
 {!transactions.length ? <EmptyState icon={Wallet} title="Hali avans berilmagan" description="Avanslar shu yerda ko‘rinadi." /> : transactions.map(t=><div key={t.id} className="px-6 py-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><Wallet size={18}/></div><div className="flex-1"><p className="font-bold text-sm">{t.name}</p><p className="text-xs text-slate-400">{formatDate(t.date)} · {t.note}</p></div><b className="text-orange-600">{money(t.amount)}</b></div>)}
 </div>
 </div>
 );
}

function DailyWorkPage({ brigadiers, onAddWorkers, categoryRates, taxiRates, brigadierRate }) {
 const today=todayISO();
 const entries=brigadiers.map(b=>{
 const counts=Object.fromEntries(Object.keys(CATEGORY_META).map(id=>[id,0]));
 let earned=0;
 b.logs.filter(l=>l.date===today&&Number(l.workers)>0).forEach(l=>{
 const c=l.category||"anor_uzish";
 if(counts[c]!==undefined)counts[c]+=Number(l.workers)||0;
 earned+=getLogEarned(l,categoryRates,taxiRates,brigadierRate);
 });
 const total=Object.values(counts).reduce((a,v)=>a+v,0);
 return total?{name:b.name,counts,total,earned}:null;
 }).filter(Boolean);

 return (
 <div className="space-y-6">
 <SectionTitle eyebrow="Bugungi nazorat" title="Kunlik ish" description="Bugungi 4 kategoriya bo‘yicha holat." action="Ishchi kiritish" onAction={onAddWorkers}/>
 <div className="bg-white rounded-[24px] p-6">
 {!entries.length?<EmptyState icon={Users} title="Bugun hali ishchi kiritilmagan" description="Bugungi ishchilarni kiriting." action="Ishchi kiritish" onAction={onAddWorkers}/>:
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{entries.map(e=><div key={e.name} className="rounded-2xl bg-slate-50/70 p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-black">{e.name.charAt(0)}</div><div className="flex-1"><p className="font-bold">{e.name}</p><p className="text-xs text-slate-400">{number(e.total)} ta ishchi</p></div></div><div className="mt-4 grid grid-cols-2 gap-2">{Object.entries(CATEGORY_META).map(([id,m])=><div key={id} className="rounded-xl bg-white p-3"><p>{m.icon}</p><p className="mt-1 text-[10px] text-slate-400">{m.name}</p><p className="font-black">{number(e.counts[id])}</p></div>)}</div><div className="mt-4 pt-3 flex justify-between text-xs"><span className="text-slate-400">Bugungi hisob</span><b className="text-emerald-700">{money(e.earned)}</b></div></div>)}</div>}
 </div>
 </div>
 );
}

function SettingsPage({ categoryRates,setCategoryRates,taxiRates,setTaxiRates,brigadierRate,setBrigadierRate,onExport,onImport,onClear }) {
 const [localRates,setLocalRates]=useState({...categoryRates});
 const [localTaxi,setLocalTaxi]=useState({...taxiRates});
 const [localBrig,setLocalBrig]=useState(brigadierRate);

 useEffect(()=>setLocalRates({...categoryRates}),[categoryRates]);
 useEffect(()=>setLocalTaxi({...taxiRates}),[taxiRates]);
 useEffect(()=>setLocalBrig(brigadierRate),[brigadierRate]);

 const save=()=>{
 setCategoryRates(Object.fromEntries(Object.keys(CATEGORY_META).map(id=>[id,Math.max(Number(localRates[id])||0,0)])));
 setTaxiRates(Object.fromEntries(Object.keys(CATEGORY_META).map(id=>[id,Math.max(Number(localTaxi[id])||0,0)])));
 setBrigadierRate(Math.max(Number(localBrig)||0,0));
 };

 return (
 <div className="space-y-6">
 <SectionTitle eyebrow="Tizim" title="Sozlamalar" description="Kategoriya, taxi va brigadir stavkalarini shu yerdan o‘zgartiring."/>
 <div className="bg-white rounded-[24px] p-6">
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
 {Object.entries(CATEGORY_META).map(([id,m])=><div key={id} className="rounded-2xl p-4"><div className="flex items-center gap-2"><span className="text-xl">{m.icon}</span><b className="text-sm">{m.name}</b></div><div className="mt-4 space-y-3"><Input label="Ish haqi (so‘m)" type="number" value={String(localRates[id]??"")} onChange={v=>setLocalRates(s=>({...s,[id]:v}))}/><Input label="Taxi puli (so‘m)" type="number" value={String(localTaxi[id]??"")} onChange={v=>setLocalTaxi(s=>({...s,[id]:v}))}/></div></div>)}
 </div>
 <div className="mt-4 max-w-sm"><Input label="Brigadir puli (so‘m)" type="number" value={String(localBrig??"")} onChange={setLocalBrig}/></div>
 <button onClick={save} className="mt-5 px-5 py-2.5 rounded-xl bg-[#0b6b43] text-white text-sm font-bold flex items-center gap-2"><Check size={16}/> Saqlash</button>
 </div>

 <div className="bg-white rounded-[24px] p-6">
 <h3 className="font-black">Backup va ma’lumotlar</h3>
 <p className="text-sm text-slate-500 mt-1">Backup eski stavkalarni ham saqlaydi va tiklaganda qayta yuklaydi.</p>
 <div className="mt-5 flex flex-wrap gap-3">
 <button onClick={onExport} className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"><Download size={16}/> Backup olish</button>
 <button onClick={onImport} className="px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold flex items-center gap-2"><Upload size={16}/> Backup tiklash</button>
 <button onClick={onClear} className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold">Barchasini tozalash</button>
 </div>
 </div>
 </div>
 );
}

export default function App() {
 const [brigadiers,setBrigadiers]=useState(()=>{
 try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}").brigadiers||[]}catch{return[]}
 });
 const [categoryRates,setCategoryRates]=useState(()=>{
 try{return {...DEFAULT_CATEGORY_RATES,...(JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}").categoryRates||{})}}catch{return {...DEFAULT_CATEGORY_RATES}}
 });
 const [taxiRates,setTaxiRates]=useState(()=>{
 try{return {...DEFAULT_TAXI_RATES,...(JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}").taxiRates||{})}}catch{return {...DEFAULT_TAXI_RATES}}
 });
 const [brigadierRate,setBrigadierRate]=useState(()=>{
 try{const v=Number(JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}").brigadierRate);return v>=0?v:DEFAULT_BRIGADIER_RATE}catch{return DEFAULT_BRIGADIER_RATE}
 });

 const [activeTab,setActiveTab]=useState("dashboard");
 const [selectedId,setSelectedId]=useState(null);
 const [mobileMenu,setMobileMenu]=useState(false);
 const [modal,setModal]=useState(null);
 const [newBrigadier,setNewBrigadier]=useState(emptyBrigadier);

 const emptyRow=()=>({
 id:uid("row"),workers:"",category:"anor_uzish",portion:"1",
 rate:getCategoryRate(categoryRates,"anor_uzish"),
 taxiRate:getTaxiRate(taxiRates,"anor_uzish"),
 brigadierRate:Number(brigadierRate)||DEFAULT_BRIGADIER_RATE
 });

 const [workerForm,setWorkerForm]=useState({brigadierId:"",date:todayISO(),rows:[emptyRow()],note:""});
 const [advanceForm,setAdvanceForm]=useState({brigadierId:"",date:todayISO(),amount:"",note:""});

 useEffect(()=>{
 localStorage.setItem(STORAGE_KEY,JSON.stringify({brigadiers,categoryRates,taxiRates,brigadierRate}));
 },[brigadiers,categoryRates,taxiRates,brigadierRate]);

 const stats=useMemo(()=>{
 let allWorkers=0,todayWorkers=0,todayEarned=0,totalAdvance=0,advanceCount=0,totalEarned=0;
 const dailyWorkers=Array(7).fill(0);
 const categoryWorkers=Object.fromEntries(Object.keys(CATEGORY_META).map(id=>[id,0]));
 const today=todayISO();

 brigadiers.forEach(b=>b.logs.forEach(log=>{
 const workers=Number(log.workers)||0;
 const advance=Number(log.advance)||0;
 const earned=getLogEarned(log,categoryRates,taxiRates,brigadierRate);
 allWorkers+=workers;
 totalEarned+=earned;
 totalAdvance+=advance;
 if(advance>0)advanceCount++;
 const category=log.category||"anor_uzish";
 if(categoryWorkers[category]!==undefined)categoryWorkers[category]+=workers;
 const diff=Math.floor((new Date(`${today}T12:00:00`)-new Date(`${log.date}T12:00:00`))/86400000);
 if(diff===0){todayWorkers+=workers;todayEarned+=earned}
 if(diff>=0&&diff<7)dailyWorkers[6-diff]+=workers;
 }));

 return {brigadiers:brigadiers.length,allWorkers,todayWorkers,todayEarned,totalAdvance,advanceCount,totalEarned,dailyWorkers,categoryWorkers};
 },[brigadiers,categoryRates,taxiRates,brigadierRate]);

 const recent=useMemo(()=>{
 const list=[];
 brigadiers.forEach(b=>b.logs.forEach(l=>{
 if(Number(l.workers)>0)list.push({id:`${l.id}_w`,type:"workers",date:l.date,title:`${b.name} — ${number(l.workers)} ta ${getCategoryName(l.category||"anor_uzish")}`,subtitle:l.note||"Ishchilar kiritildi"});
 if(Number(l.advance)>0)list.push({id:`${l.id}_a`,type:"advance",date:l.date,title:`${b.name} — ${money(l.advance)} avans`,subtitle:l.note||"Avans berildi"});
 }));
 return list.sort((a,b)=>b.date.localeCompare(a.date));
 },[brigadiers]);

 const selectedBrigadier=brigadiers.find(b=>b.id===selectedId);

 const navigate=(tab)=>{setActiveTab(tab);setSelectedId(null);setMobileMenu(false)};

 const addBrigadier=(e)=>{
 e.preventDefault();
 if(!newBrigadier.name.trim())return;
 setBrigadiers(prev=>[{id:uid("brig"),name:newBrigadier.name.trim(),phone:newBrigadier.phone.trim(),note:newBrigadier.note.trim(),createdAt:todayISO(),logs:[]},...prev]);
 setNewBrigadier(emptyBrigadier);
 setModal(null);
 };

 const saveWorkerLog=(e)=>{
 e.preventDefault();
 if(!workerForm.brigadierId)return;

 const rows=(workerForm.rows||[])
 .map(row=>({
 workers:Number(row.workers)||0,
 category:row.category||"anor_uzish",
 portion:Number(row.portion)>0?Number(row.portion):1,
 rate:row.rate!==""&&row.rate!==undefined?Math.max(Number(row.rate)||0,0):getCategoryRate(categoryRates,row.category||"anor_uzish"),
 taxiRate:row.taxiRate!==""&&row.taxiRate!==undefined?Math.max(Number(row.taxiRate)||0,0):getTaxiRate(taxiRates,row.category||"anor_uzish"),
 brigadierRate:row.brigadierRate!==""&&row.brigadierRate!==undefined?Math.max(Number(row.brigadierRate)||0,0):Math.max(Number(brigadierRate)||0,0)
 }))
 .filter(row=>row.workers>0);

 if(!rows.length)return;

 setBrigadiers(prev=>prev.map(b=>{
 if(b.id!==workerForm.brigadierId)return b;
 const newLogs=rows.map(row=>({
 id:uid("log"),
 date:workerForm.date,
 workers:row.workers,
 category:row.category,
 portion:row.portion,
 rate:row.rate,
 taxiRate:row.taxiRate,
 brigadierRate:row.brigadierRate,
 advance:0,
 note:workerForm.note
 }));
 return {...b,logs:[...b.logs,...newLogs]};
 }));

 setModal(null);
 setWorkerForm({brigadierId:"",date:todayISO(),rows:[emptyRow()],note:""});
 };

 const saveAdvance=(e)=>{
 e.preventDefault();
 const amount=Number(advanceForm.amount);
 if(!advanceForm.brigadierId||!amount||amount<=0)return;
 setBrigadiers(prev=>prev.map(b=>b.id!==advanceForm.brigadierId?b:{...b,logs:[...b.logs,{id:uid("advance"),date:advanceForm.date,workers:0,advance:amount,note:advanceForm.note||"Avans"}]}));
 setModal(null);
 setAdvanceForm({brigadierId:"",date:todayISO(),amount:"",note:""});
 };

 const openWorkersModal=(brigadierId="")=>{
 setWorkerForm({
 brigadierId:brigadierId||selectedId||brigadiers[0]?.id||"",
 date:todayISO(),
 rows:[emptyRow()],
 note:""
 });
 setModal("workers");
 };

 const openAdvanceModal=(brigadierId="")=>{
 setAdvanceForm({brigadierId:brigadierId||selectedId||brigadiers[0]?.id||"",date:todayISO(),amount:"",note:""});
 setModal("advance");
 };

 const deleteBrigadier=()=>{
 if(!selectedBrigadier)return;
 if(!window.confirm(`"${selectedBrigadier.name}" brigadirini o‘chirishni tasdiqlaysizmi?`))return;
 setBrigadiers(prev=>prev.filter(b=>b.id!==selectedId));
 setSelectedId(null);
 setActiveTab("brigadiers");
 };

 const exportBackup=()=>{
 const blob=new Blob([JSON.stringify({
 exportedAt:new Date().toISOString(),
 brigadiers,
 categoryRates,
 taxiRates,
 brigadierRate
 },null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;
 a.download=`anor-bogi-backup-${todayISO()}.json`;
 document.body.appendChild(a);
 a.click();
 a.remove();
 URL.revokeObjectURL(url);
 };

 const importBackup=()=>{
 const input=document.createElement("input");
 input.type="file";
 input.accept=".json,application/json";
 input.onchange=(e)=>{
 const file=e.target.files?.[0];
 if(!file)return;
 const reader=new FileReader();
 reader.onload=(event)=>{
 try{
 const data=JSON.parse(event.target.result);
 if(!data||!Array.isArray(data.brigadiers))throw new Error("invalid");
 if(!window.confirm("Backup ma’lumotlari hozirgi barcha ma’lumotlarni almashtiradi. Davom etasizmi?"))return;

 setBrigadiers(data.brigadiers);
 setCategoryRates({...DEFAULT_CATEGORY_RATES,...(data.categoryRates||{})});
 setTaxiRates({...DEFAULT_TAXI_RATES,...(data.taxiRates||{})});
 setBrigadierRate(Number(data.brigadierRate)>=0?Number(data.brigadierRate):DEFAULT_BRIGADIER_RATE);
 setSelectedId(null);
 setActiveTab("dashboard");
 alert("Backup muvaffaqiyatli tiklandi.");
 }catch{
 alert("Backup fayli noto‘g‘ri yoki buzilgan.");
 }
 };
 reader.readAsText(file);
 };
 input.click();
 };

 const clearAll=()=>{
 if(!window.confirm("Barcha brigadirlar va ish ma’lumotlari o‘chiriladi. Davom etasizmi?"))return;
 setBrigadiers([]);
 setCategoryRates({...DEFAULT_CATEGORY_RATES});
 setTaxiRates({...DEFAULT_TAXI_RATES});
 setBrigadierRate(DEFAULT_BRIGADIER_RATE);
 localStorage.removeItem(STORAGE_KEY);
 };

 const navItems=[
 {id:"dashboard",label:"Boshqaruv paneli",icon:BarChart3},
 {id:"brigadiers",label:"Brigadirlar",icon:Users},
 {id:"daily",label:"Kunlik ish",icon:CalendarDays},
 {id:"finance",label:"Moliya",icon:Wallet},
 {id:"reports",label:"Hisobotlar",icon:FileBarChart}
 ];

 let page;
 if(selectedBrigadier&&activeTab==="brigadiers"){
 page=<BrigadierDetail brigadier={selectedBrigadier} categoryRates={categoryRates} taxiRates={taxiRates} brigadierRate={brigadierRate} onBack={()=>setSelectedId(null)} onAddWorkers={()=>openWorkersModal(selectedBrigadier.id)} onAdvance={()=>openAdvanceModal(selectedBrigadier.id)} onDelete={deleteBrigadier}/>;
 }else if(activeTab==="dashboard"){
 page=<Dashboard stats={stats} recent={recent} onAddBrigadier={()=>setModal("brigadier")} onAddWorkers={()=>openWorkersModal()} onAdvance={()=>openAdvanceModal()} onOpenBrigadiers={()=>navigate("brigadiers")} onOpenFinance={()=>navigate("finance")}/>;
 }else if(activeTab==="brigadiers"){
 page=<BrigadiersPage brigadiers={brigadiers} categoryRates={categoryRates} taxiRates={taxiRates} brigadierRate={brigadierRate} onAdd={()=>setModal("brigadier")} onOpen={setSelectedId}/>;
 }else if(activeTab==="daily"){
 page=<DailyWorkPage brigadiers={brigadiers} categoryRates={categoryRates} taxiRates={taxiRates} brigadierRate={brigadierRate} onAddWorkers={()=>openWorkersModal()}/>;
 }else if(activeTab==="finance"){
 page=<FinancePage stats={stats} brigadiers={brigadiers} categoryRates={categoryRates} taxiRates={taxiRates} brigadierRate={brigadierRate}/>;
 }else if(activeTab==="reports"){
 page=<ReportsPage stats={stats} brigadiers={brigadiers} categoryRates={categoryRates} taxiRates={taxiRates} brigadierRate={brigadierRate}/>;
 }else{
 page=<SettingsPage categoryRates={categoryRates} setCategoryRates={setCategoryRates} taxiRates={taxiRates} setTaxiRates={setTaxiRates} brigadierRate={brigadierRate} setBrigadierRate={setBrigadierRate} onExport={exportBackup} onImport={importBackup} onClear={clearAll}/>;
 }

 return (
 <div className="min-h-screen bg-[#f7f9f8] text-slate-900">
 <div className="flex min-h-screen">
 <aside className={`fixed lg:sticky top-0 z-50 h-screen w-[270px] bg-[#073c29] text-white flex flex-col transition-transform duration-300 ${mobileMenu?"translate-x-0":"-translate-x-full lg:translate-x-0"}`}>
 <div className="px-6 pt-7 pb-6 "><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"><Leaf size={25}/></div><div><h2 className="font-black text-lg">ANOR BOG‘I</h2><p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/60">Boshqaruv tizimi</p></div></div></div>
 <nav className="px-4 py-6 space-y-1.5 flex-1">
 <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-200/40">Asosiy</p>
 {navItems.map(item=>{const Icon=item.icon;return <button key={item.id} onClick={()=>navigate(item.id)} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold ${activeTab===item.id?"bg-white text-[#073c29]":"text-emerald-50/65 hover:text-white hover:bg-white/8"}`}><Icon size={18}/>{item.label}</button>})}
 <p className="px-3 pt-7 pb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-200/40">Tizim</p>
 <button onClick={()=>navigate("settings")} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold ${activeTab==="settings"?"bg-white text-[#073c29]":"text-emerald-50/65 hover:text-white hover:bg-white/8"}`}><Settings size={18}/>Sozlamalar</button>
 </nav>
 <div className="p-4"><div className="rounded-2xl bg-white/7 p-4"><div className="flex items-center gap-2 text-emerald-200"><Sparkles size={15}/><span className="text-[11px] font-bold">Bugungi eslatma</span></div><p className="mt-2 text-xs text-white/55">Kichik nazorat — katta natija.</p></div></div>
 </aside>

 {mobileMenu&&<button onClick={()=>setMobileMenu(false)} className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"/>}

 <main className="flex-1 min-w-0">
 <header className="sticky top-0 z-30 h-[72px] bg-white/85 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-9">
 <div className="flex items-center gap-3"><button onClick={()=>setMobileMenu(true)} className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><Menu size={19}/></button><div><p className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-emerald-600">ANOR BOG‘I</p><p className="text-sm font-black">{selectedBrigadier?selectedBrigadier.name:navItems.find(n=>n.id===activeTab)?.label||"Sozlamalar"}</p></div></div>
 <div className="flex items-center gap-2 sm:gap-4"><div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl px-3 py-2"><CalendarDays size={15}/>{new Date().toLocaleDateString("uz-UZ",{day:"2-digit",month:"short"})}</div><button className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500"><Bell size={18}/>{recent.length>0&&<span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-orange-500"/>}</button><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-[#0b6b43] text-white flex items-center justify-center font-black text-sm">S</div><div className="hidden md:block"><p className="text-xs font-black">Suxrob</p><p className="text-[10px] text-slate-400">Rahbar</p></div></div></div>
 </header>
 <div className="w-full p-4 sm:p-6 lg:p-8 xl:p-9">{page}</div>
 </main>
 </div>

 <Modal open={modal==="brigadier"} title="Yangi brigadir qo‘shish" subtitle="Birinchi brigadirni kiriting." onClose={()=>setModal(null)}>
 <form onSubmit={addBrigadier} className="p-6 space-y-4"><Input label="Brigadir ismi *" value={newBrigadier.name} onChange={v=>setNewBrigadier(s=>({...s,name:v}))} placeholder="Masalan: Anvar Aliyev"/><Input label="Telefon raqami" value={newBrigadier.phone} onChange={v=>setNewBrigadier(s=>({...s,phone:v}))} placeholder="+998 90 123 45 67"/><Input label="Izoh" value={newBrigadier.note} onChange={v=>setNewBrigadier(s=>({...s,note:v}))} placeholder="Qo‘shimcha ma’lumot..."/><button type="submit" disabled={!newBrigadier.name.trim()} className="w-full h-11 rounded-xl bg-[#0b6b43] text-white text-sm font-bold disabled:opacity-40">Brigadirni saqlash</button></form>
 </Modal>

 <Modal open={modal==="workers"} title="Ishchilarni kiritish" subtitle="Har bir qatorda kategoriya, stavka, taxi va brigadir pulini alohida o‘zgartirishingiz mumkin." onClose={()=>setModal(null)} wide>
 <form onSubmit={saveWorkerLog} className="p-6 space-y-5">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <label className="block"><span className="block text-xs font-bold text-slate-600 mb-2">Brigadir *</span><select value={workerForm.brigadierId} onChange={e=>setWorkerForm(s=>({...s,brigadierId:e.target.value}))} className="w-full h-11 px-3 rounded-xl bg-slate-50 outline-none text-sm"><option value="">Brigadirni tanlang</option>{brigadiers.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
 <Input label="Sana" type="date" value={workerForm.date} onChange={v=>setWorkerForm(s=>({...s,date:v}))}/>
 </div>

 <div className="space-y-4">
 {(workerForm.rows||[]).map((row,index)=>(
 <div key={row.id} className="rounded-2xl p-4 bg-slate-50/40">
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 items-end">
 <Input label={index===0?"Ishchilar soni *":"Ishchilar soni"} type="number" value={row.workers} onChange={v=>setWorkerForm(s=>({...s,rows:s.rows.map(r=>r.id===row.id?{...r,workers:v}:r)}))} placeholder="20"/>
 <label className="block"><span className="block text-xs font-bold text-slate-600 mb-2">Kategoriya</span><select value={row.category} onChange={e=>{const category=e.target.value;setWorkerForm(s=>({...s,rows:s.rows.map(r=>r.id===row.id?{...r,category,rate:getCategoryRate(categoryRates,category),taxiRate:getTaxiRate(taxiRates,category)}:r)}))}} className="w-full h-11 px-3 rounded-xl bg-white text-sm">{Object.entries(CATEGORY_META).map(([id,m])=><option key={id} value={id}>{m.icon} {m.name}</option>)}</select></label>
 <label className="block"><span className="block text-xs font-bold text-slate-600 mb-2">Ulush / kun</span><select value={row.portion} onChange={e=>setWorkerForm(s=>({...s,rows:s.rows.map(r=>r.id===row.id?{...r,portion:e.target.value}:r)}))} className="w-full h-11 px-3 rounded-xl bg-white text-sm"><option value="1">1 kun</option><option value="0.75">0.75 kun</option><option value="0.5">0.5 kun</option><option value="0.25">0.25 kun</option></select></label>
 <Input label="Stavka (so‘m)" type="number" value={String(row.rate??"")} onChange={v=>setWorkerForm(s=>({...s,rows:s.rows.map(r=>r.id===row.id?{...r,rate:v}:r)}))}/>
 <Input label="Taxi puli" type="number" value={String(row.taxiRate??"")} onChange={v=>setWorkerForm(s=>({...s,rows:s.rows.map(r=>r.id===row.id?{...r,taxiRate:v}:r)}))}/>
 <Input label="Brigadir puli" type="number" value={String(row.brigadierRate??"")} onChange={v=>setWorkerForm(s=>({...s,rows:s.rows.map(r=>r.id===row.id?{...r,brigadierRate:v}:r)}))}/>
 </div>
 <div className="mt-3 flex items-center justify-between gap-3">
 <p className="text-xs text-slate-500">{number(Number(row.workers)||0)} ishchi × {row.portion} × ({money(Number(row.rate)||0)} + {money(Number(row.taxiRate)||0)} taxi + {money(Number(row.brigadierRate)||0)} brigadir) = <b className="text-emerald-700">{money((Number(row.workers)||0)*(Number(row.portion)||0)*((Number(row.rate)||0)+(Number(row.taxiRate)||0)+(Number(row.brigadierRate)||0)))}</b></p>
 <button type="button" disabled={workerForm.rows.length===1} onClick={()=>setWorkerForm(s=>({...s,rows:s.rows.filter(r=>r.id!==row.id)}))} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold disabled:opacity-30">O‘chirish</button>
 </div>
 </div>
 ))}
 <button type="button" onClick={()=>setWorkerForm(s=>({...s,rows:[...s.rows,emptyRow()]}))} className="w-full h-11 rounded-xl text-emerald-700 text-sm font-bold">+ Yana ish turi qo‘shish</button>
 </div>

 <Input label="Izoh" value={workerForm.note} onChange={v=>setWorkerForm(s=>({...s,note:v}))} placeholder="Masalan: Bugungi terim"/>
 <button type="submit" disabled={!workerForm.brigadierId||!(workerForm.rows||[]).some(r=>Number(r.workers)>0)} className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-40">Ishchilarni saqlash</button>
 </form>
 </Modal>

 <Modal open={modal==="advance"} title="Avans berish" subtitle="Brigadirga berilgan to‘lovni qayd qiling." onClose={()=>setModal(null)}>
 <form onSubmit={saveAdvance} className="p-6 space-y-4">
 <label className="block"><span className="block text-xs font-bold text-slate-600 mb-2">Brigadir *</span><select value={advanceForm.brigadierId} onChange={e=>setAdvanceForm(s=>({...s,brigadierId:e.target.value}))} className="w-full h-11 px-3 rounded-xl bg-slate-50 text-sm"><option value="">Brigadirni tanlang</option>{brigadiers.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
 <Input label="Sana" type="date" value={advanceForm.date} onChange={v=>setAdvanceForm(s=>({...s,date:v}))}/>
 <Input label="Avans summasi *" type="number" value={advanceForm.amount} onChange={v=>setAdvanceForm(s=>({...s,amount:v}))} placeholder="2500000"/>
 <Input label="Izoh" value={advanceForm.note} onChange={v=>setAdvanceForm(s=>({...s,note:v}))} placeholder="Haftalik avans"/>
 <button type="submit" disabled={!advanceForm.brigadierId||!advanceForm.amount} className="w-full h-11 rounded-xl bg-orange-500 text-white text-sm font-bold disabled:opacity-40">Avansni saqlash</button>
 </form>
 </Modal>
 </div>
 );
}
