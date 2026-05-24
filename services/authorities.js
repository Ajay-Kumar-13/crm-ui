import api from "../utils/api/axios";

export const fetchAuthorities = async () => {
    const res = await api.get(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/user/admin/authorities`)
    return res.data;
}

export const saveAuthority = async ({ authority }) => {
    const res = await api.post(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/user/admin/authorities`, authority);
    return res.data;
}