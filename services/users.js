import api from "../utils/api/axios";

export const fetchUsers = async () => {
    const res = await api.get(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/admin/users`);
    return res.data;
}

export const saveUser = async (userData) => {
    const res = await api.post(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/admin/users`, userData);
    return res.data;
}

export const updateUser = async (userId, userData) => {
    const res = await api.put(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/admin/users/${userId}`, userData);
    return res.data;
}