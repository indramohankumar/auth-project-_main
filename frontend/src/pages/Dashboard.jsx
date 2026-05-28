import { useState, useEffect, useContext } from "react";
import { getVisitors } from "../services/visitorService";
import { getAppointments } from "../services/appointmentService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import StatCard from "../components/dashboard/StatCard";
import RecentVisitorsList from "../components/dashboard/RecentVisitorsList";
import RecentAppointmentsList from "../components/dashboard/RecentAppointmentsList";
import RecentStatusChanges from "../components/dashboard/RecentStatusChanges";

const STAT_CONFIG = [
  { key: "totalVisitors", label: "Total Visitors", roles: ["admin", "security"], bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
  { key: "totalAppointments", label: "Total Appointments", roles: ["admin", "employee"], bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  { key: "pendingAppointments", label: "Pending Approvals", roles: ["admin", "employee", "security"], bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  { key: "approvedAppointments", label: "Approved Passes", roles: ["admin", "employee", "security"], bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  { key: "todayVisitors", label: "Today's Visitors", roles: ["admin", "security"], bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-100", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /> },
  { key: "rejectedAppointments", label: "Rejected", roles: ["admin", "employee"], bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const role = user?.role || "employee";

  const [stats, setStats] = useState({
    totalVisitors: 0, totalAppointments: 0, pendingAppointments: 0,
    approvedAppointments: 0, rejectedAppointments: 0, todayVisitors: 0,
  });

  const [recentVisitors, setRecentVisitors] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const roleDetails = {
    admin: { label: "Admin", description: "Full system overview with access to visitors, appointments, and access control." },
    employee: { label: "Employee", description: "Focus on scheduling appointments and coordinating host approvals." },
    security: { label: "Security / Frontdesk", description: "Manage visitor entries and verify passes at the desk." },
  };

  const visibleStats = STAT_CONFIG.filter((card) => role === "admin" || card.roles.includes(role));

  useEffect(() => { fetchDashboardData(); }, []);

  async function fetchDashboardData() {
    setLoading(true);
    setError(false);
    try {
      const [visitorsData, appointmentsData] = await Promise.all([getVisitors(), getAppointments()]);
      const visitorsList = visitorsData.visitors || [];
      const appointmentsList = appointmentsData.appointments || [];

      const todayStr = new Date().toDateString();
      const todayCount = visitorsList.filter((v) => new Date(v.createdAt).toDateString() === todayStr).length;
      const pending = appointmentsList.filter((a) => a.status === "pending").length;
      const approved = appointmentsList.filter((a) => a.status === "approved").length;
      const rejected = appointmentsList.filter((a) => a.status === "rejected").length;

      setStats({
        totalVisitors: visitorsList.length, totalAppointments: appointmentsList.length,
        pendingAppointments: pending, approvedAppointments: approved,
        rejectedAppointments: rejected, todayVisitors: todayCount,
      });

      setRecentVisitors([...visitorsList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
      setRecentAppointments([...appointmentsList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const QUICK_ACTIONS = [
    { label: "Add Visitor", path: "/visitors", bg: "bg-blue-600 hover:bg-blue-700", roles: ["admin", "security"] },
    { label: "New Appointment", path: "/appointments", bg: "bg-indigo-600 hover:bg-indigo-700", roles: ["admin", "employee"] },
    { label: "Check In / Out", path: "/check", bg: "bg-emerald-600 hover:bg-emerald-700", roles: ["admin", "security"] },
  ];

  const visibleQuickActions = QUICK_ACTIONS.filter((action) => role === "admin" || action.roles.includes(role));
  const showVisitorsSection = role === "admin" || role === "security";
  const showAppointmentsSection = role === "admin" || role === "employee";

  const recentStatusChanges = [...recentAppointments]
    .flatMap((appointment) => (appointment.statusHistory || []).map((change) => ({ id: `${appointment._id}-${change.changedAt || change.status}`, appointment, ...change })))
    .sort((a, b) => new Date(b.changedAt || 0) - new Date(a.changedAt || 0))
    .slice(0, 5);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-br from-black via-slate-950 to-slate-900" />
        <div className="absolute -top-40 left-1/2 h-96 w-240 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-44 top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-52 top-10 h-112 w-112 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_30%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.92)_100%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">Overview</p>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Dashboard</h1>
              <span className={["text-xs font-semibold px-2.5 py-1 rounded-full", loading ? "bg-white/10 text-white/70" : error ? "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/20" : "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/20"].join(" ")}>
                {loading ? "Loading" : error ? "Needs attention" : "Up to date"}
              </span>
            </div>
            <p className="text-sm text-white/55">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Current role</p>
              <p className="text-sm font-semibold text-white">{roleDetails[role]?.label || "User"}</p>
            </div>
            <button onClick={fetchDashboardData} disabled={loading} className={["inline-flex items-center gap-2", "text-sm font-semibold", "text-white/80 bg-white/5", "border border-white/10", "px-4 py-2.5 rounded-xl", "shadow-sm hover:bg-white/10 transition", "focus:outline-none focus:ring-4 focus:ring-white/10", "disabled:opacity-60 disabled:cursor-not-allowed"].join(" ")}>
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-4 shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)]">
          <p className="text-xs font-semibold tracking-widest text-white/45 uppercase">Role overview</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{roleDetails[role]?.label || "User"}</h2>
              <p className="text-sm text-white/55">{roleDetails[role]?.description || "Personalized access view."}</p>
            </div>
            <p className="text-sm text-white/45">Only the actions relevant to your role are shown below.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-rose-100">Failed to load dashboard data. <span className="ml-2 text-rose-200/80 font-normal">Please retry.</span></p>
              <button onClick={fetchDashboardData} className="text-sm font-semibold text-rose-100 underline underline-offset-2 hover:text-white w-fit">Retry</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {visibleStats.map((card) => (
            <StatCard key={card.key} card={card} loading={loading} value={stats[card.key]} />
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)] p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">Quick Actions</h2>
              <p className="text-xs text-white/50 mt-0.5">Jump to common tasks without searching menus.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {visibleQuickActions.map((action) => (
                <button key={action.path} onClick={() => navigate(action.path)} className={[action.bg, "text-white text-sm font-semibold", "px-5 py-2.5 rounded-xl", "shadow-sm hover:shadow-md transition", "focus:outline-none focus:ring-4 focus:ring-white/10"].join(" ")}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {showAppointmentsSection && (
          <RecentStatusChanges recentStatusChanges={recentStatusChanges} loading={loading} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {showVisitorsSection && (
            <RecentVisitorsList visitors={recentVisitors} loading={loading} onNavigate={() => navigate("/visitors")} />
          )}

          {showAppointmentsSection && (
            <RecentAppointmentsList appointments={recentAppointments} loading={loading} onNavigate={() => navigate("/appointments")} />
          )}
        </div>
      </div>
    </div>
  );
}