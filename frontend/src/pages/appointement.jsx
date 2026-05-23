import { useState, useEffect, useContext, useMemo } from "react";
import {
  getAppointments,
  createAppointment,
  approveAppointment,
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
    return [...visitors].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
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

  const handleApprove = async (id) => {
    if (!id) return;
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

  const handleGeneratePass = async (id) => {
    if (!id) return;
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* same dark background theme */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-slate-900" />
        <div className="absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-44 top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-52 top-10 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_30%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.92)_100%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">
              Scheduling
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white">Appointments</h1>
            <p className="mt-1 text-sm text-white/55">
              Create appointments, approve requests, and generate visitor passes.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black
                       shadow-sm hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20 w-fit"
          >
            + Schedule Appointment
          </button>
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)] overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/[0.04]">
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
                  <td colSpan="6" className="text-center py-10 text-white/50">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      {appt.visitor ? appt.visitor.name : "Unknown Visitor"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                      {appt.host ? appt.host.name : "Unknown Host"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                      {new Date(appt.visitdate).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                      {appt.purpose}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                          STATUS_BADGE[appt.status] ||
                            "bg-white/10 text-white/70 border border-white/10",
                        ].join(" ")}
                      >
                        {appt.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        {appt.status === "pending" && (
                          <button
                            onClick={() => handleApprove(appt._id)}
                            disabled={actionId === appt._id}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold
                                       bg-indigo-500/15 text-indigo-200 border border-indigo-500/20
                                       hover:bg-indigo-500/20 transition
                                       disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {actionId === appt._id ? "Approving…" : "Approve"}
                          </button>
                        )}

                        {appt.status === "approved" && (
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Generated Pass Modal */}
        {generatedPassData && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)] p-7 text-center">
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
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)]">
              <div className="p-7">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Schedule Appointment</h2>
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

                  <div>
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

                  <div>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Appointment;