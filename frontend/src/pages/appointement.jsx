import { useState, useEffect, useContext } from 'react';
import { getAppointments, createAppointment, approveAppointment } from '../services/appointmentService';
import { generatePass } from '../services/passService';
import { getVisitors } from '../services/visitorService';
import { AuthContext } from '../context/AuthContext';

function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generatedPassData, setGeneratedPassData] = useState(null);
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    visitor: '',
    purpose: '',
    visitdate: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchVisitorsList();
  }, []);

  async function fetchAppointments() {
    try {
      const data = await getAppointments();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVisitorsList() {
    try {
      const data = await getVisitors();
      setVisitors(data.visitors || []);
    } catch (error) {
      console.error('Failed to fetch visitors:', error);
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAppointment({
        ...formData,
        host: user._id || user.id 
      });
      setShowModal(false);
      setFormData({ visitor: '', purpose: '', visitdate: '' });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('Failed to create appointment');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveAppointment(id);
      fetchAppointments();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve appointment');
    }
  };

  const handleGeneratePass = async (id) => {
    try {
      const data = await generatePass(id);
      setGeneratedPassData(data.pass); // Save pass data to state to show QR code
    } catch (error) {
      console.error('Failed to generate pass:', error);
      alert(error.response?.data?.message || 'Failed to generate pass');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
        >
          + Schedule Appointment
        </button>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4 text-gray-500">No appointments found.</td></tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {appt.visitor ? appt.visitor.name : 'Unknown Visitor'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appt.host ? appt.host.name : 'Unknown Host'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(appt.visitdate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.purpose}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${appt.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        appt.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {appt.status === 'pending' && (
                      <button 
                        onClick={() => handleApprove(appt._id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Approve
                      </button>
                    )}
                    {appt.status === 'approved' && (
                      <button 
                        onClick={() => handleGeneratePass(appt._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Generate Pass
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Generated Pass QR Modal */}
      {generatedPassData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pass Generated!</h2>
            <p className="text-gray-500 mb-6 font-mono bg-gray-100 p-2 rounded">{generatedPassData.passnumber}</p>
            
            <div className="flex justify-center border-4 border-dashed border-gray-200 p-4 rounded-xl mb-6">
              {/* Display the base64 QR Code string returned from the backend */}
              <img src={generatedPassData.qrcode} alt="Pass QR Code" className="w-48 h-48 object-contain" />
            </div>

            <p className="text-sm text-gray-600 mb-6">
              You can now scan this QR code on the Check In/Out page to test the scanner!
            </p>

            <button 
              onClick={() => setGeneratedPassData(null)} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Schedule Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Visitor *</label>
                <select 
                  required 
                  name="visitor" 
                  value={formData.visitor} 
                  onChange={handleInputChange} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                >
                  <option value="" disabled>Select a registered visitor</option>
                  {visitors.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time *</label>
                <input 
                  required 
                  type="datetime-local" 
                  name="visitdate" 
                  value={formData.visitdate} 
                  onChange={handleInputChange} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Purpose *</label>
                <input 
                  required 
                  type="text" 
                  name="purpose" 
                  value={formData.purpose} 
                  onChange={handleInputChange} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                />
              </div>
              
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointment;