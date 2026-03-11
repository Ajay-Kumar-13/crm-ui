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

export const saveAuthority = async ({ accessToken, authority }) => {
    const res = await fetch(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/admin/authorities`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(authority)
    });
    if (!res.ok) {
        throw new Error('Failed to save authority');
    }
    return res.json();
}