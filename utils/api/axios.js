// To understand this code: https://chatgpt.com/c/69b804fc-ad80-8323-a511-5ed9b0fdf1d6

import axios from "axios";
import { refreshAccessToken } from "../system-utils";

// Create an Axios instance with the base URL from environment variables
const api = axios.create({
    baseURL: `${import.meta.env.VITE_CRM_USERS_API_ENDPOINT}/api/user`
})

// Add a request interceptor to include the access token in the headers
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let queue = [];

// Add a response interceptor to handle token refresh on 401 errors
api.interceptors.response.use((response) => response, async(error) => {
    const originalRequest = error.config;
    
    // Check if the error is a 401 and we have already tried to refresh
    if(error.response && error.response.status !== 401 && originalRequest._retry) {
        return Promise.reject(error);
    }

    originalRequest._retry = true;
    
    // If we are already refreshing the token, queue the request
    if(isRefreshing) {
        // Return a promise that resolves once the token is refreshed and the original request is retried
        return new Promise((resolve) => {
            queue.push((token) => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                resolve(api(originalRequest));
            })
        });
    }

    isRefreshing = true;
    
    try {
        const res = await refreshAccessToken();
        const newToken = res.data.accessToken;
        localStorage.setItem('access_token', newToken);
        
        // Update the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        // Process the queued requests
        queue.forEach(callback => callback(newToken));
        queue = [];
        
        return api(originalRequest);
    } catch (err) {
        localStorage.removeItem('access_token');
        return Promise.reject(err);
    } finally {
        isRefreshing = false;
    }   
});

export default api;
