import React, { useState, useEffect, useRef } from "react";
import {
  fetchPeople,
  createPerson,
  updatePerson,
  deletePerson,
  exportToCSV,
  uploadFile,
} from "../../lib/dataStore";
import { Person, PersonCategory } from "../../types";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Download,
  Save,
  X,
  AlertTriangle,
  Upload,
  ZoomIn,
  ZoomOut,
  Move,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * Image Cropper Modal Component
 */
const ImageCropperModal: React.FC<{
  imageSrc: string;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}> = ({ imageSrc, onConfirm, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleConfirm = () => {
    if (!imageRef.current || !containerRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // We want a square crop (1:1)
    const size = 600;
    canvas.width = size;
    canvas.height = size;

    const img = imageRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Calculate how the image is drawn onto the canvas based on zoom and offset
    // The "viewport" is the center square of the container
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const cropSize = Math.min(rect.width, rect.height) * 0.8; // The visual box size

    // Transform logic:
    // 1. Move to canvas center
    ctx.translate(size / 2, size / 2);
    // 2. Scale
    ctx.scale((size / cropSize) * zoom, (size / cropSize) * zoom);
    // 3. Move by user offset (relative to original image center)
    ctx.translate(offset.x / zoom, offset.y / zoom);
    // 4. Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    canvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Edit2 size={18} className="text-brand-red" /> 编辑成员照片
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div
          className="bg-slate-100 relative h-[400px] overflow-hidden cursor-move"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="To crop"
            draggable={false}
            className="absolute transition-transform duration-75 select-none"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: "center",
            }}
          />

          {/* Overlay Grid */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[320px] h-[320px] border-2 border-brand-red shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] relative">
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border-r border-white"></div>
                ))}
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border-b border-white"></div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center pointer-events-none">
            <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold flex items-center gap-1">
              <Move size={10} /> 拖拽调整位置，滑块缩放
            </span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-6">
            <ZoomOut size={18} className="text-slate-400" />
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-grow accent-brand-red"
            />
            <ZoomIn size={18} className="text-slate-400" />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-xl transition-all"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="px-10 py-2 bg-brand-red text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all active:scale-95 flex items-center gap-2"
            >
              确认裁剪并应用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PeopleManager: React.FC = () => {
  const { t } = useLanguage();
  const [people, setPeople] = useState<Person[]>([]);
  const [filtered, setFiltered] = useState<Person[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Person>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cropper State
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // Helpers for Teacher Profile Arrays (English)
  const [researchInput, setResearchInput] = useState("");
  const [achieveInput, setAchieveInput] = useState("");
  const [projectInput, setProjectInput] = useState("");
  const [influenceInput, setInfluenceInput] = useState("");

  // Helpers for Teacher Profile Arrays (Chinese)
  const [researchInputZh, setResearchInputZh] = useState("");
  const [achieveInputZh, setAchieveInputZh] = useState("");
  const [projectInputZh, setProjectInputZh] = useState("");
  const [influenceInputZh, setInfluenceInputZh] = useState("");

  const refreshData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchPeople();
      setPeople(data);
      setFiltered(data);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Failed to fetch data");
      setPeople([]);
      setFiltered([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (activeCategory === "All") {
      setFiltered(people);
    } else {
      setFiltered(people.filter((p) => p.category === activeCategory));
    }
  }, [people, activeCategory]);

  const handleSave = async () => {
    let newItem = { ...editingItem } as Person;

    if (
      newItem.category === "Teachers" ||
      newItem.category === "Visiting Scholars"
    ) {
      if (!newItem.teacherProfile)
        newItem.teacherProfile = {
          position: "",
          researchAreas: [],
          achievements: [],
          projects: [],
        };

      newItem.teacherProfile.researchAreas = researchInput
        .split("\n")
        .filter((s) => s.trim());
      newItem.teacherProfile.achievements = achieveInput
        .split("\n")
        .filter((s) => s.trim());
      newItem.teacherProfile.projects = projectInput
        .split("\n")
        .filter((s) => s.trim());
      newItem.teacherProfile.influence = influenceInput
        .split("\n")
        .filter((s) => s.trim());

      newItem.teacherProfile.researchAreasZh = researchInputZh
        .split("\n")
        .filter((s) => s.trim());
      newItem.teacherProfile.achievementsZh = achieveInputZh
        .split("\n")
        .filter((s) => s.trim());
      newItem.teacherProfile.projectsZh = projectInputZh
        .split("\n")
        .filter((s) => s.trim());
      newItem.teacherProfile.influenceZh = influenceInputZh
        .split("\n")
        .filter((s) => s.trim());
    }

    setIsLoading(true);
    try {
      if (!newItem.id) newItem.id = Date.now().toString();

      if (editingItem.id) {
        await updatePerson(newItem);
      } else {
        await createPerson(newItem);
      }
      setIsModalOpen(false);
      setEditingItem({});
      refreshData();
    } catch (err: any) {
      alert(`Failed to save person: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropConfirm = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const file = new File([blob], `avatar_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const url = await uploadFile(file);
      setEditingItem((prev) => ({ ...prev, avatar: url }));
      setCropSrc(null);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this person?")) {
      try {
        await deletePerson(id);
        refreshData();
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const openModal = (item?: Person) => {
    const freshItem: Partial<Person> = item || {
      category: "Teachers",
      order: 1,
      avatar: "https://ui-avatars.com/api/?name=User",
      teacherProfile: {
        position: "",
        researchAreas: [],
        achievements: [],
        projects: [],
        influence: [],
        researchAreasZh: [],
        achievementsZh: [],
        projectsZh: [],
        influenceZh: [],
      },
    };

    setEditingItem(freshItem);

    if (freshItem.teacherProfile) {
      setResearchInput(
        freshItem.teacherProfile.researchAreas?.join("\n") || ""
      );
      setAchieveInput(freshItem.teacherProfile.achievements?.join("\n") || "");
      setProjectInput(freshItem.teacherProfile.projects?.join("\n") || "");
      setInfluenceInput(freshItem.teacherProfile.influence?.join("\n") || "");
      setResearchInputZh(
        freshItem.teacherProfile.researchAreasZh?.join("\n") || ""
      );
      setAchieveInputZh(
        freshItem.teacherProfile.achievementsZh?.join("\n") || ""
      );
      setProjectInputZh(freshItem.teacherProfile.projectsZh?.join("\n") || "");
      setInfluenceInputZh(
        freshItem.teacherProfile.influenceZh?.join("\n") || ""
      );
    } else {
      setResearchInput("");
      setAchieveInput("");
      setProjectInput("");
      setInfluenceInput("");
      setResearchInputZh("");
      setAchieveInputZh("");
      setProjectInputZh("");
      setInfluenceInputZh("");
    }

    setIsModalOpen(true);
  };

  const categories: PersonCategory[] = [
    "Teachers",
    "Visiting Scholars",
    "PhD",
    "Academic Master",
    "Professional Master",
    "Master",
    "RA",
    "Intern",
    "Secretary",
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {t("admin.people")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(filtered, "people.csv")}
            className="px-4 py-2 border rounded hover:bg-slate-50 flex items-center transition-colors"
          >
            <Download size={16} className="mr-2" /> Export
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700 flex items-center transition-all shadow-md"
          >
            <Plus size={16} className="mr-2" /> {t("admin.add")}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeCategory === "All"
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeCategory === c
                ? "bg-brand-red text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-10 animate-pulse text-slate-400 font-serif">
          Loading laboratory personnel...
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 flex items-center shadow-sm">
          <AlertTriangle className="mr-2 shrink-0" size={18} />
          <span className="text-sm">Connection Error: {errorMsg}</span>
        </div>
      )}

      <div className="flex-grow overflow-auto">
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20 text-slate-300 italic border-2 border-dashed border-slate-100 rounded-2xl">
            No people found in this category.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((person) => (
            <div
              key={person.id}
              className="border border-slate-100 rounded-xl p-5 flex gap-5 items-start relative group bg-white hover:shadow-xl hover:border-brand-red/10 transition-all duration-300"
            >
              <img
                src={person.avatar}
                alt={person.name}
                className="w-16 h-16 rounded-full object-cover bg-slate-100 border border-slate-50 shadow-inner"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://ui-avatars.com/api/?name=" + person.name;
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-slate-800 text-lg truncate group-hover:text-brand-red transition-colors">
                  {person.nameZh || person.name}
                </h3>
                <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest mb-1">
                  {person.category}
                </p>
                <p className="text-xs text-slate-400 truncate font-light italic">
                  {person.title || "Researcher"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openModal(person)}
                  className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(person.id)}
                  className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b shrink-0 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingItem.id ? "Edit Researcher" : "New Member"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8 flex-grow">
              {/* Photo & Basic Info */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative group bg-slate-100">
                    <img
                      src={editingItem.avatar}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <label className="relative cursor-pointer group">
                    <div className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-full flex items-center gap-2 hover:bg-brand-red transition-all shadow-md active:scale-95">
                      <Upload size={14} /> 上传并裁剪照片
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 max-w-[150px] text-center font-light">
                    建议使用高清原图，裁剪后将自动保存为正方形。
                  </p>
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Category / 分类
                      </label>
                      <select
                        value={editingItem.category}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            category: e.target.value as PersonCategory,
                          })
                        }
                        className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-brand-red outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Sort Priority / 排序权重
                      </label>
                      <input
                        type="number"
                        value={editingItem.order}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            order: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Name / 姓名
                    </label>
                    <input
                      placeholder="Name (English)"
                      value={editingItem.name || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                      className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm mb-3"
                    />
                    <input
                      placeholder="姓名 (中文)"
                      value={editingItem.nameZh || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          nameZh: e.target.value,
                        })
                      }
                      className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Title / 职位
                    </label>
                    <input
                      placeholder="Title (e.g. Professor)"
                      value={editingItem.title || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          title: e.target.value,
                        })
                      }
                      className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm mb-3"
                    />
                    <input
                      placeholder="职位 (如：教授)"
                      value={editingItem.titleZh || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          titleZh: e.target.value,
                        })
                      }
                      className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    value={editingItem.email || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, email: e.target.value })
                    }
                    className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm"
                    placeholder="example@whu.edu.cn"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Homepage
                  </label>
                  <input
                    value={editingItem.homepage || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        homepage: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Teacher Profile Section - Only show for Teachers/Visiting */}
              {["Teachers", "Visiting Scholars"].includes(
                editingItem.category as string
              ) && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-brand-red uppercase tracking-widest flex items-center gap-2">
                    <Plus size={14} /> Researcher Extended Profile
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                        Academic Position (English)
                      </label>
                      <input
                        value={editingItem.teacherProfile?.position || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            teacherProfile: {
                              ...editingItem.teacherProfile!,
                              position: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                        学术头衔 (中文)
                      </label>
                      <input
                        value={editingItem.teacherProfile?.positionZh || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            teacherProfile: {
                              ...editingItem.teacherProfile!,
                              positionZh: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 border rounded-xl bg-slate-50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                        Research Areas (EN) - Line split
                      </label>
                      <textarea
                        value={researchInput}
                        onChange={(e) => setResearchInput(e.target.value)}
                        className="w-full p-3 border rounded-xl text-xs font-mono bg-slate-50 leading-relaxed"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                        研究领域 (中文) - 换行分隔
                      </label>
                      <textarea
                        value={researchInputZh}
                        onChange={(e) => setResearchInputZh(e.target.value)}
                        className="w-full p-3 border rounded-xl text-xs font-mono bg-slate-50 leading-relaxed"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                        Achievements (EN) - Line split
                      </label>
                      <textarea
                        value={achieveInput}
                        onChange={(e) => setAchieveInput(e.target.value)}
                        className="w-full p-3 border rounded-xl text-xs font-mono bg-slate-50"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                        代表性成果 (中文)
                      </label>
                      <textarea
                        value={achieveInputZh}
                        onChange={(e) => setAchieveInputZh(e.target.value)}
                        className="w-full p-3 border rounded-xl text-xs font-mono bg-slate-50"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-slate-50/50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-slate-500 font-medium hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-10 py-2 bg-brand-red text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all active:scale-95"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {cropSrc && (
        <ImageCropperModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  );
};

export default PeopleManager;
