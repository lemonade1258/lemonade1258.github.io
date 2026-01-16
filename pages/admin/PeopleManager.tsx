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
  Camera,
  Crop,
  Loader2,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * 核心图片裁剪组件
 * 专门处理 OSS 远程图片的跨域加载与缩放
 */
const ImageCropperModal: React.FC<{
  imageSrc: string;
  isCircle: boolean;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}> = ({ imageSrc, isCircle, onConfirm, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 这里的 timestamp 是为了绕过浏览器缓存，防止 CORS 跨域验证失效
  const [processedSrc] = useState(() => {
    if (!imageSrc) return "";
    if (imageSrc.startsWith("data:")) return imageSrc;
    const connector = imageSrc.includes("?") ? "&" : "?";
    return `${imageSrc}${connector}t=${Date.now()}`;
  });

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

    // 导出统一为 600x600 的正方形图片
    const outputSize = 600;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const img = imageRef.current;
    const uiCropSize = 320;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, outputSize, outputSize);

    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.scale(
      (outputSize / uiCropSize) * zoom,
      (outputSize / uiCropSize) * zoom
    );
    ctx.translate(offset.x / zoom, offset.y / zoom);

    try {
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      canvas.toBlob(
        (blob) => {
          if (blob) onConfirm(blob);
        },
        "image/jpeg",
        0.95
      );
    } catch (e) {
      console.error("Canvas Security Error:", e);
      alert(
        "操作受限：该图片所在的服务器(OSS)未允许当前域名的跨域访问。请在 OSS 后台配置 CORS 规则。"
      );
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              调整照片展示效果
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {isCircle
                ? "【圆形展示模式】请确保面部居中"
                : "【方形展示模式】请调整构图位置"}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={28} />
          </button>
        </div>

        <div
          className="bg-slate-200 relative h-[500px] overflow-hidden cursor-move touch-none flex items-center justify-center"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {!imgLoaded && !loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4 bg-slate-100 z-10">
              <Loader2 className="animate-spin text-brand-red" size={40} />
              <span className="text-xs font-bold uppercase tracking-widest animate-pulse">
                正在从 OSS 载入原始照片...
              </span>
            </div>
          )}

          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 gap-4 bg-red-50 z-20 px-10 text-center">
              <AlertTriangle size={48} />
              <p className="font-bold">图片加载失败</p>
              <p className="text-xs text-red-400">
                可能是由于 OSS
                跨域配置不正确，或者图片链接已失效。请尝试重新上传本地文件。
              </p>
              <button
                onClick={onCancel}
                className="mt-4 px-6 py-2 bg-white border border-red-200 rounded-xl text-sm font-bold shadow-sm"
              >
                返回
              </button>
            </div>
          )}

          <img
            ref={imageRef}
            crossOrigin="anonymous"
            src={processedSrc}
            alt="Original"
            draggable={false}
            onLoad={() => {
              console.log("Cropper image loaded successfully");
              setImgLoaded(true);
            }}
            onError={() => {
              console.error("Failed to load image for cropping");
              setLoadError(true);
            }}
            className={`absolute select-none pointer-events-none transition-opacity duration-700 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: "center",
            }}
          />

          {/* 实时形状蒙版：直接决定最终成片视觉效果 */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className={`w-[320px] h-[320px] border-4 border-white/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.85)] relative transition-all duration-700 ${
                isCircle ? "rounded-full" : "rounded-none"
              }`}
            >
              {/* 辅助网格线：仅在非圆形时更明显 */}
              <div
                className={`absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 transition-opacity ${
                  isCircle ? "opacity-10" : "opacity-20"
                }`}
              >
                <div className="border-r border-white"></div>
                <div className="border-r border-white"></div>
                <div></div>
                <div className="border-b border-white col-span-3"></div>
                <div className="border-b border-white col-span-3"></div>
              </div>

              {!isCircle && (
                <div className="absolute inset-0 border border-brand-red/30">
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-brand-red"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-brand-red"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-brand-red"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-brand-red"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-10 bg-white">
          <div className="flex items-center gap-8 mb-10">
            <ZoomOut size={24} className="text-slate-300" />
            <div className="flex-grow relative h-3 bg-slate-100 rounded-full">
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="absolute top-0 bottom-0 left-0 bg-brand-red rounded-full transition-all"
                style={{ width: `${(zoom / 5) * 100}%` }}
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white border-4 border-brand-red rounded-full shadow-xl pointer-events-none transition-all"
                style={{ left: `calc(${(zoom / 5) * 100}% - 14px)` }}
              ></div>
            </div>
            <ZoomIn size={24} className="text-slate-300" />
          </div>

          <div className="flex justify-end gap-5">
            <button
              onClick={onCancel}
              className="px-10 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all"
            >
              取消更改
            </button>
            <button
              onClick={handleConfirm}
              disabled={!imgLoaded}
              className={`px-16 py-4 bg-brand-red text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3 ${
                !imgLoaded
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-red-700 hover:shadow-red-900/20"
              }`}
            >
              <Save size={20} /> 提交此裁剪并同步至 OSS
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

  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const [researchInput, setResearchInput] = useState("");
  const [researchInputZh, setResearchInputZh] = useState("");

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPeople();
      setPeople(data);
      setFiltered(data);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to fetch data");
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
      newItem.teacherProfile.researchAreasZh = researchInputZh
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
      alert(`数据库同步失败: ${err.message}`);
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
    // 重置 input 以允许再次选择同一文件
    e.target.value = "";
  };

  const handleEditExistingPhoto = () => {
    if (editingItem.avatar && !editingItem.avatar.includes("ui-avatars.com")) {
      setCropSrc(editingItem.avatar);
    } else {
      alert("当前没有可编辑的原始图片资源，请上传新照片。");
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
      alert("上传 OSS 失败，请检查 OSS 后台 CORS 配置。");
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = (item?: Person) => {
    const freshItem: Partial<Person> = item || {
      category: "Teachers",
      order: 1,
      avatar:
        "https://ui-avatars.com/api/?name=New+User&background=f1f5f9&color=cbd5e1",
      teacherProfile: {
        position: "",
        researchAreas: [],
        achievements: [],
        projects: [],
        researchAreasZh: [],
      },
    };

    setEditingItem(freshItem);
    setResearchInput(freshItem.teacherProfile?.researchAreas?.join("\n") || "");
    setResearchInputZh(
      freshItem.teacherProfile?.researchAreasZh?.join("\n") || ""
    );
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

  const isCircleCategory = (cat: string) => {
    return [
      "PhD",
      "Academic Master",
      "Professional Master",
      "Master",
      "RA",
      "Intern",
      "Secretary",
    ].includes(cat);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {t("admin.people")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(filtered, "people.csv")}
            className="px-4 py-2 border rounded hover:bg-slate-50 flex items-center transition-colors font-medium text-slate-600"
          >
            <Download size={16} className="mr-2" /> 导出数据
          </button>
          <button
            onClick={() => openModal()}
            className="px-5 py-2 bg-brand-red text-white rounded-xl hover:bg-red-700 flex items-center transition-all shadow-lg active:scale-95 font-bold"
          >
            <Plus size={18} className="mr-2" /> 新增成员
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeCategory === "All"
              ? "bg-slate-800 text-white shadow-md"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          全部
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeCategory === c
                ? "bg-brand-red text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((person) => (
            <div
              key={person.id}
              className="border border-slate-100 rounded-3xl p-6 flex gap-6 items-center relative group bg-white hover:shadow-2xl hover:border-brand-red/10 transition-all duration-500"
            >
              <div
                className={`w-16 h-16 overflow-hidden bg-slate-100 ring-4 ring-slate-50 shrink-0 transition-all duration-500 group-hover:scale-110 ${
                  isCircleCategory(person.category)
                    ? "rounded-full"
                    : "rounded-xl"
                }`}
              >
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-slate-800 text-lg group-hover:text-brand-red transition-colors truncate">
                  {person.nameZh || person.name}
                </h3>
                <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest mb-1">
                  {person.category}
                </p>
                <p className="text-xs text-slate-400 italic truncate">
                  {person.title || "研究人员"}
                </p>
              </div>
              <div className="flex flex-col gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(person)}
                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm("确定永久删除该成员？"))
                      deletePerson(person.id).then(refreshData);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 成员档案弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-10 border-b shrink-0 bg-slate-50/30">
              <h3 className="text-3xl font-serif font-bold text-slate-800">
                {editingItem.id ? "编辑成员档案" : "录入新成员"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={32} className="text-slate-400" />
              </button>
            </div>

            <div className="p-12 space-y-12 flex-grow">
              <div className="flex flex-col md:flex-row gap-14 items-start">
                <div className="flex flex-col items-center gap-8 shrink-0">
                  <div
                    className={`w-48 h-48 overflow-hidden border-8 border-white shadow-2xl relative bg-slate-100 group transition-all duration-700 ${
                      isCircleCategory(editingItem.category || "")
                        ? "rounded-full"
                        : "rounded-[2rem]"
                    }`}
                  >
                    <img
                      src={editingItem.avatar}
                      className="w-full h-full object-cover"
                      alt="Avatar"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-brand-dark/70 flex items-center justify-center backdrop-blur-sm">
                        <Loader2
                          className="text-white animate-spin"
                          size={40}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 w-full">
                    <label className="cursor-pointer group">
                      <div className="px-6 py-3 bg-brand-red text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg active:scale-95">
                        <Upload size={18} /> 选择本地照片并裁剪
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>

                    <button
                      onClick={handleEditExistingPhoto}
                      className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-brand-dark transition-all shadow-lg active:scale-95"
                    >
                      <Crop size={18} /> 编辑/缩放当前照片
                    </button>
                  </div>
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-10 w-full pt-4">
                  <div className="md:col-span-2 grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                        实验室分类
                      </label>
                      <select
                        value={editingItem.category}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            category: e.target.value as PersonCategory,
                          })
                        }
                        className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm font-bold focus:border-brand-red outline-none transition-colors appearance-none"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                        显示优先级
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
                        className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                      姓名 (English & 中文)
                    </label>
                    <input
                      placeholder="English Name"
                      value={editingItem.name || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                      className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none transition-colors"
                    />
                    <input
                      placeholder="中文姓名"
                      value={editingItem.nameZh || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          nameZh: e.target.value,
                        })
                      }
                      className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                      职位 / Title
                    </label>
                    <input
                      placeholder="Title (EN)"
                      value={editingItem.title || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          title: e.target.value,
                        })
                      }
                      className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none transition-colors"
                    />
                    <input
                      placeholder="职位 (中文)"
                      value={editingItem.titleZh || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          titleZh: e.target.value,
                        })
                      }
                      className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 联系方式 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-12 border-t-2 border-slate-50">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Email / 官方邮箱
                  </label>
                  <input
                    value={editingItem.email || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, email: e.target.value })
                    }
                    className="w-full p-5 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none transition-colors"
                    placeholder="name@whu.edu.cn"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Personal Homepage / 个人主页
                  </label>
                  <input
                    value={editingItem.homepage || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        homepage: e.target.value,
                      })
                    }
                    className="w-full p-5 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none transition-colors"
                    placeholder="https://scholar.google.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="p-10 border-t shrink-0 flex justify-end gap-5 bg-slate-50/50 rounded-b-[3rem]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-10 py-4 text-slate-400 font-bold hover:bg-slate-200 rounded-2xl transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-20 py-4 bg-brand-red text-white font-bold rounded-2xl shadow-2xl shadow-red-900/10 hover:bg-red-700 transition-all active:scale-95"
              >
                提交并更新数据库
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片编辑器 */}
      {cropSrc && (
        <ImageCropperModal
          imageSrc={cropSrc}
          isCircle={isCircleCategory(editingItem.category || "Teachers")}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  );
};

export default PeopleManager;
