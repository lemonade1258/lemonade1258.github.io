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
import { useNavigate } from "react-router-dom";

/**
 * 终极精准裁切器
 * 采用物理比例映射，解决所有缩放不对应和偏移问题
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

  const UI_BOX_SIZE = 320;
  const EXPORT_SIZE = 600;
  const RATIO = EXPORT_SIZE / UI_BOX_SIZE;

  const [safeSrc] = useState(() => {
    if (!imageSrc) return "";
    if (imageSrc.startsWith("data:")) return imageSrc;
    return `${imageSrc}${
      imageSrc.includes("?") ? "&" : "?"
    }v_crop=${Date.now()}`;
  });

  const updateVisuals = useCallback(() => {
    if (!imgDisplayRef.current) return;
    const { x, y } = offsetRef.current;
    const z = zoomRef.current;
    imgDisplayRef.current.style.transform = `translate3d(-50%, -50%, 0) translate3d(${x}px, ${y}px, 0) scale(${z})`;
  }, []);

  const handleAutoFit = useCallback(() => {
    if (!imgDisplayRef.current) return;
    const img = imgDisplayRef.current;
    const scale =
      Math.max(
        UI_BOX_SIZE / img.naturalWidth,
        UI_BOX_SIZE / img.naturalHeight
      ) * 1.0;
    zoomRef.current = scale;
    offsetRef.current = { x: 0, y: 0 };
    setZoom(scale);
    updateVisuals();
  }, [updateVisuals]);

  const handleWheel = (e: React.WheelEvent) => {
    if (imgStatus !== "loaded") return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.94 : 1.06;
    const nextZoom = Math.min(Math.max(zoomRef.current * factor, 0.001), 20);
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

  const handleConfirm = () => {
    const img = imageRef.current;
    if (!img || imgStatus !== "loaded") return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

    // 绘制算法核心：
    // 1. 移动中心
    ctx.translate(EXPORT_SIZE / 2, EXPORT_SIZE / 2);
    // 2. 应用预览时的物理位移投影
    ctx.translate(offsetRef.current.x * RATIO, offsetRef.current.y * RATIO);
    // 3. 应用缩放 (zoomRef 是相对于 natural 尺寸的，因此这里需要配合 RATIO 来确保 UI 视野一致)
    // 缩放本身是倍数，由于我们预览时也是 scale(zoom)，Canvas 里直接 scale(zoom * RATIO) 即可对齐 600px 画布
    ctx.scale(zoomRef.current * RATIO, zoomRef.current * RATIO);

    try {
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      canvas.toBlob(
        (blob) => {
          if (blob) onConfirm(blob);
        },
        "image/jpeg",
        0.95
      );
    } catch (e) {
      alert("图片受限 (CORS)，请上传本地照片。");
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">调整照片</h3>
            <p className="text-sm text-slate-400 mt-1">
              当前倍率: {zoom.toFixed(3)}x · 导出像素: {EXPORT_SIZE}px
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAutoFit}
              className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
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

        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={onMouseDown}
          className="bg-slate-900 relative h-[480px] overflow-hidden cursor-move touch-none flex items-center justify-center"
        >
          {imgStatus === "loading" && (
            <Loader2 className="animate-spin text-brand-red" size={48} />
          )}
          <img
            ref={imgDisplayRef}
            crossOrigin="anonymous"
            src={safeSrc}
            onLoad={() => {
              setImgStatus("loaded");
              handleAutoFit();
            }}
            onError={() => setImgStatus("error")}
            draggable={false}
            className={`absolute select-none pointer-events-none max-none w-auto h-auto ${
              imgStatus === "loaded" ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: "50%",
              top: "50%",
              transform: `translate3d(-50%, -50%, 0) scale(1)`,
              transformOrigin: "center",
            }}
          />
          <img
            ref={imageRef}
            src={safeSrc}
            crossOrigin="anonymous"
            className="hidden"
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              style={{ width: `${UI_BOX_SIZE}px`, height: `${UI_BOX_SIZE}px` }}
              className={`border-2 border-white/60 shadow-[0_0_0_2000px_rgba(15,23,42,0.85)] relative ${
                isCircle ? "rounded-full" : ""
              }`}
            />
          </div>
        </div>

        <div className="p-10 bg-white flex justify-between items-center">
          <div className="flex-grow max-w-sm mr-10">
            <input
              type="range"
              min="0.001"
              max="3"
              step="0.001"
              value={zoom}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                zoomRef.current = val;
                setZoom(val);
                updateVisuals();
              }}
              className="w-full accent-brand-red"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={imgStatus !== "loaded"}
              className="px-12 py-3 bg-brand-red text-white font-bold rounded-2xl shadow-xl hover:bg-red-700 active:scale-95 transition-all"
            >
              保存裁切
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PeopleManager: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
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
    } catch (e: any) {
      if (e.message.includes("Forbidden")) navigate("/admin/login");
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
      refreshData();
      alert("成员信息已更新");
    } catch (err: any) {
      if (err.message.includes("Forbidden")) {
        alert("登录权限已过期，请重新登录。");
        navigate("/admin/login");
      } else {
        alert(`保存失败: ${err.message}`);
      }
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

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    setIsUploading(true);
    try {
      const file = new File([blob], `avatar_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const url = await uploadFile(file);
      // 成功上传后更新头像 URL
      setEditingItem((prev) => ({ ...prev, avatar: url }));
    } catch (err: any) {
      if (err.message.includes("Forbidden")) {
        alert("权限已失效，请先登录后台。");
        navigate("/admin/login");
      } else {
        alert(`上传失败: ${err.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = (item?: Person) => {
    const freshItem: Partial<Person> = item || {
      category: "Teachers",
      order: 1,
      avatar:
        "https://ui-avatars.com/api/?name=User&background=f1f5f9&color=cbd5e1",
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
  const isCircleCategory = (cat: string) =>
    [
      "PhD",
      "Academic Master",
      "Professional Master",
      "Master",
      "RA",
      "Intern",
      "Secretary",
    ].includes(cat);

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">团队管理</h2>
        <div className="flex gap-2">
          <button
            onClick={() => openModal()}
            className="px-6 py-2 bg-brand-red text-white rounded-xl font-bold shadow-lg"
          >
            新增成员
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold ${
            activeCategory === "All"
              ? "bg-slate-800 text-white"
              : "bg-slate-100"
          }`}
        >
          全部
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold ${
              activeCategory === c ? "bg-brand-red text-white" : "bg-slate-100"
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
              className="border border-slate-100 rounded-[2rem] p-6 flex gap-6 items-center relative group bg-white hover:shadow-xl transition-all"
            >
              <div
                className={`w-16 h-16 overflow-hidden bg-slate-100 shrink-0 ${
                  isCircleCategory(person.category)
                    ? "rounded-full"
                    : "rounded-2xl"
                }`}
              >
                <img
                  src={person.avatar}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">
                  {person.nameZh || person.name}
                </h3>
                <p className="text-[10px] text-brand-red font-bold uppercase mb-1">
                  {person.category}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openModal(person)}
                  className="p-2 text-slate-400 hover:text-blue-500"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm("确定删除?"))
                      deletePerson(person.id).then(refreshData);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500"
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
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-8 border-b bg-slate-50/30">
              <h3 className="text-2xl font-bold">
                {editingItem.id ? "编辑档案" : "新增成员"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-10 space-y-10">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex flex-col items-center gap-6 shrink-0">
                  <div
                    className={`w-40 h-40 overflow-hidden border-4 border-white shadow-xl bg-slate-100 relative ${
                      isCircleCategory(editingItem.category || "")
                        ? "rounded-full"
                        : "rounded-3xl"
                    }`}
                  >
                    <img
                      src={editingItem.avatar}
                      className="w-full h-full object-cover"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                        <Loader2
                          className="text-white animate-spin"
                          size={32}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label className="cursor-pointer px-4 py-2 bg-brand-red text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                      <Upload size={14} /> 上传新照片
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <button
                      onClick={() =>
                        editingItem.avatar && setCropSrc(editingItem.avatar)
                      }
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      <Crop size={14} /> 裁切当前
                    </button>
                  </div>
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      基本信息
                    </label>
                    <select
                      value={editingItem.category}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          category: e.target.value as PersonCategory,
                        })
                      }
                      className="w-full p-3 border rounded-xl text-sm outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="中文姓名"
                      value={editingItem.nameZh || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          nameZh: e.target.value,
                        })
                      }
                      className="w-full p-3 border rounded-xl text-sm"
                    />
                    <input
                      placeholder="English Name"
                      value={editingItem.name || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                      className="w-full p-3 border rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-4 pt-6">
                    <input
                      placeholder="职位 (如: 博士生)"
                      value={editingItem.titleZh || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          titleZh: e.target.value,
                        })
                      }
                      className="w-full p-3 border rounded-xl text-sm"
                    />
                    <input
                      placeholder="Email"
                      value={editingItem.email || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-3 border rounded-xl text-sm"
                    />
                    <input
                      type="number"
                      placeholder="排序权重"
                      value={editingItem.order}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          order: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-3 border rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t flex justify-end gap-4 bg-slate-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 text-slate-400 font-bold"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-12 py-3 bg-brand-red text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
              >
                确认并保存
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
