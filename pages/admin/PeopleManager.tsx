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
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * 高级图片裁剪模态框
 * 支持本地 File 对象和远程 URL
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

    // 输出标准的 600x600 正方形头像
    const outputSize = 600;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const img = imageRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const uiCropSize = 320; // UI 界面中红色裁剪框的大小

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, outputSize, outputSize);

    // 计算缩放比例映射
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.scale(
      (outputSize / uiCropSize) * zoom,
      (outputSize / uiCropSize) * zoom
    );
    ctx.translate(offset.x / zoom, offset.y / zoom);

    // 绘图
    try {
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      canvas.toBlob(
        (blob) => {
          if (blob) onConfirm(blob);
        },
        "image/jpeg",
        0.92
      );
    } catch (e) {
      console.error("Canvas 裁剪出错 (可能是跨域问题):", e);
      alert(
        "裁剪失败：无法处理该远程图片。请确保 OSS 已配置 CORS 权限，或尝试重新上传本地文件。"
      );
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/80">
          <div>
            <h3 className="text-xl font-bold text-slate-800">图片展示调整</h3>
            <p className="text-xs text-slate-400 mt-1">
              您可以自由拖拽图片位置并缩放，以获得最佳展示效果
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        <div
          className="bg-slate-200 relative h-[500px] overflow-hidden cursor-move touch-none"
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
            crossOrigin="anonymous" // 关键：允许跨域 Canvas 操作
            draggable={false}
            className="absolute select-none pointer-events-none transition-opacity duration-300"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: "center",
            }}
            onLoad={() => console.log("Image loaded into cropper")}
          />

          {/* 阴影遮罩层 */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[320px] h-[320px] border-4 border-white/50 rounded shadow-[0_0_0_9999px_rgba(15,23,42,0.75)] relative">
              {/* 辅助网格线 */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
                <div className="border-r border-white"></div>
                <div className="border-r border-white"></div>
                <div></div>
                <div className="border-b border-white col-span-3"></div>
                <div className="border-b border-white col-span-3"></div>
              </div>
              {/* 红色指示边角 */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-brand-red"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-brand-red"></div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-brand-red"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-brand-red"></div>
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="px-4 py-1.5 bg-black/40 backdrop-blur rounded-full text-white text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
              <Move size={12} /> 拖拽调整区域
            </div>
          </div>
        </div>

        <div className="p-8 bg-white">
          <div className="flex items-center gap-6 mb-8">
            <ZoomOut size={20} className="text-slate-400" />
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-grow h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-red"
            />
            <ZoomIn size={20} className="text-slate-400" />
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onCancel}
              className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all"
            >
              取消修改
            </button>
            <button
              onClick={handleConfirm}
              className="px-12 py-3 bg-brand-red text-white font-bold rounded-2xl shadow-xl hover:bg-red-700 transition-all active:scale-95 flex items-center gap-2"
            >
              <Save size={18} /> 保存展示效果
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

  // 裁剪源图片 (可以是 DataURL 或 远程 URL)
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // 教师档案辅助输入
  const [researchInput, setResearchInput] = useState("");
  const [achieveInput, setAchieveInput] = useState("");
  const [projectInput, setProjectInput] = useState("");
  const [influenceInput, setInfluenceInput] = useState("");
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
      alert(`保存失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理本地文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // 触发对当前图片的重新编辑
  const handleEditExistingPhoto = () => {
    if (editingItem.avatar && !editingItem.avatar.includes("ui-avatars.com")) {
      setCropSrc(editingItem.avatar);
    } else {
      alert("当前没有可编辑的原始照片，请上传新图片。");
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
      alert("照片保存失败，请检查 OSS 状态。");
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
            className="px-4 py-2 border rounded hover:bg-slate-50 flex items-center transition-colors font-medium"
          >
            <Download size={16} className="mr-2" /> 导出 CSV
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700 flex items-center transition-all shadow-md font-bold"
          >
            <Plus size={16} className="mr-2" /> 新增成员
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeCategory === "All"
              ? "bg-slate-800 text-white"
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
                ? "bg-brand-red text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-20 animate-pulse text-slate-300 font-serif">
          正在读取成员档案...
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 flex items-center shadow-sm">
          <AlertTriangle className="mr-2 shrink-0" size={18} />
          <span className="text-sm">服务器错误: {errorMsg}</span>
        </div>
      )}

      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((person) => (
            <div
              key={person.id}
              className="border border-slate-100 rounded-2xl p-6 flex gap-6 items-center relative group bg-white hover:shadow-xl hover:border-brand-red/10 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 ring-4 ring-slate-50 shrink-0">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-slate-800 text-lg group-hover:text-brand-red transition-colors">
                  {person.nameZh || person.name}
                </h3>
                <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest mb-1">
                  {person.category}
                </p>
                <p className="text-xs text-slate-400 italic truncate">
                  {person.title || "研究人员"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openModal(person)}
                  className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm("确定删除?"))
                      deletePerson(person.id).then(refreshData);
                  }}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 成员详情编辑弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-8 border-b shrink-0 bg-slate-50/50">
              <h3 className="text-2xl font-serif font-bold text-slate-800">
                {editingItem.id ? "编辑成员档案" : "新增实验室成员"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={28} className="text-slate-400" />
              </button>
            </div>

            <div className="p-10 space-y-12 flex-grow">
              {/* 头像编辑区域 */}
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex flex-col items-center gap-6 shrink-0">
                  <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl relative bg-slate-100 group">
                    <img
                      src={editingItem.avatar}
                      className="w-full h-full object-cover"
                      alt="Avatar"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-brand-dark/60 flex items-center justify-center">
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    {/* 按钮一：上传新图 */}
                    <label className="cursor-pointer group">
                      <div className="px-4 py-2.5 bg-brand-red text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-md active:scale-95">
                        <Upload size={14} /> 上传新照片并裁剪
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>

                    {/* 按钮二：基于现有图裁剪 */}
                    <button
                      onClick={handleEditExistingPhoto}
                      className="px-4 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-tech transition-all shadow-md active:scale-95"
                    >
                      <Crop size={14} /> 编辑/缩放当前照片
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed">
                    支持对已上传的 OSS 照片
                    <br />
                    进行位置微调和缩放
                  </p>
                </div>

                {/* 核心信息输入 */}
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <div className="md:col-span-2 grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        分类
                      </label>
                      <select
                        value={editingItem.category}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            category: e.target.value as PersonCategory,
                          })
                        }
                        className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm font-bold focus:border-brand-red outline-none transition-colors"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        排序权重 (数字越小越靠前)
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
                        className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      姓名 (中/英)
                    </label>
                    <input
                      placeholder="英文姓名"
                      value={editingItem.name || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                      className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm mb-2 focus:border-brand-red outline-none"
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
                      className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      职位/头衔
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
                      className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm mb-2 focus:border-brand-red outline-none"
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
                      className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 联系方式 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t-2 border-slate-50">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    邮箱
                  </label>
                  <input
                    value={editingItem.email || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, email: e.target.value })
                    }
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none"
                    placeholder="example@whu.edu.cn"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    主页链接
                  </label>
                  <input
                    value={editingItem.homepage || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        homepage: e.target.value,
                      })
                    }
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* 导师详细档案 */}
              {["Teachers", "Visiting Scholars"].includes(
                editingItem.category as string
              ) && (
                <div className="space-y-8 pt-10 border-t-2 border-slate-50">
                  <h4 className="text-xs font-bold text-brand-red uppercase tracking-[0.3em] flex items-center gap-3">
                    <Plus size={16} /> 详细学术档案 / Researcher Extended
                    Profile
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        学术头衔 (EN)
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
                        className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        学术头衔 (ZH)
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
                        className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-sm focus:border-brand-red outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        研究领域 (EN) - 换行分隔
                      </label>
                      <textarea
                        value={researchInput}
                        onChange={(e) => setResearchInput(e.target.value)}
                        className="w-full p-4 border-2 border-slate-100 rounded-2xl text-xs font-mono bg-slate-50 focus:border-brand-red outline-none"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        研究领域 (ZH)
                      </label>
                      <textarea
                        value={researchInputZh}
                        onChange={(e) => setResearchInputZh(e.target.value)}
                        className="w-full p-4 border-2 border-slate-100 rounded-2xl text-xs font-mono bg-slate-50 focus:border-brand-red outline-none"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t shrink-0 flex justify-end gap-4 bg-slate-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-10 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-2xl transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-16 py-3 bg-brand-red text-white font-bold rounded-2xl shadow-xl hover:bg-red-700 transition-all active:scale-95"
              >
                保存档案
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片编辑器模态框 */}
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
