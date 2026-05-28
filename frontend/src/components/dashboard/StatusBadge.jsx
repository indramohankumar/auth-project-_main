export const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  approved: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  rejected: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1",
        "text-xs font-semibold",
        "px-2.5 py-1 rounded-full capitalize",
        "whitespace-nowrap",
        STATUS_STYLES[status] || "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
      ].join(" ")}
      title={status}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {status}
    </span>
  );
}
