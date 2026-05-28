import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  getAppointments,
  createAppointment,
  approveAppointment,
  rejectAppointment,
  deleteAppointment,
} from "../services/appointmentService";
import { getVisitors } from "../services/visitorService";
import { generatePass } from "../services/passService";
import toast from "react-hot-toast";
import AppointmentTable from "../components/appointments/AppointmentTable";
import ScheduleAppointmentModal from "../components/appointments/ScheduleAppointmentModal";
import GeneratedPassModal from "../components/appointments/GeneratedPassModal";

const EMPTY_FORM = { visitor: "", visitdate: "", purpose: "" };

function Appointment() {
  const { user } = useContext(AuthContext);
  const role = user?.role || "user";
  const userId = user?.id || user?._id;

  const canCreateAppointment = role === "admin" || role === "employee" || role === "security";
  const canApproveAppointment = role === "admin" || role === "employee";
  const canGeneratePass = role === "admin" || role === "security";

  const [appointments, setAppointments] = useState([]);
  const [visitorOptions, setVisitorOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [generatedPassData, setGeneratedPassData] = useState(null);

  useEffect(() => {
    fetchAppointmentsList();
    if (canCreateAppointment) fetchVisitorsList();
  }, [canCreateAppointment]);

  const fetchAppointmentsList = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      let apps = data.appointments || [];
      if (role === "employee" && userId) {
        apps = apps.filter((a) => {
          const hostId = a.host?._id || a.host;
          return String(hostId) === String(userId);
        });
      }
      setAppointments(apps);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorsList = async () => {
    try {
      const data = await getVisitors();
      setVisitorOptions(data.visitors || []);
    } catch (error) {
      console.error("Failed to fetch visitors for dropdown:", error);
    }
  };

  const openScheduleModal = () => {
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const closeScheduleModal = () => {
    if (!submitting) setShowModal(false);
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAppointment(formData);
      toast.success("Appointment scheduled successfully.");
      closeScheduleModal();
      fetchAppointmentsList();
    } catch (error) {
      console.error("Failed to schedule appointment:", error);
      toast.error(error.response?.data?.message || "Failed to schedule appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    if (!canApproveAppointment) return toast.error("Unauthorized");
    setActionId(id);
    try {
      await approveAppointment(id);
      toast.success("Appointment approved.");
      fetchAppointmentsList();
    } catch (error) {
      console.error("Failed to approve:", error);
      toast.error("Failed to approve appointment");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    if (!canApproveAppointment) return toast.error("Unauthorized");
    setActionId(id);
    try {
      await rejectAppointment(id);
      toast.success("Appointment rejected.");
      fetchAppointmentsList();
    } catch (error) {
      console.error("Failed to reject:", error);
      toast.error("Failed to reject appointment");
    } finally {
      setActionId(null);
    }
  };

  const handleGeneratePass = async (id) => {
    if (!canGeneratePass) return toast.error("Unauthorized");
    setActionId(id);
    try {
      const res = await generatePass(id);
      toast.success("Pass generated successfully!");
      setGeneratedPassData(res.pass);
      fetchAppointmentsList();
    } catch (error) {
      console.error("Failed to generate pass:", error);
      toast.error(error.response?.data?.message || "Failed to generate pass");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (role !== "admin") {
      alert("Only admins can delete appointments.");
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this appointment?")) return;
    setActionId(id);
    try {
      await deleteAppointment(id);
      toast.success("Appointment deleted.");
      fetchAppointmentsList();
    } catch (error) {
      console.error("Failed to delete:", error);
      alert(error.response?.data?.message || "Failed to delete appointment");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-900 to-black" />
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Appointments</h1>
            <p className="mt-2 text-sm text-white/55 max-w-xl">
              {role === "employee" ? "Manage appointments for your visitors. Approve their requests to grant them a pass." : "Manage all visitor appointments. Approve requests and generate digital entry passes."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={fetchAppointmentsList} disabled={loading} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/10 transition focus:outline-none focus:ring-4 focus:ring-white/10 disabled:opacity-50">
              Refresh
            </button>

            {canCreateAppointment && (
              <button onClick={openScheduleModal} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition focus:outline-none focus:ring-4 focus:ring-indigo-500/30">
                + Schedule
              </button>
            )}
          </div>
        </div>

        <AppointmentTable
          appointments={appointments}
          loading={loading}
          role={role}
          canApproveAppointment={canApproveAppointment}
          canGeneratePass={canGeneratePass}
          actionId={actionId}
          handleApprove={handleApprove}
          handleReject={handleReject}
          handleGeneratePass={handleGeneratePass}
          handleDelete={handleDelete}
        />

        <GeneratedPassModal
          generatedPassData={generatedPassData}
          onClose={() => setGeneratedPassData(null)}
        />

        <ScheduleAppointmentModal
          show={showModal}
          visitorOptions={visitorOptions}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          closeScheduleModal={closeScheduleModal}
          submitting={submitting}
        />
      </div>
    </div>
  );
}

export default Appointment;