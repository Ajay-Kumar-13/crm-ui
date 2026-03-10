export const saveUser = async (userData, accessToken) => {
    const res = await fetch(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(userData)
    });
    if (!res.ok) {
        throw new Error('Failed to save user');
    }
    return res.json();
}