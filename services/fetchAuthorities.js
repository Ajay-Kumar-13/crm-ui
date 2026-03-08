export const fetchAuthorities = async (accessToken) => {
    const res = await fetch(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/admin/authorities`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!res.ok) {
        throw new Error('Failed to fetch authorities');
    }
    return res.json();
}