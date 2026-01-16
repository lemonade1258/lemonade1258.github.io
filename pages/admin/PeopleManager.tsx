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
  RefreshCcw,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * 旗舰版图片裁剪器 (物理像素校准版)
 * 解决大图缩放失效、保存位移偏差的核心方案
 */
const ImageCropperModal: React.FC<{
  imageSrc: string;
  isCircle: boolean;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}> = ({ imageSrc, isCircle, onConfirm, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );

  const imgDisplayRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const UI_BOX_SIZE = 320; // 预览框大小 (px)
  const EXPORT_SIZE = 600; // 导出文件大小 (px)
  const RATIO = EXPORT_SIZE / UI_BOX_SIZE; // 物理换算比 (1.875)

  // 1. 资源安全加载
  const [safeSrc] = useState(() => {
    if (!imageSrc) return "";
    if (imageSrc.startsWith("data:")) return imageSrc;
    const connector = imageSrc.includes("?") ? "&" : "?";
    return `${imageSrc}${connector}cropper_v=${Date.now()}`;
  });

  // 2. 视觉同步更新 (Direct DOM Manipulation for Performance)
  const updateVisuals = useCallback(() => {
    if (!imgDisplayRef.current) return;
    const { x, y } = offsetRef.current;
    const z = zoomRef.current;
    // 关键：强制 translate3d 避免子像素渲染偏差
    imgDisplayRef.current.style.transform = `translate3d(-50%, -50%, 0) translate3d(${x}px, ${y}px, 0) scale(${z})`;
  }, []);

  // 3. 初始自动适配逻辑
  const handleAutoFit = useCallback(() => {
    if (!imgDisplayRef.current) return;
    const img = imgDisplayRef.current;
    // 计算图片以其“自然像素”在 320px 框中显示的初始缩放比
    const scale =
      Math.max(
        UI_BOX_SIZE / img.naturalWidth,
        UI_BOX_SIZE / img.naturalHeight
      ) * 1.05;
    zoomRef.current = scale;
    offsetRef.current = { x: 0, y: 0 };
    setZoom(scale);
    updateVisuals();
  }, [updateVisuals]);

  // 4. 滚轮与拖拽逻辑
  const handleWheel = (e: React.WheelEvent) => {
    if (imgStatus !== "loaded") return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    const nextZoom = Math.min(Math.max(zoomRef.current * factor, 0.01), 20);
    zoomRef.current = nextZoom;
    setZoom(nextZoom);
    updateVisuals();
  };

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
      requestAnimationFrame(updateVisuals);
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
  }, [updateVisuals]);

  // 5. 零误差 Canvas 导出算法
  const handleConfirm = () => {
    const img = imageRef.current;
    if (!img || imgStatus !== "loaded") return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;

    // 填充底色
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

    // 核心坐标变换：
    // 我们需要将 UI 上的操作 (320px 坐标系) 映射到 Canvas (600px 坐标系)

    // a. 将原点移至画布物理中心 (300, 300)
    ctx.translate(EXPORT_SIZE / 2, EXPORT_SIZE / 2);

    // b. 应用偏移量（UI 像素 * 物理转换比）
    ctx.translate(offsetRef.current.x * RATIO, offsetRef.current.y * RATIO);

    // c. 应用缩放（UI 缩放倍数 * 物理转换比）
    // 注意：这里的 zoomRef 本身就是相对于 naturalWidth 的倍数
    ctx.scale(zoomRef.current * RATIO, zoomRef.current * RATIO);

    try {
      // d. 绘制图片（图片中心点对齐当前原点）
      // 此时坐标系已经根据偏移和缩放准备好，我们只需要把图片的原生中心画在 (0,0) 即可
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      canvas.toBlob(
        (blob) => {
          if (blob) onConfirm(blob);
        },
        "image/jpeg",
        0.95
      );
    } catch (e) {
      alert(
        "由于图片存储服务器的安全限制 (CORS)，无法完成裁剪。请尝试上传本地文件。"
      );
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              像素级精准裁剪
            </h3>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              已同步物理坐标系 · 当前输出: {EXPORT_SIZE}x{EXPORT_SIZE}px
              <span className="inline-block w-1 h-1 bg-slate-300 rounded-full"></span>
              倍率: {zoomRef.current.toFixed(3)}x
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAutoFit}
              className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
              title="自动重置"
            >
              <RefreshCcw size={24} />
            </button>
            <button
              onClick={onCancel}
              className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* 交互视口 */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={onMouseDown}
          className="bg-slate-900 relative h-[500px] overflow-hidden cursor-move touch-none flex items-center justify-center"
        >
          {imgStatus === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4 z-20">
              <Loader2 className="animate-spin text-brand-red" size={48} />
              <span className="text-xs font-bold uppercase tracking-widest">
                正在采样图片像素...
              </span>
            </div>
          )}

          {/* 实时预览层 */}
          <img
            ref={imgDisplayRef}
            crossOrigin="anonymous"
            src={safeSrc}
            alt="UI View"
            onLoad={() => {
              setImgStatus("loaded");
              handleAutoFit();
            }}
            onError={() => setImgStatus("error")}
            draggable={false}
            className={`absolute select-none pointer-events-none max-none w-auto h-auto will-change-transform ${
              imgStatus === "loaded" ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: "50%",
              top: "50%",
              transform: `translate3d(-50%, -50%, 0) scale(1)`,
              transformOrigin: "center",
            }}
          />

          {/* 隐藏数据源 (保证绘图时使用最原始数据) */}
          <img
            ref={imageRef}
            src={safeSrc}
            crossOrigin="anonymous"
            className="hidden"
            alt="Source Data"
          />

          {/* 精准蒙版层 */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              style={{ width: `${UI_BOX_SIZE}px`, height: `${UI_BOX_SIZE}px` }}
              className={`border-[2px] border-white/60 shadow-[0_0_0_2000px_rgba(15,23,42,0.85)] relative ${
                isCircle ? "rounded-full" : "rounded-none"
              }`}
            >
              {/* 构图辅助线 */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
                <div className="border-r border-white"></div>
                <div className="border-r border-white"></div>
                <div className="border-b border-white col-span-3"></div>
                <div className="border-b border-white col-span-3"></div>
              </div>
              {!isCircle && (
                <div className="absolute inset-0 border border-brand-red/40">
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-brand-red"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-brand-red"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-brand-red"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-brand-red"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="p-10 bg-white">
          <div className="flex items-center gap-8 mb-10">
            <button
              onClick={() => {
                zoomRef.current *= 0.8;
                setZoom(zoomRef.current);
                updateVisuals();
              }}
              className="text-slate-300 hover:text-brand-red transition-all"
            >
              <ZoomOut size={28} />
            </button>
            <div className="flex-grow relative h-3 bg-slate-100 rounded-full">
              <input
                type="range"
                min="0.01"
                max="5"
                step="0.001"
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
                style={{ width: `${(zoom / 5) * 100}%` }}
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 border-brand-red rounded-full shadow-xl pointer-events-none"
                style={{ left: `calc(${(zoom / 5) * 100}% - 16px)` }}
              ></div>
            </div>
            <button
              onClick={() => {
                zoomRef.current *= 1.2;
                setZoom(zoomRef.current);
                updateVisuals();
              }}
              className="text-slate-300 hover:text-brand-red transition-all"
            >
              <ZoomIn size={28} />
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Move size={14} /> 鼠标拖拽平移 · 滚轮精细缩放
              </span>
              <span className="text-[10px] text-brand-red/50 mt-1 font-mono">
                物理投影比例: 1 : 1.875
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="px-10 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all"
              >
                放弃修改
              </button>
              <button
                onClick={handleConfirm}
                disabled={imgStatus !== "loaded"}
                className={`px-16 py-4 bg-brand-red text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3 ${
                  imgStatus !== "loaded"
                    ? "opacity-50 grayscale cursor-not-allowed"
                    : "hover:bg-red-700 hover:shadow-red-900/30"
                }`}
              >
                <Save size={20} /> 同步像素数据
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
      alert("该成员目前使用默认占位图，请先通过本地上传一张原始照片。");
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
      alert("OSS 上传失败，请检查网络连接或权限设置。");
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
            <Download size={16} className="mr-2" /> 导出
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
                      <Crop size={18} /> 调出精准裁剪器
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
                提交并保存
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
