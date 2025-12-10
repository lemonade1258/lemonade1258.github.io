import React, { useState, useEffect } from "react";
import { getNews, saveNews, exportToCSV } from "../../lib/dataStore";
import { NewsItem } from "../../types";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Download,
  Save,
  X,
  Globe,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const NewsManager: React.FC = () => {
  const { t } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filtered, setFiltered] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Editor State
  const [editingItem, setEditingItem] = useState<Partial<NewsItem>>({});
  const [activeTab, setActiveTab] = useState<"zh" | "en">("zh");

  useEffect(() => {
    const data = getNews();
    setNews(data);
    setFiltered(data);
  }, []);

  useEffect(() => {
    const results = news.filter((item) => {
      const titleEn = item.title ? item.title.toLowerCase() : "";
      const titleZh = item.titleZh ? item.titleZh.toLowerCase() : "";
      const term = searchTerm.toLowerCase();
      return (
        titleEn.includes(term) ||
        titleZh.includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    });
    setFiltered(results);
  }, [searchTerm, news]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const updated = news.filter((n) => n.id !== id);
      setNews(updated);
      saveNews(updated);
    }
  };

  const handleSave = () => {
    // Validation: Title in at least one language is required
    if (!editingItem.title && !editingItem.titleZh) {
      alert("Please provide a title in at least one language.");
      return;
    }

    let updated: NewsItem[];
    if (editingItem.id) {
      updated = news.map((n) =>
        n.id === editingItem.id ? ({ ...n, ...editingItem } as NewsItem) : n
      );
    } else {
      const newItem = {
        ...editingItem,
        id: Date.now().toString(),
        date: editingItem.date || new Date().toLocaleDateString(),
      } as NewsItem;
      updated = [newItem, ...news];
    }
    setNews(updated);
    saveNews(updated);
    setIsModalOpen(false);
    setEditingItem({});
  };

  const openModal = (item?: NewsItem) => {
    // Default to 'zh' tab for new items, or whatever logical default
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
            onClick={() => exportToCSV(news, "news_export.csv")}
            className="flex items-center px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
          >
            <Download size={16} className="mr-2" /> {t("admin.export")}
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700"
          >
            <Plus size={16} className="mr-2" /> {t("admin.add")}
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
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-brand-red"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
              <th className="p-4 border-b">Date</th>
              <th className="p-4 border-b">Title (ZH / EN)</th>
              <th className="p-4 border-b">Category</th>
              <th className="p-4 border-b text-right">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">
                  {t("common.noData")}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 border-b last:border-0"
                >
                  <td className="p-4 text-sm text-slate-500 font-mono">
                    {item.date}
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    <div className="text-sm">
                      {item.titleZh || (
                        <span className="text-slate-400 italic">
                          No Chinese Title
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.title || (
                        <span className="text-slate-400 italic">
                          No English Title
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(item)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h3 className="text-xl font-bold">
                {editingItem.id ? t("admin.edit") : t("admin.add")}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 flex-grow overflow-y-auto">
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("news.category")}
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
                    placeholder="e.g., May 15, 2024"
                    value={editingItem.date || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, date: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cover Image URL
                  </label>
                  <input
                    value={editingItem.coverImage || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        coverImage: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Language Tabs */}
              <div className="border rounded-md overflow-hidden">
                <div className="flex border-b bg-slate-50">
                  <button
                    onClick={() => setActiveTab("zh")}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                      activeTab === "zh"
                        ? "bg-white border-t-2 border-t-brand-red text-brand-dark"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span className="text-lg">🇨🇳</span> {t("admin.tabZh")}
                  </button>
                  <button
                    onClick={() => setActiveTab("en")}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                      activeTab === "en"
                        ? "bg-white border-t-2 border-t-brand-red text-brand-dark"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span className="text-lg">🇺🇸</span> {t("admin.tabEn")}
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("admin.titleLabel")} (
                      {activeTab === "zh" ? "Chinese" : "English"})
                    </label>
                    <input
                      value={
                        activeTab === "zh"
                          ? editingItem.titleZh || ""
                          : editingItem.title || ""
                      }
                      onChange={(e) => {
                        if (activeTab === "zh")
                          setEditingItem({
                            ...editingItem,
                            titleZh: e.target.value,
                          });
                        else
                          setEditingItem({
                            ...editingItem,
                            title: e.target.value,
                          });
                      }}
                      className="w-full p-2 border rounded focus:ring-1 focus:ring-brand-red"
                      placeholder={
                        activeTab === "zh"
                          ? "请输入中文标题"
                          : "Enter English Title"
                      }
                    />
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("admin.summaryLabel")} (
                      {activeTab === "zh" ? "Chinese" : "English"})
                    </label>
                    <textarea
                      rows={3}
                      value={
                        activeTab === "zh"
                          ? editingItem.summaryZh || ""
                          : editingItem.summary || ""
                      }
                      onChange={(e) => {
                        if (activeTab === "zh")
                          setEditingItem({
                            ...editingItem,
                            summaryZh: e.target.value,
                          });
                        else
                          setEditingItem({
                            ...editingItem,
                            summary: e.target.value,
                          });
                      }}
                      className="w-full p-2 border rounded focus:ring-1 focus:ring-brand-red"
                      placeholder={
                        activeTab === "zh" ? "简短摘要..." : "Short summary..."
                      }
                    />
                  </div>

                  {/* HTML Content */}
                  <div>
                    <label className="block text-sm font-medium mb-1 flex justify-between">
                      <span>{t("admin.contentLabel")}</span>
                      <span className="text-xs text-slate-400 font-normal">
                        Supported: &lt;p&gt;, &lt;h3&gt;, &lt;img&gt;,
                        &lt;table&gt;...
                      </span>
                    </label>
                    <textarea
                      rows={12}
                      value={
                        activeTab === "zh"
                          ? editingItem.contentZh || ""
                          : editingItem.content || ""
                      }
                      onChange={(e) => {
                        if (activeTab === "zh")
                          setEditingItem({
                            ...editingItem,
                            contentZh: e.target.value,
                          });
                        else
                          setEditingItem({
                            ...editingItem,
                            content: e.target.value,
                          });
                      }}
                      className="w-full p-4 border rounded font-mono text-xs bg-slate-50 focus:ring-1 focus:ring-brand-red leading-relaxed"
                      placeholder={
                        activeTab === "zh"
                          ? "<p>在此输入HTML内容...</p>"
                          : "<p>Enter HTML content here...</p>"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded"
              >
                {t("admin.cancel")}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brand-red text-white rounded flex items-center"
              >
                <Save size={16} className="mr-2" /> {t("admin.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManager;
