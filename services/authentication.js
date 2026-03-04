export const fetchAccessToken = async (authenticationObject) => {
    const token = await fetch(`${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(authenticationObject),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    console.log("token: ", token);
    
    if (!token.ok) {
        throw new Error('Failed to fetch access token');
    }
    return token.json();
}