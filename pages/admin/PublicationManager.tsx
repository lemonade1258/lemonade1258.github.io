import React, { useState, useEffect } from "react";
import {
  fetchPublications,
  createPublication,
  updatePublication,
  deletePublication,
  exportToCSV,
} from "../../lib/dataStore";
import { Publication } from "../../types";
import {
  Plus,
  Trash2,
  Edit2,
  Download,
  X,
  Save,
  Clipboard,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const PublicationManager: React.FC = () => {
  const { t } = useLanguage();
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Publication>>({});
  const [authorsInput, setAuthorsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Batch Import States
  const [batchText, setBatchText] = useState("");
  const [batchPreview, setBatchPreview] = useState<Partial<Publication>[]>([]);
  const [importStatus, setImportStatus] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPublications();
      setPubs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSave = async () => {
    let newItem = { ...editingItem } as Publication;

    // Process Arrays
    newItem.authors = authorsInput
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    newItem.tags = tagsInput
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    setIsLoading(true);
    try {
      if (!newItem.id) newItem.id = `pub_${Date.now()}`;

      if (editingItem.id) {
        await updatePublication(newItem);
      } else {
        await createPublication(newItem);
      }
      setIsModalOpen(false);
      refreshData();
      alert("保存成功！");
    } catch (err) {
      alert("保存失败，请检查网络或后端状态");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Batch Import Logic ---
  const parseBatchText = () => {
    if (!batchText.trim()) {
      setBatchPreview([]);
      return;
    }

    const lines = batchText.trim().split("\n");
    const results: Partial<Publication>[] = [];

    lines.forEach((line, idx) => {
      // Detect split char: Tab (Excel) or Comma
      const parts = line.includes("\t") ? line.split("\t") : line.split(",");

      if (parts.length >= 5) {
        const [authors, title, link, type, year, venue] = parts.map((p) =>
          p.trim()
        );
        results.push({
          id: `batch_${Date.now()}_${idx}`,
          authors: authors.split(";").map((a) => a.trim()),
          title,
          link,
          type:
            type.includes("期刊") || type.toLowerCase().includes("journal")
              ? "Journal"
              : "Conference",
          year: parseInt(year) || new Date().getFullYear(),
          venue: venue || "",
          tags: [],
          order: 0,
        });
      }
    });
    setBatchPreview(results);
  };

  const handleBatchImport = async () => {
    if (!batchPreview.length) return;

    setIsLoading(true);
    let successCount = 0;
    setImportStatus({ current: 0, total: batchPreview.length });

    try {
      for (let i = 0; i < batchPreview.length; i++) {
        const item = batchPreview[i] as Publication;
        await createPublication(item);
        successCount++;
        setImportStatus({ current: successCount, total: batchPreview.length });
      }
      alert(`导入完成！共成功导入 ${successCount} 条文献。`);
      setBatchText("");
      setBatchPreview([]);
      setIsBatchOpen(false);
      refreshData();
    } catch (err) {
      alert("批量导入中断，部分数据可能已存入。");
    } finally {
      setIsLoading(false);
      setImportStatus(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这条文献记录吗？")) {
      try {
        await deletePublication(id);
        refreshData();
      } catch (err) {
        alert("删除失败");
      }
    }
  };

  const openModal = (item?: Publication) => {
    if (item) {
      setEditingItem(item);
      setAuthorsInput(item.authors.join("; "));
      setTagsInput(item.tags?.join("; ") || "");
    } else {
      setEditingItem({
        year: new Date().getFullYear(),
        type: "Conference",
        order: 0,
      });
      setAuthorsInput("");
      setTagsInput("");
    }
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            论文发表管理
            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {pubs.length} 条记录
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            管理实验室的所有研究成果，支持批量从 Excel 导入。
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportToCSV(pubs, "publications.csv")}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-sm"
          >
            <Download size={16} className="mr-2" /> 导出
          </button>
          <button
            onClick={() => setIsBatchOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 flex items-center justify-center transition-all shadow-md"
          >
            <Clipboard size={16} className="mr-2" /> 批量导入
          </button>
          <button
            onClick={() => openModal()}
            className="flex-1 sm:flex-none px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700 flex items-center justify-center transition-all shadow-md"
          >
            <Plus size={16} className="mr-2" /> 新增文献
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-auto border rounded-lg border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest sticky top-0 z-10">
            <tr>
              <th className="p-4 border-b">年份</th>
              <th className="p-4 border-b">类型</th>
              <th className="p-4 border-b">文献题目</th>
              <th className="p-4 border-b">会议/期刊</th>
              <th className="p-4 border-b text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400">
                  加载数据中...
                </td>
              </tr>
            ) : (
              pubs.map((pub) => (
                <tr
                  key={pub.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4 font-mono text-sm text-slate-500">
                    {pub.year}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        pub.type === "Journal"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-red-50 text-brand-red"
                      }`}
                    >
                      {pub.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800 truncate max-w-md">
                      {pub.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 truncate max-w-md">
                      {pub.authors.join(", ")}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500 font-medium italic">
                    {pub.venue}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(pub)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(pub.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Batch Import Modal */}
      {isBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  批量导入文献
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  支持从 Excel/WPS
                  直接复制粘贴数据。格式：作者、题目、链接、类型、年份、会议/期刊。
                </p>
              </div>
              <button
                onClick={() => setIsBatchOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
              {/* Left: Editor */}
              <div className="flex-1 p-6 border-r flex flex-col">
                <label className="block text-sm font-bold text-slate-400 uppercase mb-4">
                  粘贴区域 (Tab/逗号分隔)
                </label>
                <textarea
                  className="flex-grow w-full p-4 border rounded-xl font-mono text-xs bg-slate-50 focus:ring-2 focus:ring-brand-red outline-none transition-all"
                  placeholder="示例：Zhang, W.; Li, J.	Deep Learning...	https://...	期刊	2024	CVPR"
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                />
                <button
                  onClick={parseBatchText}
                  className="mt-4 w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
                >
                  <RefreshCw size={18} /> 解析并预览内容
                </button>
              </div>

              {/* Right: Preview */}
              <div className="flex-1 p-6 bg-slate-50/50 flex flex-col overflow-hidden">
                <label className="block text-sm font-bold text-slate-400 uppercase mb-4">
                  解析结果预览 ({batchPreview.length})
                </label>
                <div className="flex-grow overflow-auto space-y-3">
                  {batchPreview.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                      <AlertCircle size={48} strokeWidth={1} className="mb-2" />
                      <p className="text-sm">暂未解析到有效数据</p>
                    </div>
                  ) : (
                    batchPreview.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-xs"
                      >
                        <div className="flex justify-between mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              item.type === "Journal"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-red-50 text-brand-red"
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="font-mono text-slate-400">
                            {item.year}
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-slate-500 mt-1 italic">
                          {item.venue}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
              <div className="text-sm">
                {importStatus && (
                  <div className="flex items-center gap-3 text-brand-red font-bold">
                    <div className="w-4 h-4 border-2 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                    正在导入: {importStatus.current} / {importStatus.total}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsBatchOpen(false)}
                  className="px-6 py-2 text-slate-500 font-medium hover:bg-slate-200 rounded-xl transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleBatchImport}
                  disabled={!batchPreview.length || isLoading}
                  className={`px-10 py-2 bg-brand-red text-white font-bold rounded-xl shadow-lg transition-all ${
                    !batchPreview.length || isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 active:scale-95"
                  }`}
                >
                  确认导入所有数据
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-slate-800">
                {editingItem.id ? "编辑文献详情" : "新增文献记录"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  文献标题 (Title)
                </label>
                <input
                  className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-red outline-none transition-all"
                  value={editingItem.title || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  placeholder="输入论文完整标题"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    发表会议/期刊 (Venue)
                  </label>
                  <input
                    className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-red outline-none transition-all"
                    value={editingItem.venue || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, venue: e.target.value })
                    }
                    placeholder="例如: CVPR 2024"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    发表年份 (Year)
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-red outline-none transition-all"
                    value={editingItem.year || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        year: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    文献类型
                  </label>
                  <select
                    className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-red outline-none transition-all"
                    value={editingItem.type}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        type: e.target.value as any,
                      })
                    }
                  >
                    <option value="Conference">会议 (Conference)</option>
                    <option value="Journal">期刊 (Journal)</option>
                    <option value="Preprint">预印本 (Preprint)</option>
                    <option value="Other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    排序权重 (数字越小越靠前)
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-red outline-none transition-all"
                    value={editingItem.order || 0}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        order: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  作者列表 (Authors, 用分号 ';' 分隔)
                </label>
                <input
                  className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-red outline-none transition-all"
                  value={authorsInput}
                  onChange={(e) => setAuthorsInput(e.target.value)}
                  placeholder="Zhang, W.; Li, J.; Wang, S."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  文献链接 (URL)
                </label>
                <input
                  className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-red outline-none transition-all"
                  value={editingItem.link || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, link: e.target.value })
                  }
                  placeholder="https://arxiv.org/..."
                />
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-slate-500 font-medium hover:bg-slate-200 rounded-xl transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-10 py-2 bg-brand-red text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all active:scale-95"
              >
                保存更改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationManager;
