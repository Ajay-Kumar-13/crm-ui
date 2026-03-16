import api from "./api/axios";

export const fetchAccessToken = async (authenticationObject) => {
    const token = await api.post(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/auth/login`, authenticationObject);
    return token.data;
}

export const refreshAccessToken = async () => {
    const token = await api.post(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/auth/refresh`);
    return token.data;
}

export const fetchRoleAuthorities = async (roleId) => {
    const authorities = await api.get(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/admin/authorities/${roleId}`);
    return authorities.data;
}