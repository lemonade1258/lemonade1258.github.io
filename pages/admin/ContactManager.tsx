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
  Edit2,
  X,
  Pipette,
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
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "contact">("home");

  const [newPartner, setNewPartner] = useState<Partner>({
    name: "",
    nameZh: "",
    logo: "",
    link: "",
    bgColor: "#F8FAFC",
  });
  const [editingPartnerIndex, setEditingPartnerIndex] = useState<number | null>(
    null
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const d = await fetchContact();
      setData({ ...defaultContact, ...d });
    } catch (e) {
      console.error(e);
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
    setIsSaving(true);
    try {
      await saveContact(data);
      clearCache();
      setHasUnsavedChanges(false);
      alert("Saved to server successfully!");
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
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
      setNewPartner({
        name: "",
        nameZh: "",
        logo: "",
        link: "",
        bgColor: "#F8FAFC",
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleEditPartner = (idx: number) => {
    setNewPartner({ bgColor: "#F8FAFC", ...data.partners![idx] });
    setEditingPartnerIndex(idx);
    document
      .getElementById("partner-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRemovePartner = (idx: number) => {
    if (!confirm("Delete partner?")) return;
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
    return <div className="p-12 text-center text-slate-400">Loading...</div>;

  const presets = ["#FFFFFF", "#F8FAFC", "#111111", "#1E293B", "#A81C1C"];

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full overflow-y-auto relative">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 z-10 py-2 border-b">
        <h2 className="text-2xl font-bold text-slate-800">Site Settings</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 text-white rounded flex items-center shadow ${
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
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-8">
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

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-slate-50 px-6 py-3 border-b font-bold text-slate-700 flex items-center gap-2">
                <Users size={18} /> Collaborating Institutions
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {(data.partners || []).map((p, idx) => (
                    <div
                      key={idx}
                      className={`group border rounded-lg p-3 relative transition-all ${
                        editingPartnerIndex === idx
                          ? "ring-2 ring-brand-red"
                          : "bg-white"
                      }`}
                    >
                      <div
                        className="w-full h-20 rounded border flex items-center justify-center p-3 mb-2"
                        style={{ backgroundColor: p.bgColor || "#F8FAFC" }}
                      >
                        <img
                          src={p.logo}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-800 truncate text-center">
                        {p.name}
                      </p>
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
                      <div className="absolute right-1 top-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => movePartner(idx, "up")}
                          className="p-1 bg-white border rounded text-slate-400"
                        >
                          <ArrowUp size={10} />
                        </button>
                        <button
                          onClick={() => movePartner(idx, "down")}
                          className="p-1 bg-white border rounded text-slate-400"
                        >
                          <ArrowDown size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  id="partner-form"
                  className={`p-6 rounded-lg border-2 ${
                    editingPartnerIndex !== null
                      ? "bg-blue-50/30 border-blue-200"
                      : "bg-slate-50 border-dashed border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      {editingPartnerIndex !== null ? (
                        <>
                          <Edit2 size={16} /> Edit Institution
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Add Institution
                        </>
                      )}
                    </h4>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-lg border shadow-sm">
                      <div className="flex items-center gap-2 pr-4 border-r">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Background Color
                        </span>
                        <input
                          type="color"
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0 overflow-hidden"
                          value={newPartner.bgColor || "#F8FAFC"}
                          onChange={(e) =>
                            setNewPartner({
                              ...newPartner,
                              bgColor: e.target.value,
                            })
                          }
                        />
                        <input
                          type="text"
                          className="w-20 p-1 text-xs border rounded font-mono"
                          value={newPartner.bgColor || "#F8FAFC"}
                          onChange={(e) =>
                            setNewPartner({
                              ...newPartner,
                              bgColor: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-1">
                        {presets.map((c) => (
                          <button
                            key={c}
                            onClick={() =>
                              setNewPartner({ ...newPartner, bgColor: c })
                            }
                            className={`w-5 h-5 rounded-full border border-slate-200 transition-transform hover:scale-125 ${
                              newPartner.bgColor === c
                                ? "ring-2 ring-brand-red ring-offset-1"
                                : ""
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

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
                          setNewPartner({
                            name: "",
                            logo: "",
                            bgColor: "#F8FAFC",
                          });
                        }}
                        className="px-4 py-2 text-sm text-slate-500"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleAddPartner}
                      className="px-8 py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManager;
