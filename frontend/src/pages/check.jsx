import { useState, useContext } from 'react';
import QRScanner from '../components/QRScanner';
import { checkIn, checkOut } from '../services/checkService';
import { Html5Qrcode } from 'html5-qrcode';
import { AuthContext } from '../context/AuthContext';

export default function CheckPage() {
  const [passID, setPassID] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const { user } = useContext(AuthContext);
  const role = user?.role || 'employee';
  const canManageCheckins = role === 'admin' || role === 'security';
  // scanning state removed (not used) to satisfy linter

  const handleCheckIn = async (id = passID) => {
    try {
      if (!canManageCheckins) {
        return setStatusMessage({ type: 'error', text: 'You do not have permission to check visitors in.' });
      }
      if (!id) return alert("Please enter a Pass ID");
      await checkIn(id);
      setStatusMessage({ type: 'success', text: `Successfully checked IN pass: ${id}` });
      setPassID('');
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Check-in failed' });
    }
  };

  const handleCheckOut = async (id = passID) => {
    try {
      if (!canManageCheckins) {
        return setStatusMessage({ type: 'error', text: 'You do not have permission to check visitors out.' });
      }
      if (!id) return alert("Please enter a Pass ID");
      await checkOut(id);
      setStatusMessage({ type: 'success', text: `Successfully checked OUT pass: ${id}` });
      setPassID('');
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Check-out failed' });
    }
  };

  const handleAutoCheckIn = async (scannedPassData) => {
    try {
      let idToUse = scannedPassData;
      try {
        const parsed = JSON.parse(scannedPassData);
        idToUse = parsed.passnumber || parsed._id || scannedPassData;
      } catch {
        // Not JSON, just use raw text
      }

      setPassID(idToUse);
      setStatusMessage({ type: 'success', text: 'QR Code successfully scanned! ID: ' + idToUse });
    } catch (error) {
      console.error('Error parsing QR', error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatusMessage({ type: 'success', text: 'Scanning image... please wait.' });

    Html5Qrcode.scanFile(file, true)
      .then(decodedText => {
        handleAutoCheckIn(decodedText);
      })
      .catch(err => {
        console.error("Error scanning uploaded file:", err);
        setStatusMessage({ type: 'error', text: 'Could not read QR code from the uploaded image. Please ensure the QR code is clear and visible.' });
      });

    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Same dark background theme (professional + consistent) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-br from-black via-slate-950 to-slate-900" />
        <div className="absolute -top-40 left-1/2 h-96 w-240 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-44 top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-52 top-10 h-112 w-112 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_30%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.92)_100%)]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">
            Access Control
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white">Check In / Check Out</h1>
          <p className="text-white/55 mt-2">
            Scan a Visitor Pass QR code or enter the Pass ID manually.
          </p>
          <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
            {role === 'admin' ? 'Admin access' : 'Frontdesk access'}
          </p>
        </div>

        {!canManageCheckins && (
          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            This page is intended for admin and frontdesk users.
          </div>
        )}

        {statusMessage && (
          <div
            className={[
              "mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold",
              statusMessage.type === 'success'
                ? "bg-emerald-500/10 text-emerald-100 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-100 border-rose-500/20",
            ].join(" ")}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Scanner Section */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)] p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-white">Scan QR Code</h2>
                <p className="text-sm text-white/55 mt-1">
                  Use the camera for fastest check-in.
                </p>
              </div>

              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-white/5 text-white/70 border border-white/10">
                Camera
              </span>
            </div>

            <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <div className="p-3">
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <QRScanner onScan={handleAutoCheckIn} />
                </div>
              </div>
            </div>

            <div className="w-full mt-6">
              <div className="relative flex py-4 items-center">
                <div className="grow border-t border-white/10"></div>
                <span className="shrink-0 mx-4 text-white/40 text-xs font-semibold tracking-widest">
                  OR UPLOAD IMAGE
                </span>
                <div className="grow border-t border-white/10"></div>
              </div>

              <label className="flex flex-col items-center justify-center w-full h-24 border border-white/10 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition">
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white/60 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    ></path>
                  </svg>
                  <p className="text-sm text-white/60">
                    <span className="font-semibold text-white">Click to upload</span>{" "}
                    a QR code image
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    PNG/JPG with a clear QR works best
                  </p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>

            <p className="text-sm text-white/50 mt-4 text-center">
              The Pass ID will auto-fill in the manual field after scanning.
            </p>
          </div>

          {/* Manual Entry Section */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)] p-4 sm:p-6 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-lg font-extrabold text-white">Manual Entry</h2>
              <p className="text-sm text-white/55 mt-1">
                Use this when camera access isn’t available.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Pass ID
                </label>
                <input
                  type="text"
                  placeholder="Enter Pass ID (e.g., PASS-12345)"
                  value={passID}
                  onChange={(e) => setPassID(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white
                             placeholder:text-white/30 shadow-sm outline-none transition
                             focus:border-white/20 focus:ring-4 focus:ring-white/10"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => handleCheckIn(passID)}
                  disabled={!canManageCheckins}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4
                             shadow-sm transition focus:outline-none focus:ring-4 focus:ring-emerald-500/20
                             disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Check In
                </button>
                <button
                  onClick={() => handleCheckOut(passID)}
                  disabled={!canManageCheckins}
                  className="flex-1 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold py-3 px-4
                             border border-white/10 shadow-sm transition focus:outline-none focus:ring-4 focus:ring-white/10
                             disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Check Out
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-xs text-white/50">
                  Tip: After scanning, verify the Pass ID before you check in/out.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* small footer spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}