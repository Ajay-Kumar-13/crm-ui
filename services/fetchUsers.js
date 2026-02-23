import { ACCESS_TOKEN } from "../constants";

export const fetchUsers = async () => {
    const res = await fetch(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/admin/users`, {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
    });
    if (!res.ok) {
        throw new Error('Failed to fetch users');
    }
    return res.json();
}