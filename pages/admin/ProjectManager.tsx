import React, { useState, useEffect } from "react";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  exportToCSV,
} from "../../lib/dataStore";
import { Project, ProjectLink } from "../../types";
import { Plus, Trash2, Edit2, Download, X, Save } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const ProjectManager: React.FC = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Project>>({});
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data.sort((a, b) => (a.order || 99) - (b.order || 99)));
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
    let newItem = { ...editingItem } as Project;
    // ensure links array
    if (!newItem.links) newItem.links = [];

    setIsLoading(true);
    try {
      if (!newItem.id) newItem.id = Date.now().toString();

      if (editingItem.id) {
        await updateProject(newItem);
      } else {
        await createProject(newItem);
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
    if (confirm("Delete this project?")) {
      try {
        await deleteProject(id);
        refreshData();
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const openModal = (item?: Project) => {
    if (item) {
      setEditingItem(item);
    } else {
      setEditingItem({ order: 1, links: [] });
    }
    setIsModalOpen(true);
  };

  const addLink = () => {
    setEditingItem((prev) => ({
      ...prev,
      links: [...(prev.links || []), { label: "Other", url: "" }],
    }));
  };

  const updateLink = (
    index: number,
    field: keyof ProjectLink,
    value: string
  ) => {
    const newLinks = [...(editingItem.links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setEditingItem({ ...editingItem, links: newLinks });
  };

  const removeLink = (index: number) => {
    const newLinks = [...(editingItem.links || [])];
    newLinks.splice(index, 1);
    setEditingItem({ ...editingItem, links: newLinks });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(projects, "projects.csv")}
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

      <div className="flex-grow overflow-auto space-y-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="border p-4 rounded flex justify-between items-center hover:bg-slate-50"
          >
            <div className="flex gap-4 items-center">
              {p.image && (
                <img
                  src={p.image}
                  className="w-16 h-10 object-cover rounded"
                  alt="thumb"
                />
              )}
              <div>
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-xs text-slate-500 truncate w-64">
                  {p.description}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal(p)}
                className="p-2 bg-blue-50 text-blue-600 rounded"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-2 bg-red-50 text-red-600 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">
                {editingItem.id ? "Edit Project" : "Add Project"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    className="w-full p-2 border rounded"
                    value={editingItem.title || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={editingItem.order}
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
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full p-2 border rounded"
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image URL
                </label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingItem.image || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, image: e.target.value })
                  }
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Links</label>
                  <button
                    onClick={addLink}
                    className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200"
                  >
                    + Add Link
                  </button>
                </div>
                {editingItem.links?.map((link, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select
                      className="p-2 border rounded text-sm w-32"
                      value={link.label}
                      onChange={(e) => updateLink(idx, "label", e.target.value)}
                    >
                      <option>Try Online</option>
                      <option>GitHub</option>
                      <option>Model</option>
                      <option>Dataset</option>
                      <option>Paper</option>
                      <option>Other</option>
                    </select>
                    <input
                      className="flex-grow p-2 border rounded text-sm"
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateLink(idx, "url", e.target.value)}
                    />
                    <button
                      onClick={() => removeLink(idx)}
                      className="text-red-500 p-2 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
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

export default ProjectManager;
