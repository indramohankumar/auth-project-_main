import API from './api';

export const generatePass = async (appointmentId) => {
    const response = await API.post(`/passes/${appointmentId}`);
    return response.data;
};

export const getPassPdfUrl = (passId) => {
    return `http://localhost:5000/api/passes/pdf/${passId}`;
};
