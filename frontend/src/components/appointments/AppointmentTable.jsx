export default function AppointmentTable({ appointments, loading, role, canApproveAppointment, canGeneratePass, actionId, handleApprove, handleReject, handleGeneratePass, handleDelete }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 border border-white/10 bg-white/5 rounded-2xl">
        <div className="text-white/60 font-semibold animate-pulse">Loading appointments…</div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-white/10 bg-white/5 rounded-2xl text-center px-4">
        <div className="w-12 h-12 mb-3 bg-white/5 text-white/40 rounded-full flex items-center justify-center ring-1 ring-white/10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-white/80 font-semibold">No appointments found</p>
        <p className="text-white/40 text-sm mt-1">Schedule an appointment to see it here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-semibold">Visitor / Company</th>
              <th className="px-6 py-4 font-semibold">Purpose</th>
              <th className="px-6 py-4 font-semibold">Date &amp; Time</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {appointments.map((appt) => (
              <tr key={appt._id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">{appt.visitor?.name || "—"}</p>
                  <p className="text-xs text-white/40 mt-0.5">{appt.visitor?.company || "No Company"}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-white/80 max-w-[200px] truncate" title={appt.purpose}>{appt.purpose || "—"}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-white/80">{new Date(appt.visitdate).toLocaleDateString()}</p>
                  <p className="text-xs text-white/40 mt-0.5">{new Date(appt.visitdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={[
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
                    appt.status === "pending" ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/20" :
                    appt.status === "approved" ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/20" :
                    "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/20"
                  ].join(" ")}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    {appt.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {appt.status === "pending" && canApproveAppointment && (
                      <>
                        <button onClick={() => handleApprove(appt._id)} disabled={actionId === appt._id} className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-500/20 hover:bg-emerald-500/25 transition">
                          Approve
                        </button>
                        <button onClick={() => handleReject(appt._id)} disabled={actionId === appt._id} className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-rose-500/15 text-rose-200 border border-rose-500/20 hover:bg-rose-500/25 transition">
                          Reject
                        </button>
                      </>
                    )}
                    {appt.status === "approved" && canGeneratePass && (
                      <button onClick={() => handleGeneratePass(appt._id)} disabled={actionId === appt._id} className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-indigo-500/15 text-indigo-200 border border-indigo-500/20 hover:bg-indigo-500/25 transition">
                        {actionId === appt._id ? "Generating…" : "Generate Pass"}
                      </button>
                    )}
                    {role === "admin" && (
                      <button onClick={() => handleDelete(appt._id)} disabled={actionId === appt._id} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition" title="Delete Appointment">
                        ✕ Delete
                      </button>
                    )}
                    {((appt.status === "pending" && !canApproveAppointment) || (appt.status === "approved" && !canGeneratePass) || (appt.status !== "pending" && appt.status !== "approved" && role !== "admin")) && (
                      <span className="text-xs text-white/35">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
