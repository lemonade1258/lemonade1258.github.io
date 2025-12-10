import React, { useState, useEffect } from "react";
import { fetchContact, saveContact, uploadFile } from "../../lib/dataStore";
import { ContactInfo } from "../../types";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

// Default empty state to ensure UI renders even on API failure
const defaultContact: ContactInfo = {
  addressEn: "",
  addressZh: "",
  emailGeneral: "",
  emailAdmissions: "",
  introEn: "",
  introZh: "",
  hiringTextEn: "",
  hiringTextZh: "",
  hiringLink: "",
  mapEmbedUrl: "",
  heroImages: [],
};

const ContactManager: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<ContactInfo>(defaultContact);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const d = await fetchContact();
        // If backend returns empty object, merge with default to avoid null access
        setData({ ...defaultContact, ...d });
      } catch (e: any) {
        console.error("Failed to load contact info:", e);
        setMsg({
          type: "error",
          text: "无法连接到服务器。您处于离线编辑模式，保存可能会失败。",
        });
        // Keep default data so user can still see the UI
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateField = (field: keyof ContactInfo, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setMsg(null);
    try {
      await saveContact(data);
      setMsg({
        type: "success",
        text: "保存成功！数据已更新。Saved successfully!",
      });
      setHasUnsavedChanges(false);
      // Auto clear success message
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMsg({
        type: "error",
        text: `保存失败: ${err.message || "服务器连接错误"}`,
      });
    }
  };

  const handleAddImage = () => {
    if (newImageUrl) {
      setData((prev) => ({
        ...prev,
        heroImages: [...(prev.heroImages || []), newImageUrl],
      }));
      setNewImageUrl("");
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveImage = (index: number) => {
    setData((prev) => {
      const newImages = [...(prev.heroImages || [])];
      newImages.splice(index, 1);
      return { ...prev, heroImages: newImages };
    });
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      setMsg(null);
      try {
        const url = await uploadFile(e.target.files[0]);
        // Auto add to list
        setData((prev) => ({
          ...prev,
          heroImages: [...(prev.heroImages || []), url],
        }));
        setMsg({
          type: "success",
          text: "Image uploaded! Remember to click SAVE.",
        });
        setHasUnsavedChanges(true);
        setTimeout(() => setMsg(null), 5000);
      } catch (err: any) {
        setMsg({ type: "error", text: `Upload failed: ${err.message}` });
      } finally {
        setUploading(false);
      }
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-slate-400">Loading settings...</div>
    );

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full overflow-y-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 sticky top-0 bg-white/95 backdrop-blur z-10 py-2 border-b">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            站点设置 (Site Settings)
          </h2>
          <p className="text-slate-500 text-sm">
            管理联系方式、首页轮播图及招聘信息
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-2 text-white rounded flex items-center shadow-sm transition-all active:scale-95 ${
            hasUnsavedChanges
              ? "bg-brand-red hover:bg-red-700 animate-pulse"
              : "bg-slate-700 hover:bg-slate-800"
          }`}
        >
          <Save size={18} className="mr-2" />
          {hasUnsavedChanges
            ? "保存未保存的更改 (Save Changes*)"
            : "保存 (Save)"}
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-md mb-6 flex items-start gap-3 ${
            msg.type === "error"
              ? "bg-red-50 text-red-800 border border-red-100"
              : "bg-green-50 text-green-800 border border-green-100"
          }`}
        >
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      <div className="space-y-8 pb-10">
        {/* Hero Image Carousel Management */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <ImageIcon className="text-brand-red" size={20} />
            <h3 className="font-bold text-slate-800">
              首页轮播大图 (Homepage Carousel)
            </h3>
          </div>

          <div className="p-6">
            <p className="text-sm text-slate-500 mb-6">
              这里的图片将会在首页底部全屏展示，并自动轮播。建议尺寸：1920x1080。
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {data.heroImages && data.heroImages.length > 0 ? (
                data.heroImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm"
                  >
                    <img
                      src={img}
                      alt={`Slide ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 md:col-span-4 p-8 border-2 border-dashed border-slate-200 rounded-lg text-center">
                  <ImageIcon className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">
                    暂无图片，将显示默认背景。
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col xl:flex-row gap-6 bg-slate-50 p-4 rounded-lg">
              <div className="flex-grow">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  方式 A: 输入图片链接
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-grow px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none text-sm"
                    placeholder="https://example.com/image.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <button
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 flex items-center text-sm font-medium"
                  >
                    <Plus size={16} className="mr-1" /> 添加
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <span className="text-xs font-bold text-slate-300 px-2">
                  OR
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  方式 B: 上传本地文件
                </label>
                <label
                  className={`cursor-pointer flex items-center justify-center px-4 py-2 border border-slate-300 bg-white rounded hover:bg-brand-red/5 hover:border-brand-red/30 text-slate-700 text-sm transition-all ${
                    uploading ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {uploading ? (
                    <span className="animate-spin mr-2 font-bold">...</span>
                  ) : (
                    <Upload size={16} className="mr-2" />
                  )}
                  {uploading ? "上传中..." : "选择图片上传"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Intro Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-bold text-slate-700">
              简介文案 (Introduction)
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  English
                </label>
                <textarea
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded focus:border-brand-red outline-none"
                  value={data.introEn || ""}
                  onChange={(e) => updateField("introEn", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  中文
                </label>
                <textarea
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded focus:border-brand-red outline-none"
                  value={data.introZh || ""}
                  onChange={(e) => updateField("introZh", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-bold text-slate-700">
              地址信息 (Address)
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  English
                </label>
                <textarea
                  rows={4}
                  className="w-full p-3 border border-slate-300 rounded focus:border-brand-red outline-none font-mono text-sm"
                  value={data.addressEn || ""}
                  onChange={(e) => updateField("addressEn", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  中文
                </label>
                <textarea
                  rows={4}
                  className="w-full p-3 border border-slate-300 rounded focus:border-brand-red outline-none font-mono text-sm"
                  value={data.addressZh || ""}
                  onChange={(e) => updateField("addressZh", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Hiring Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-bold text-slate-700">
              招聘信息 (Hiring)
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Text (English)
                </label>
                <input
                  className="w-full p-3 border border-slate-300 rounded focus:border-brand-red outline-none"
                  value={data.hiringTextEn || ""}
                  onChange={(e) => updateField("hiringTextEn", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Text (Chinese)
                </label>
                <input
                  className="w-full p-3 border border-slate-300 rounded focus:border-brand-red outline-none"
                  value={data.hiringTextZh || ""}
                  onChange={(e) => updateField("hiringTextZh", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Link URL
                </label>
                <input
                  className="w-full p-3 border border-slate-300 rounded focus:border-brand-red outline-none text-brand-tech"
                  value={data.hiringLink || ""}
                  onChange={(e) => updateField("hiringLink", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* General Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-bold text-slate-700">
              联系方式与地图 (Contact & Map)
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  General Email
                </label>
                <input
                  className="w-full p-3 border border-slate-300 rounded focus:border-brand-red outline-none"
                  value={data.emailGeneral || ""}
                  onChange={(e) => updateField("emailGeneral", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Admissions Email
                </label>
                <input
                  className="w-full p-3 border border-slate-300 rounded focus:border-brand-red outline-none"
                  value={data.emailAdmissions || ""}
                  onChange={(e) =>
                    updateField("emailAdmissions", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Google Maps Embed URL
                </label>
                <textarea
                  className="w-full p-3 border border-slate-300 rounded focus:border-brand-red outline-none text-xs font-mono h-24"
                  value={data.mapEmbedUrl || ""}
                  onChange={(e) => updateField("mapEmbedUrl", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;
