import { NewsItem, Person, Publication, ContactInfo } from "../types";

// Configuration
// CHANGE THIS: Pointing to your Alibaba Cloud Server IP
const API_BASE_URL = "http://59.110.163.47:5000/api";

// --- Helper for Fetch ---
async function apiCall<T>(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<T> {
  // Get token from storage
  const token = localStorage.getItem("admin_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    // Add Authorization header if token exists
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    // CRITICAL: Force browser to fetch fresh data from server
    cache: "no-store",
  };

  try {
    // Add timestamp to URL to strictly bust cache
    const url =
      method === "GET"
        ? `${API_BASE_URL}${endpoint}?t=${Date.now()}`
        : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, config);

    // Handle 403 Forbidden (Token expired or invalid)
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

      // If error message looks like HTML (e.g. 500 Nginx/Express error page), simplify it
      if (errorMessage && errorMessage.trim().startsWith("<")) {
        errorMessage = "Server Internal Error. Please check backend logs.";
      }

      throw new Error(errorMessage || response.statusText);
    }
    return await response.json();
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

    // Get raw text first to handle potential HTML responses (like 404 or 500)
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return data;
    } catch (e) {
      // If parsing fails, it implies the server returned HTML (likely 404 Not Found if server wasn't restarted)
      console.error("Login response was not JSON:", text);
      return {
        success: false,
        message: `Server Interface Error (${response.status}). Please restart the backend (pm2 restart clain-api).`,
      };
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
      headers: {
        // Do NOT set Content-Type header for FormData, browser does it automatically with boundary
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errText}`);
    }

    const data = await response.json();

    // Ensure protocol consistency
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
export const fetchNews = async (): Promise<NewsItem[]> => {
  return apiCall<NewsItem[]>("/news");
};

export const fetchNewsItem = async (id: string): Promise<NewsItem> => {
  return apiCall<NewsItem>(`/news/${id}`);
};

export const createNews = async (news: NewsItem): Promise<NewsItem> => {
  return apiCall<NewsItem>("/news", "POST", news);
};

export const updateNews = async (news: NewsItem): Promise<NewsItem> => {
  return apiCall<NewsItem>(`/news/${news.id}`, "PUT", news);
};

export const deleteNews = async (id: string): Promise<void> => {
  return apiCall<void>(`/news/${id}`, "DELETE");
};

// --- People API ---
export const fetchPeople = async (): Promise<Person[]> => {
  return apiCall<Person[]>("/people");
};

export const createPerson = async (person: Person): Promise<Person> => {
  return apiCall<Person>("/people", "POST", person);
};

export const updatePerson = async (person: Person): Promise<Person> => {
  return apiCall<Person>(`/people/${person.id}`, "PUT", person);
};

export const deletePerson = async (id: string): Promise<void> => {
  return apiCall<void>(`/people/${id}`, "DELETE");
};

// --- Publications API ---
export const fetchPublications = async (): Promise<Publication[]> => {
  return apiCall<Publication[]>("/publications");
};

export const createPublication = async (
  pub: Publication
): Promise<Publication> => {
  return apiCall<Publication>("/publications", "POST", pub);
};

export const updatePublication = async (
  pub: Publication
): Promise<Publication> => {
  return apiCall<Publication>(`/publications/${pub.id}`, "PUT", pub);
};

export const deletePublication = async (id: string): Promise<void> => {
  return apiCall<void>(`/publications/${id}`, "DELETE");
};

// --- Contact API ---
export const fetchContact = async (): Promise<ContactInfo> => {
  return apiCall<ContactInfo>("/contact");
};

export const saveContact = async (
  contact: ContactInfo
): Promise<ContactInfo> => {
  return apiCall<ContactInfo>("/contact", "POST", contact);
};

// --- Export Helper (Frontend Only) ---
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
