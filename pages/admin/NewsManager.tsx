import React, { useState, useEffect } from "react";
import {
  fetchNews,
  createNews,
  updateNews,
  deleteNews,
  exportToCSV,
} from "../../lib/dataStore";
import { NewsItem } from "../../types";
import { Search, Plus, Trash2, Edit2, Download, Save, X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const NewsManager: React.FC = () => {
  const { t } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filtered, setFiltered] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editingItem, setEditingItem] = useState<Partial<NewsItem>>({});
  const [activeTab, setActiveTab] = useState<"zh" | "en">("zh");

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchNews();
      setNews(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const results = news.filter((item) => {
      const titleEn = item.title ? item.title.toLowerCase() : "";
      const titleZh = item.titleZh ? item.titleZh.toLowerCase() : "";
      const term = searchTerm.toLowerCase();
      return titleEn.includes(term) || titleZh.includes(term);
    });
    setFiltered(results);
  }, [searchTerm, news]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteNews(id);
        refreshData();
      } catch (err: any) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  const handleSave = async () => {
    if (!editingItem.title && !editingItem.titleZh) {
      alert("Please provide a title.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...editingItem,
        // 只有新增时才生成新 ID，编辑时必须保留原有 ID (可能是 ObjectId 字符串)
        id: editingItem.id || `news_${Date.now()}`,
        date:
          editingItem.date ||
          new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
      } as NewsItem;

      if (editingItem.id) {
        await updateNews(payload);
      } else {
        await createNews(payload);
      }
      setIsModalOpen(false);
      setEditingItem({});
      refreshData();
      alert("Saved successfully!");
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (item?: NewsItem) => {
    setActiveTab("zh");
    setEditingItem(
      item || {
        category: "News",
        summary: "",
        summaryZh: "",
        content: "",
        contentZh: "",
      }
    );
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">{t("admin.news")}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(news, "news.csv")}
            className="px-4 py-2 border rounded hover:bg-slate-50 flex items-center"
          >
            <Download size={16} className="mr-2" /> Export
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-brand-red text-white rounded flex items-center"
          >
            <Plus size={16} className="mr-2" /> Add New
          </button>
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t("common.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 border-b">Date</th>
              <th className="p-4 border-b">Title</th>
              <th className="p-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 border-b">
                <td className="p-4 text-sm text-slate-500">{item.date}</td>
                <td className="p-4 font-medium">
                  {item.titleZh || item.title}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => openModal(item)}
                    className="p-1 text-blue-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h3 className="text-xl font-bold">
                {editingItem.id ? "Edit" : "Add"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={editingItem.category || "News"}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option>News</option>
                    <option>Publication</option>
                    <option>Event</option>
                    <option>Award</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="text"
                    value={editingItem.date || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, date: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="border rounded">
                <div className="flex border-b bg-slate-50">
                  <button
                    onClick={() => setActiveTab("zh")}
                    className={`flex-1 py-2 ${
                      activeTab === "zh"
                        ? "bg-white border-t-2 border-brand-red font-bold"
                        : ""
                    }`}
                  >
                    中文
                  </button>
                  <button
                    onClick={() => setActiveTab("en")}
                    className={`flex-1 py-2 ${
                      activeTab === "en"
                        ? "bg-white border-t-2 border-brand-red font-bold"
                        : ""
                    }`}
                  >
                    English
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <input
                    value={
                      activeTab === "zh"
                        ? editingItem.titleZh || ""
                        : editingItem.title || ""
                    }
                    onChange={(e) =>
                      activeTab === "zh"
                        ? setEditingItem({
                            ...editingItem,
                            titleZh: e.target.value,
                          })
                        : setEditingItem({
                            ...editingItem,
                            title: e.target.value,
                          })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Title"
                  />
                  <textarea
                    rows={3}
                    value={
                      activeTab === "zh"
                        ? editingItem.summaryZh || ""
                        : editingItem.summary || ""
                    }
                    onChange={(e) =>
                      activeTab === "zh"
                        ? setEditingItem({
                            ...editingItem,
                            summaryZh: e.target.value,
                          })
                        : setEditingItem({
                            ...editingItem,
                            summary: e.target.value,
                          })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Summary"
                  />
                  <textarea
                    rows={10}
                    value={
                      activeTab === "zh"
                        ? editingItem.contentZh || ""
                        : editingItem.content || ""
                    }
                    onChange={(e) =>
                      activeTab === "zh"
                        ? setEditingItem({
                            ...editingItem,
                            contentZh: e.target.value,
                          })
                        : setEditingItem({
                            ...editingItem,
                            content: e.target.value,
                          })
                    }
                    className="w-full p-2 border rounded font-mono text-sm"
                    placeholder="Content (HTML)"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-brand-red text-white rounded flex items-center"
              >
                <Save size={16} className="mr-2" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManager;
