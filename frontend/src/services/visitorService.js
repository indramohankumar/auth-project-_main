import API from './api';

export const getVisitors = async () => {
    const response = await API.get('/visitor');
    return response.data;
};

export const createVisitor = async (visitorData) => {
    const response = await API.post('/visitor', visitorData);
    return response.data;
};

export const updateVisitor = async (id, visitorData) => {
    const response = await API.put(`/visitor/${id}`, visitorData);
    return response.data;
};

export const deleteVisitor = async (id) => {
    const response = await API.delete(`/visitor/${id}`);
    return response.data;
};
