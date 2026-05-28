export default function GeneratedPassModal({ generatedPassData, onClose }) {
  if (!generatedPassData) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-neutral-950 p-6 sm:p-8 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)]">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center ring-4 ring-emerald-500/10">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">Pass Generated</h2>

        <div className="mb-6 mt-4">
          <div className="text-xs font-semibold tracking-widest text-white/50 uppercase text-center">
            Pass Number
          </div>
          <div className="mt-2 font-mono text-white bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center text-lg">
            {generatedPassData.passnumber}
          </div>
        </div>

        <div className="flex justify-center border border-white/10 bg-white/5 p-4 rounded-2xl mb-6">
          <img src={generatedPassData.qrcode} alt="Pass QR Code" className="w-48 h-48 object-contain" />
        </div>

        <p className="text-sm text-white/60 mb-6 text-center">
          Scan this QR code on the Check In/Out page to test the scanner.
        </p>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-sm hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
