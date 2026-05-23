import { useState, useEffect } from "react";
import { getVisitors } from "../services/visitorService";
import { getAppointments } from "../services/appointmentService";
import { useNavigate } from "react-router-dom";

// ─── stat card config — icons, colors, labels all in one place ────────────────
// makes it easy to add/remove cards without touching JSX
const STAT_CONFIG = [
  {
    key: "totalVisitors",
    label: "Total Visitors",
    color: "blue",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
  {
    key: "totalAppointments",
    label: "Total Appointments",
    color: "indigo",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
  },
  {
    key: "pendingAppointments",
    label: "Pending Approvals",
    color: "yellow",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-100",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    key: "approvedAppointments",
    label: "Approved Passes",
    color: "green",
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-100",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    key: "todayVisitors",
    label: "Today's Visitors",
    color: "purple",
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-100",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    ),
  },
  {
    key: "rejectedAppointments",
    label: "Rejected",
    color: "red",
    bg: "bg-red-50",
    text: "text-red-500",
    border: "border-red-100",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

// ─── status badge helper ──────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

// ─── skeleton pulse block — used while loading ────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

function Dashboard() {
  // ─── stats derived from API data ───────────────────────────────────────────
  const [stats, setStats] = useState({
    totalVisitors:        0,
    totalAppointments:    0,
    pendingAppointments:  0,
    approvedAppointments: 0,
    rejectedAppointments: 0,
    todayVisitors:        0,
  });

  // ─── recent records for the activity tables ────────────────────────────────
  const [recentVisitors,    setRecentVisitors]    = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const navigate = useNavigate();

  // ─── fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    setError(false);
    try {
      // run both requests in parallel — faster than sequential await
      const [visitorsData, appointmentsData] = await Promise.all([
        getVisitors(),
        getAppointments(),
      ]);

      const visitorsList     = visitorsData.visitors     || [];
      const appointmentsList = appointmentsData.appointments || [];

      // ── today's visitor count ────────────────────────────────────────────
      const todayStr = new Date().toDateString();
      const todayCount = visitorsList.filter(
        (v) => new Date(v.createdAt).toDateString() === todayStr
      ).length;

      // ── appointment breakdown by status ──────────────────────────────────
      const pending  = appointmentsList.filter((a) => a.status === "pending").length;
      const approved = appointmentsList.filter((a) => a.status === "approved").length;
      const rejected = appointmentsList.filter((a) => a.status === "rejected").length;

      setStats({
        totalVisitors:        visitorsList.length,
        totalAppointments:    appointmentsList.length,
        pendingAppointments:  pending,
        approvedAppointments: approved,
        rejectedAppointments: rejected,
        todayVisitors:        todayCount,
      });

      // ── keep only the 5 most recent records for the activity section ──────
      // sort descending by createdAt then slice
      setRecentVisitors(
        [...visitorsList]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      );
      setRecentAppointments(
        [...appointmentsList]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      );
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // ─── quick action buttons ─────────────────────────────────────────────────
  const QUICK_ACTIONS = [
    { label: "Add Visitor",      path: "/visitors",     bg: "bg-blue-600 hover:bg-blue-700"   },
    { label: "New Appointment",  path: "/appointments", bg: "bg-indigo-600 hover:bg-indigo-700" },
    { label: "Check In / Out",   path: "/check",        bg: "bg-green-600 hover:bg-green-700"  },
  ];

  // ─── render ────────────────────────────────────────────────────────────────
  // small helper to show relative time
  function timeAgo(date) {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    return `${days}d ago`;
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-cyan-600 border-4 bg-black tracking-tight">
              Dashboard
            </h1>
            {/* live date so user sees today at a glance */}
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>

          {/* refresh button — re-runs fetchDashboardData */}
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50 w-fit"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Error Banner ─────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span>⚠️ Failed to load dashboard data.</span>
            <button onClick={fetchDashboardData} className="underline font-medium">Retry</button>
          </div>
        )}

        {/* ── Stat Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAT_CONFIG.map((card) =>
            loading ? (
              // skeleton placeholder while data loads
              <Skeleton key={card.key} className="h-28" />
            ) : (
              <div
                key={card.key}
                className={`bg-white rounded-2xl p-4 border ${card.border} shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3`}
              >
                {/* icon */}
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${card.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {card.icon}
                  </svg>
                </div>

                {/* number */}
                <p className="text-2xl font-bold text-gray-900 leading-none">
                  {stats[card.key]}
                </p>

                {/* label */}
                <p className="text-xs font-medium text-gray-500 leading-tight">
                  {card.label}
                </p>
              </div>
            )
          )}
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`${action.bg} text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent Activity (two columns) ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Visitors */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300">
              <h2 className="font-semibold bg-orange-300 text-amber-200">Recent Visitors</h2>
              <button
                onClick={() => navigate("/visitors")}
                className="text-xs text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>

            {loading ? (
              // skeleton rows
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : recentVisitors.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No visitors yet.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentVisitors.map((v) => (
                  <li key={v._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">

                    {/* avatar — photo or initials */}
                    {v.photoUrl ? (
                      <img src={v.photoUrl} alt={v.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {v.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                      <p className="text-xs text-gray-400 truncate">{v.purpose || v.email}</p>
                    </div>

                    {/* relative time — e.g. "2 days ago" */}
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {timeAgo(v.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-black">Recent Appointments</h2>
              <button
                onClick={() => navigate("/appointments")}
                className="text-xs text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>

            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : recentAppointments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No appointments yet.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentAppointments.map((a) => (
                  <li key={a._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">

                    {/* calendar icon */}
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* visitor name — supports populated object or plain string */}
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {a.visitor?.name || a.visitor || "—"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{a.purpose || "No purpose"}</p>
                    </div>

                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}



export default Dashboard;