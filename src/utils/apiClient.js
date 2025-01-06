import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

apiClient.interceptors.request.use(async (config) => {
    let token = sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(error));
});

export default apiClient;
