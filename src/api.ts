import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: () => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  }),
});

// Tasks
export const fetchTasks = (projectId: string) => api.get(`/tasks`, { params: { projectId } });
export const updateTask = (taskId: string, data: any) => api.put(`/tasks/${taskId}`, data);

// Messages
export const fetchMessages = () => api.get(`/messages`);
export const sendMessage = (content: string) => api.post(`/messages`, { content });

// Projects
export const fetchProjects = () => api.get("/projects");
export const createProject = (data: { name: string; description?: string }) => api.post("/projects", data); 