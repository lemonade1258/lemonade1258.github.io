import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Crop,
  Loader2,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * 高性能图片裁剪器
 * 使用 Ref 直接操作 DOM 节点以达到 0 延迟，并修复坐标偏移
 */
const ImageCropperModal: React.FC<{
  imageSrc: string;
  isCircle: boolean;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}> = ({ imageSrc, isCircle, onConfirm, onCancel }) => {
  // 状态仅用于记录，不直接驱动高频渲染
  const [zoom, setZoom] = useState(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );

  const imgDisplayRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 1. 加载处理
  const [safeSrc] = useState(() => {
    if (!imageSrc) return "";
    if (imageSrc.startsWith("data:")) return imageSrc;
    const connector = imageSrc.includes("?") ? "&" : "?";
    return `${imageSrc}${connector}cv=${Date.now()}`;
  });

  // 更新视觉效果（高性能方案：直接修改 CSS transform）
  const updateVisuals = () => {
    if (imgDisplayRef.current) {
      const { x, y } = offsetRef.current;
      const z = zoomRef.current;
      imgDisplayRef.current.style.transform = `translate3d(-50%, -50%, 0) translate3d(${x}px, ${y}px, 0) scale(${z})`;
    }
  };

  // 2. 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    if (imgStatus !== "loaded") return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    const nextZoom = Math.min(Math.max(zoomRef.current * delta, 0.05), 10);
    zoomRef.current = nextZoom;
    setZoom(nextZoom); // 同步给 UI Slider
    updateVisuals();
  };

  // 3. 拖拽逻辑 (Ref 驱动)
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    if (imgStatus !== "loaded") return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    };
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      offsetRef.current = {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      };
      updateVisuals();
    };

    const onMouseUp = () => {
      isDragging.current = false;
      if (containerRef.current) containerRef.current.style.cursor = "move";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // 4. 精确导出逻辑 (解决偏移关键)
  const handleConfirm = () => {
    if (!imageRef.current || imgStatus !== "loaded") return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const exportSize = 600; // 导出固定为 600x600
    const uiBoxSize = 320; // UI 界面裁剪框大小
    const ratio = exportSize / uiBoxSize; // UI 到 Canvas 的缩放倍数

    canvas.width = exportSize;
    canvas.height = exportSize;

    // 平滑处理
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "white"; // 填充背景防止透明
    ctx.fillRect(0, 0, exportSize, exportSize);

    // 核心转换序列 (顺序极为重要)
    // 第一步：移动到画布中心作为坐标原点
    ctx.translate(exportSize / 2, exportSize / 2);
    // 第二步：应用用户位移（换算到输出坐标系）
    ctx.translate(offsetRef.current.x * ratio, offsetRef.current.y * ratio);
    // 第三步：应用缩放（换算到输出坐标系）
    ctx.scale(zoomRef.current * ratio, zoomRef.current * ratio);

    try {
      const img = imageRef.current;
      // 第四步：将图片中心对齐原点绘制
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob(
        (blob) => {
          if (blob) onConfirm(blob);
        },
        "image/jpeg",
        0.92
      );
    } catch (e) {
      alert(
        "图片资源跨域限制。请确保图片服务器已配置 CORS 允许当前域名访问，或上传本地图片。"
      );
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">调整裁剪区域</h3>
            <p className="text-xs text-slate-400 mt-1">
              支持拖拽与滚轮缩放 · 所见即所得
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* 视口区域 */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={onMouseDown}
          className="bg-slate-900 relative h-[450px] overflow-hidden cursor-move touch-none flex items-center justify-center"
        >
          {imgStatus === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 z-20">
              <Loader2 className="animate-spin text-brand-red" size={32} />
              <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">
                正在载入图像...
              </span>
            </div>
          )}

          {imgStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 gap-4 z-30 bg-red-50/5 px-10 text-center">
              <AlertTriangle size={48} />
              <p className="font-bold text-sm">无法加载此原始资源 (CORS)</p>
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-xs font-bold transition-all"
              >
                尝试上传本地照片
              </button>
            </div>
          )}

          {/* 实时预览层 (Ref 驱动) */}
          <img
            ref={imgDisplayRef}
            crossOrigin="anonymous"
            src={safeSrc}
            alt="UI Preview"
            onLoad={() => {
              setImgStatus("loaded");
              updateVisuals();
            }}
            onError={() => setImgStatus("error")}
            draggable={false}
            className={`absolute select-none pointer-events-none will-change-transform ${
              imgStatus === "loaded" ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: "50%",
              top: "50%",
              transform: `translate3d(-50%, -50%, 0) scale(1)`,
              transformOrigin: "center",
            }}
          />

          {/* 备用隐藏层 (用于 Canvas 绘制) */}
          <img
            ref={imageRef}
            src={safeSrc}
            crossOrigin="anonymous"
            className="hidden"
            alt="Source"
          />

          {/* 裁剪蒙版 */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className={`w-[320px] h-[320px] border-2 border-white/50 shadow-[0_0_0_2000px_rgba(15,23,42,0.85)] relative transition-all duration-500 ${
                isCircle ? "rounded-full" : "rounded-none"
              }`}
            >
              {/* 辅助网格 */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-10">
                <div className="border-r border-white"></div>
                <div className="border-r border-white"></div>
                <div></div>
                <div className="border-b border-white col-span-3"></div>
                <div className="border-b border-white col-span-3"></div>
              </div>

              {!isCircle && (
                <div className="absolute inset-0">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-brand-red"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-brand-red"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-brand-red"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-brand-red"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 控制区 */}
        <div className="p-8 bg-white">
          <div className="flex items-center gap-6 mb-8">
            <ZoomOut size={20} className="text-slate-300" />
            <div className="flex-grow relative h-2 bg-slate-100 rounded-full">
              <input
                type="range"
                min="0.05"
                max="10"
                step="0.01"
                value={zoom}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  zoomRef.current = val;
                  setZoom(val);
                  updateVisuals();
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="absolute top-0 bottom-0 left-0 bg-brand-red rounded-full"
                style={{ width: `${(zoom / 10) * 100}%` }}
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-brand-red rounded-full shadow-lg pointer-events-none"
                style={{ left: `calc(${(zoom / 10) * 100}% - 10px)` }}
              ></div>
            </div>
            <ZoomIn size={20} className="text-slate-300" />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2">
              <Move size={12} /> 滚轮/触控缩放支持
            </span>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
              >
                放弃
              </button>
              <button
                onClick={handleConfirm}
                disabled={imgStatus !== "loaded"}
                className={`px-10 py-2.5 bg-brand-red text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                  imgStatus !== "loaded"
                    ? "opacity-50 grayscale cursor-not-allowed"
                    : "hover:bg-red-700"
                }`}
              >
                <Save size={18} /> 完成裁剪并应用
              </button>
            </div>
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
      console.error(e);
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
      alert(`保存失败: ${err.message}`);
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
    e.target.value = "";
  };

  const handleEditExistingPhoto = () => {
    if (editingItem.avatar && !editingItem.avatar.includes("ui-avatars.com")) {
      setCropSrc(editingItem.avatar);
    } else {
      alert("该成员目前使用默认占位符，请先通过本地上传一张原始照片。");
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
      alert("OSS 上传失败，请检查网络权限。");
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
            <Download size={16} className="mr-2" /> 导出 CSV
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
              className="border border-slate-100 rounded-[2rem] p-6 flex gap-6 items-center relative group bg-white hover:shadow-2xl hover:border-brand-red/10 transition-all duration-500"
            >
              <div
                className={`w-16 h-16 overflow-hidden bg-slate-100 ring-4 ring-slate-50 shrink-0 transition-all duration-500 group-hover:scale-110 ${
                  isCircleCategory(person.category)
                    ? "rounded-full"
                    : "rounded-2xl"
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
                    if (confirm("确定删除?"))
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
                        <Upload size={18} /> 上传新照片
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-12 border-t-2 border-slate-50">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Email
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
                    className="w-full p-5 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none transition-colors"
                    placeholder="https://..."
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
                className="px-20 py-4 bg-brand-red text-white font-bold rounded-2xl shadow-2xl hover:bg-red-700 transition-all active:scale-95"
              >
                提交保存
              </button>
            </div>
          </div>
        </div>
      )}

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
