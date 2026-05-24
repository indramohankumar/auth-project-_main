import API from './api';

export const getAppointments = async () => {
    const response = await API.get('/appointment');
    return response.data;
};

export const createAppointment = async (appointmentData) => {
    const response = await API.post('/appointment', appointmentData);
    return response.data;
};

export const approveAppointment = async (id) => {
    const response = await API.put(`/appointment/${id}`, { status: 'approved' });
    return response.data;
};

export const rejectAppointment = async (id) => {
    const response = await API.put(`/appointment/${id}`, { status: 'rejected' });
    return response.data;
};
