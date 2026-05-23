import { useState } from 'react';
import QRScanner from '../components/QRScanner';
import { checkIn, checkOut } from '../services/checkService';
import { Html5Qrcode } from 'html5-qrcode';

export default function CheckPage() {
  const [passID, setPassID] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  // scanning state removed (not used) to satisfy linter

  const handleCheckIn = async (id = passID) => {
    try {
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Check In / Check Out</h1>
        <p className="text-gray-600 mt-2">Scan a Visitor Pass QR code or enter the Pass ID manually.</p>
      </div>

      {statusMessage && (
        <div className={`p-4 mb-6 rounded-lg font-medium ${statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* QR Scanner Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Scan QR Code</h2>
          <div className="w-full max-w-sm overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
            <QRScanner onScan={handleAutoCheckIn} />
          </div>
          
          <div className="w-full mt-6">
            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR UPLOAD IMAGE</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> a QR code image</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Hold the visitor's pass up to the camera or upload an image. The Pass ID will automatically fill below.
          </p>
        </div>

        {/* Manual Entry Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Manual Entry</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pass ID</label>
              <input
                type="text"
                placeholder="Enter Pass ID (e.g., PASS-12345)"
                value={passID}
                onChange={(e) => setPassID(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleCheckIn(passID)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition"
              >
                Check In
              </button>
              <button
                onClick={() => handleCheckOut(passID)}
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow transition"
              >
                Check Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
