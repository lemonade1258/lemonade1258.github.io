import React, { useState, useEffect } from "react";
import { fetchContact, saveContact, uploadFile } from "../../lib/dataStore";
import { ContactInfo, Partner } from "../../types";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  AlertCircle,
  Home,
  FileText,
  Users,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

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
  welcomeTitleEn: "",
  welcomeTitleZh: "",
  welcomeTextEn: "",
  welcomeTextZh: "",
  researchAreasTextEn: "",
  researchAreasTextZh: "",
  partners: [],
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
  const [activeTab, setActiveTab] = useState<"home" | "contact">("home");

  // Partner State
  const [newPartner, setNewPartner] = useState<Partner>({
    name: "",
    logo: "",
    link: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const d = await fetchContact();
        setData({ ...defaultContact, ...d });
      } catch (e: any) {
        setMsg({ type: "error", text: "Offline Mode." });
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
      setMsg({ type: "success", text: "Saved successfully!" });
      setHasUnsavedChanges(false);
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: "error", text: `Failed: ${err.message}` });
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
      try {
        const url = await uploadFile(e.target.files[0]);
        setData((prev) => ({
          ...prev,
          heroImages: [...(prev.heroImages || []), url],
        }));
        setMsg({ type: "success", text: "Image uploaded!" });
        setHasUnsavedChanges(true);
      } catch (err: any) {
        setMsg({ type: "error", text: `Upload failed: ${err.message}` });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAddPartner = () => {
    if (newPartner.name && newPartner.logo) {
      setData((prev) => ({
        ...prev,
        partners: [...(prev.partners || []), newPartner],
      }));
      setNewPartner({ name: "", logo: "", link: "" });
      setHasUnsavedChanges(true);
    } else {
      alert("Name and Logo URL are required");
    }
  };

  const handleRemovePartner = (idx: number) => {
    setData((prev) => {
      const list = [...(prev.partners || [])];
      list.splice(idx, 1);
      return { ...prev, partners: list };
    });
    setHasUnsavedChanges(true);
  };

  if (loading)
    return (
      <div className="p-12 text-center text-slate-400">Loading settings...</div>
    );

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full overflow-y-auto relative">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 z-10 py-2 border-b">
        <h2 className="text-2xl font-bold text-slate-800">Site Settings</h2>
        <button
          onClick={handleSave}
          className={`px-6 py-2 text-white rounded flex items-center shadow-sm ${
            hasUnsavedChanges ? "bg-brand-red animate-pulse" : "bg-slate-700"
          }`}
        >
          <Save size={18} className="mr-2" /> Save
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-md mb-6 ${
            msg.type === "error"
              ? "bg-red-50 text-red-800"
              : "bg-green-50 text-green-800"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab("home")}
          className={`pb-3 px-4 font-bold border-b-2 transition-colors ${
            activeTab === "home"
              ? "border-brand-red text-brand-red"
              : "border-transparent text-slate-400"
          }`}
        >
          Home Page
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`pb-3 px-4 font-bold border-b-2 transition-colors ${
            activeTab === "contact"
              ? "border-brand-red text-brand-red"
              : "border-transparent text-slate-400"
          }`}
        >
          Contact & Hiring
        </button>
      </div>

      <div className="space-y-8 pb-10">
        {activeTab === "home" && (
          <>
            {/* 1. Welcome Section */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700 flex items-center gap-2">
                <Home size={18} /> Welcome Message
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Title (En)
                    </label>
                    <input
                      className="w-full p-2 border rounded"
                      value={data.welcomeTitleEn || ""}
                      onChange={(e) =>
                        updateField("welcomeTitleEn", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Title (Zh)
                    </label>
                    <input
                      className="w-full p-2 border rounded"
                      value={data.welcomeTitleZh || ""}
                      onChange={(e) =>
                        updateField("welcomeTitleZh", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Body (En)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-2 border rounded"
                      value={data.welcomeTextEn || ""}
                      onChange={(e) =>
                        updateField("welcomeTextEn", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Body (Zh)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-2 border rounded"
                      value={data.welcomeTextZh || ""}
                      onChange={(e) =>
                        updateField("welcomeTextZh", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Carousel */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon size={18} /> Homepage Carousel
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {(data.heroImages || []).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-video bg-slate-100 rounded overflow-hidden"
                    >
                      <img
                        src={img}
                        alt="slide"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-grow p-2 border rounded text-sm"
                    placeholder="Image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <button
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-slate-800 text-white rounded text-sm"
                  >
                    Add URL
                  </button>
                  <label
                    className={`cursor-pointer px-4 py-2 bg-white border rounded hover:bg-slate-50 text-sm ${
                      uploading ? "opacity-50" : ""
                    }`}
                  >
                    {uploading ? "..." : <Upload size={16} />}
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

            {/* 3. Research Areas */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700 flex items-center gap-2">
                <FileText size={18} /> Research Areas
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Text (En) - Supports newlines
                  </label>
                  <textarea
                    rows={6}
                    className="w-full p-2 border rounded"
                    value={data.researchAreasTextEn || ""}
                    onChange={(e) =>
                      updateField("researchAreasTextEn", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Text (Zh) - Supports newlines
                  </label>
                  <textarea
                    rows={6}
                    className="w-full p-2 border rounded"
                    value={data.researchAreasTextZh || ""}
                    onChange={(e) =>
                      updateField("researchAreasTextZh", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* 4. Partners */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700 flex items-center gap-2">
                <Users size={18} /> Collaborating Institutions
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {(data.partners || []).map((p, idx) => (
                    <div
                      key={idx}
                      className="border p-2 rounded relative group text-center"
                    >
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="h-12 w-full object-contain mb-2"
                      />
                      <p className="text-xs truncate">{p.name}</p>
                      <button
                        onClick={() => handleRemovePartner(idx)}
                        className="absolute top-1 right-1 bg-red-50 text-red-600 p-1 rounded hover:bg-red-100 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-50 p-4 rounded">
                  <input
                    className="p-2 border rounded text-sm"
                    placeholder="Partner Name"
                    value={newPartner.name}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, name: e.target.value })
                    }
                  />
                  <input
                    className="p-2 border rounded text-sm"
                    placeholder="Logo URL"
                    value={newPartner.logo}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, logo: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <input
                      className="flex-grow p-2 border rounded text-sm"
                      placeholder="Link (Optional)"
                      value={newPartner.link}
                      onChange={(e) =>
                        setNewPartner({ ...newPartner, link: e.target.value })
                      }
                    />
                    <button
                      onClick={handleAddPartner}
                      className="px-4 bg-brand-red text-white rounded text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "contact" && (
          <>
            {/* Address & Intro */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700">
                Contact Page Intro & Address
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded"
                    placeholder="Intro En"
                    value={data.introEn}
                    onChange={(e) => updateField("introEn", e.target.value)}
                  />
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded"
                    placeholder="Intro Zh"
                    value={data.introZh}
                    onChange={(e) => updateField("introZh", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded font-mono text-sm"
                    placeholder="Address En"
                    value={data.addressEn}
                    onChange={(e) => updateField("addressEn", e.target.value)}
                  />
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded font-mono text-sm"
                    placeholder="Address Zh"
                    value={data.addressZh}
                    onChange={(e) => updateField("addressZh", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Emails & Map */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700">
                Emails & Map
              </div>
              <div className="p-6 space-y-4">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="General Email"
                  value={data.emailGeneral}
                  onChange={(e) => updateField("emailGeneral", e.target.value)}
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Admissions Email"
                  value={data.emailAdmissions}
                  onChange={(e) =>
                    updateField("emailAdmissions", e.target.value)
                  }
                />
                <textarea
                  className="w-full p-2 border rounded font-mono text-xs"
                  placeholder="Map Embed URL"
                  value={data.mapEmbedUrl}
                  onChange={(e) => updateField("mapEmbedUrl", e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactManager;
