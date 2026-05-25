import { useState, useEffect, useContext, useMemo } from "react";
import {
  getAppointments,
  createAppointment,
  approveAppointment,
  rejectAppointment,
  deleteAppointment,
} from "../services/appointmentService";
import { generatePass } from "../services/passService";
import { getVisitors } from "../services/visitorService";
import { AuthContext } from "../context/AuthContext";

function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [generatedPassData, setGeneratedPassData] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null); // which row is doing approve/generate (simple UX)

  const { user } = useContext(AuthContext);
  const role = user?.role || "employee";

  const canCreateAppointment = role === "admin" || role === "employee" || role === "security";
  const canApproveAppointment = role === "admin" || role === "employee";
  const canGeneratePass = role === "admin" || role === "security";

  const [formData, setFormData] = useState({
    visitor: "",
    purpose: "",
    visitdate: "",
  });

  useEffect(() => {
    fetchAppointments();
    fetchVisitorsList();
  }, []);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVisitorsList() {
    try {
      const data = await getVisitors();
      setVisitors(data.visitors || []);
    } catch (error) {
      console.error("Failed to fetch visitors:", error);
    }
  }

  const visitorOptions = useMemo(() => {
    return [...visitors].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
  }, [visitors]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const closeScheduleModal = () => {
    setShowModal(false);
    setFormData({ visitor: "", purpose: "", visitdate: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!canCreateAppointment) {
      alert("You do not have permission to create appointments.");
      return;
    }

    setSubmitting(true);
    try {
      await createAppointment({
        ...formData,
        host: user?._id || user?.id,
      });
      closeScheduleModal();
      fetchAppointments();
    } catch (error) {
      console.error("Failed to create appointment:", error);
      alert("Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id, hostId) => {
    if (!id) return;
    if (role !== "admin" && user?._id !== hostId && user?.id !== hostId) {
      alert("Only admins or the specific host can approve this appointment.");
      return;
    }
    setActionId(id);
    try {
      await approveAppointment(id);
      fetchAppointments();
    } catch (error) {
      console.error("Failed to approve:", error);
      alert("Failed to approve appointment");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id, hostId) => {
    if (!id) return;
    if (role !== "admin" && user?._id !== hostId && user?.id !== hostId) {
      alert("Only admins or the specific host can reject this appointment.");
      return;
    }
    setActionId(id);
    try {
      await rejectAppointment(id);
      fetchAppointments();
    } catch (error) {
      console.error("Failed to reject:", error);
      alert(error.response?.data?.message || "Failed to reject appointment");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (role !== "admin") {
      alert("Only admins can delete appointments.");
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this appointment?")) return;
    
    setActionId(id);
    try {
      await deleteAppointment(id);
      fetchAppointments();
    } catch (error) {
      console.error("Failed to delete:", error);
      alert(error.response?.data?.message || "Failed to delete appointment");
    } finally {
      setActionId(null);
    }
  };

  const handleGeneratePass = async (id) => {
    if (!id) return;
    if (!canGeneratePass) {
      alert("Only admins and security can generate visitor passes.");
      return;
    }
    setActionId(id);
    try {
      const data = await generatePass(id);
      setGeneratedPassData(data.pass);
    } catch (error) {
      console.error("Failed to generate pass:", error);
      alert(error.response?.data?.message || "Failed to generate pass");
    } finally {
      setActionId(null);
    }
  };

  const STATUS_BADGE = {
    pending: "bg-amber-500/15 text-amber-200 border border-amber-500/20",
    approved: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/20",
    rejected: "bg-rose-500/15 text-rose-200 border border-rose-500/20",
  };

  const inputDark =
    "mt-1 block w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-white " +
    "placeholder:text-white/30 shadow-sm outline-none transition " +
    "focus:border-white/20 focus:ring-4 focus:ring-white/10";

  const selectDark =
    "mt-1 block w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-white " +
    "shadow-sm outline-none transition " +
    "focus:border-white/20 focus:ring-4 focus:ring-white/10";

  // small helper to make the UI feel “cleaner” without changing any stored values
  const formatVisitDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return new Date(value).toLocaleString();
    }
  };

  const getLatestStatusChange = (appt) => {
    const latestChange = appt.statusHistory?.[appt.statusHistory.length - 1];
    if (!latestChange) return null;

    const changedAt = latestChange.changedAt
      ? new Date(latestChange.changedAt).toLocaleString(undefined, {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Unknown time";

    return `${latestChange.status} • ${changedAt}${latestChange.changedByRole ? ` • ${latestChange.changedByRole}` : ""}`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background (same theme, slightly refined for depth) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-br from-black via-slate-950 to-slate-900" />
        <div className="absolute -top-44 left-1/2 h-104 w-248 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-48 top-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-56 top-10 h-112 w-112 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_30%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.92)_100%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">
              Scheduling
            </p>

            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-white">
                Appointments
              </h1>

              <span
                className={[
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                  loading
                    ? "bg-white/10 text-white/70 border border-white/10"
                    : "bg-emerald-500/15 text-emerald-200 border border-emerald-500/20",
                ].join(" ")}
              >
                {loading ? "Loading" : "Ready"}
              </span>
            </div>

            <p className="mt-1 text-sm text-white/55">
              Create appointments, approve requests, and generate visitor passes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchAppointments}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80
                         hover:bg-white/10 transition focus:outline-none focus:ring-4 focus:ring-white/10
                         disabled:opacity-60 disabled:cursor-not-allowed"
              title="Refresh appointments"
            >
              <svg
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>

            {canCreateAppointment ? (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black
                           shadow-sm hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                + Schedule Appointment
              </button>
            ) : (
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/50">
                Scheduling disabled for your role
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-4 shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)]">
          <p className="text-xs font-semibold tracking-widest text-white/45 uppercase">
            Appointment access
          </p>
          <p className="mt-2 text-sm text-white/60">
            {role === "admin" && "You can create appointments, approve requests, and generate passes."}
            {role === "employee" && "You can create appointments and approve requests where you are the host."}
            {role === "security" && "You can create appointments and generate passes for approved visits."}
          </p>
        </div>

        {/* Table card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">
                Appointment List
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Approve pending requests and generate passes for approved visits.
              </p>
            </div>

            <div className="text-sm text-white/55">
              Total:{" "}
              <span className="font-semibold text-white">{appointments.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/4">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Visitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Host
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Date &amp; Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-white/50">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/30 animate-pulse" />
                        Loading…
                      </span>
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <p className="text-sm font-semibold text-white/80">
                        No appointments found
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        Schedule an appointment to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white">
                          {appt.visitor ? appt.visitor.name : "Unknown Visitor"}
                        </div>
                        <div className="text-xs text-white/40">
                          {appt.visitor?.email || ""}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                        {appt.host ? appt.host.name : "Unknown Host"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60 tabular-nums">
                        {formatVisitDate(appt.visitdate)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                        {appt.purpose || "—"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={[
                            "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                            STATUS_BADGE[appt.status] ||
                              "bg-white/10 text-white/70 border border-white/10",
                          ].join(" ")}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                          {appt.status}
                        </span>
                        {getLatestStatusChange(appt) ? (
                          <div className="mt-1 text-[11px] text-white/40">
                            Updated: {getLatestStatusChange(appt)}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          {appt.status === "pending" && (role === "admin" || (appt.host && (user?._id === appt.host._id || user?.id === appt.host._id))) && (
                            <>
                              <button
                                onClick={() => handleApprove(appt._id, appt.host?._id)}
                                disabled={actionId === appt._id}
                                className="rounded-lg px-3 py-1.5 text-xs font-semibold
                                           bg-indigo-500/15 text-indigo-200 border border-indigo-500/20
                                           hover:bg-indigo-500/20 transition
                                           disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {actionId === appt._id ? "Approving…" : "Approve"}
                              </button>

                              <button
                                onClick={() => handleReject(appt._id, appt.host?._id)}
                                disabled={actionId === appt._id}
                                className="rounded-lg px-3 py-1.5 text-xs font-semibold
                                           bg-rose-500/15 text-rose-200 border border-rose-500/20
                                           hover:bg-rose-500/20 transition
                                           disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {actionId === appt._id ? "Rejecting…" : "Reject"}
                              </button>
                            </>
                          )}

                          {appt.status === "approved" && canGeneratePass && (
                            <button
                              onClick={() => handleGeneratePass(appt._id)}
                              disabled={actionId === appt._id}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold
                                         bg-emerald-500/15 text-emerald-200 border border-emerald-500/20
                                         hover:bg-emerald-500/20 transition
                                         disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {actionId === appt._id ? "Generating…" : "Generate Pass"}
                            </button>
                          )}

                          {role === "admin" && (
                            <button
                              onClick={() => handleDelete(appt._id)}
                              disabled={actionId === appt._id}
                              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition"
                              title="Delete Appointment"
                            >
                              ✕ Delete
                            </button>
                          )}

                          {/* keep layout stable when no actions */}
                          {((appt.status === "pending" && !canApproveAppointment) ||
                            (appt.status === "approved" && !canGeneratePass) ||
                            (appt.status !== "pending" && appt.status !== "approved" && role !== "admin")) ? (
                            <span className="text-xs text-white/35">—</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generated Pass Modal */}
        {generatedPassData && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)] p-5 sm:p-7 text-center">
              <div className="mx-auto mb-4 h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-emerald-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Pass Generated</h2>

              <div className="mb-6">
                <div className="text-xs font-semibold tracking-widest text-white/50 uppercase">
                  Pass Number
                </div>
                <div className="mt-2 font-mono text-white bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  {generatedPassData.passnumber}
                </div>
              </div>

              <div className="flex justify-center border border-white/10 bg-white/5 p-4 rounded-2xl mb-6">
                <img
                  src={generatedPassData.qrcode}
                  alt="Pass QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>

              <p className="text-sm text-white/60 mb-6">
                Scan this QR code on the Check In/Out page to test the scanner.
              </p>

              <button
                onClick={() => setGeneratedPassData(null)}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black
                           shadow-sm hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Schedule Appointment Modal */}
        {showModal && canCreateAppointment && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)]">
              <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Schedule Appointment
                    </h2>
                    <p className="mt-1 text-sm text-white/55">
                      Select a visitor and choose date/time.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeScheduleModal}
                    className="rounded-xl px-3 py-2 text-white/60 hover:bg-white/5 hover:text-white transition"
                    aria-label="Close"
                    disabled={submitting}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80">
                      Select Visitor <span className="text-rose-300">*</span>
                    </label>
                    <select
                      required
                      name="visitor"
                      value={formData.visitor}
                      onChange={handleInputChange}
                      className={selectDark}
                      disabled={submitting}
                    >
                      <option value="" disabled>
                        Select a registered visitor
                      </option>
                      {visitorOptions.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name} ({v.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-white/80">
                        Date &amp; Time <span className="text-rose-300">*</span>
                      </label>
                      <input
                        required
                        type="datetime-local"
                        name="visitdate"
                        value={formData.visitdate}
                        onChange={handleInputChange}
                        className={inputDark}
                        disabled={submitting}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-white/80">
                        Purpose <span className="text-rose-300">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        className={inputDark}
                        placeholder="e.g. Interview, Meeting, Delivery"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeScheduleModal}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white transition"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition
                                 hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20
                                 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Scheduling…" : "Schedule"}
                    </button>
                  </div>
                </form>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-white/50">
                    Tip: Only <span className="text-white/70 font-semibold">approved</span>{" "}
                    appointments can generate a pass.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Appointment;