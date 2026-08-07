import axios from "axios";
import toast from "react-hot-toast";
import { clearToken, getToken } from "./auth";

const api = axios.create({ baseURL: (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000") + "/api/v1" });
api.interceptors.request.use(c => { const t = getToken(); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401) { clearToken(); window.location.href = "/login"; }
  else if (e.response?.status === 403) toast.error("Access Denied");
  else if (e.response?.status >= 500) toast.error("Server error");
  return Promise.reject(e);
});
export const sendOTP = email => api.post("/otp/send", { email }).then(r => r.data);
export const verifyOTP = (email, otp) => api.post("/otp/verify", { email, otp }).then(r => r.data);
export const register = d => api.post("/auth/register", d).then(r => r.data);
export const login = (email, password, organization_slug) => api.post("/auth/login", { email, password, organization_slug }).then(r => r.data);
export const getCurrentUser = () => api.get("/auth/me").then(r => r.data);
export const uploadDocument = (file, classification = "internal", language = "en") => { const f = new FormData(); f.append("file", file); f.append("classification", classification); f.append("language", language); return api.post("/upload", f).then(r => r.data); };
export const uploadYoutube = (url, classification = "internal", language = "en") => api.post("/upload/youtube", { url, classification, language }).then(r => r.data);
export const getDocuments = () => api.get("/documents").then(r => r.data);
export const getDocumentStatus = id => api.get(`/documents/${id}/status`).then(r => r.data);
export const deleteDocument = id => api.delete(`/documents/${id}`).then(r => r.data);
export const downloadDocument = async (id, filename) => {
  const response = await api.get(`/documents/${id}/download`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename || "document");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
export const downloadReminderIcs = async (id, filename) => {
  const response = await api.get(`/reminders/${id}/ics`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename || "reminder.ics");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
export const getSanitisationReport = id => api.get(`/document-tags/${id}/sanitisation-report`).then(r => r.data);
export const updateDocumentTags = (id, d) => api.put(`/document-tags/${id}`, d).then(r => r.data);
export const sendQuery = (query, language = "en", conversationId = null, limit = 8) =>
  api.post("/query", { query, language, conversation_id: conversationId, limit }).then(r => r.data);
export const sendVoiceQuery = (blob, language = "en") => { const f = new FormData(); f.append("audio", blob, "recording.webm"); f.append("language", language); return api.post("/voice/query", f).then(r => r.data); };
export const getConversations = () => api.get("/chat/conversations").then(r => r.data);
export const getConversationMessages = id => api.get(`/chat/conversations/${id}/messages`).then(r => r.data);
export const deleteConversation = id => api.delete(`/chat/conversations/${id}`).then(r => r.data);
export const semanticSearch = (query, limit = 10) => api.post("/search", { query, limit }).then(r => r.data);
export const generateSummary = topic => api.post("/summary", { topic }).then(r => r.data);
export const generateReport = data => api.post("/reports", data).then(r => r.data);
export const getDashboardMetrics = () => api.get("/dashboard/metrics").then(r => r.data);
export const getKnowledgeMap = () => api.get("/dashboard/knowledge-map").then(r => r.data);
export const getGapAnalysis = () => api.get("/dashboard/gap-analysis").then(r => r.data);
export const getKnowledgeGaps = () => api.get("/dashboard/gaps").then(r => r.data);
export const getPredictiveInsights = () => api.get("/dashboard/insights").then(r => r.data);
export const getDomainTypes = () => api.get("/domains/types").then(r => r.data);
export const getDomains = () => api.get("/domains").then(r => r.data);
export const createDomain = d => api.post("/domains", d).then(r => r.data);
export const deleteDomain = id => api.delete(`/domains/${id}`).then(r => r.data);
export const getDomainMembers = id => api.get(`/domains/${id}/members`).then(r => r.data);
export const getMembers = () => api.get("/hr/members").then(r => r.data);
export const addMember = d => api.post("/hr/members", d).then(r => r.data);
export const bulkUploadCSV = file => { const f = new FormData(); f.append("file", file); return api.post("/hr/bulk-upload", f).then(r => r.data); };
export const getUsers = () => api.get("/admin/users").then(r => r.data);
export const createUser = d => api.post("/admin/users", d).then(r => r.data);
export const updateUser = (id, d) => api.put(`/admin/users/${id}`, d).then(r => r.data);
export const deleteUser = id => api.delete(`/admin/users/${id}`).then(r => r.data);
export const getAuditTrail = () => api.get("/admin/audit-trail").then(r => r.data);
export const getKnowledgeMapDocuments = async () => {
  const response = await api.get('/knowledge-map/documents');
  return response.data;
};
export const getPermissionsMatrix = () => api.get("/admin/permissions-matrix").then(r => r.data);
export const changePassword = (current_password, new_password) =>
api.post("/auth/change-password", { current_password, new_password }).then(r => r.data);

export const activateAccount = d => api.post("/auth/activate", d).then(r => r.data);
export const resendActivation = d => api.post("/auth/resend-activation", d).then(r => r.data);

// Knowledge Analytics Dashboard — super admin only (backend enforces via
// the "analytics:read" permission, which no other role is ever granted).
export const getAnalyticsOverview = () => api.get("/analytics/overview").then(r => r.data);
export const getQueryTrends = (days = 14) => api.get("/analytics/query-trends", { params: { days } }).then(r => r.data);
export const getTopTopics = (limit = 10) => api.get("/analytics/top-topics", { params: { limit } }).then(r => r.data);
export const getDocumentUsageAnalytics = (limit = 10) => api.get("/analytics/document-usage", { params: { limit } }).then(r => r.data);
export const getUserActivityAnalytics = (limit = 10) => api.get("/analytics/user-activity", { params: { limit } }).then(r => r.data);
export const getConfidenceTrends = (days = 14) => api.get("/analytics/confidence-trends", { params: { days } }).then(r => r.data);

// ---- Legal document analysis ("Understand My Case") ----
export const analyzeLegalDocument = (file, language = "en") => {
  const f = new FormData();
  f.append("file", file);
  f.append("language", language);
  return api.post("/legal/analyze", f).then(r => r.data);
};
export const getLegalCases = () => api.get("/legal/cases").then(r => r.data);
export const getLegalCase = id => api.get(`/legal/cases/${id}`).then(r => r.data);

// ---- Reminders ----
export const listReminders = () => api.get("/reminders").then(r => r.data);
export const createReminder = d => api.post("/reminders", d).then(r => r.data);
export const updateReminder = (id, d) => api.put(`/reminders/${id}`, d).then(r => r.data);
export const deleteReminder = id => api.delete(`/reminders/${id}`).then(r => r.data);

// ---- Google Calendar sync ----
export const getCalendarStatus = () => api.get("/calendar/status").then(r => r.data);
export const getCalendarOAuthUrl = () => api.get("/calendar/oauth/url").then(r => r.data);
export const syncReminderToCalendar = id => api.post(`/calendar/sync/${id}`).then(r => r.data);

// ---- Court / registrar triage dashboard ----
export const listCourtCases = () => api.get("/court/cases").then(r => r.data);
export const registerCourtCase = d => api.post("/court/cases", d).then(r => r.data);

export default api;