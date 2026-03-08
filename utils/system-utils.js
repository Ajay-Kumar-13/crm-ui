export const fetchAccessToken = async (authenticationObject) => {
    const token = await fetch(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(authenticationObject),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    if (!token.ok) {
        throw new Error('Failed to fetch access token');
    }
    return token.json();
}

export const fetchRoleAuthorities = async (accessToken, roleId) => {
    const authorities = await fetch(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/admin/authorities/${roleId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!authorities.ok) {
        throw new Error('Failed to fetch role authorities');
    }
    return authorities.json();
}