import React, { useState, useEffect } from "react";
import {
  fetchPublications,
  createPublication,
  updatePublication,
  deletePublication,
  exportToCSV,
} from "../../lib/dataStore";
import { Publication } from "../../types";
import { Plus, Trash2, Edit2, Download, X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const PublicationManager: React.FC = () => {
  const { t } = useLanguage();
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Publication>>({});
  const [authorsInput, setAuthorsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      if (!newItem.id) newItem.id = Date.now().toString();

      if (editingItem.id) {
        await updatePublication(newItem);
      } else {
        await createPublication(newItem);
      }
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      alert("Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this publication?")) {
      try {
        await deletePublication(id);
        refreshData();
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const openModal = (item?: Publication) => {
    if (item) {
      setEditingItem(item);
      setAuthorsInput(item.authors.join("; "));
      setTagsInput(item.tags?.join("; ") || "");
    } else {
      setEditingItem({ year: new Date().getFullYear() });
      setAuthorsInput("");
      setTagsInput("");
    }
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Publications</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(pubs, "pubs.csv")}
            className="px-4 py-2 border rounded hover:bg-slate-50 flex items-center"
          >
            <Download size={16} className="mr-2" /> Export
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700 flex items-center"
          >
            <Plus size={16} className="mr-2" /> Add New
          </button>
        </div>
      </div>

      {isLoading && <div className="text-center py-4">Loading...</div>}

      <div className="flex-grow overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase sticky top-0">
            <tr>
              <th className="p-3 border-b">Year</th>
              <th className="p-3 border-b">Title</th>
              <th className="p-3 border-b">Conference</th>
              <th className="p-3 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pubs.map((pub) => (
              <tr key={pub.id} className="hover:bg-slate-50 border-b">
                <td className="p-3 font-mono text-sm">{pub.year}</td>
                <td className="p-3 font-medium">{pub.title}</td>
                <td className="p-3 text-sm text-slate-500">{pub.conference}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => openModal(pub)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 mr-2 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(pub.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">
                {editingItem.id ? "Edit Publication" : "Add Publication"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingItem.title || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Conference / Journal
                  </label>
                  <input
                    className="w-full p-2 border rounded"
                    value={editingItem.conference || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        conference: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Authors (Separated by semicolon ';')
                </label>
                <input
                  className="w-full p-2 border rounded"
                  value={authorsInput}
                  onChange={(e) => setAuthorsInput(e.target.value)}
                  placeholder="Zhang, W.; Li, J."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tags (Separated by semicolon ';')
                </label>
                <input
                  className="w-full p-2 border rounded"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="NLP; CV"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Link URL (Optional)
                </label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingItem.link || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, link: e.target.value })
                  }
                  placeholder="https://arxiv.org/..."
                />
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brand-red text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationManager;
