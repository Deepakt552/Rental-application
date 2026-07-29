import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Handle CSRF Token Mismatch (419) globally for axios
window.axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 419) {
            console.warn('CSRF token mismatch or session expired (419)');
        }
        return Promise.reject(error);
    }
);
