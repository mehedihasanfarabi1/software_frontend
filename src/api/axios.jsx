import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto refresh
api.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("token");
        const exp = localStorage.getItem("token_exp");

        // Check token expiry
        if (token && exp) {
            const now = Date.now() / 1000;
            if (now >= exp) {
                // token expired
                localStorage.clear();
                window.location.href = "/";
                return Promise.reject("Token expired");
            }
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
