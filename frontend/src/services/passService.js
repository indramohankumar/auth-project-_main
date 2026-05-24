import API from './api';

export const generatePass = async (appointmentId) => {
    const response = await API.post(`/passes/${appointmentId}`);
    return response.data;
};

export const getPassPdfUrl = (passId) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/passes/pdf/${passId}`;
};
