import React, { useState, useEffect } from "react";
import {
  fetchContact,
  saveContact,
  uploadFile,
  clearCache,
} from "../../lib/dataStore";
import { ContactInfo, Partner } from "../../types";
import {
  Save,
  Plus,
  Trash2,
  Home,
  FileText,
  Users,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertCircle,
  Info,
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
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "contact">("home");

  const [newPartner, setNewPartner] = useState<Partner>({
    name: "",
    nameZh: "",
    logo: "",
    link: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const d = await fetchContact();
      setData({ ...defaultContact, ...d });
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Failed to load settings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (field: keyof ContactInfo, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setMsg(null);
    setIsSaving(true);
    try {
      await saveContact(data);
      clearCache(); // 现在只清除数据缓存，不会导致退出登录
      setMsg({ type: "success", text: "Saved successfully! Content updated." });
      setHasUnsavedChanges(false);
      setTimeout(() => setMsg(null), 4000);
    } catch (err: any) {
      setMsg({ type: "error", text: `Save failed: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPartner = () => {
    if (newPartner.name && newPartner.logo) {
      setData((prev) => ({
        ...prev,
        partners: [...(prev.partners || []), newPartner],
      }));
      setNewPartner({ name: "", nameZh: "", logo: "", link: "" });
      setHasUnsavedChanges(true);
    } else {
      alert("Name (En) and Logo URL are required");
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

  const movePartner = (index: number, direction: "up" | "down") => {
    setData((prev) => {
      const list = [...(prev.partners || [])];
      if (direction === "up" && index > 0) {
        [list[index], list[index - 1]] = [list[index - 1], list[index]];
      } else if (direction === "down" && index < list.length - 1) {
        [list[index], list[index + 1]] = [list[index + 1], list[index]];
      }
      return { ...prev, partners: list };
    });
    setHasUnsavedChanges(true);
  };

  if (loading)
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-4">
        <RefreshCw className="animate-spin" size={32} />
        Fetching settings...
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full overflow-y-auto relative">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 z-10 py-2 border-b">
        <h2 className="text-2xl font-bold text-slate-800">Site Settings</h2>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="px-3 py-2 text-slate-500 hover:text-brand-dark rounded flex items-center gap-1 border"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 text-white rounded flex items-center shadow-sm transition-all ${
              isSaving
                ? "bg-slate-400 opacity-50"
                : hasUnsavedChanges
                ? "bg-brand-red animate-pulse"
                : "bg-slate-700"
            }`}
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save size={18} className="mr-2" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-md mb-6 flex items-start gap-3 border animate-fade-in ${
            msg.type === "error"
              ? "bg-red-50 text-red-800 border-red-100"
              : "bg-green-50 text-green-800 border-green-100"
          }`}
        >
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="text-sm font-medium">{msg.text}</div>
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

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} /> Research Areas (HTML Supported)
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info size={12} /> &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;,
                  &lt;li&gt; allowed
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    HTML Content (En)
                  </label>
                  <textarea
                    rows={8}
                    className="w-full p-2 border rounded font-mono text-sm bg-slate-50"
                    value={data.researchAreasTextEn || ""}
                    onChange={(e) =>
                      updateField("researchAreasTextEn", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    HTML Content (Zh)
                  </label>
                  <textarea
                    rows={8}
                    className="w-full p-2 border rounded font-mono text-sm bg-slate-50"
                    value={data.researchAreasTextZh || ""}
                    onChange={(e) =>
                      updateField("researchAreasTextZh", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700 flex items-center gap-2">
                <Users size={18} /> Collaborating Institutions
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {(data.partners || []).map((p, idx) => (
                    <div
                      key={idx}
                      className="border p-3 rounded flex items-center gap-3 bg-white shadow-sm relative group"
                    >
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => movePartner(idx, "up")}
                          disabled={idx === 0}
                          className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-30"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => movePartner(idx, "down")}
                          disabled={idx === (data.partners?.length || 0) - 1}
                          className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-30"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="h-10 w-16 object-contain bg-slate-50 p-1 border rounded"
                      />
                      <div className="min-w-0 flex-grow">
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {p.nameZh || "---"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemovePartner(idx)}
                        className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-4 rounded space-y-3 border-2 border-dashed border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="p-2 border rounded text-sm"
                      placeholder="Name (En)"
                      value={newPartner.name}
                      onChange={(e) =>
                        setNewPartner({ ...newPartner, name: e.target.value })
                      }
                    />
                    <input
                      className="p-2 border rounded text-sm"
                      placeholder="Name (Zh)"
                      value={newPartner.nameZh || ""}
                      onChange={(e) =>
                        setNewPartner({ ...newPartner, nameZh: e.target.value })
                      }
                    />
                  </div>
                  <input
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Logo URL (Direct link to image)"
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
                      className="px-6 bg-slate-800 text-white rounded text-sm font-bold hover:bg-brand-red transition-colors"
                    >
                      Add Institution
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "contact" && (
          <div className="space-y-8">
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

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700">
                Emails & Map
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      General Email(s)
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2 border rounded font-mono text-sm"
                      value={data.emailGeneral}
                      onChange={(e) =>
                        updateField("emailGeneral", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Admissions Email(s)
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2 border rounded font-mono text-sm"
                      value={data.emailAdmissions}
                      onChange={(e) =>
                        updateField("emailAdmissions", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Map Embed URL
                  </label>
                  <textarea
                    className="w-full p-2 border rounded font-mono text-xs"
                    value={data.mapEmbedUrl}
                    onChange={(e) => updateField("mapEmbedUrl", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManager;
