import React, { useState, useEffect } from "react";
import { fetchContact, saveContact, clearCache } from "../../lib/dataStore";
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
  Edit2,
  X,
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

  // Partner Editing State
  const [newPartner, setNewPartner] = useState<Partner>({
    name: "",
    nameZh: "",
    logo: "",
    link: "",
  });
  const [editingPartnerIndex, setEditingPartnerIndex] = useState<number | null>(
    null
  );

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
      clearCache();
      setMsg({ type: "success", text: "Saved successfully!" });
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
      if (editingPartnerIndex !== null) {
        const updatedList = [...(data.partners || [])];
        updatedList[editingPartnerIndex] = newPartner;
        setData((prev) => ({ ...prev, partners: updatedList }));
        setEditingPartnerIndex(null);
      } else {
        setData((prev) => ({
          ...prev,
          partners: [...(prev.partners || []), newPartner],
        }));
      }
      setNewPartner({ name: "", nameZh: "", logo: "", link: "" });
      setHasUnsavedChanges(true);
    }
  };

  const handleEditPartner = (idx: number) => {
    setNewPartner(data.partners![idx]);
    setEditingPartnerIndex(idx);
    document
      .getElementById("partner-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRemovePartner = (idx: number) => {
    if (!confirm("Are you sure?")) return;
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
      <div className="p-12 text-center text-slate-400 animate-pulse">
        Loading...
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full overflow-y-auto relative">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 z-10 py-2 border-b">
        <h2 className="text-2xl font-bold text-slate-800">Site Settings</h2>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 text-white rounded flex items-center transition-all ${
              isSaving
                ? "bg-slate-400"
                : hasUnsavedChanges
                ? "bg-brand-red animate-pulse"
                : "bg-slate-700"
            }`}
          >
            <Save size={18} className="mr-2" />{" "}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

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
                  <input
                    className="w-full p-2 border rounded"
                    value={data.welcomeTitleEn || ""}
                    placeholder="Title EN"
                    onChange={(e) =>
                      updateField("welcomeTitleEn", e.target.value)
                    }
                  />
                  <input
                    className="w-full p-2 border rounded"
                    value={data.welcomeTitleZh || ""}
                    placeholder="Title ZH"
                    onChange={(e) =>
                      updateField("welcomeTitleZh", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded"
                    value={data.welcomeTextEn || ""}
                    placeholder="Text EN"
                    onChange={(e) =>
                      updateField("welcomeTextEn", e.target.value)
                    }
                  />
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded"
                    value={data.welcomeTextZh || ""}
                    placeholder="Text ZH"
                    onChange={(e) =>
                      updateField("welcomeTextZh", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} /> Research Areas
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <textarea
                  rows={6}
                  className="w-full p-2 border rounded font-mono text-sm bg-slate-50"
                  value={data.researchAreasTextEn || ""}
                  onChange={(e) =>
                    updateField("researchAreasTextEn", e.target.value)
                  }
                />
                <textarea
                  rows={6}
                  className="w-full p-2 border rounded font-mono text-sm bg-slate-50"
                  value={data.researchAreasTextZh || ""}
                  onChange={(e) =>
                    updateField("researchAreasTextZh", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Partners Admin - Styled to match Frontend refinement */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700 flex items-center gap-2">
                <Users size={18} /> Collaborating Institutions
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {(data.partners || []).map((p, idx) => (
                    <div
                      key={idx}
                      className={`group border rounded-lg p-3 bg-white relative transition-all ${
                        editingPartnerIndex === idx
                          ? "ring-2 ring-brand-red"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="absolute right-1 top-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => movePartner(idx, "up")}
                          className="p-1 bg-white border rounded text-slate-400 hover:text-slate-700"
                        >
                          <ArrowUp size={10} />
                        </button>
                        <button
                          onClick={() => movePartner(idx, "down")}
                          className="p-1 bg-white border rounded text-slate-400 hover:text-slate-700"
                        >
                          <ArrowDown size={10} />
                        </button>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-full aspect-[3/2] bg-slate-50 rounded border flex items-center justify-center p-3 mb-2">
                          <img
                            src={p.logo}
                            alt={p.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <p className="text-[10px] font-bold text-slate-800 truncate w-full text-center">
                          {p.name}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t flex justify-center gap-3">
                        <button
                          onClick={() => handleEditPartner(idx)}
                          className="text-blue-500 hover:underline text-[10px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemovePartner(idx)}
                          className="text-red-400 hover:underline text-[10px] font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  id="partner-form"
                  className={`p-6 rounded-lg border-2 ${
                    editingPartnerIndex !== null
                      ? "bg-brand-red/5 border-brand-red/20"
                      : "bg-slate-50 border-dashed border-slate-200"
                  }`}
                >
                  <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    {editingPartnerIndex !== null ? (
                      <>
                        <Edit2 size={16} /> Edit Partner
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Add New Partner
                      </>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Name (En)"
                      value={newPartner.name}
                      onChange={(e) =>
                        setNewPartner({ ...newPartner, name: e.target.value })
                      }
                    />
                    <input
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Name (Zh)"
                      value={newPartner.nameZh || ""}
                      onChange={(e) =>
                        setNewPartner({ ...newPartner, nameZh: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input
                      className="w-full p-2 border rounded text-sm font-mono"
                      placeholder="Logo URL"
                      value={newPartner.logo}
                      onChange={(e) =>
                        setNewPartner({ ...newPartner, logo: e.target.value })
                      }
                    />
                    <input
                      className="w-full p-2 border rounded text-sm font-mono"
                      placeholder="Website Link"
                      value={newPartner.link || ""}
                      onChange={(e) =>
                        setNewPartner({ ...newPartner, link: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    {editingPartnerIndex !== null && (
                      <button
                        onClick={() => {
                          setEditingPartnerIndex(null);
                          setNewPartner({ name: "", logo: "" });
                        }}
                        className="px-4 py-2 text-sm text-slate-500"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleAddPartner}
                      className="px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded"
                    >
                      {editingPartnerIndex !== null
                        ? "Update Partner"
                        : "Add to List"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === "contact" && (
          <div className="space-y-4">
            <textarea
              rows={3}
              className="w-full p-2 border rounded"
              placeholder="Intro EN"
              value={data.introEn}
              onChange={(e) => updateField("introEn", e.target.value)}
            />
            <textarea
              rows={3}
              className="w-full p-2 border rounded"
              placeholder="Intro ZH"
              value={data.introZh}
              onChange={(e) => updateField("introZh", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                className="w-full p-2 border rounded"
                placeholder="Email General"
                value={data.emailGeneral}
                onChange={(e) => updateField("emailGeneral", e.target.value)}
              />
              <input
                className="w-full p-2 border rounded"
                placeholder="Email Admissions"
                value={data.emailAdmissions}
                onChange={(e) => updateField("emailAdmissions", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManager;
