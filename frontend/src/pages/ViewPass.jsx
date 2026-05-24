import { useState } from 'react';
import { Link } from 'react-router-dom';

function ViewPass() {
  const [passnumber, setPassnumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Direct window location change to trigger a download/view since it's a PDF response
      window.location.href = `http://localhost:5000/api/passes/public/pdf/${passnumber.trim()}`;
      
      // Note: A more robust implementation might fetch it as a blob first to handle 404s gracefully
      // but this works for standard PDF viewing
      
      setTimeout(() => { setIsSubmitting(false); }, 2000);
    } catch (err) {
      setErrorMsg('Failed to fetch pass. Check your pass number.');
      setIsSubmitting(false);
    }
  };

  const inputClass = 'block w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white shadow-sm outline-none transition placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/10';
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex flex-col pt-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-black via-neutral-950 to-slate-950" />
        <div className="absolute -top-40 left-1/2 h-96 w-240 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_35%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.92)_100%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white">View Digital Pass</h1>
          <p className="mt-2 text-sm text-white/60">Enter your pass number to download your badge.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-neutral-950 p-8 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
          {errorMsg && (
            <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Pass Number</label>
              <input required name="passnumber" value={passnumber} onChange={(e) => setPassnumber(e.target.value)} className={inputClass} placeholder="PASS-171..." />
            </div>

            <button type="submit" disabled={isSubmitting || !passnumber} className="w-full mt-4 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none disabled:opacity-60">
              {isSubmitting ? 'Fetching...' : 'Download Pass'}
            </button>
            <div className="text-center text-sm text-white/60 pt-4">
               Don't have an appointment? <Link to="/pre-register" className="font-semibold text-indigo-300 hover:text-indigo-200">Pre-register here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ViewPass;
