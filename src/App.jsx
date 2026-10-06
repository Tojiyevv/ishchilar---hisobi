import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Download,
  FileBarChart,
  FileText,
  Leaf,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

/*
  ANOR BOG'I — modern orchard management UI
  Requirements:
  - React + Tailwind CSS
  - lucide-react
  - Starts completely empty (no demo brigadiers)
  - localStorage persistence
*/

const STORAGE_KEY = "anor_bogi_v3";
const DEFAULT_CATEGORY_RATES = {
  anor_uzish: 150000,
  salafanlash: 150000,
  ortish: 150000,
};
const DAILY_RATE = DEFAULT_CATEGORY_RATES.anor_uzish;

const CATEGORY_META = {
  anor_uzish: { name: "Anor uzuvchi", icon: "🍎" },
  salafanlash: { name: "Salafan qiluvchi", icon: "📦" },
  ortish: { name: "Mashinaga ortuvchi", icon: "🚚" },
};

const getCategoryName = (category) =>
  CATEGORY_META[category]?.name || CATEGORY_META.anor_uzish.name;

const getCategoryRate = (categoryRates, category) =>
  Number(categoryRates?.[category]) || 0;

const money = (value = 0) =>
  new Intl.NumberFormat("uz-UZ").format(Math.round(Number(value) || 0)) + " so'm";

const number = (value = 0) =>
  new Intl.NumberFormat("uz-UZ").format(Number(value) || 0);

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const WEEKDAY_SHORT = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

const getLast7DayLabels = () => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    return WEEKDAY_SHORT[date.getDay()];
  });
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(`${date}T12:00:00`).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const uid = (prefix = "id") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const emptyBrigadier = {
  name: "",
  phone: "",
  note: "",
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
      className="group text-left bg-white border border-slate-200/80 rounded-[22px] p-5 shadow-[0_6px_30px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.08)] transition-all w-full"
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tones[tone]}`}>
          <Icon size={21} strokeWidth={2.2} />
        </div>
        <ArrowUpRight
          size={17}
          className="text-slate-300 group-hover:text-emerald-600 transition-colors"
        />
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
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b6b43] text-white text-sm font-bold hover:bg-[#095b39] transition"
        >
          <Plus size={17} />
          {action}
        </button>
      )}
    </div>
  );
}

function Modal({ open, title, subtitle, onClose, children, wide = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm p-4 flex items-center justify-center">
      <div
        className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[92vh] overflow-auto bg-white rounded-[28px] shadow-2xl border border-white/60`}
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
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
      <span className="block text-xs font-bold text-slate-600 mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/60 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm text-slate-800 transition"
      />
    </label>
  );
}

