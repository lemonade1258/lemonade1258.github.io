import { NewsItem, Person, Publication, ContactInfo, Project } from "../types";
import * as StaticData from "../constants";

/**
 * 静态化数据层 (Pure Static Data Store)
 * 没有任何 fetch 请求，适配 GitHub Pages。
 * 如果你想在不运行 python 脚本的情况下更新，可以将 json 内容放在根目录下的 db.json
 */

// Internal cache for dynamically loaded JSON
let dynamicDb: any = null;

const getSource = async () => {
  if (dynamicDb) return dynamicDb;

  // Optional: Try to fetch a db.json from the root if constants is empty
  // This allows the user to just drop a json file and name it db.json
  if (StaticData.PEOPLE.length === 0) {
    try {
      const resp = await fetch("./db.json");
      if (resp.ok) {
        dynamicDb = await resp.json();
        return dynamicDb;
      }
    } catch (e) {
      console.warn("db.json not found, using empty constants.");
    }
  }
  return StaticData;
};

// --- News ---
export const fetchNews = async (): Promise<NewsItem[]> => {
  const data = await getSource();
  const list = data.NEWS || data.news || [];
  return [...list].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if ((a.order || 0) !== (b.order || 0))
      return (a.order || 0) - (b.order || 0);
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

export const fetchNewsItem = async (id: string): Promise<NewsItem | null> => {
  const news = await fetchNews();
  return news.find((item) => item.id === id) || null;
};

export const trackNewsView = async (id: string): Promise<void> => {
  console.debug(`[Static View] News ID: ${id}`);
};

// --- People ---
export const fetchPeople = async (): Promise<Person[]> => {
  const data = await getSource();
  const list = data.PEOPLE || data.people || [];
  return [...list].sort((a, b) => (a.order || 99) - (b.order || 99));
};

// --- Publications ---
export const fetchPublications = async (): Promise<Publication[]> => {
  const data = await getSource();
  const list = data.PUBLICATIONS || data.publications || [];
  return [...list].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return (a.order || 0) - (b.order || 0);
  });
};

// --- Projects ---
export const fetchProjects = async (): Promise<Project[]> => {
  const data = await getSource();
  const list = data.PROJECTS || data.projects || [];
  return [...list].sort((a, b) => (a.order || 99) - (b.order || 99));
};

// --- Contact ---
export const fetchContact = async (): Promise<ContactInfo> => {
  const data = await getSource();
  const contact = data.CONTACT || data.contact || data.CONTACT_DEFAULTS;
  return contact || StaticData.CONTACT_DEFAULTS;
};

// --- 静态模式写操作警告 ---
const showStaticAlert = () => {
  console.warn("Write operations are disabled in GitHub Static Mode.");
  alert(
    "提示：当前为 GitHub 静态模式。网页上的修改无法保存到服务器。\n\n方案 1：运行 python import_data.py (推荐)\n方案 2：将备份 JSON 文件重命名为 db.json 放在项目根目录。",
  );
};

export const createNews = async (item: NewsItem) => {
  showStaticAlert();
  return item;
};
export const updateNews = async (item: NewsItem) => {
  showStaticAlert();
  return item;
};
export const deleteNews = async (id: string) => {
  showStaticAlert();
};

export const createPerson = async (item: Person) => {
  showStaticAlert();
  return item;
};
export const updatePerson = async (item: Person) => {
  showStaticAlert();
  return item;
};
export const deletePerson = async (id: string) => {
  showStaticAlert();
};

export const createPublication = async (item: Publication) => {
  showStaticAlert();
  return item;
};
export const updatePublication = async (item: Publication) => {
  showStaticAlert();
  return item;
};
export const deletePublication = async (id: string) => {
  showStaticAlert();
};

export const createProject = async (item: Project) => {
  showStaticAlert();
  return item;
};
export const updateProject = async (item: Project) => {
  showStaticAlert();
  return item;
};
export const deleteProject = async (id: string) => {
  showStaticAlert();
};

export const saveContact = async (data: ContactInfo) => {
  showStaticAlert();
  return data;
};

export const loginAdmin = async (
  u: string,
  p: string,
): Promise<{ success: boolean; token?: string; message?: string }> => {
  return { success: true, token: "static_mode_token" };
};

export const uploadFile = async (file: File): Promise<string> => {
  return URL.createObjectURL(file);
};

export const clearCache = () => {};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((item) => Object.values(item).join(","));
  const csvContent =
    "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", filename);
  link.click();
};
