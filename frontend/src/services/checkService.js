import API from './api';

export const checkIn = async (passId) => {
    const response = await API.post(`/check/checkin/${passId}`);
    return response.data;
};

export const checkOut = async (passId) => {
    const response = await API.post(`/check/checkout/${passId}`);
    return response.data;
};
