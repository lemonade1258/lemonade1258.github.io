import { NewsItem, Person, Publication, ContactInfo, Project } from "../types";

// Configuration
// CHANGE THIS: Pointing to your Alibaba Cloud Server IP
const API_BASE_URL = "http://59.110.163.47:5000/api";
const CACHE_PREFIX = "clair_cache_";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

console.log(
  `[CLAIR DataStore] Initialized. Connecting to API: ${API_BASE_URL}`
);

// --- Cache Helper ---
const getCache = (key: string) => {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    const { data, ts } = JSON.parse(item);
    if (Date.now() - ts < CACHE_TTL) return data;
    localStorage.removeItem(CACHE_PREFIX + key); // Expired
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
  } catch (e) {
    console.error("Cache write failed", e);
  }
};

const clearCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

// --- Helper for Fetch ---
async function apiCall<T>(
  endpoint: string,
  method: string = "GET",
  body?: any,
  skipCache: boolean = false
): Promise<T> {
  const token = localStorage.getItem("admin_token");

  // 1. Try Cache for GET requests
  if (method === "GET" && !skipCache && !token) {
    // Only cache for public users (no token), or if explicitly desired
    // Ideally admin should always fetch fresh, public users fetch cache
    const cached = getCache(endpoint);
    if (cached) {
      // console.log(`[Cache Hit] ${endpoint}`);
      return cached;
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    if (response.status === 403) {
      console.warn("Access forbidden. You might need to login again.");
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) errorMessage = errorJson.message;
      } catch (e) {}
      throw new Error(errorMessage || response.statusText);
    }

    const json = await response.json();

    // 2. Set Cache for GET requests
    if (method === "GET" && !token) {
      setCache(endpoint, json);
    }

    // 3. Clear Cache on Mutations
    if (["POST", "PUT", "DELETE"].includes(method)) {
      clearCache();
    }

    return json;
  } catch (error) {
    console.error(`Request failed for ${endpoint}:`, error);
    throw error;
  }
}

// --- Auth API ---
export const loginAdmin = async (
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { success: false, message: "Server Interface Error." };
    }
  } catch (e: any) {
    return { success: false, message: "Network Error: Cannot reach server." };
  }
};

// --- Upload Helper ---
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("admin_token");

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    const data = await response.json();
    let finalUrl = data.url;
    if (
      finalUrl &&
      finalUrl.startsWith("http://") &&
      window.location.protocol === "https:"
    ) {
      finalUrl = finalUrl.replace("http://", "https://");
    }
    return finalUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// --- News API ---
export const fetchNews = async (): Promise<NewsItem[]> =>
  apiCall<NewsItem[]>("/news");
export const fetchNewsItem = async (id: string): Promise<NewsItem> =>
  apiCall<NewsItem>(`/news/${id}`);
export const createNews = async (news: NewsItem): Promise<NewsItem> =>
  apiCall<NewsItem>("/news", "POST", news);
export const updateNews = async (news: NewsItem): Promise<NewsItem> =>
  apiCall<NewsItem>(`/news/${news.id}`, "PUT", news);
export const deleteNews = async (id: string): Promise<void> =>
  apiCall<void>(`/news/${id}`, "DELETE");

// --- People API ---
export const fetchPeople = async (): Promise<Person[]> =>
  apiCall<Person[]>("/people");
export const createPerson = async (person: Person): Promise<Person> =>
  apiCall<Person>("/people", "POST", person);
export const updatePerson = async (person: Person): Promise<Person> =>
  apiCall<Person>(`/people/${person.id}`, "PUT", person);
export const deletePerson = async (id: string): Promise<void> =>
  apiCall<void>(`/people/${id}`, "DELETE");

// --- Publications API ---
export const fetchPublications = async (): Promise<Publication[]> =>
  apiCall<Publication[]>("/publications");
export const createPublication = async (
  pub: Publication
): Promise<Publication> => apiCall<Publication>("/publications", "POST", pub);
export const updatePublication = async (
  pub: Publication
): Promise<Publication> =>
  apiCall<Publication>(`/publications/${pub.id}`, "PUT", pub);
export const deletePublication = async (id: string): Promise<void> =>
  apiCall<void>(`/publications/${id}`, "DELETE");

// --- Projects API ---
export const fetchProjects = async (): Promise<Project[]> =>
  apiCall<Project[]>("/projects");
export const createProject = async (proj: Project): Promise<Project> =>
  apiCall<Project>("/projects", "POST", proj);
export const updateProject = async (proj: Project): Promise<Project> =>
  apiCall<Project>(`/projects/${proj.id}`, "PUT", proj);
export const deleteProject = async (id: string): Promise<void> =>
  apiCall<void>(`/projects/${id}`, "DELETE");

// --- Contact (Site Settings) API ---
// Fetch contact can cache, but saves should clear it
export const fetchContact = async (): Promise<ContactInfo> =>
  apiCall<ContactInfo>("/contact");
export const saveContact = async (contact: ContactInfo): Promise<ContactInfo> =>
  apiCall<ContactInfo>("/contact", "POST", contact);

// --- Export Helper ---
export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((fieldName) => {
          const val = row[fieldName];
          if (typeof val === "object")
            return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          return JSON.stringify(val, (key, value) =>
            value === null ? "" : value
          );
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
