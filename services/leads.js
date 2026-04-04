import api from "../utils/api/axios";

export const fetchLeads = async () => {
    const res = await api.get(`${import.meta.env.VITE_CRM_LEADS_API_ENDPOINT}/api/admin/leads`);
    return res.data;
}

export const uploadLeads = async (leadsData) => {
    const res = await api.post(`${import.meta.env.VITE_CRM_LEADS_API_ENDPOINT}/api/admin/leads`, leadsData);
    return res.data;
}