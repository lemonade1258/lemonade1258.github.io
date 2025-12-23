import { NewsItem, Person, Publication, ContactInfo, Project } from "../types";

/**
 * CLAIR DataStore & API Client
 * - Supports automatic local caching for performance
 * - Handles bilingual content retrieval
 */

// 优先使用当前域名，如果是本地开发则回退到指定 IP
const getBaseUrl = () => {
  // 如果你在本地运行前端想连远程后端，手动改这里
  const REMOTE_IP = "http://59.110.163.47:5000/api";
  if (window.location.hostname === "localhost") return REMOTE_IP;
  // 如果前后端部署在同一台机器且通过域名访问，通常可以相对路径或动态匹配
  return `http://${window.location.hostname}:5000/api`;
};

const API_BASE_URL = "http://59.110.163.47:5000/api"; // 固定为你目前的后端地址
const CACHE_PREFIX = "clair_cache_v2_";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache for public view

// --- Cache Helper ---
const getCache = (key: string) => {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    const { data, ts } = JSON.parse(item);
    if (Date.now() - ts < CACHE_TTL) return data;
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (e) {
    return null;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch (e) {}
};

export const clearCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
  console.log("[Cache] All cleared.");
};

// --- API Wrapper ---
async function apiCall<T>(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const isRead = method === "GET";

  // 1. Try Cache
  if (isRead && !token) {
    const cached = getCache(endpoint);
    if (cached) return cached;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();

    // 2. Set Cache
    if (isRead && !token) setCache(endpoint, data);

    // 3. Clear on Change
    if (!isRead) clearCache();

    return data;
  } catch (error: any) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "无法连接到后端服务器，请检查后端程序是否正在运行（node server.js）以及 5000 端口是否开放。"
      );
    }
    throw error;
  }
}

// --- Specific API Methods ---
export const loginAdmin = async (username: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return await res.json();
};

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });
  const data = await res.json();
  return data.url;
};

export const fetchNews = () => apiCall<NewsItem[]>("/news");
export const fetchNewsItem = (id: string) => apiCall<NewsItem>(`/news/${id}`);
export const createNews = (data: NewsItem) =>
  apiCall<NewsItem>("/news", "POST", data);
export const updateNews = (data: NewsItem) =>
  apiCall<NewsItem>(`/news/${data.id}`, "PUT", data);
export const deleteNews = (id: string) =>
  apiCall<void>(`/news/${id}`, "DELETE");

export const fetchPeople = () => apiCall<Person[]>("/people");
export const createPerson = (data: Person) =>
  apiCall<Person>("/people", "POST", data);
export const updatePerson = (data: Person) =>
  apiCall<Person>(`/people/${data.id}`, "PUT", data);
export const deletePerson = (id: string) =>
  apiCall<void>(`/people/${id}`, "DELETE");

export const fetchPublications = () => apiCall<Publication[]>("/publications");
export const createPublication = (data: Publication) =>
  apiCall<Publication>("/publications", "POST", data);
export const updatePublication = (data: Publication) =>
  apiCall<Publication>(`/publications/${data.id}`, "PUT", data);
export const deletePublication = (id: string) =>
  apiCall<void>(`/publications/${id}`, "DELETE");

export const fetchProjects = () => apiCall<Project[]>("/projects");
export const createProject = (data: Project) =>
  apiCall<Project>("/projects", "POST", data);
export const updateProject = (data: Project) =>
  apiCall<Project>(`/projects/${data.id}`, "PUT", data);
export const deleteProject = (id: string) =>
  apiCall<void>(`/projects/${id}`, "DELETE");

export const fetchContact = () => apiCall<ContactInfo>("/contact");
export const saveContact = (data: ContactInfo) =>
  apiCall<ContactInfo>("/contact", "POST", data);

export const exportToCSV = (data: any[], filename: string) => {
  // ... existing CSV logic ...
};
