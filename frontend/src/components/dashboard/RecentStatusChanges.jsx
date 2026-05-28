import { formatRelativeTime } from "./RecentVisitorsList";
import { Skeleton } from "./StatCard";

const statusChangeTone = {
  pending: "text-amber-200 bg-amber-500/10 border-amber-500/20",
  approved: "text-emerald-200 bg-emerald-500/10 border-emerald-500/20",
  rejected: "text-rose-200 bg-rose-500/10 border-rose-500/20",
};

export default function RecentStatusChanges({ recentStatusChanges, loading }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)] overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h2 className="text-sm font-extrabold text-white">Recent Status Changes</h2>
          <p className="text-xs text-white/50 mt-0.5">Latest approval and rejection activity from appointments.</p>
        </div>
      </header>

      {loading ? (
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 bg-white/10" />
          ))}
        </div>
      ) : recentStatusChanges.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-semibold text-white/80">No audit activity yet</p>
          <p className="text-xs text-white/50 mt-1">Approval and rejection events will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {recentStatusChanges.map((change) => (
            <li key={change.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
              <div
                className={[
                  "w-9 h-9 rounded-full border flex items-center justify-center shrink-0 text-xs font-extrabold capitalize",
                  statusChangeTone[change.status] || "text-white/70 bg-white/5 border-white/10",
                ].join(" ")}
              >
                {change.status?.slice(0, 1)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {change.appointment?.visitor?.name || "Appointment"} · {change.status}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {change.changedBy?.name || change.changedBy?.email || change.changedByRole || "System"}
                </p>
              </div>

              <span className="text-xs font-semibold text-white/35 shrink-0 tabular-nums">
                {formatRelativeTime(change.changedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
