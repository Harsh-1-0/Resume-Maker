import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 180000, // 3 minutes
});

export const processPair = (formData) => axiosInstance.post("/process_pair/", formData, { headers: { 'Content-Type': 'multipart/form-data' }});
export const skillMatch = (payload) => axiosInstance.post("/skill_match/", payload, { headers: { 'Content-Type': 'application/json' }});
export const skillGap = (payload) => axiosInstance.post("/skill_gap/", payload, { headers: { 'Content-Type': 'application/json' }});
export const searchJobs = (payload) => axiosInstance.post("/search_jobs", payload, { headers: { 'Content-Type': 'application/json' }});
export const getResumePdf = (payload) => axiosInstance.post("/resume", payload, { headers: { 'Content-Type': 'application/json' }, responseType: 'blob' });

export default axiosInstance;
