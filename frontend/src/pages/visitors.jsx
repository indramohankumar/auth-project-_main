import { useState, useEffect, useRef } from "react";
import { getVisitors, createVisitor, deleteVisitor, updateVisitor } from "../services/visitorService";
import toast from "react-hot-toast";

// ─── empty form state used for both Add and reset ────────────────────────────
const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  purpose: "",
  host: "",
  photo: null, // file object for photo upload
};

function Visitors() {
  // ─── core data state ───────────────────────────────────────────────────────
  const [visitors, setVisitors]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(false); // show error row if API fails

  // ─── modal / form state ────────────────────────────────────────────────────
  const [showModal, setShowModal]   = useState(false);
  const [editVisitor, setEditVisitor] = useState(null); // null = add mode, object = edit mode
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [photoPreview, setPhotoPreview] = useState(null); // base64 preview of chosen photo
  const [submitting, setSubmitting] = useState(false);   // disables Save while request is in flight

  // ─── search / filter state ─────────────────────────────────────────────────
  const [search, setSearch]         = useState("");
  const [filterPurpose, setFilterPurpose] = useState(""); // filter by purpose

  const fileInputRef = useRef(null); // programmatic reset of file input

  // fetch all visitors from backend
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

  // ─── on mount: load visitors ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      try {
        await fetchVisitors();
      } catch {
        // ignore — fetchVisitors already logs errors
      }
    })();
    return () => { mounted = false; };
  }, []);

  // NOTE: backend currently has no public users endpoint; host remains a free-text field

  // ─── open modal in ADD mode ────────────────────────────────────────────────
  const openAddModal = () => {
    setEditVisitor(null);
    setFormData(EMPTY_FORM);
    setPhotoPreview(null);
    setShowModal(true);
  };

  // ─── open modal in EDIT mode, pre-fill form ────────────────────────────────
  const openEditModal = (visitor) => {
    setEditVisitor(visitor);
    setFormData({
      name:    visitor.name    || "",
      email:   visitor.email   || "",
      phone:   visitor.phone   || "",
      company: visitor.company || "",
      purpose: visitor.purpose || "",
      host:    visitor.host?._id || visitor.host || "",
      photo:   null, // reset — user must re-upload if they want to change
    });
    setPhotoPreview(visitor.photoUrl || null); // show existing photo if stored
    setShowModal(true);
  };

  // ─── close modal and reset all form state ─────────────────────────────────
  const closeModal = () => {
    setShowModal(false);
    setEditVisitor(null);
    setFormData(EMPTY_FORM);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── handle text / select input changes ───────────────────────────────────
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── handle photo file selection ──────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // only allow image files
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setFormData({ ...formData, photo: file });

    // generate a local preview URL so user sees the chosen photo immediately
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ─── submit: handles both create and update ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // build FormData so the photo file is included in the multipart request
    const payload = new FormData();
    payload.append("name",    formData.name);
    payload.append("email",   formData.email);
    payload.append("phone",   formData.phone);
    payload.append("company", formData.company);
    payload.append("purpose", formData.purpose);
    payload.append("host",    formData.host);
    if (formData.photo) payload.append("photo", formData.photo);

    try {
      if (editVisitor) {
        // UPDATE existing visitor
        await updateVisitor(editVisitor._id, payload);
        toast.success("Visitor updated successfully!");
      } else {
        // CREATE new visitor
        await createVisitor(payload);
        toast.success("Visitor added successfully!");
      }
      closeModal();
      fetchVisitors(); // refresh table
    } catch (error) {
      console.error("Failed to save visitor:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── delete visitor with confirmation ─────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this visitor?")) return;
    try {
      await deleteVisitor(id);
      toast.success("Visitor deleted.");
      // optimistic update — remove from local state without full refetch
      setVisitors((prev) => prev.filter((v) => v._id !== id));
    } catch (error) {
      console.error("Failed to delete visitor:", error);
      toast.error("Failed to delete visitor.");
    }
  };

  // ─── client-side search + filter ──────────────────────────────────────────
  // filters the visitors array before rendering — no extra API calls needed
  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch =
      !search ||
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.includes(search);

    const matchesPurpose =
      !filterPurpose ||
      v.purpose?.toLowerCase().includes(filterPurpose.toLowerCase());

    return matchesSearch && matchesPurpose;
  });

  // unique purposes for the filter dropdown
  const purposeOptions = [...new Set(visitors.map((v) => v.purpose).filter(Boolean))];

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Visitors</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors w-fit"
        >
          + Add Visitor
        </button>
      </div>

      {/* ── Search + Filter Bar ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* search by name, email, or phone */}
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* filter by purpose — options built from existing visitor data */}
        <select
          value={filterPurpose}
          onChange={(e) => setFilterPurpose(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Purposes</option>
          {purposeOptions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* show how many results match the current filter */}
        <span className="text-sm text-gray-500 self-center">
          {filteredVisitors.length} result{filteredVisitors.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Visitors Table ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200 text-sm">

            {/* loading state */}
            {loading && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400 animate-pulse">
                  Loading visitors...
                </td>
              </tr>
            )}

            {/* error state — shows if fetchVisitors threw */}
            {!loading && fetchError && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-red-400">
                  Failed to load visitors.{" "}
                  <button onClick={fetchVisitors} className="underline text-blue-500">
                    Retry
                  </button>
                </td>
              </tr>
            )}

            {/* empty state */}
            {!loading && !fetchError && filteredVisitors.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  {search || filterPurpose ? "No visitors match your search." : "No visitors yet. Add one above."}
                </td>
              </tr>
            )}

            {/* visitor rows */}
            {!loading && !fetchError &&
              filteredVisitors.map((visitor) => (
                <tr key={visitor._id} className="hover:bg-gray-50 transition-colors">

                  {/* photo avatar — shows uploaded photo or initials fallback */}
                  <td className="px-4 py-3">
                    {visitor.photoUrl ? (
                      <img
                        src={visitor.photoUrl}
                        alt={visitor.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                        {visitor.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{visitor.name}</td>

                  <td className="px-4 py-3 text-gray-500">
                    <div>{visitor.email}</div>
                    <div className="text-xs">{visitor.phone}</div>
                  </td>

                  <td className="px-4 py-3 text-gray-500">{visitor.company || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{visitor.purpose || "—"}</td>

                  {/* host name — supports both populated object and plain string */}
                  <td className="px-4 py-3 text-gray-500">
                    {visitor.host?.name || visitor.host || "—"}
                  </td>

                  {/* action buttons */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(visitor)}
                        className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(visitor._id)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded transition-colors"
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

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        // backdrop — clicking it closes the modal
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          {/* stop clicks inside the card from closing the modal */}
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editVisitor ? "Edit Visitor" : "Add New Visitor"}
                </h2>
                {/* X button to close */}
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── Photo Upload ─────────────────────────────────────── */}
                <div className="flex flex-col items-center gap-3">
                  {/* photo preview circle */}
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs text-center px-1">No photo</span>
                    )}
                  </div>

                  {/* hidden file input, triggered by the button below */}
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
                    className="cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded transition-colors"
                  >
                    {photoPreview ? "Change Photo" : "Upload Photo"}
                  </label>
                </div>

                {/* ── Name ─────────────────────────────────────────────── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* ── Email + Phone ─────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>

                {/* ── Company + Host ────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Company name"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                    <input
                      type="text"
                      name="host"
                      value={formData.host}
                      onChange={handleInputChange}
                      placeholder="Host name"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>

                {/* ── Purpose ───────────────────────────────────────────── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    placeholder="e.g. Meeting, Interview, Delivery"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* ── Form Actions ───────────────────────────────────────── */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>

                  {/* disabled + shows "Saving…" while the API call is in flight */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {submitting ? "Saving…" : editVisitor ? "Update Visitor" : "Save Visitor"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Visitors;