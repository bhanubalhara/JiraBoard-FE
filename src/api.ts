import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  try {
    const { auth } = await import("./firebase");
    if (auth.currentUser) {
      // Firebase caches tokens for up to 1h; force refresh if older than 55m
      const token = await auth.currentUser.getIdToken(false);
      const exp = JSON.parse(atob(token.split(".")[1])).exp * 1000; // expiry in ms
      const now = Date.now();
      const shouldRefresh = exp - now < 5 * 60 * 1000; // <5 minutes left
      const freshToken = shouldRefresh ? await auth.currentUser.getIdToken(true) : token;
      const final = freshToken || token;
      localStorage.setItem("token", final);
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${final}`,
      } as any;
    }
  } catch {
    // ignore if firebase not ready
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      // Avoid redirect loop if already on auth pages
      if (path !== "/login" && path !== "/register") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// Tasks
export const fetchTasks = (projectId: string) => api.get(`/tasks`, { params: { projectId } });
export const updateTask = (taskId: string, data: any) => api.put(`/tasks/${taskId}`, data);

// create task
export const createTask = (data: { title: string; description?: string; projectId: string }) =>
  api.post("/tasks", data);

// Messages
export const fetchMessages = () => api.get(`/messages`);
export const sendMessage = (content: string) => api.post(`/messages`, { content });

// Projects
export const fetchProjects = () => api.get("/projects");
export const createProject = (data: { name: string; description?: string }) => api.post("/projects", data); 