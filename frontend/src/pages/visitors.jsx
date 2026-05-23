import { useState, useEffect, useRef, useMemo } from "react";
import {
  getVisitors,
  createVisitor,
  deleteVisitor,
  updateVisitor,
} from "../services/visitorService";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  purpose: "",
  host: "",
  photo: null,
};

function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editVisitor, setEditVisitor] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");

  const fileInputRef = useRef(null);

  const fetchVisitors = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await getVisitors();
      setVisitors(data.visitors || []);
    } catch (error) {
      console.error("Failed to fetch visitors:", error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetchVisitors();
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const openAddModal = () => {
    setEditVisitor(null);
    setFormData(EMPTY_FORM);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowModal(true);
  };

  const openEditModal = (visitor) => {
    setEditVisitor(visitor);
    setFormData({
      name: visitor.name || "",
      email: visitor.email || "",
      phone: visitor.phone || "",
      company: visitor.company || "",
      purpose: visitor.purpose || "",
      host: visitor.host?._id || visitor.host || "",
      photo: null,
    });
    setPhotoPreview(visitor.photoUrl || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditVisitor(null);
    setFormData(EMPTY_FORM);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setFormData({ ...formData, photo: file });

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("email", formData.email);
    payload.append("phone", formData.phone);
    payload.append("company", formData.company);
    payload.append("purpose", formData.purpose);
    payload.append("host", formData.host);
    if (formData.photo) payload.append("photo", formData.photo);

    try {
      if (editVisitor) {
        await updateVisitor(editVisitor._id, payload);
        toast.success("Visitor updated successfully!");
      } else {
        await createVisitor(payload);
        toast.success("Visitor added successfully!");
      }
      closeModal();
      fetchVisitors();
    } catch (error) {
      console.error("Failed to save visitor:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this visitor?")) return;
    try {
      await deleteVisitor(id);
      toast.success("Visitor deleted.");
      setVisitors((prev) => prev.filter((v) => v._id !== id));
    } catch (error) {
      console.error("Failed to delete visitor:", error);
      toast.error("Failed to delete visitor.");
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const s = search.trim().toLowerCase();
    const matchesSearch =
      !s ||
      v.name?.toLowerCase().includes(s) ||
      v.email?.toLowerCase().includes(s) ||
      v.phone?.includes(search);

    const p = filterPurpose.trim().toLowerCase();
    const matchesPurpose = !p || v.purpose?.toLowerCase().includes(p);

    return matchesSearch && matchesPurpose;
  });

  const purposeOptions = useMemo(() => {
    return [...new Set(visitors.map((v) => v.purpose).filter(Boolean))];
  }, [visitors]);

  const inputDark =
    "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white " +
    "placeholder:text-white/30 shadow-sm outline-none transition " +
    "focus:border-white/20 focus:ring-4 focus:ring-white/10";

  const selectDark =
    "rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white shadow-sm outline-none transition " +
    "focus:border-white/20 focus:ring-4 focus:ring-white/10";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Dark background to match Login/Register/Dashboard theme */}
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
              Directory
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white">Visitors</h1>
            <p className="mt-1 text-sm text-white/55">
              Manage visitor entries and contact details.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black
                       shadow-sm hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20 w-fit"
          >
            <span className="text-lg leading-none">+</span>
            Add Visitor
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputDark}
            />
          </div>

          <select
            value={filterPurpose}
            onChange={(e) => setFilterPurpose(e.target.value)}
            className={selectDark}
          >
            <option value="">All purposes</option>
            {purposeOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <div className="text-sm text-white/55 md:ml-auto">
            <span className="font-semibold text-white">{filteredVisitors.length}</span>{" "}
            result{filteredVisitors.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)] overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/[0.04]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Photo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-sm">
              {loading && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-white/50">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-white/30 animate-pulse" />
                      Loading visitors…
                    </span>
                  </td>
                </tr>
              )}

              {!loading && fetchError && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-rose-200">
                    Failed to load visitors.{" "}
                    <button
                      onClick={fetchVisitors}
                      className="underline underline-offset-2 text-indigo-200 hover:text-white"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              )}

              {!loading && !fetchError && filteredVisitors.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-white/50">
                    {search || filterPurpose
                      ? "No visitors match your search."
                      : "No visitors yet. Add one above."}
                  </td>
                </tr>
              )}

              {!loading &&
                !fetchError &&
                filteredVisitors.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      {visitor.photoUrl ? (
                        <img
                          src={visitor.photoUrl}
                          alt={visitor.name}
                          className="w-9 h-9 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-500/15 text-blue-200 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
                          {visitor.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                      {visitor.name}
                    </td>

                    <td className="px-4 py-3 text-white/60">
                      <div className="truncate max-w-[220px]">{visitor.email}</div>
                      <div className="text-xs text-white/40">{visitor.phone}</div>
                    </td>

                    <td className="px-4 py-3 text-white/60">{visitor.company || "—"}</td>
                    <td className="px-4 py-3 text-white/60">{visitor.purpose || "—"}</td>

                    <td className="px-4 py-3 text-white/60">
                      {visitor.host?.name || visitor.host || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(visitor)}
                          className="text-xs font-semibold rounded-lg px-3 py-1.5
                                     bg-amber-500/15 text-amber-200 border border-amber-500/20
                                     hover:bg-amber-500/20 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(visitor._id)}
                          className="text-xs font-semibold rounded-lg px-3 py-1.5
                                     bg-rose-500/15 text-rose-200 border border-rose-500/20
                                     hover:bg-rose-500/20 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={closeModal}
          >
            <div
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editVisitor ? "Edit Visitor" : "Add New Visitor"}
                    </h2>
                    <p className="mt-1 text-sm text-white/55">
                      Fill in the details and save.
                    </p>
                  </div>

                  <button
                    onClick={closeModal}
                    className="rounded-xl px-3 py-2 text-white/60 hover:bg-white/5 hover:text-white transition"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Photo */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xs text-white/40 text-center px-2">
                          No photo
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="photoInput"
                      />

                      <label
                        htmlFor="photoInput"
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80
                                   hover:bg-white/10 transition cursor-pointer w-fit"
                      >
                        {photoPreview ? "Change photo" : "Upload photo"}
                      </label>

                      <p className="mt-2 text-xs text-white/40">
                        JPG/PNG recommended.
                      </p>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Name <span className="text-rose-300">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full name"
                      className={inputDark}
                    />
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Email <span className="text-rose-300">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className={inputDark}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Phone <span className="text-rose-300">*</span>
                      </label>
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone number"
                        className={inputDark}
                      />
                    </div>
                  </div>

                  {/* Company + Host */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Company name"
                        className={inputDark}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Host
                      </label>
                      <input
                        type="text"
                        name="host"
                        value={formData.host}
                        onChange={handleInputChange}
                        placeholder="Host name"
                        className={inputDark}
                      />
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Purpose
                    </label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      placeholder="e.g. Meeting, Interview, Delivery"
                      className={inputDark}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition
                                 hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20
                                 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting
                        ? "Saving…"
                        : editVisitor
                        ? "Update Visitor"
                        : "Save Visitor"}
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

export default Visitors;