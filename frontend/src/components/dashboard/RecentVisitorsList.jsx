import { Skeleton } from "./StatCard";

export function formatRelativeTime(date) {
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

export default function RecentVisitorsList({ visitors, loading, onNavigate }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)] overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h2 className="text-sm font-extrabold text-white">Recent Visitors</h2>
          <p className="text-xs text-white/50 mt-0.5">Latest 5 visitors by created time.</p>
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
      ) : visitors.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-semibold text-white/80">No visitors yet</p>
          <p className="text-xs text-white/50 mt-1">New visitor entries will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {visitors.map((v) => (
            <li key={v._id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
              {v.photoUrl ? (
                <img src={v.photoUrl} alt={v.name} className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-500/15 text-blue-200 border border-blue-500/20 flex items-center justify-center text-sm font-extrabold shrink-0">
                  {v.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{v.name}</p>
                <p className="text-xs text-white/50 truncate">{v.purpose || v.email}</p>
              </div>

              <span className="text-xs font-semibold text-white/35 shrink-0 tabular-nums">
                {formatRelativeTime(v.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
