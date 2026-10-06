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
  Trash2,
  AlertCircle,
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
const DAILY_RATE = 150000;

const money = (value = 0) =>
  new Intl.NumberFormat("uz-UZ").format(Math.round(Number(value) || 0)) + " so'm";

const number = (value = 0) =>
  new Intl.NumberFormat("uz-UZ").format(Number(value) || 0);

const todayISO = () => new Date().toISOString().slice(0, 10);

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
    label: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"][i],
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
          value={money(stats.todayWorkers * DAILY_RATE)}
          hint={`${money(DAILY_RATE)} / ishchi`}
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

function BrigadiersPage({ brigadiers, onAdd, onOpen }) {
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
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Brigadir nomi yoki telefon raqami bo‘yicha qidiring..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-emerald-500 text-sm"
          />
        </div>
      </div>

      {!filtered.length ? (
        <div className="bg-white border border-slate-200/80 rounded-[24px]">
          <EmptyState
            icon={Users}
            title={brigadiers.length ? "Natija topilmadi" : "Hali brigadir yo‘q"}
            description={
              brigadiers.length
                ? "Qidiruv so‘zini o‘zgartirib ko‘ring."
                : "Tizimni 0 dan boshlayapsiz. Birinchi brigadirni qo‘shing."
            }
            action={!brigadiers.length ? "Birinchi brigadirni qo‘shish" : undefined}
            onAction={onAdd}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const workers = b.logs.reduce((s, l) => s + (Number(l.workers) || 0), 0);
            const advances = b.logs.reduce((s, l) => s + (Number(l.advance) || 0), 0);
            const earned = workers * DAILY_RATE;
            return (
              <button
                key={b.id}
                onClick={() => onOpen(b.id)}
                className="group text-left bg-white border border-slate-200/80 rounded-[24px] p-5 hover:border-emerald-300 hover:-translate-y-0.5 shadow-[0_6px_30px_rgba(15,23,42,0.04)] transition"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg">
                    {b.name?.trim()?.charAt(0)?.toUpperCase() || "B"}
                  </div>
                  <MoreHorizontal size={19} className="text-slate-300" />
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-900">{b.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{b.phone || "Telefon kiritilmagan"}</p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] text-slate-400">Jami ishchi</p>
                    <p className="mt-1 font-black text-slate-800">{number(workers)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] text-slate-400">Hisoblangan</p>
                    <p className="mt-1 font-black text-slate-800 text-xs">{money(earned)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Avans: <b className="text-slate-700">{money(advances)}</b></span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    Ochish <ChevronRight size={15} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BrigadierDetail({ brigadier, onBack, onAddWorkers, onAdvance, onDelete }) {
  if (!brigadier) return null;

  const workers = brigadier.logs.reduce((s, l) => s + (Number(l.workers) || 0), 0);
  const advance = brigadier.logs.reduce((s, l) => s + (Number(l.advance) || 0), 0);
  const earned = workers * DAILY_RATE;
  const balance = Math.max(earned - advance, 0);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-sm font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-2"
      >
        ← Brigadirlar ro‘yxatiga qaytish
      </button>

      <section className="bg-white border border-slate-200/80 rounded-[26px] p-6 shadow-[0_6px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[20px] bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-black">
              {brigadier.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">Brigadir</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">{brigadier.name}</h1>
              <p className="mt-1 text-sm text-slate-400">{brigadier.phone || "Telefon kiritilmagan"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onAddWorkers}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center gap-2"
            >
              <Users size={16} /> Ishchi kiritish
            </button>
            <button
              onClick={onAdvance}
              className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold flex items-center gap-2"
            >
              <Wallet size={16} /> Avans berish
            </button>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] text-slate-400">Jami ishchi</p>
            <p className="mt-1 text-xl font-black">{number(workers)}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-[11px] text-emerald-700/70">Hisoblangan</p>
            <p className="mt-1 text-lg font-black text-emerald-800">{money(earned)}</p>
          </div>
          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="text-[11px] text-orange-700/70">Avans</p>
            <p className="mt-1 text-lg font-black text-orange-800">{money(advance)}</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-[11px] text-blue-700/70">Qolgan haq</p>
            <p className="mt-1 text-lg font-black text-blue-800">{money(balance)}</p>
          </div>
        </div>
      </section>

      <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900">Faoliyat tarixi</h3>
            <p className="text-xs text-slate-500 mt-1">Ishchilar va avanslar</p>
          </div>
          <ClipboardList size={19} className="text-slate-300" />
        </div>

        {!brigadier.logs.length ? (
          <EmptyState
            icon={ClipboardList}
            title="Hali ma’lumot yo‘q"
            description="Bu brigadir uchun birinchi ish kuni yoki avansni kiriting."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="text-left px-6 py-3 font-bold">Sana</th>
                  <th className="text-left px-6 py-3 font-bold">Ishchi</th>
                  <th className="text-left px-6 py-3 font-bold">Avans</th>
                  <th className="text-left px-6 py-3 font-bold">Izoh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...brigadier.logs].reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-semibold text-slate-700">{formatDate(log.date)}</td>
                    <td className="px-6 py-4">{log.workers ? `${number(log.workers)} ta` : "—"}</td>
                    <td className="px-6 py-4 font-bold text-orange-600">{log.advance ? money(log.advance) : "—"}</td>
                    <td className="px-6 py-4 text-slate-400">{log.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onDelete}
          className="text-xs font-bold text-rose-500 hover:text-rose-700"
        >
          Ushbu brigadirni o‘chirish
        </button>
      </div>
    </div>
  );
}

function ReportsPage({ stats, brigadiers }) {
  const rows = brigadiers.map((b) => {
    const workers = b.logs.reduce((s, l) => s + (Number(l.workers) || 0), 0);
    const advance = b.logs.reduce((s, l) => s + (Number(l.advance) || 0), 0);
    return {
      name: b.name,
      workers,
      earned: workers * DAILY_RATE,
      advance,
      balance: Math.max(workers * DAILY_RATE - advance, 0),
    };
  });

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Nazorat va tahlil"
        title="Hisobotlar"
        description="Brigadirlar va mehnat xarajatlari bo‘yicha umumiy ko‘rinish."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Jami ishchilar" value={number(stats.allWorkers)} hint="Kiritilgan jami ishchi soni" />
        <StatCard icon={Wallet} label="Hisoblangan ish haqi" value={money(stats.totalEarned)} hint="Kunlik stavka asosida" tone="purple" />
        <StatCard icon={CircleDollarSign} label="Qolgan to‘lov" value={money(Math.max(stats.totalEarned - stats.totalAdvance, 0))} hint="Avans chegirilgandan keyin" tone="orange" />
      </div>

      <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden shadow-[0_6px_30px_rgba(15,23,42,0.04)]">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-black text-slate-900">Brigadirlar hisoboti</h3>
          <p className="text-xs text-slate-500 mt-1">Har bir brigadir bo‘yicha umumiy natija</p>
        </div>

        {!rows.length ? (
          <EmptyState
            icon={FileBarChart}
            title="Hisobot uchun ma’lumot yetarli emas"
            description="Avval brigadirlar va ishchilar haqidagi ma’lumotlarni kiriting."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="text-left px-6 py-3">Brigadir</th>
                  <th className="text-left px-6 py-3">Ishchi</th>
                  <th className="text-left px-6 py-3">Hisoblangan</th>
                  <th className="text-left px-6 py-3">Avans</th>
                  <th className="text-left px-6 py-3">Qolgan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.name}>
                    <td className="px-6 py-4 font-bold text-slate-800">{r.name}</td>
                    <td className="px-6 py-4">{number(r.workers)} ta</td>
                    <td className="px-6 py-4 font-semibold">{money(r.earned)}</td>
                    <td className="px-6 py-4 text-orange-600 font-semibold">{money(r.advance)}</td>
                    <td className="px-6 py-4 text-emerald-700 font-bold">{money(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FinancePage({ stats, brigadiers }) {
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

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Moliya"
        title="Moliyaviy boshqaruv"
        description="Mehnat xarajatlari, avanslar va qolgan to‘lovlarni kuzating."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Jami hisoblangan" value={money(stats.totalEarned)} hint="Barcha ishchilar" tone="green" />
        <StatCard icon={Wallet} label="Berilgan avans" value={money(stats.totalAdvance)} hint={`${number(stats.advanceCount)} ta operatsiya`} tone="orange" />
        <StatCard icon={CircleDollarSign} label="Qolgan haq" value={money(Math.max(stats.totalEarned - stats.totalAdvance, 0))} hint="Hisoblangan − avans" tone="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6">
          <p className="text-xs font-bold text-slate-400">Mehnat uchun umumiy hisob</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{money(stats.totalEarned)}</p>
          <div className="mt-6 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{
                width: `${Math.min((stats.totalAdvance / Math.max(stats.totalEarned, 1)) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs">
            <span className="text-slate-400">Avans ulushi</span>
            <b className="text-slate-700">
              {stats.totalEarned ? Math.round((stats.totalAdvance / stats.totalEarned) * 100) : 0}%
            </b>
          </div>
        </div>

        <div className="bg-[#f3faf6] border border-emerald-100 rounded-[24px] p-6">
          <div className="flex items-center gap-2 text-emerald-700">
            <Leaf size={18} />
            <span className="text-xs font-black">ISH HAQI STAVKASI</span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{money(DAILY_RATE)}</p>
          <p className="mt-1 text-sm text-slate-500">1 ishchi uchun kunlik hisob-kitob.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
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
              <div key={t.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Wallet size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(t.date)} · {t.note}</p>
                </div>
                <p className="font-black text-orange-600">{money(t.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DailyWorkPage({ brigadiers, onAddWorkers }) {
  const today = todayISO();
  const entries = [];
  brigadiers.forEach((b) => {
    const log = b.logs.find((l) => l.date === today);
    if (log && Number(log.workers) > 0) {
      entries.push({ name: b.name, workers: Number(log.workers), note: log.note });
    }
  });

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Bugungi nazorat"
        title="Kunlik ish"
        description="Bugungi brigadirlar va ishchilar holatini bir joyda ko‘ring."
        action="Ishchi kiritish"
        onAction={onAddWorkers}
      />

      <div className="bg-white border border-slate-200/80 rounded-[24px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Bugun</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              {new Date().toLocaleDateString("uz-UZ", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CalendarDays size={20} />
          </div>
        </div>

        {!entries.length ? (
          <EmptyState
            icon={Users}
            title="Bugun hali ishchi kiritilmagan"
            description="Brigadir va bugungi ishchilar sonini kiriting. Keyin bu sahifa kunlik nazorat markaziga aylanadi."
            action="Bugungi ishni kiritish"
            onAction={onAddWorkers}
          />
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {entries.map((entry) => (
              <div key={entry.name} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-black">
                    {entry.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800">{entry.name}</p>
                    <p className="text-xs text-slate-400">{entry.note || "Bugungi ish"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-700">{number(entry.workers)}</p>
                    <p className="text-[10px] text-slate-400">ishchi</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPage({ rate, setRate, onExport, onClear }) {
  const [localRate, setLocalRate] = useState(String(rate));

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Tizim"
        title="Sozlamalar"
        description="Asosiy hisob-kitob va ma’lumotlar sozlamalari."
      />

      <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900">Mehnat haqi</h3>
            <p className="text-sm text-slate-500 mt-1">
              Bir ishchi uchun kunlik hisoblash stavkasini belgilang.
            </p>
          </div>
        </div>

        <div className="mt-6 max-w-sm">
          <Input
            label="Kunlik stavka (so‘m)"
            value={localRate}
            onChange={setLocalRate}
            type="number"
          />
        </div>
        <button
          onClick={() => setRate(Math.max(Number(localRate) || DAILY_RATE, 0))}
          className="mt-4 px-4 py-2.5 rounded-xl bg-[#0b6b43] text-white text-sm font-bold"
        >
          Saqlash
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 max-w-2xl">
        <h3 className="font-black text-slate-900">Ma’lumotlar</h3>
        <p className="text-sm text-slate-500 mt-1">
          Tizimdagi ma’lumotlarni zaxiralash yoki barcha ma’lumotlarni tozalash.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={onExport}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 flex items-center gap-2"
          >
            <Download size={16} /> Zaxira nusxa
          </button>
          <button
            onClick={onClear}
            className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold"
          >
            Barcha ma’lumotni tozalash
          </button>
        </div>
      </div>
    </div>
  );
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

  const [rate, setRate] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return saved.rate || DAILY_RATE;
    } catch {
      return DAILY_RATE;
    }
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Mac-style notification / toast system
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = "success") => {
    const id = uid("toast");
    setToasts((prev) => [...prev, { id, title, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  };

  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [newBrigadier, setNewBrigadier] = useState(emptyBrigadier);
  const [workerForm, setWorkerForm] = useState({
    brigadierId: "",
    date: todayISO(),
    workers: "",
    note: "",
  });
  const [advanceForm, setAdvanceForm] = useState({
    brigadierId: "",
    date: todayISO(),
    amount: "",
    note: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ brigadiers, rate }));
  }, [brigadiers, rate]);

  const stats = useMemo(() => {
    let allWorkers = 0;
    let todayWorkers = 0;
    let totalAdvance = 0;
    let advanceCount = 0;
    let totalLogs = 0;
    const dailyWorkers = Array(7).fill(0);

    brigadiers.forEach((b) => {
      b.logs.forEach((log) => {
        const workers = Number(log.workers) || 0;
        const advance = Number(log.advance) || 0;
        allWorkers += workers;
        totalAdvance += advance;
        if (advance > 0) advanceCount++;
        totalLogs++;

        const diff = Math.floor(
          (new Date(`${todayISO()}T12:00:00`) - new Date(`${log.date}T12:00:00`)) /
            86400000
        );
        if (diff === 0) todayWorkers += workers;
        if (diff >= 0 && diff < 7) dailyWorkers[6 - diff] += workers;
      });
    });

    return {
      brigadiers: brigadiers.length,
      allWorkers,
      todayWorkers,
      totalAdvance,
      advanceCount,
      totalLogs,
      totalEarned: allWorkers * rate,
      weekWorkers: dailyWorkers.reduce((a, b) => a + b, 0),
      dailyWorkers,
    };
  }, [brigadiers, rate]);

  const recent = useMemo(() => {
    const list = [];
    brigadiers.forEach((b) =>
      b.logs.forEach((l) => {
        if (Number(l.workers) > 0) {
          list.push({
            id: `${l.id}_w`,
            type: "workers",
            date: l.date,
            title: `${b.name} — ${number(l.workers)} ta ishchi`,
            subtitle: l.note || "Ishchilar kiritildi",
          });
        }
        if (Number(l.advance) > 0) {
          list.push({
            id: `${l.id}_a`,
            type: "advance",
            date: l.date,
            title: `${b.name} — ${money(l.advance)} avans`,
            subtitle: l.note || "Avans berildi",
          });
        }
      })
    );
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [brigadiers]);

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
    addToast("Brigadir qo‘shildi", `${item.name} tizimga muvaffaqiyatli qo‘shildi.`);
  };

  const saveWorkerLog = (e) => {
  e.preventDefault();

  if (!workerForm.brigadierId) return;

  const rows = (workerForm.rows || [])
    .map((row) => ({
      ...row,
      workers: Number(row.workers) || 0,
    }))
    .filter((row) => row.workers > 0);

  if (!rows.length) return;

  const totalWorkers = rows.reduce(
    (sum, row) => sum + row.workers,
    0
  );

  setBrigadiers((prev) =>
    prev.map((b) => {
      if (b.id !== workerForm.brigadierId) return b;

      let logs = [...b.logs];

      rows.forEach((row) => {
        const existingIndex = logs.findIndex(
          (l) =>
            l.date === workerForm.date &&
            l.category === row.category
        );

        if (existingIndex !== -1) {
          logs[existingIndex] = {
            ...logs[existingIndex],
            workers: row.workers,
            note: workerForm.note || logs[existingIndex].note,
          };
        } else {
          logs.push({
            id: uid("log"),
            date: workerForm.date,
            workers: row.workers,
            category: row.category,
            advance: 0,
            note: workerForm.note,
          });
        }
      });

      return {
        ...b,
        logs,
      };
    })
  );

  setModal(null);

  setWorkerForm({
    brigadierId: "",
    date: todayISO(),
    rows: [
      {
        id: Date.now(),
        workers: "",
        category: "anor_uzish",
      },
    ],
    note: "",
  });

  addToast(
  "Ishchilar saqlandi",
  `${totalWorkers} ta ishchi ma'lumotlari saqlandi.`
);
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
    addToast("Avans saqlandi", `${money(amount)} avans muvaffaqiyatli qayd qilindi.`);
  };

  const openWorkersModal = (brigadierId = "") => {
    setWorkerForm({
      brigadierId: brigadierId || selectedId || brigadiers[0]?.id || "",
      date: todayISO(),
      workers: "",
      note: "",
    });
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
    setDeleteConfirm(true);
  };

  const confirmDeleteBrigadier = () => {
    if (!selectedBrigadier || !selectedId) return;

    const brigadierId = selectedId;
    const name = selectedBrigadier.name;

    setBrigadiers((prev) => prev.filter((b) => b.id !== brigadierId));
    setDeleteConfirm(false);
    setSelectedId(null);
    setActiveTab("brigadiers");

    addToast(
      "Brigadir o‘chirildi",
      `"${name}" tizimdan olib tashlandi.`,
      "warning"
    );
  };

  const exportBackup = () => {
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), brigadiers, rate }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anor-bogi-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Zaxira tayyor", "Ma’lumotlar JSON fayl sifatida yuklab olindi.");
  };

  const clearAll = () => {
    if (!window.confirm("Barcha brigadirlar va ish ma’lumotlari o‘chiriladi. Davom etasizmi?")) return;
    setBrigadiers([]);
    localStorage.removeItem(STORAGE_KEY);
    addToast("Ma’lumotlar tozalandi", "Barcha brigadir va ish ma’lumotlari o‘chirildi.", "warning");
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
        onAdd={() => setModal("brigadier")}
        onOpen={(id) => setSelectedId(id)}
      />
    ) : activeTab === "daily" ? (
      <DailyWorkPage brigadiers={brigadiers} onAddWorkers={() => openWorkersModal()} />
    ) : activeTab === "finance" ? (
      <FinancePage stats={stats} brigadiers={brigadiers} />
    ) : activeTab === "reports" ? (
      <ReportsPage stats={stats} brigadiers={brigadiers} />
    ) : (
      <SettingsPage
        rate={rate}
        setRate={setRate}
        onExport={exportBackup}
        onClear={clearAll}
      />
    );

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-900">
      {/* Mac-style notification center */}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[200] w-[calc(100%-2rem)] sm:w-[390px] pointer-events-none space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto overflow-hidden rounded-[22px] border border-white/70 bg-white/90 backdrop-blur-2xl shadow-[0_20px_60px_rgba(15,23,42,0.18)] animate-[toastIn_0.35s_ease-out]"
          >
            <div className="p-4 flex items-start gap-3.5">
              <div
                className={`w-10 h-10 shrink-0 rounded-[13px] flex items-center justify-center ${
                  toast.type === "warning"
                    ? "bg-orange-50 text-orange-600"
                    : toast.type === "error"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {toast.type === "warning" ? (
                  <Bell size={19} />
                ) : toast.type === "error" ? (
                  <X size={19} />
                ) : (
                  <CheckCircle2 size={19} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-black text-slate-900 truncate">{toast.title}</p>
                  <span className="text-[10px] text-slate-400 shrink-0">hozir</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{toast.message}</p>
              </div>

              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                className="w-7 h-7 shrink-0 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                aria-label="Bildirishnomani yopish"
              >
                <X size={15} />
              </button>
            </div>

            <div className="h-0.5 bg-slate-100">
              <div
                className={`h-full origin-left animate-[toastProgress_4.5s_linear_forwards] ${
                  toast.type === "warning" ? "bg-orange-400" : toast.type === "error" ? "bg-rose-400" : "bg-emerald-500"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-18px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastProgress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(18px) scale(.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>


      <style>{`
        /* Telefon / kichik ekranlar uchun qo‘shimcha responsive qatlam */
        @media (max-width: 639px) {
          html, body, #root {
            max-width: 100%;
            overflow-x: hidden;
          }

          button, input, select, textarea {
            -webkit-tap-highlight-color: transparent;
          }

          input, select, textarea {
            font-size: 16px !important;
          }

          /* Header */
          header {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          /* Sahifa kontenti */
          main > div:last-child {
            padding: 12px !important;
          }

          /* Dashboard/stat kartalar */
          .grid {
            min-width: 0;
          }

          /* Katta kartalar telefonda ekranni oshirib yubormasin */
          [class*="min-w-["] {
            min-width: 0 !important;
          }

          /* Modal */
          [role="dialog"] {
            padding: 12px !important;
          }

          [role="dialog"] > div.relative {
            max-height: calc(100vh - 24px);
            overflow-y: auto;
          }

          /* Delete modal tugmalari */
          [role="dialog"] .grid.grid-cols-2 {
            grid-template-columns: 1fr !important;
          }

          /* Uzun matnlar */
          p, h1, h2, h3, h4, span {
            overflow-wrap: anywhere;
          }
        }

        @media (max-width: 380px) {
          header {
            height: 64px !important;
          }

          header .w-10 {
            width: 38px !important;
            height: 38px !important;
          }

          header .w-9 {
            width: 34px !important;
            height: 34px !important;
          }

          main > div:last-child {
            padding: 10px !important;
          }
        }
      `}</style>

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
              <button
                onClick={() => {
                  if (recent.length) {
                    const latest = recent[0];
                    addToast("So‘nggi faoliyat", latest.title);
                  } else {
                    addToast("Bildirishnomalar", "Hozircha yangi faoliyat mavjud emas.", "warning");
                  }
                }}
                className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:border-emerald-200 transition"
                aria-label="Bildirishnomalar"
              >
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

          <div className="w-full p-4 sm:p-6 lg:p-9">{page}</div>
        </main>
      </div>

      {deleteConfirm && selectedBrigadier && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-brigadier-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirm(false);
          }}
        >
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-[fadeIn_.18s_ease-out]" />

          <div className="relative w-full max-w-[430px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] animate-[modalIn_.22s_cubic-bezier(.16,1,.3,1)]">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-400" />

            <div className="p-7 sm:p-8">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 ring-8 ring-rose-50/60">
                <Trash2 className="h-7 w-7 text-rose-500" />
              </div>

              <div className="text-center">
                <h3 id="delete-brigadier-title" className="text-xl font-extrabold tracking-tight text-slate-900">
                  Brigadirni o‘chirasizmi?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  <span className="font-bold text-slate-700">“{selectedBrigadier.name}”</span> brigadirini tizimdan
                  o‘chirishni tasdiqlang.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3.5">
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  <p className="text-xs font-medium leading-5 text-rose-700">
                    Bu brigadirga tegishli ishchilar va hisob-kitoblar ham o‘chadi. Bu amalni ortga qaytarib bo‘lmaydi.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0"
                >
                  Bekor qilish
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteBrigadier}
                  className="group flex h-12 items-center justify-center gap-2 rounded-2xl bg-rose-500 text-sm font-extrabold text-white shadow-lg shadow-rose-500/20 transition-all hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-500/25 active:translate-y-0"
                >
                  <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                  O‘chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        title="Bugungi ishchilarni kiritish"
        subtitle="Brigadir va ishchilar sonini belgilang."
        onClose={() => setModal(null)}
      >
        <form onSubmit={saveWorkerLog} className="p-6 space-y-4">
          <label className="block">
            <span className="block text-xs font-bold text-slate-600 mb-2">Brigadir *</span>
            <select
              value={workerForm.brigadierId}
              onChange={(e) => setWorkerForm((s) => ({ ...s, brigadierId: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm"
            >
              <option value="">Brigadirni tanlang</option>
              {brigadiers.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <Input label="Sana" type="date" value={workerForm.date} onChange={(v) => setWorkerForm((s) => ({ ...s, date: v }))} />
          <div className="space-y-3">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-slate-700">
        Ishchilar kategoriyasi
      </p>

      <p className="text-[10px] text-slate-400 mt-1">
        Ishchi sonini yozing va ish turini tanlang
      </p>
    </div>

    <button
      type="button"
      onClick={() =>
        setWorkerForm((s) => ({
          ...s,
          rows: [
            ...s.rows,
            {
              id: Date.now(),
              workers: "",
              category: "anor_uzish",
            },
          ],
        }))
      }
      className="h-9 px-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold"
    >
      + Kategoriya qo‘shish
    </button>
  </div>

  {workerForm.rows.map((row, index) => (
    <div
      key={row.id}
      className="p-3 rounded-2xl border border-slate-200 bg-slate-50"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr_auto] gap-3">

        <Input
          label="Ishchi soni"
          type="number"
          value={row.workers}
          onChange={(v) =>
            setWorkerForm((s) => ({
              ...s,
              rows: s.rows.map((item) =>
                item.id === row.id
                  ? { ...item, workers: v }
                  : item
              ),
            }))
          }
          placeholder="10"
        />

        <label className="block">
          <span className="block text-xs font-bold text-slate-600 mb-2">
            Ish turi
          </span>

          <select
            value={row.category}
            onChange={(e) =>
              setWorkerForm((s) => ({
                ...s,
                rows: s.rows.map((item) =>
                  item.id === row.id
                    ? {
                        ...item,
                        category: e.target.value,
                      }
                    : item
                ),
              }))
            }
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-emerald-500"
          >
            <option value="anor_uzish">
              🍎 Anor uzish
            </option>

            <option value="salafanlash">
              📦 Salafanlash
            </option>

            <option value="ortish">
              🚚 Ortish
            </option>
          </select>
        </label>

        {workerForm.rows.length > 1 && (
          <button
            type="button"
            onClick={() =>
              setWorkerForm((s) => ({
                ...s,
                rows: s.rows.filter(
                  (item) => item.id !== row.id
                ),
              }))
            }
            className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-500"
          >
            ×
          </button>
        )}
      </div>
    </div>
  ))}

  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
    <span className="text-xs font-bold text-emerald-700">
      Jami ishchilar
    </span>

    <span className="text-lg font-black text-emerald-800">
      {workerForm.rows.reduce(
        (sum, row) =>
          sum + (Number(row.workers) || 0),
        0
      )} ta
    </span>
  </div>
</div>
          <Input label="Izoh" value={workerForm.note} onChange={(v) => setWorkerForm((s) => ({ ...s, note: v }))} placeholder="Masalan: Anor terimi" />
          <button
            type="submit"
           disabled={
  !workerForm.brigadierId ||
  !workerForm.rows ||
  !workerForm.rows.some(
    (row) => Number(row.workers) > 0
  )
}
            className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-40"
          >
            Ishchilarni saqlash
          </button>
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
