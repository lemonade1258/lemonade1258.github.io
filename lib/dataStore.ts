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
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // Prevent caching headers
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
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
    if (!response.ok) {
      const errorText = await response.text();
      // Try to parse error as JSON if possible, otherwise use text
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) errorMessage = errorJson.message;
      } catch (e) {}

      // If error message looks like HTML (e.g. 500 Nginx/Express error page), simplify it
      if (errorMessage && errorMessage.trim().startsWith("<")) {
        errorMessage = "Server Internal Error. Please check backend logs.";
      }

      throw new Error(
        `API Error ${response.status}: ${errorMessage || response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error(`Request failed for ${endpoint}:`, error);
    throw error;
  }
}

// --- Upload Helper ---
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errText}`);
    }
    const data = await response.json();
    return data.url; // Returns full URL from backend
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
