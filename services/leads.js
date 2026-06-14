import api from "../utils/api/axios";

export const fetchLeads = async () => {
    const res = await api.get(`${import.meta.env.VITE_CRM_LEADS_API_ENDPOINT}/api/handle-leads/admin/leads`);
    return res.data;
}

export const uploadLeads = async ({leadsData}) => {
    const res = await api.post(`${import.meta.env.VITE_CRM_LEADS_API_ENDPOINT}/api/handle-leads/admin/leads`, leadsData);
    return res.data;
}

export const updateLead = async ({ leadId, leadData }) => {
    const res = await api.put(`${import.meta.env.VITE_CRM_LEADS_API_ENDPOINT}/api/handle-leads/admin/leads/${leadId}`, leadData);
    return res.data;
}