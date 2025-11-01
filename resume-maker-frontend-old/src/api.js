import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export const processPair = (formData) => {
  // formData: instance of FormData (multipart/form-data)
  return axios.post(`${API_BASE}/process_pair/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000, // allow longer for LLM calls
  });
};

// keep other API helpers unchanged...
export const skillMatch = (payload) => axios.post(`${API_BASE}/skill_match/`, payload);
export const skillGap = (payload) => axios.post(`${API_BASE}/skill_gap/`, payload);
export const resumePDF = (payload) =>
  axios.post(`${API_BASE}/resume/`, payload, { responseType: "blob" });
export const searchJobs = (payload) => axios.post(`${API_BASE}/search_jobs`, payload);
