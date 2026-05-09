export const fetchRoles = async (accessToken) => {
    const res = await fetch(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/user/admin/roles`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!res.ok) {
        throw new Error('Failed to fetch roles');
    }
    return res.json();
};

export const saveRole = async ({accessToken, roleData}) => {
    const res = await fetch(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/user/admin/roles`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
    });
    if (!res.ok) {
        throw new Error('Failed to save role');
    }
    return res.json();
}

export const updateRole = async ({roleId, roleData, accessToken}) => {
    const res = await fetch(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/user/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
    });
    if (!res.ok) {
        throw new Error('Failed to update role');
    }
    return res.json();
}