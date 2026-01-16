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
 * 旗舰版图片裁剪器 (绝对坐标物理对齐版)
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

  // 1. 同步视觉更新
  const updateVisuals = useCallback(() => {
    if (!imgDisplayRef.current) return;
    const { x, y } = offsetRef.current;
    const z = zoomRef.current;
    // 使用 translate3d 配合物理坐标映射
    imgDisplayRef.current.style.transform = `translate3d(-50%, -50%, 0) translate3d(${x}px, ${y}px, 0) scale(${z})`;
  }, []);

  // 2. 初始自适应：确保图片覆盖 320px 的框
  const handleAutoFit = useCallback(() => {
    if (!imgDisplayRef.current) return;
    const img = imgDisplayRef.current;
    const scale = Math.max(
      UI_BOX_SIZE / img.naturalWidth,
      UI_BOX_SIZE / img.naturalHeight
    );
    zoomRef.current = scale;
    offsetRef.current = { x: 0, y: 0 };
    setZoom(scale);
    updateVisuals();
  }, [updateVisuals]);

  // 3. 滚轮控制
  const handleWheel = (e: React.WheelEvent) => {
    if (imgStatus !== "loaded") return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.95 : 1.05;
    const nextZoom = Math.min(Math.max(zoomRef.current * factor, 0.001), 10);
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

  // 4. 绝对坐标导出算法 (核心修复)
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

    // 关键：不使用 ctx.scale 这种容易产生舍入误差的方式
    // 而是直接计算在 600px 空间下图片的绝对绘制位置和大小

    // a. 计算缩放后的物理尺寸 (UI 缩放 * 物理倍率 1.875)
    const drawWidth = img.naturalWidth * zoomRef.current * RATIO;
    const drawHeight = img.naturalHeight * zoomRef.current * RATIO;

    // b. 计算图片中心在 600px 画布中的绝对偏移
    const canvasCenterX = EXPORT_SIZE / 2 + offsetRef.current.x * RATIO;
    const canvasCenterY = EXPORT_SIZE / 2 + offsetRef.current.y * RATIO;

    try {
      // c. 使用 9 参数 drawImage 形式精确控制每一个像素
      ctx.drawImage(
        img,
        canvasCenterX - drawWidth / 2,
        canvasCenterY - drawHeight / 2,
        drawWidth,
        drawHeight
      );

      canvas.toBlob(
        (blob) => {
          if (blob) onConfirm(blob);
        },
        "image/jpeg",
        0.95
      );
    } catch (e) {
      alert("CORS 限制：无法读取服务器图片像素。请尝试上传本地照片。");
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">照片精准裁剪</h3>
            <p className="text-sm text-slate-400 mt-1">
              绝对映射模式 (600px) · 倍率: {zoom.toFixed(4)}x
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
            src={imageSrc}
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
            }}
          />
          <img
            ref={imageRef}
            src={imageSrc}
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
          <div className="flex-grow max-w-xs mr-10">
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
              className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-brand-red cursor-pointer"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={imgStatus !== "loaded"}
              className="px-12 py-3 bg-brand-red text-white font-bold rounded-2xl shadow-xl hover:bg-red-700 active:scale-95 transition-all"
            >
              确认并上传
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PeopleManager: React.FC = () => {
  const navigate = useNavigate();
  const [people, setPeople] = useState<Person[]>([]);
  const [filtered, setFiltered] = useState<Person[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Person>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const handleError = (err: any) => {
    if (err.message === "AUTH_FORBIDDEN") {
      alert("登录已过期，请重新登录。");
      navigate("/admin/login");
    } else {
      alert(`操作失败: ${err.message}`);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPeople();
      setPeople(data);
    } catch (e: any) {
      handleError(e);
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
    if (isUploading) return alert("正在同步照片，请稍候...");

    let newItem = { ...editingItem } as Person;
    setIsLoading(true);
    try {
      if (editingItem.id) {
        await updatePerson(newItem);
      } else {
        await createPerson(newItem);
      }
      setIsModalOpen(false);
      refreshData();
      alert("成员信息已保存");
    } catch (err: any) {
      handleError(err);
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
      // 核心：上传完成后必须立即更新 editingItem
      setEditingItem((prev) => ({ ...prev, avatar: url }));
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = (item?: Person) => {
    setEditingItem(
      item || {
        category: "Teachers",
        order: 1,
        avatar:
          "https://ui-avatars.com/api/?name=User&background=f1f5f9&color=cbd5e1",
      }
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
        <h2 className="text-2xl font-bold text-slate-800">团队成员管理</h2>
        <button
          onClick={() => openModal()}
          className="px-6 py-2 bg-brand-red text-white rounded-xl font-bold shadow-lg"
        >
          新增成员
        </button>
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
                      deletePerson(person.id)
                        .then(refreshData)
                        .catch(handleError);
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
                {editingItem.id ? "修改档案" : "录入新成员"}
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
                    className={`w-44 h-44 overflow-hidden border-4 border-white shadow-xl bg-slate-100 relative ${
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
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                        <Loader2
                          className="text-white animate-spin mb-2"
                          size={32}
                        />
                        <span className="text-white text-[10px] font-bold">
                          同步中...
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label className="cursor-pointer px-4 py-3 bg-brand-red text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-red-700">
                      <Upload size={14} /> 上传并裁剪
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
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
                      className="w-full p-4 border-2 border-slate-50 rounded-2xl text-sm outline-none focus:border-brand-red"
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
                      className="w-full p-4 border-2 border-slate-50 rounded-2xl text-sm"
                    />
                    <input
                      placeholder="English Name"
                      value={editingItem.name || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                      className="w-full p-4 border-2 border-slate-50 rounded-2xl text-sm"
                    />
                  </div>
                  <div className="space-y-4 pt-6">
                    <input
                      placeholder="职位 (如: 博士后)"
                      value={editingItem.titleZh || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          titleZh: e.target.value,
                        })
                      }
                      className="w-full p-4 border-2 border-slate-50 rounded-2xl text-sm"
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
                      className="w-full p-4 border-2 border-slate-50 rounded-2xl text-sm"
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
                      className="w-full p-4 border-2 border-slate-50 rounded-2xl text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t flex justify-end gap-4 bg-slate-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 text-slate-400 font-bold hover:bg-slate-200 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={isUploading || isLoading}
                className={`px-16 py-3 bg-brand-red text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-all ${
                  isUploading || isLoading
                    ? "opacity-50 grayscale cursor-wait"
                    : "hover:bg-red-700"
                }`}
              >
                {isUploading ? "正在同步照片..." : "确认并永久保存"}
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
