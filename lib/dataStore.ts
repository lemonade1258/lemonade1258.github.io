import { NEWS, PEOPLE, PUBLICATIONS, CONTACT_DEFAULTS } from "../constants";
import { NewsItem, Person, Publication, ContactInfo } from "../types";

// Initialize data from constants if local storage is empty
const initStore = () => {
  if (!localStorage.getItem("store_news")) {
    localStorage.setItem("store_news", JSON.stringify(NEWS));
  }
  if (!localStorage.getItem("store_people_v2")) {
    localStorage.setItem("store_people_v2", JSON.stringify(PEOPLE));
  }
  if (!localStorage.getItem("store_publications")) {
    localStorage.setItem("store_publications", JSON.stringify(PUBLICATIONS));
  }
  if (!localStorage.getItem("store_contact")) {
    localStorage.setItem("store_contact", JSON.stringify(CONTACT_DEFAULTS));
  }
};

// News
export const getNews = (): NewsItem[] => {
  initStore();
  return JSON.parse(localStorage.getItem("store_news") || "[]");
};

export const saveNews = (news: NewsItem[]) => {
  localStorage.setItem("store_news", JSON.stringify(news));
};

// People
export const getPeople = (): Person[] => {
  initStore();
  return JSON.parse(localStorage.getItem("store_people_v2") || "[]");
};

export const savePeople = (people: Person[]) => {
  localStorage.setItem("store_people_v2", JSON.stringify(people));
};

// Publications
export const getPublications = (): Publication[] => {
  initStore();
  return JSON.parse(localStorage.getItem("store_publications") || "[]");
};

export const savePublications = (pubs: Publication[]) => {
  localStorage.setItem("store_publications", JSON.stringify(pubs));
};

// Contact
export const getContact = (): ContactInfo => {
  initStore();
  return JSON.parse(
    localStorage.getItem("store_contact") || JSON.stringify(CONTACT_DEFAULTS)
  );
};

export const saveContact = (contact: ContactInfo) => {
  localStorage.setItem("store_contact", JSON.stringify(contact));
};

// Helper for CSV Export
export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((fieldName) =>
          JSON.stringify(row[fieldName], (key, value) =>
            value === null ? "" : value
          )
        )
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
