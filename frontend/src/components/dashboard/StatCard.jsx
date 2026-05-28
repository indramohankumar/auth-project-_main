export function Skeleton({ className = "" }) {
  return <div className={["animate-pulse rounded-2xl bg-gray-100", className].join(" ")} />;
}

export default function StatCard({ card, loading, value }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <Skeleton className="h-10 w-10" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl p-4",
        "border border-white/10",
        "bg-white/5 backdrop-blur",
        "shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)]",
        "hover:bg-white/8 hover:border-white/15 hover:shadow-[0_25px_70px_-40px_rgba(0,0,0,0.95)]",
        "transition",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={[
            "w-11 h-11 rounded-xl",
            "flex items-center justify-center",
            card.bg,
            "border",
            card.border,
            "shadow-sm",
          ].join(" ")}
        >
          <svg className={`w-5 h-5 ${card.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {card.icon}
          </svg>
        </div>

        <span className="text-[11px] font-semibold text-white/55 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
          {card.label}
        </span>
      </div>

      <div className="relative mt-4">
        <p className="text-3xl font-black text-white leading-none tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-white/45">{card.label}</p>
      </div>
    </div>
  );
}
