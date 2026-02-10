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
  Upload,
  Loader2,
  Link as LinkIcon,
  Hash,
  Mail,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * 旗舰版图片裁剪器
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
    "loading",
  );

  const imgDisplayRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const UI_BOX_SIZE = 320;
  const EXPORT_SIZE = 600;
  const RATIO = EXPORT_SIZE / UI_BOX_SIZE;

  const updateVisuals = useCallback(() => {
    if (!imgDisplayRef.current) return;
    const { x, y } = offsetRef.current;
    const z = zoomRef.current;
    imgDisplayRef.current.style.transform = `translate3d(-50%, -50%, 0) translate3d(${x}px, ${y}px, 0) scale(${z})`;
  }, []);

  const handleAutoFit = useCallback(() => {
    if (!imgDisplayRef.current) return;
    const img = imgDisplayRef.current;
    const scale = Math.max(
      UI_BOX_SIZE / img.naturalWidth,
      UI_BOX_SIZE / img.naturalHeight,
    );
    zoomRef.current = scale;
    offsetRef.current = { x: 0, y: 0 };
    setZoom(scale);
    updateVisuals();
  }, [updateVisuals]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">照片精准裁剪</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-3 hover:bg-slate-200 rounded-full text-slate-400"
          >
            <X size={28} />
          </button>
        </div>
        <div
          ref={containerRef}
          className="bg-slate-900 relative h-[480px] overflow-hidden cursor-move flex items-center justify-center"
        >
          <img
            ref={imgDisplayRef}
            crossOrigin="anonymous"
            src={imageSrc}
            onLoad={() => {
              setImgStatus("loaded");
              handleAutoFit();
            }}
            draggable={false}
            className={`absolute select-none pointer-events-none max-none w-auto h-auto transition-opacity ${imgStatus === "loaded" ? "opacity-100" : "opacity-0"}`}
            style={{ left: "50%", top: "50%" }}
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              style={{ width: `${UI_BOX_SIZE}px`, height: `${UI_BOX_SIZE}px` }}
              className={`border-2 border-white/60 shadow-[0_0_0_2000px_rgba(15,23,42,0.85)] ${isCircle ? "rounded-full" : ""}`}
            />
          </div>
        </div>
        <div className="p-10 bg-white flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl"
          >
            取消
          </button>
          <button
            onClick={() => {
              const img = imageRef.current;
              const canvas = document.createElement("canvas");
              canvas.width = EXPORT_SIZE;
              canvas.height = EXPORT_SIZE;
              const ctx = canvas.getContext("2d");
              if (ctx && img) {
                ctx.drawImage(
                  img,
                  EXPORT_SIZE / 2 +
                    offsetRef.current.x * RATIO -
                    (img.naturalWidth * zoomRef.current * RATIO) / 2,
                  EXPORT_SIZE / 2 +
                    offsetRef.current.y * RATIO -
                    (img.naturalHeight * zoomRef.current * RATIO) / 2,
                  img.naturalWidth * zoomRef.current * RATIO,
                  img.naturalHeight * zoomRef.current * RATIO,
                );
                canvas.toBlob((b) => b && onConfirm(b), "image/jpeg", 0.95);
              }
            }}
            className="px-12 py-3 bg-brand-red text-white font-bold rounded-2xl shadow-xl"
          >
            确认
          </button>
        </div>
        <img
          ref={imageRef}
          src={imageSrc}
          crossOrigin="anonymous"
          className="hidden"
        />
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

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPeople();
      setPeople(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);
  useEffect(() => {
    setFiltered(
      activeCategory === "All"
        ? people
        : people.filter((p) => p.category === activeCategory),
    );
  }, [people, activeCategory]);

  const handleSave = async () => {
    if (isUploading) return;
    setIsLoading(true);
    try {
      if (editingItem.id) {
        await updatePerson(editingItem as Person);
      } else {
        await createPerson({
          ...editingItem,
          id: `person_${Date.now()}`,
        } as Person);
      }
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
          onClick={() => {
            setEditingItem({
              category: "Teachers",
              avatar: "https://ui-avatars.com/api/?name=User",
            });
            setIsModalOpen(true);
          }}
          className="px-6 py-2 bg-brand-red text-white rounded-xl font-bold shadow-lg"
        >
          新增成员
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold ${activeCategory === "All" ? "bg-slate-800 text-white" : "bg-slate-100"}`}
        >
          全部
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold ${activeCategory === c ? "bg-brand-red text-white" : "bg-slate-100"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((person) => (
          <div
            key={person.id}
            className="border rounded-[2rem] p-6 flex gap-6 items-center bg-white hover:shadow-xl transition-all"
          >
            <img
              src={person.avatar}
              className={`w-16 h-16 object-cover ${isCircleCategory(person.category) ? "rounded-full" : "rounded-2xl"}`}
            />
            <div className="flex-1 truncate">
              <h3 className="font-bold text-slate-800 truncate">
                {person.nameZh || person.name}
              </h3>
              <p className="text-[10px] text-brand-red font-bold uppercase">
                {person.category}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {person.titleZh || person.title || "职位未填"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setEditingItem(person);
                  setIsModalOpen(true);
                }}
                className="p-2 text-slate-400 hover:text-blue-500"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => deletePerson(person.id).then(refreshData)}
                className="p-2 text-slate-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-8 border-b">
              <h3 className="text-2xl font-bold">
                {editingItem.id ? "修改成员" : "新增成员"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-10 flex flex-col lg:flex-row gap-12">
              <div className="flex flex-col items-center gap-6 w-full lg:w-72">
                <div
                  className={`w-44 h-44 overflow-hidden border-4 border-white shadow-xl bg-slate-100 ${isCircleCategory(editingItem.category || "") ? "rounded-full" : "rounded-3xl"}`}
                >
                  <img
                    src={editingItem.avatar}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full space-y-4">
                  <label className="cursor-pointer w-full py-3 bg-brand-red text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg">
                    <Upload size={14} /> 本地上传裁剪
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const r = new FileReader();
                          r.onload = () => setCropSrc(r.result as string);
                          r.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      头像 URL (支持 OSS 链接)
                    </label>
                    <input
                      value={editingItem.avatar || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          avatar: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs font-mono focus:border-brand-red focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      成员类别
                    </label>
                    <select
                      value={editingItem.category}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm focus:border-brand-red outline-none transition-all"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      中文姓名
                    </label>
                    <input
                      value={editingItem.nameZh || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          nameZh: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm focus:border-brand-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      English Name
                    </label>
                    <input
                      value={editingItem.name || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                      className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm focus:border-brand-red outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      中文职位 (e.g. 博士研究生)
                    </label>
                    <input
                      value={editingItem.titleZh || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          titleZh: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm focus:border-brand-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      English Title (e.g. PhD Student)
                    </label>
                    <input
                      value={editingItem.title || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          title: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm focus:border-brand-red outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Email
                      </label>
                      <input
                        value={editingItem.email || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            email: e.target.value,
                          })
                        }
                        className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm focus:border-brand-red outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        个人主页 URL
                      </label>
                      <input
                        value={editingItem.homepage || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            homepage: e.target.value,
                          })
                        }
                        className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm focus:border-brand-red outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 border-t flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 text-slate-400 font-bold hover:bg-slate-100 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-16 py-3 bg-brand-red text-white font-bold rounded-2xl shadow-xl hover:bg-red-700 transition-all"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {cropSrc && (
        <ImageCropperModal
          imageSrc={cropSrc}
          isCircle={isCircleCategory(editingItem.category || "Teachers")}
          onCancel={() => setCropSrc(null)}
          onConfirm={async (blob) => {
            const url = await uploadFile(new File([blob], "avatar.jpg"));
            setEditingItem({ ...editingItem, avatar: url });
            setCropSrc(null);
          }}
        />
      )}
    </div>
  );
};

export default PeopleManager;
