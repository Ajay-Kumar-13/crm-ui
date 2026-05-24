import api from "../utils/api/axios";

export const fetchRoles = async () => {
    const res = await api.get(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/user/admin/roles`);
    return res.data;
};

export const saveRole = async ({roleData}) => {
    const res = await api.post(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/user/admin/roles`, roleData);
    return res.data;
}

export const updateRole = async ({roleId, roleData}) => {
    const res = await api.put(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/user/admin/roles/${roleId}`, roleData);
    return res.data;
}

export const deleteRole = async ({roleId}) => {
    const res = await api.delete(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/user/admin/roles/${roleId}`);
    return true;
}