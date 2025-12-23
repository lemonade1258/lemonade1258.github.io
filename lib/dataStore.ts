import { NewsItem, Person, Publication, ContactInfo, Project } from "../types";

/**
 * CLAIR DataStore & API Client - V4
 */

const API_BASE_URL = "http://59.110.163.47:5000/api";
const CACHE_PREFIX = "clair_cache_v4_"; // 版本号升级，强制失效旧数据
const CACHE_TTL = 1 * 60 * 1000; // 公众访问缓存缩短至 1 分钟

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

/**
 * 修复：只清除数据缓存，不清除登录令牌(admin_token)
 */
export const clearCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
  console.log("[DataStore] Data cache cleared. Admin token remains safe.");
};

// --- API Wrapper ---
async function apiCall<T>(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const isAdmin = !!token;
  const isRead = method === "GET";

  // 1. 管理员操作永远不使用缓存
  if (isRead && !isAdmin) {
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
      cache: "no-store", // 禁用浏览器原始缓存
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (isRead && !isAdmin) setCache(endpoint, data);

    // 2. 任何修改操作后清空数据缓存，但保留 Token
    if (!isRead) clearCache();

    return data;
  } catch (error: any) {
    if (error.name === "TypeError") {
      throw new Error(
        "连接失败。请确保后端 5000 端口已开放，且浏览器未拦截 HTTP 请求。"
      );
    }
    throw error;
  }
}

// --- API Methods ---
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
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((v) => JSON.stringify(row[v] || "")).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
