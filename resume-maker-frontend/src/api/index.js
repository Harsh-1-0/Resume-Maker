import axios from "axios";
import axiosRetry from "axios-retry";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// increase timeout to e.g. 180s (180000 ms). LLM calls may need long time.
const client = axios.create({
  baseURL: API_BASE,
  timeout: 180000, // 180s
});

// automatic retry for network errors and 5xx
axiosRetry(client, {
  retries: 2, // try up to 2 retries (so total attempts = 1 + 2)
  retryDelay: (retryCount) => {
    // exponential backoff: 1s, 2s, 4s...
    return Math.pow(2, retryCount) * 1000;
  },
  retryCondition: (error) => {
    // retry on network or 5xx
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error?.response?.status >= 500;
  },
});

// helper wrapper to surface friendly errors
async function safeRequest(promise) {
  try {
    const r = await promise;
    return r;
  } catch (err) {
    // Convert Axios timeout to a clearer message
    if (err.code === "ECONNABORTED" && err.message && err.message.includes("timeout")) {
      const e = new Error("The server took too long to respond (timeout). This endpoint may need more time or the backend may be stuck.");
      e.original = err;
      throw e;
    }
    throw err;
  }
}

export async function processPair(formData) {
  return safeRequest(client.post("/process_pair/", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }));
}

export async function skillMatch(payload) {
  return safeRequest(client.post("/skill_match/", payload));
}

export async function skillGap(payload) {
  return safeRequest(client.post("/skill_gap/", payload));
}

export async function searchJobs(payload) {
  return safeRequest(client.post("/search_jobs", payload));
}

export async function downloadResumePDF(payload) {
  return safeRequest(client.post("/resume", payload, { responseType: "blob" }));
}
