import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function PreRegister() {
  const [hosts, setHosts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    hostId: '',
    purpose: '',
    visitdate: '',
  });
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const response = await api.get('/users/public/hosts');
        setHosts(response.data.hosts);
      } catch (err) {
        console.error('Error fetching hosts', err);
      }
    };
    fetchHosts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (photo) {
        data.append('photo', photo);
      }

      const response = await api.post('/visitors/public-register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Pre-registration successful! Your host will approve your visit.');
      setFormData({
        name: '', email: '', phone: '', company: '', hostId: '', purpose: '', visitdate: ''
      });
      setPhoto(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to pre-register. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'block w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white shadow-sm outline-none transition placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/10';
  const labelClass = 'block text-sm font-medium text-white/80';

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex flex-col pt-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-black via-neutral-950 to-slate-950" />
        <div className="absolute -top-40 left-1/2 h-96 w-240 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_35%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.92)_100%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Visitor Pre-Registration</h1>
          <p className="mt-2 text-sm text-white/60">Fill out your details to request an appointment.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-neutral-950 p-8 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
          {message && (
            <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {message}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} className={inputClass} placeholder="Jane Doe" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="jane@example.com" />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input required name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="+1234567890" />
              </div>
              <div>
                <label className={labelClass}>Company (Optional)</label>
                <input name="company" value={formData.company} onChange={handleInputChange} className={inputClass} placeholder="Acme Corp" />
              </div>
              <div>
                <label className={labelClass}>Host to Visit</label>
                <select required name="hostId" value={formData.hostId} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select a host</option>
                  {hosts.map(host => (
                    <option key={host._id} value={host._id}>{host.name} ({host.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Visit Date & Time</label>
                <input required type="datetime-local" name="visitdate" value={formData.visitdate} onChange={handleInputChange} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Purpose of Visit</label>
                <textarea required name="purpose" value={formData.purpose} onChange={handleInputChange} className={inputClass} rows="2" placeholder="Meeting regarding..."></textarea>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Photo</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full mt-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90 focus:outline-none disabled:opacity-60">
              {isSubmitting ? 'Submitting...' : 'Request Appointment'}
            </button>
            <div className="text-center text-sm text-white/60 pt-4">
               Already have a pass? <Link to="/view-pass" className="font-semibold text-indigo-300 hover:text-indigo-200">View Digital Pass</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PreRegister;
