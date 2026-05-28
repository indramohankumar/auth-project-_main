const selectDark = [
  "block w-full rounded-xl border border-white/10 bg-white/5",
  "px-3 py-2.5 text-sm text-white",
  "shadow-sm transition",
  "placeholder:text-white/30",
  "focus:border-white/25 focus:outline-none focus:ring-4 focus:ring-white/5",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "[&>option]:bg-neutral-900 [&>option]:text-white",
].join(" ");

const inputDark = [
  "block w-full rounded-xl border border-white/10 bg-white/5",
  "px-3 py-2.5 text-sm text-white",
  "shadow-sm transition",
  "placeholder:text-white/30",
  "focus:border-white/25 focus:outline-none focus:ring-4 focus:ring-white/5",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

export default function ScheduleAppointmentModal({ show, visitorOptions, formData, handleInputChange, handleSubmit, closeScheduleModal, submitting }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)]">
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Schedule Appointment</h2>
              <p className="mt-1 text-sm text-white/55">Select a visitor and choose date/time.</p>
            </div>
            <button type="button" onClick={closeScheduleModal} className="rounded-xl px-3 py-2 text-white/60 hover:bg-white/5 hover:text-white transition" aria-label="Close" disabled={submitting}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80">Select Visitor <span className="text-rose-300">*</span></label>
              <select required name="visitor" value={formData.visitor} onChange={handleInputChange} className={selectDark} disabled={submitting}>
                <option value="" disabled>Select a registered visitor</option>
                {visitorOptions.map((v) => (
                  <option key={v._id} value={v._id}>{v.name} ({v.email})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white/80">Date &amp; Time <span className="text-rose-300">*</span></label>
                <input required type="datetime-local" name="visitdate" value={formData.visitdate} onChange={handleInputChange} className={inputDark} disabled={submitting} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white/80">Purpose <span className="text-rose-300">*</span></label>
                <input required type="text" name="purpose" value={formData.purpose} onChange={handleInputChange} className={inputDark} placeholder="e.g. Interview, Meeting, Delivery" disabled={submitting} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeScheduleModal} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white transition" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? "Scheduling…" : "Schedule"}
              </button>
            </div>
          </form>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs text-white/50">Tip: Only <span className="text-white/70 font-semibold">approved</span> appointments can generate a pass.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