function SectionTitle({ eyebrow, title, description, action, onAction }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl md:text-[28px] font-black tracking-tight text-slate-900">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b6b43] text-white text-sm font-bold shadow-sm hover:bg-[#095b39] transition"
        >
          <Plus size={17} />
          {action}
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
            <div className="text-[10px] text-slate-400 text-center mb-1">
              {item.value ? number(item.value) : ""}
            </div>
            <div
              className="w-full bg-emerald-500/80 rounded-t-lg transition-all"
              style={{ height: `${height}%` }}
            />
            <div className="mt-2 text-[10px] text-slate-400 text-center">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function Donut({ income, expense }) {
  const total = income + expense;
  const expensePct = total ? expense / total : 0;
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-40 h-40 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="13" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#0b6b43"
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={`${c * (1 - expensePct)} ${c}`}
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={`${c * expensePct} ${c}`}
          strokeDashoffset={-c * (1 - expensePct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] text-slate-400">Jami</span>
        <span className="text-sm font-black text-slate-900">{money(total)}</span>
      </div>
    </div>
  );
}

function Dashboard({
  stats,
  recent,
  brigadiers,
  onAddBrigadier,
  onAddWorkers,
  onAdvance,
  onOpenBrigadiers,
  onOpenFinance,
}) {
  const chart = stats.dailyWorkers.map((v, i) => ({
    label: getLast7DayLabels()[i],
    value: v,
  }));

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] min-h-[235px] bg-[#0a5d3a] text-white shadow-[0_18px_50px_rgba(5,92,56,0.18)]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534256958597-7fe685cbd745?auto=format&fit=crop&w=1800&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06482d]/95 via-[#0a5d3a]/78 to-[#0a5d3a]/35" />
        <div className="relative z-10 p-7 md:p-9 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold">
            <Sparkles size={14} />
            Anor bog'i boshqaruv tizimi
          </div>
          <h2 className="mt-5 text-3xl md:text-[38px] leading-tight font-black tracking-tight">
            Assalomu alaykum,
            <br />
            bog‘ingiz nazorat ostida.
          </h2>
          <p className="mt-3 text-sm text-emerald-50/80 max-w-lg leading-6">
            Bugungi ishlar, brigadirlar va moliyaviy holatni bitta joydan boshqaring.
          </p>
        </div>
        <div className="absolute right-7 bottom-7 hidden md:flex items-center gap-2 text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2">
          <CalendarDays size={15} />
          {new Date().toLocaleDateString("uz-UZ", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="Jami brigadirlar"
          value={number(stats.brigadiers)}
          hint={stats.brigadiers ? "Tizimdagi brigadirlar" : "Hozircha brigadir qo‘shilmagan"}
          onClick={onOpenBrigadiers}
        />
        <StatCard
          icon={User}
          label="Bugun ishlayotganlar"
          value={number(stats.todayWorkers)}
          hint={`Jami ishchi: ${number(stats.allWorkers)}`}
          tone="blue"
          onClick={onAddWorkers}
        />
        <StatCard
          icon={Wallet}
          label="Bugungi mehnat xarajati"
          value={money(stats.todayEarned)}
          hint="3 ta ish turi bo‘yicha hisoblangan"
          tone="purple"
          onClick={onOpenFinance}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Berilgan avans"
          value={money(stats.totalAdvance)}
          hint={`${number(stats.advanceCount)} ta operatsiya`}
          tone="orange"
          onClick={onAdvance}
        />
        <StatCard
          icon={TrendingUp}
          label="Jami hisoblangan ish haqi"
          value={money(stats.totalEarned)}
          hint={`Qolgan: ${money(Math.max(stats.totalEarned - stats.totalAdvance, 0))}`}
          tone="cyan"
          onClick={onOpenFinance}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_0.95fr] gap-5">
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-[0_6px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-900">Haftalik ish faolligi</h3>
              <p className="text-xs text-slate-500 mt-1">Oxirgi 7 kun bo‘yicha ishchilar</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <Activity size={14} />
              {number(stats.weekWorkers)} ishchi
            </div>
          </div>
          <div className="mt-6">
            <MiniBarChart values={chart} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-[0_6px_30px_rgba(15,23,42,0.04)]">
          <div>
            <h3 className="font-black text-slate-900">Daromad va xarajatlar</h3>
            <p className="text-xs text-slate-500 mt-1">Tizimdagi umumiy moliyaviy ko‘rsatkich</p>
          </div>
          <div className="mt-5 flex items-center gap-5">
            <Donut income={stats.totalEarned} expense={stats.totalAdvance} />
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  Hisoblangan ish haqi
                </div>
                <p className="mt-1 font-black text-slate-900">{money(stats.totalEarned)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Berilgan avans
                </div>
                <p className="mt-1 font-black text-slate-900">{money(stats.totalAdvance)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
        <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden shadow-[0_6px_30px_rgba(15,23,42,0.04)]">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900">So‘nggi faoliyat</h3>
              <p className="text-xs text-slate-500 mt-1">Tizimda kiritilgan oxirgi amallar</p>
            </div>
            <Clock3 size={19} className="text-slate-300" />
          </div>
          {recent.length ? (
            <div className="divide-y divide-slate-100">
              {recent.slice(0, 6).map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    {item.type === "advance" ? <Wallet size={16} /> : <Users size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{formatDate(item.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="Hali faoliyat yo‘q"
              description="Brigadir yoki ishchilar haqida birinchi ma’lumotni kiritsangiz, bu yerda tarix paydo bo‘ladi."
              action="Brigadir qo‘shish"
              onAction={onAddBrigadier}
            />
          )}
        </div>

        <div className="bg-[#f3faf6] border border-emerald-100 rounded-[24px] p-6">
          <div className="flex items-center gap-2 text-emerald-700">
            <Zap size={18} fill="currentColor" />
            <span className="text-xs font-black uppercase tracking-wider">Tezkor boshqaruv</span>
          </div>
          <h3 className="mt-3 text-xl font-black text-slate-900">Bugungi ishni tez boshlang</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Eng ko‘p ishlatiladigan amallar shu yerda.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={onAddBrigadier}
              className="p-4 bg-white border border-emerald-100 rounded-2xl text-left hover:border-emerald-300 transition"
            >
              <UserPlus className="text-emerald-700" size={20} />
              <p className="mt-3 text-sm font-extrabold text-slate-800">Brigadir</p>
              <p className="text-[11px] text-slate-400 mt-1">Yangi qo‘shish</p>
            </button>
            <button
              onClick={onAddWorkers}
              className="p-4 bg-white border border-emerald-100 rounded-2xl text-left hover:border-emerald-300 transition"
            >
              <Users className="text-blue-600" size={20} />
              <p className="mt-3 text-sm font-extrabold text-slate-800">Ishchilar</p>
              <p className="text-[11px] text-slate-400 mt-1">Bugungi sonni kiritish</p>
            </button>
            <button
              onClick={onAdvance}
              className="p-4 bg-white border border-orange-100 rounded-2xl text-left hover:border-orange-300 transition"
            >
              <Wallet className="text-orange-600" size={20} />
              <p className="mt-3 text-sm font-extrabold text-slate-800">Avans</p>
              <p className="text-[11px] text-slate-400 mt-1">To‘lov kiritish</p>
            </button>
            <button
              onClick={onOpenFinance}
              className="p-4 bg-white border border-violet-100 rounded-2xl text-left hover:border-violet-300 transition"
            >
              <FileBarChart className="text-violet-600" size={20} />
              <p className="mt-3 text-sm font-extrabold text-slate-800">Hisobot</p>
              <p className="text-[11px] text-slate-400 mt-1">Natijani ko‘rish</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrigadiersPage({ brigadiers, onAdd, onOpen, categoryRates }) {
  const [query, setQuery] = useState("");

  const filtered = brigadiers.filter((b) =>
    `${b.name} ${b.phone}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Jamoa boshqaruvi"
        title="Brigadirlar"
        description="Brigadirlar, ishchilar va hisob-kitoblarni shu yerdan boshqaring."
        action="Brigadir qo‘shish"
        onAction={onAdd}
      />

      <div className="bg-white border border-slate-200/80 rounded-[24px] p-4 shadow-[0_6px_30px_rgba(15,23,42,0.04)]">
        <div className="relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Brigadir nomi yoki telefon raqami bo‘yicha qidiring..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-emerald-500 text-sm" />
        </div>
      </div>

      {!filtered.length ? (
        <div className="bg-white border border-slate-200/80 rounded-[24px]">
          <EmptyState icon={Users} title={brigadiers.length ? "Natija topilmadi" : "Hali brigadir yo‘q"} description={brigadiers.length ? "Qidiruv so‘zini o‘zgartirib ko‘ring." : "Tizimni 0 dan boshlayapsiz. Birinchi brigadirni qo‘shing."} action={!brigadiers.length ? "Birinchi brigadirni qo‘shish" : undefined} onAction={onAdd} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const categoryWorkers = { anor_uzish: 0, salafanlash: 0, ortish: 0 };
            b.logs.forEach((l) => {
              const category = l.category || "anor_uzish";
              if (categoryWorkers[category] !== undefined) categoryWorkers[category] += Number(l.workers) || 0;
            });
            const earned = Object.entries(categoryWorkers).reduce((sum, [category, workers]) => sum + workers * getCategoryRate(categoryRates, category), 0);
            const advances = b.logs.reduce((s, l) => s + (Number(l.advance) || 0), 0);
            return (
              <button key={b.id} onClick={() => onOpen(b.id)} className="group text-left bg-white border border-slate-200/80 rounded-[24px] p-5 hover:border-emerald-300 hover:-translate-y-0.5 shadow-[0_6px_30px_rgba(15,23,42,0.04)] transition">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg">{b.name?.trim()?.charAt(0)?.toUpperCase() || "B"}</div>
                  <MoreHorizontal size={19} className="text-slate-300" />
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-900">{b.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{b.phone || "Telefon kiritilmagan"}</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {Object.entries(CATEGORY_META).map(([id, meta]) => (
                    <div key={id} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-base">{meta.icon}</p>
                      <p className="mt-1 text-[10px] leading-4 text-slate-400">{meta.name}</p>
                      <p className="mt-1 font-black text-slate-800">{number(categoryWorkers[id])}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div><span className="text-xs text-slate-400">Hisoblangan: </span><b className="text-xs text-slate-700">{money(earned)}</b></div>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">Ochish <ChevronRight size={15} /></span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Avans: {money(advances)}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BrigadierDetail({ brigadier, categoryRates, onBack, onAddWorkers, onAdvance, onDelete }) {
  if (!brigadier) return null;
  const categoryWorkers = { anor_uzish: 0, salafanlash: 0, ortish: 0 };
  brigadier.logs.forEach((l) => {
    const category = l.category || "anor_uzish";
    if (categoryWorkers[category] !== undefined) categoryWorkers[category] += Number(l.workers) || 0;
  });
  const earned = Object.entries(categoryWorkers).reduce((sum, [category, workers]) => sum + workers * getCategoryRate(categoryRates, category), 0);
  const advance = brigadier.logs.reduce((s, l) => s + (Number(l.advance) || 0), 0);
  const balance = Math.max(earned - advance, 0);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-2">← Brigadirlar ro‘yxatiga qaytish</button>
      <section className="bg-white border border-slate-200/80 rounded-[26px] p-6 shadow-[0_6px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[20px] bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-black">{brigadier.name.charAt(0).toUpperCase()}</div>
            <div><p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">Brigadir</p><h1 className="mt-1 text-2xl font-black text-slate-900">{brigadier.name}</h1><p className="mt-1 text-sm text-slate-400">{brigadier.phone || "Telefon kiritilmagan"}</p></div>
          </div>
          <div className="flex flex-wrap gap-2"><button onClick={onAddWorkers} className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center gap-2"><Users size={16} /> Ishchi kiritish</button><button onClick={onAdvance} className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold flex items-center gap-2"><Wallet size={16} /> Avans berish</button></div>
        </div>
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(CATEGORY_META).map(([id, meta]) => (<div key={id} className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between"><span className="text-xl">{meta.icon}</span><span className="text-[10px] font-bold text-slate-400">{money(getCategoryRate(categoryRates,id))}/ta</span></div><p className="mt-3 text-[11px] text-slate-400">{meta.name}</p><p className="mt-1 text-2xl font-black">{number(categoryWorkers[id])}</p><p className="mt-1 text-xs font-bold text-emerald-700">{money(categoryWorkers[id] * getCategoryRate(categoryRates,id))}</p></div>))}
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-[11px] text-emerald-700/70">Jami hisoblangan</p><p className="mt-1 text-lg font-black text-emerald-800">{money(earned)}</p></div>
          <div className="rounded-2xl bg-orange-50 p-4"><p className="text-[11px] text-orange-700/70">Avans</p><p className="mt-1 text-lg font-black text-orange-800">{money(advance)}</p></div>
          <div className="rounded-2xl bg-blue-50 p-4"><p className="text-[11px] text-blue-700/70">Qolgan haq</p><p className="mt-1 text-lg font-black text-blue-800">{money(balance)}</p></div>
        </div>
      </section>
      <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between"><div><h3 className="font-black text-slate-900">Faoliyat tarixi</h3><p className="text-xs text-slate-500 mt-1">Ishchilar, kategoriyalar va avanslar</p></div><ClipboardList size={19} className="text-slate-300" /></div>
        {!brigadier.logs.length ? <EmptyState icon={ClipboardList} title="Hali ma’lumot yo‘q" description="Bu brigadir uchun birinchi ish kuni yoki avansni kiriting." /> : (() => {
          const groupedByDate = brigadier.logs.reduce((groups, log) => {
            if (!groups[log.date]) groups[log.date] = [];
            groups[log.date].push(log);
            return groups;
          }, {});
          const dates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

          return <div className="overflow-x-auto"><table className="w-full text-sm min-w-[760px]"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400"><tr><th className="text-left px-6 py-3 font-bold w-[180px]">Sana</th><th className="text-left px-6 py-3 font-bold">Turi</th><th className="text-left px-6 py-3 font-bold">Soni</th><th className="text-left px-6 py-3 font-bold">Avans</th><th className="text-left px-6 py-3 font-bold">Izoh</th></tr></thead><tbody className="divide-y divide-slate-100">{dates.map((date) => groupedByDate[date].map((log, index) => <tr key={log.id} className="hover:bg-slate-50/70">
            {index === 0 && <td rowSpan={groupedByDate[date].length} className="px-6 py-4 align-top font-bold text-slate-700 whitespace-nowrap bg-white">{formatDate(date)}</td>}
            <td className="px-6 py-4">{Number(log.workers)>0 ? getCategoryName(log.category || "anor_uzish") : "Avans"}</td>
            <td className="px-6 py-4">{Number(log.workers)>0 ? `${number(log.workers)} ta` : "—"}</td>
            <td className="px-6 py-4 font-bold text-orange-600">{log.advance ? money(log.advance) : "—"}</td>
            <td className="px-6 py-4 text-slate-400">{log.note || "—"}</td>
          </tr>))}</tbody></table></div>;
        })()}
      </div>
      <div className="flex justify-end"><button onClick={onDelete} className="text-xs font-bold text-rose-500 hover:text-rose-700">Ushbu brigadirni o‘chirish</button></div>
    </div>
  );
}

function ReportsPage({ stats, brigadiers, categoryRates }) {
  const rows = brigadiers.map((b) => {
    const categoryWorkers = { anor_uzish: 0, salafanlash: 0, ortish: 0 };
    b.logs.forEach((l) => { const category = l.category || "anor_uzish"; if (categoryWorkers[category] !== undefined) categoryWorkers[category] += Number(l.workers) || 0; });
    const earned = Object.entries(categoryWorkers).reduce((sum,[category,workers]) => sum + workers * getCategoryRate(categoryRates,category), 0);
    const advance = b.logs.reduce((s,l)=>s+(Number(l.advance)||0),0);
    return { name:b.name, categories:categoryWorkers, workers:Object.values(categoryWorkers).reduce((a,b)=>a+b,0), earned, advance, balance:Math.max(earned-advance,0) };
  });
  return (
    <div className="space-y-6"><SectionTitle eyebrow="Nazorat va tahlil" title="Hisobotlar" description="Har bir brigadir va ish turi bo‘yicha hisob-kitob." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><StatCard icon={Users} label="Jami ishchilar" value={number(stats.allWorkers)} hint="Kiritilgan jami ishchi soni" /><StatCard icon={Wallet} label="Hisoblangan ish haqi" value={money(stats.totalEarned)} hint="3 kategoriya stavkasi asosida" tone="purple" /><StatCard icon={CircleDollarSign} label="Qolgan to‘lov" value={money(Math.max(stats.totalEarned-stats.totalAdvance,0))} hint="Avans chegirilgandan keyin" tone="orange" /></div>
      <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden shadow-[0_6px_30px_rgba(15,23,42,0.04)]"><div className="px-6 py-5 border-b border-slate-100"><h3 className="font-black text-slate-900">Brigadirlar hisoboti</h3><p className="text-xs text-slate-500 mt-1">Kategoriya kesimida ishchilar va pul hisoboti</p></div>{!rows.length?<EmptyState icon={FileBarChart} title="Hisobot uchun ma’lumot yetarli emas" description="Avval brigadirlar va ishchilar haqidagi ma’lumotlarni kiriting."/>:<div className="overflow-x-auto"><table className="w-full text-sm min-w-[900px]"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400"><tr><th className="text-left px-6 py-3">Brigadir</th><th className="text-left px-6 py-3">🍎 Anor uzuvchi</th><th className="text-left px-6 py-3">📦 Salafan qiluvchi</th><th className="text-left px-6 py-3">🚚 Mashinaga ortuvchi</th><th className="text-left px-6 py-3">Jami</th><th className="text-left px-6 py-3">Hisoblangan</th><th className="text-left px-6 py-3">Avans</th><th className="text-left px-6 py-3">Qolgan</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(r=><tr key={r.name}><td className="px-6 py-4 font-bold text-slate-800">{r.name}</td><td className="px-6 py-4">{number(r.categories.anor_uzish)} ta</td><td className="px-6 py-4">{number(r.categories.salafanlash)} ta</td><td className="px-6 py-4">{number(r.categories.ortish)} ta</td><td className="px-6 py-4 font-bold">{number(r.workers)} ta</td><td className="px-6 py-4 font-semibold">{money(r.earned)}</td><td className="px-6 py-4 text-orange-600 font-semibold">{money(r.advance)}</td><td className="px-6 py-4 text-emerald-700 font-bold">{money(r.balance)}</td></tr>)}</tbody></table></div>}</div>
    </div>
  );
}

function FinancePage({ stats, brigadiers, categoryRates }) {
  const transactions = [];
  brigadiers.forEach((b) =>
    b.logs.forEach((l) => {
      if (Number(l.advance) > 0) {
        transactions.push({
          id: l.id,
          name: b.name,
          date: l.date,
          amount: Number(l.advance),
          note: l.note || "Avans",
        });
      }
    })
  );
  transactions.sort((a, b) => b.date.localeCompare(a.date));

  const categorySummary = Object.entries(CATEGORY_META).map(([id, meta]) => {
    const workers = Number(stats.categoryWorkers?.[id]) || 0;
    const rate = getCategoryRate(categoryRates, id);
    const earned = workers * rate;
    const share = stats.totalEarned > 0 ? Math.round((earned / stats.totalEarned) * 100) : 0;
    return { id, meta, workers, rate, earned, share };
  });

  return (
    <div className="w-full space-y-6">
      <SectionTitle
        eyebrow="Moliya"
        title="Moliyaviy boshqaruv"
        description="Mehnat xarajatlari, avanslar va har bir kategoriya bo‘yicha qancha pul hisoblanganini kuzating."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <StatCard
          icon={TrendingUp}
          label="Jami hisoblangan"
          value={money(stats.totalEarned)}
          hint="Barcha kategoriyalar"
          tone="green"
        />
        <StatCard
          icon={Wallet}
          label="Berilgan avans"
          value={money(stats.totalAdvance)}
          hint={`${number(stats.advanceCount)} ta operatsiya`}
          tone="orange"
        />
        <StatCard
          icon={CircleDollarSign}
          label="Qolgan haq"
          value={money(Math.max(stats.totalEarned - stats.totalAdvance, 0))}
          hint="Hisoblangan − avans"
          tone="blue"
        />
      </div>

      {/* Kategoriya bo‘yicha haqiqiy hisob */}
      <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden shadow-[0_6px_30px_rgba(15,23,42,0.04)] w-full">
        <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-900">Kategoriya bo‘yicha hisob</h3>
              <p className="text-xs text-slate-500 mt-1">
                Har bir ish turi qancha ishchi va qancha pul hisoblaganini ko‘ring.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
              <Leaf size={15} className="text-emerald-600" />
              Jami: {money(stats.totalEarned)}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {categorySummary.map(({ id, meta, workers, rate, earned, share }) => (
            <div
              key={id}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 min-w-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xl">
                    {meta.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm text-slate-800 truncate">{meta.name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {number(workers)} ta ishchi
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                  {share}%
                </span>
              </div>

              <div className="mt-5">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Hisoblangan pul
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 break-words">
                  {money(earned)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">1 ishchi stavkasi</span>
                <b className="text-slate-700">{money(rate)}</b>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 sm:p-6 min-w-0">
          <p className="text-xs font-bold text-slate-400">Mehnat uchun umumiy hisob</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 break-words">
            {money(stats.totalEarned)}
          </p>
          <div className="mt-6 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  (stats.totalAdvance / Math.max(stats.totalEarned, 1)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs">
            <span className="text-slate-400">Avans ulushi</span>
            <b className="text-slate-700">
              {stats.totalEarned
                ? Math.round((stats.totalAdvance / stats.totalEarned) * 100)
                : 0}%
            </b>
          </div>
        </div>

        <div className="bg-[#f3faf6] border border-emerald-100 rounded-[24px] p-5 sm:p-6 min-w-0">
          <div className="flex items-center gap-2 text-emerald-700">
            <Leaf size={18} />
            <span className="text-xs font-black">ISH HAQI STAVKALARI</span>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categorySummary.map(({ id, meta, rate }) => (
              <div key={id} className="bg-white/80 rounded-2xl p-3 min-w-0">
                <p className="text-lg">{meta.icon}</p>
                <p className="mt-2 text-[10px] text-slate-400 leading-4">{meta.name}</p>
                <p className="mt-1 font-black text-slate-900 break-words">
                  {money(rate)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden w-full">
        <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
          <h3 className="font-black text-slate-900">Avans operatsiyalari</h3>
          <p className="text-xs text-slate-500 mt-1">Eng so‘nggi berilgan avanslar</p>
        </div>
        {!transactions.length ? (
          <EmptyState
            icon={Wallet}
            title="Hali avans berilmagan"
            description="Brigadirga avans berilganda barcha operatsiyalar shu yerda ko‘rinadi."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <div key={t.id} className="px-5 sm:px-6 py-4 flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Wallet size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{t.name}</p>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {formatDate(t.date)} · {t.note}
                  </p>
                </div>
                <p className="font-black text-orange-600 whitespace-nowrap">{money(t.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DailyWorkPage({ brigadiers, onAddWorkers, categoryRates }) {
  const today=todayISO();
  const entries=brigadiers.map(b=>{const categoryWorkers={anor_uzish:0,salafanlash:0,ortish:0};let note="";b.logs.filter(l=>l.date===today&&Number(l.workers)>0).forEach(l=>{const c=l.category||"anor_uzish";if(categoryWorkers[c]!==undefined)categoryWorkers[c]+=Number(l.workers)||0;note=note||l.note||"Bugungi ish"});const total=Object.values(categoryWorkers).reduce((a,v)=>a+v,0);return total?{name:b.name,categoryWorkers,total,note}:null}).filter(Boolean);
  return (<div className="space-y-6"><SectionTitle eyebrow="Bugungi nazorat" title="Kunlik ish" description="Bugungi brigadirlar va 3 xil ish turi bo‘yicha holat." action="Ishchi kiritish" onAction={onAddWorkers}/><div className="bg-white border border-slate-200/80 rounded-[24px] p-6"><div className="flex items-center justify-between"><div><p className="text-xs text-slate-400">Bugun</p><h2 className="mt-1 text-xl font-black text-slate-900">{new Date().toLocaleDateString("uz-UZ",{weekday:"long",day:"numeric",month:"long"})}</h2></div><div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><CalendarDays size={20}/></div></div>{!entries.length?<EmptyState icon={Users} title="Bugun hali ishchi kiritilmagan" description="Brigadir va har bir ish turi bo‘yicha ishchilar sonini kiriting." action="Bugungi ishni kiritish" onAction={onAddWorkers}/>:<div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{entries.map(entry=><div key={entry.name} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-black">{entry.name.charAt(0)}</div><div className="flex-1"><p className="font-bold text-sm text-slate-800">{entry.name}</p><p className="text-xs text-slate-400">{entry.note}</p></div><div className="text-right"><p className="text-lg font-black text-emerald-700">{number(entry.total)}</p><p className="text-[10px] text-slate-400">jami ishchi</p></div></div><div className="mt-4 grid grid-cols-3 gap-2">{Object.entries(CATEGORY_META).map(([id,meta])=><div key={id} className="rounded-xl bg-white p-2"><p className="text-sm">{meta.icon}</p><p className="mt-1 text-[9px] leading-3 text-slate-400">{meta.name}</p><p className="mt-1 text-sm font-black">{number(entry.categoryWorkers[id])}</p></div>)}</div><div className="mt-3 pt-3 border-t border-slate-200/70 flex justify-between text-xs"><span className="text-slate-400">Bugungi hisob</span><b className="text-emerald-700">{money(Object.entries(entry.categoryWorkers).reduce((sum,[id,w])=>sum+w*getCategoryRate(categoryRates,id),0))}</b></div></div>)}</div>}</div></div>);
}

function SettingsPage({ categoryRates, setCategoryRates, onExport, onClear }) {
  const [localRates,setLocalRates]=useState({...categoryRates});
  useEffect(()=>setLocalRates({...categoryRates}),[categoryRates]);
  const save=()=>setCategoryRates({anor_uzish:Math.max(Number(localRates.anor_uzish)||0,0),salafanlash:Math.max(Number(localRates.salafanlash)||0,0),ortish:Math.max(Number(localRates.ortish)||0,0)});
  return (<div className="space-y-6"><SectionTitle eyebrow="Tizim" title="Sozlamalar" description="Har bir ish turi uchun alohida ish haqi stavkasini belgilang."/>
    <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 max-w-3xl"><div className="flex items-start gap-4"><div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><Settings size={20}/></div><div><h3 className="font-black text-slate-900">Ish haqi stavkalari</h3><p className="text-sm text-slate-500 mt-1">Bu stavkalar barcha brigadirlar, hisobotlar va moliyaviy hisoblarda ishlatiladi.</p></div></div><div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">{Object.entries(CATEGORY_META).map(([id,meta])=><div key={id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-2"><span className="text-xl">{meta.icon}</span><p className="font-black text-sm text-slate-800">{meta.name}</p></div><div className="mt-4"><Input label="1 ishchi uchun (so‘m)" type="number" value={String(localRates[id]??"")} onChange={v=>setLocalRates(prev=>({...prev,[id]:v}))} placeholder="150000"/></div></div>)}</div><button onClick={save} className="mt-5 px-5 py-2.5 rounded-xl bg-[#0b6b43] text-white text-sm font-bold flex items-center gap-2"><Check size={16}/> Stavkalarni saqlash</button></div>
    <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 max-w-3xl"><h3 className="font-black text-slate-900">Ma’lumotlar</h3><p className="text-sm text-slate-500 mt-1">Tizimdagi ma’lumotlarni zaxiralash yoki barcha ma’lumotlarni tozalash.</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={onExport} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 flex items-center gap-2"><Download size={16}/> Zaxira nusxa</button><button onClick={onClear} className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold">Barcha ma’lumotni tozalash</button></div></div>
  </div>);
}

export default function App() {
  const [brigadiers, setBrigadiers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).brigadiers || [] : [];
    } catch {
      return [];
    }
  });

  const [categoryRates, setCategoryRates] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { ...DEFAULT_CATEGORY_RATES, ...(saved.categoryRates || {}) };
    } catch {
      return { ...DEFAULT_CATEGORY_RATES };
    }
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [modal, setModal] = useState(null);
  const [newBrigadier, setNewBrigadier] = useState(emptyBrigadier);
  const [workerForm, setWorkerForm] = useState({
    brigadierId: "",
    date: todayISO(),
    rows: [{ id: Date.now(), workers: "", category: "anor_uzish" }],
    note: "",
  });
  const [advanceForm, setAdvanceForm] = useState({
    brigadierId: "",
    date: todayISO(),
    amount: "",
    note: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ brigadiers, categoryRates }));
  }, [brigadiers, categoryRates]);

  const stats = useMemo(() => {
    let allWorkers = 0, todayWorkers = 0, todayEarned = 0, totalAdvance = 0, advanceCount = 0, totalLogs = 0, totalEarned = 0;
    const dailyWorkers = Array(7).fill(0);
    const categoryWorkers = { anor_uzish: 0, salafanlash: 0, ortish: 0 };
    const today = todayISO();
    brigadiers.forEach((b) => b.logs.forEach((log) => {
      const workers = Number(log.workers) || 0;
      const advance = Number(log.advance) || 0;
      const category = log.category || "anor_uzish";
      const earned = workers * getCategoryRate(categoryRates, category);
      allWorkers += workers; totalEarned += earned; totalAdvance += advance; if (advance > 0) advanceCount++; totalLogs++;
      if (categoryWorkers[category] !== undefined) categoryWorkers[category] += workers;
      const diff = Math.floor((new Date(`${today}T12:00:00`) - new Date(`${log.date}T12:00:00`)) / 86400000);
      if (diff === 0) { todayWorkers += workers; todayEarned += earned; }
      if (diff >= 0 && diff < 7) dailyWorkers[6-diff] += workers;
    }));
    return { brigadiers: brigadiers.length, allWorkers, todayWorkers, todayEarned, totalAdvance, advanceCount, totalLogs, totalEarned, weekWorkers: dailyWorkers.reduce((a,b)=>a+b,0), dailyWorkers, categoryWorkers };
  }, [brigadiers, categoryRates]);

  const recent = useMemo(() => {
    const list=[];
    brigadiers.forEach(b=>b.logs.forEach(l=>{
      if(Number(l.workers)>0) list.push({id:`${l.id}_w`,type:"workers",date:l.date,title:`${b.name} — ${number(l.workers)} ta ${getCategoryName(l.category || "anor_uzish")}`,subtitle:l.note||"Ishchilar kiritildi"});
      if(Number(l.advance)>0) list.push({id:`${l.id}_a`,type:"advance",date:l.date,title:`${b.name} — ${money(l.advance)} avans`,subtitle:l.note||"Avans berildi"});
    }));
    return list.sort((a,b)=>b.date.localeCompare(a.date));
  },[brigadiers]);

  const selectedBrigadier = brigadiers.find((b) => b.id === selectedId);

  const navigate = (tab) => {
    setActiveTab(tab);
    setSelectedId(null);
    setMobileMenu(false);
  };

  const addBrigadier = (e) => {
    e.preventDefault();
    if (!newBrigadier.name.trim()) return;

    const item = {
      id: uid("brig"),
      name: newBrigadier.name.trim(),
      phone: newBrigadier.phone.trim(),
      note: newBrigadier.note.trim(),
      createdAt: todayISO(),
      logs: [],
    };

    setBrigadiers((prev) => [item, ...prev]);
    setNewBrigadier(emptyBrigadier);
    setModal(null);
  };

  const saveWorkerLog = (e) => {
    e.preventDefault();
    if (!workerForm.brigadierId) return;
    const grouped = (workerForm.rows || []).reduce((acc,row)=>{ const workers=Number(row.workers)||0; const category=row.category||"anor_uzish"; if(workers>0) acc[category]=(acc[category]||0)+workers; return acc; },{});
    const rows=Object.entries(grouped).map(([category,workers])=>({category,workers}));
    if (!rows.length) return;
    const totalWorkers=rows.reduce((sum,row)=>sum+row.workers,0);
    setBrigadiers(prev=>prev.map(b=>{
      if(b.id!==workerForm.brigadierId) return b;
      let logs=[...b.logs];
      rows.forEach(row=>{
        const index=logs.findIndex(l=>l.date===workerForm.date&&(l.category||"anor_uzish")===row.category&&Number(l.advance||0)===0);
        if(index!==-1) logs[index]={...logs[index],workers:row.workers,category:row.category,note:workerForm.note||logs[index].note};
        else logs.push({id:uid("log"),date:workerForm.date,workers:row.workers,category:row.category,advance:0,note:workerForm.note});
      });
      return {...b,logs};
    }));
    setModal(null);
    setWorkerForm({brigadierId:"",date:todayISO(),rows:[{id:Date.now(),workers:"",category:"anor_uzish"}],note:""});
  };

  const saveAdvance = (e) => {
    e.preventDefault();
    const amount = Number(advanceForm.amount);
    if (!advanceForm.brigadierId || !amount || amount <= 0) return;

    setBrigadiers((prev) =>
      prev.map((b) => {
        if (b.id !== advanceForm.brigadierId) return b;
        return {
          ...b,
          logs: [
            ...b.logs,
            {
              id: uid("advance"),
              date: advanceForm.date,
              workers: 0,
              advance: amount,
              note: advanceForm.note || "Avans",
            },
          ],
        };
      })
    );

    setModal(null);
    setAdvanceForm({ brigadierId: "", date: todayISO(), amount: "", note: "" });
  };

  const openWorkersModal = (brigadierId = "") => {
    setWorkerForm({brigadierId:brigadierId||selectedId||brigadiers[0]?.id||"",date:todayISO(),rows:[{id:Date.now(),workers:"",category:"anor_uzish"}],note:""});
    setModal("workers");
  };

  const openAdvanceModal = (brigadierId = "") => {
    setAdvanceForm({
      brigadierId: brigadierId || selectedId || brigadiers[0]?.id || "",
      date: todayISO(),
      amount: "",
      note: "",
    });
    setModal("advance");
  };

  const deleteBrigadier = () => {
    if (!selectedBrigadier) return;
    if (!window.confirm(`"${selectedBrigadier.name}" brigadirini o‘chirishni tasdiqlaysizmi?`)) return;
    setBrigadiers((prev) => prev.filter((b) => b.id !== selectedId));
    setSelectedId(null);
    setActiveTab("brigadiers");
  };

  const exportBackup = () => {
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), brigadiers, categoryRates }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anor-bogi-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (!window.confirm("Barcha brigadirlar va ish ma’lumotlari o‘chiriladi. Davom etasizmi?")) return;
    setBrigadiers([]);
    setCategoryRates({ ...DEFAULT_CATEGORY_RATES });
    localStorage.removeItem(STORAGE_KEY);
  };

  const navItems = [
    { id: "dashboard", label: "Boshqaruv paneli", icon: BarChart3 },
    { id: "brigadiers", label: "Brigadirlar", icon: Users },
    { id: "daily", label: "Kunlik ish", icon: CalendarDays },
    { id: "finance", label: "Moliya", icon: Wallet },
    { id: "reports", label: "Hisobotlar", icon: FileBarChart },
  ];

  const page =
    selectedBrigadier && activeTab === "brigadiers" ? (
      <BrigadierDetail
        brigadier={selectedBrigadier}
        categoryRates={categoryRates}
        onBack={() => setSelectedId(null)}
        onAddWorkers={() => openWorkersModal(selectedBrigadier.id)}
        onAdvance={() => openAdvanceModal(selectedBrigadier.id)}
        onDelete={deleteBrigadier}
      />
    ) : activeTab === "dashboard" ? (
      <Dashboard
        stats={stats}
        recent={recent}
        brigadiers={brigadiers}
        onAddBrigadier={() => setModal("brigadier")}
        onAddWorkers={() => openWorkersModal()}
        onAdvance={() => openAdvanceModal()}
        onOpenBrigadiers={() => navigate("brigadiers")}
        onOpenFinance={() => navigate("finance")}
      />
    ) : activeTab === "brigadiers" ? (
      <BrigadiersPage
        brigadiers={brigadiers}
        categoryRates={categoryRates}
        onAdd={() => setModal("brigadier")}
        onOpen={(id) => setSelectedId(id)}
      />
    ) : activeTab === "daily" ? (
      <DailyWorkPage brigadiers={brigadiers} categoryRates={categoryRates} onAddWorkers={() => openWorkersModal()} />
    ) : activeTab === "finance" ? (
      <FinancePage stats={stats} brigadiers={brigadiers} categoryRates={categoryRates} />
    ) : activeTab === "reports" ? (
      <ReportsPage stats={stats} brigadiers={brigadiers} categoryRates={categoryRates} />
    ) : (
      <SettingsPage
        categoryRates={categoryRates}
        setCategoryRates={setCategoryRates}
        onExport={exportBackup}
        onClear={clearAll}
      />
    );

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={`fixed lg:sticky top-0 z-50 h-screen w-[270px] bg-[#073c29] text-white flex flex-col transition-transform duration-300 ${
            mobileMenu ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="px-6 pt-7 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Leaf size={25} />
              </div>
              <div>
                <h2 className="font-black tracking-tight text-lg">ANOR BOG‘I</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/60 mt-0.5">
                  Boshqaruv tizimi
                </p>
              </div>
            </div>
          </div>

          <nav className="px-4 py-6 space-y-1.5 flex-1">
            <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-200/40">
              Asosiy
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                    active
                      ? "bg-white text-[#073c29] shadow-lg"
                      : "text-emerald-50/65 hover:text-white hover:bg-white/8"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}

            <p className="px-3 pt-7 pb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-200/40">
              Tizim
            </p>
            <button
              onClick={() => navigate("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "settings"
                  ? "bg-white text-[#073c29]"
                  : "text-emerald-50/65 hover:text-white hover:bg-white/8"
              }`}
            >
              <Settings size={18} />
              Sozlamalar
            </button>
          </nav>

          <div className="p-4">
            <div className="rounded-2xl bg-white/7 border border-white/10 p-4">
              <div className="flex items-center gap-2 text-emerald-200">
                <Sparkles size={15} />
                <span className="text-[11px] font-bold">Bugungi eslatma</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/55">
                Kichik nazorat — katta natija.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold">S</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">Rahbar</p>
                <p className="text-[10px] text-white/40">Anor bog‘i</p>
              </div>
              <ChevronDown size={15} className="text-white/30" />
            </div>
          </div>
        </aside>

        {mobileMenu && (
          <button
            onClick={() => setMobileMenu(false)}
            className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          />
        )}

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 h-[72px] bg-white/85 backdrop-blur-xl border-b border-slate-200/70 flex items-center justify-between px-4 sm:px-6 lg:px-9">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenu(true)}
                className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"
              >
                <Menu size={19} />
              </button>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-emerald-600">
                  ANOR BOG‘I
                </p>
                <p className="text-sm font-black text-slate-800">
                  {selectedBrigadier ? selectedBrigadier.name : navItems.find((n) => n.id === activeTab)?.label || "Sozlamalar"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <CalendarDays size={15} />
                {new Date().toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" })}
              </div>
              <button className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500">
                <Bell size={18} />
                {recent.length > 0 && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-orange-500" />}
              </button>
              <div className="flex items-center gap-2 pl-1">
                <div className="w-9 h-9 rounded-xl bg-[#0b6b43] text-white flex items-center justify-center font-black text-sm">
                  S
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-black text-slate-800">Suxrob</p>
                  <p className="text-[10px] text-slate-400">Rahbar</p>
                </div>
              </div>
            </div>
          </header>

          <div className="w-full p-4 sm:p-6 lg:p-8 xl:p-9">{page}</div>
        </main>
      </div>

      <Modal
        open={modal === "brigadier"}
        title="Yangi brigadir qo‘shish"
        subtitle="Tizim 0 dan boshlangan — birinchi brigadirni kiriting."
        onClose={() => setModal(null)}
      >
        <form onSubmit={addBrigadier} className="p-6 space-y-4">
          <Input
            label="Brigadir ismi *"
            value={newBrigadier.name}
            onChange={(v) => setNewBrigadier((s) => ({ ...s, name: v }))}
            placeholder="Masalan: Anvar Aliyev"
          />
          <Input
            label="Telefon raqami"
            value={newBrigadier.phone}
            onChange={(v) => setNewBrigadier((s) => ({ ...s, phone: v }))}
            placeholder="+998 90 123 45 67"
          />
          <Input
            label="Izoh"
            value={newBrigadier.note}
            onChange={(v) => setNewBrigadier((s) => ({ ...s, note: v }))}
            placeholder="Qo‘shimcha ma’lumot..."
          />
          <button
            type="submit"
            disabled={!newBrigadier.name.trim()}
            className="w-full h-11 rounded-xl bg-[#0b6b43] text-white text-sm font-bold disabled:opacity-40"
          >
            Brigadirni saqlash
          </button>
        </form>
      </Modal>

      <Modal
        open={modal === "workers"}
        title="Ishchilarni kiritish"
        subtitle="Bir vaqtning o‘zida bir nechta ish turini kiriting."
        onClose={() => setModal(null)}
        wide
      >
        <form onSubmit={saveWorkerLog} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block"><span className="block text-xs font-bold text-slate-600 mb-2">Brigadir *</span><select value={workerForm.brigadierId} onChange={(e)=>setWorkerForm(s=>({...s,brigadierId:e.target.value}))} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm"><option value="">Brigadirni tanlang</option>{brigadiers.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
            <Input label="Sana" type="date" value={workerForm.date} onChange={v=>setWorkerForm(s=>({...s,date:v}))}/>
          </div>
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 flex items-center justify-between"><div><p className="text-sm font-black text-slate-800">Ish turlari</p><p className="text-[11px] text-slate-400">Masalan: 20 + 5 + 3 ta</p></div><span className="text-xs font-bold text-emerald-700">{number((workerForm.rows||[]).reduce((s,r)=>s+(Number(r.workers)||0),0))} ta jami</span></div>
            <div className="p-4 space-y-3">
              {(workerForm.rows||[]).map((row,index)=><div key={row.id} className="grid grid-cols-[1fr_1.5fr_auto] gap-3 items-end">
                <Input label={index===0?"Ishchilar soni *":""} type="number" value={row.workers} onChange={v=>setWorkerForm(s=>({...s,rows:s.rows.map(r=>r.id===row.id?{...r,workers:v}:r)}))} placeholder="20"/>
                <label className="block"><span className="block text-xs font-bold text-slate-600 mb-2">{index===0?"Ish turi *":""}</span><select value={row.category} onChange={e=>setWorkerForm(s=>({...s,rows:s.rows.map(r=>r.id===row.id?{...r,category:e.target.value}:r)}))} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm">{Object.entries(CATEGORY_META).map(([id,meta])=><option key={id} value={id}>{meta.icon} {meta.name} — {money(getCategoryRate(categoryRates,id))}</option>)}</select></label>
                <button type="button" disabled={workerForm.rows.length===1} onClick={()=>setWorkerForm(s=>({...s,rows:s.rows.filter(r=>r.id!==row.id)}))} className="h-11 w-11 rounded-xl bg-rose-50 text-rose-500 disabled:opacity-30">×</button>
              </div>)}
              <button type="button" onClick={()=>setWorkerForm(s=>({...s,rows:[...s.rows,{id:Date.now()+Math.random(),workers:"",category:"anor_uzish"}]}))} className="w-full h-10 rounded-xl border border-dashed border-emerald-300 text-emerald-700 text-sm font-bold hover:bg-emerald-50">+ Yana ish turi qo‘shish</button>
            </div>
          </div>
          <Input label="Izoh" value={workerForm.note} onChange={v=>setWorkerForm(s=>({...s,note:v}))} placeholder="Masalan: Bugungi terim"/>
          <button type="submit" disabled={!workerForm.brigadierId || !(workerForm.rows||[]).some(r=>Number(r.workers)>0)} className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-40">Ishchilarni saqlash</button>
        </form>
      </Modal>

      <Modal
        open={modal === "advance"}
        title="Avans berish"
        subtitle="Brigadirga berilgan to‘lovni qayd qiling."
        onClose={() => setModal(null)}
      >
        <form onSubmit={saveAdvance} className="p-6 space-y-4">
          <label className="block">
            <span className="block text-xs font-bold text-slate-600 mb-2">Brigadir *</span>
            <select
              value={advanceForm.brigadierId}
              onChange={(e) => setAdvanceForm((s) => ({ ...s, brigadierId: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm"
            >
              <option value="">Brigadirni tanlang</option>
              {brigadiers.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <Input label="Sana" type="date" value={advanceForm.date} onChange={(v) => setAdvanceForm((s) => ({ ...s, date: v }))} />
          <Input label="Avans summasi *" type="number" value={advanceForm.amount} onChange={(v) => setAdvanceForm((s) => ({ ...s, amount: v }))} placeholder="Masalan: 2500000" />
          <Input label="Izoh" value={advanceForm.note} onChange={(v) => setAdvanceForm((s) => ({ ...s, note: v }))} placeholder="Masalan: Haftalik avans" />
          <button
            type="submit"
            disabled={!advanceForm.brigadierId || !advanceForm.amount}
            className="w-full h-11 rounded-xl bg-orange-500 text-white text-sm font-bold disabled:opacity-40"
          >
            Avansni saqlash
          </button>
        </form>
      </Modal>
    </div>
  );
}
