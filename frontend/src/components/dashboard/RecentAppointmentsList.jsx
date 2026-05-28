import StatusBadge from "./StatusBadge";
import { Skeleton } from "./StatCard";

export default function RecentAppointmentsList({ appointments, loading, onNavigate }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)] overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h2 className="text-sm font-extrabold text-white">Recent Appointments</h2>
          <p className="text-xs text-white/50 mt-0.5">Latest 5 appointments by created time.</p>
        </div>
        <button onClick={onNavigate} className="text-sm font-semibold text-indigo-200 hover:underline underline-offset-4">
          View all
        </button>
      </header>

      {loading ? (
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-11 bg-white/10" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-semibold text-white/80">No appointments yet</p>
          <p className="text-xs text-white/50 mt-1">New appointments will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {appointments.map((a) => (
            <li key={a._id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
              <div className="w-9 h-9 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{a.visitor?.name || a.visitor || "—"}</p>
                <p className="text-xs text-white/50 truncate">{a.purpose || "No purpose"}</p>
              </div>

              <StatusBadge status={a.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
