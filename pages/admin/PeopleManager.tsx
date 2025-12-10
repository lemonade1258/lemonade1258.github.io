import React, { useState, useEffect } from "react";
import { getPeople, savePeople, exportToCSV } from "../../lib/dataStore";
import { Person, PersonCategory } from "../../types";
import { Search, Plus, Trash2, Edit2, Download, Save, X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const PeopleManager: React.FC = () => {
  const { t } = useLanguage();
  const [people, setPeople] = useState<Person[]>([]);
  const [filtered, setFiltered] = useState<Person[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Person>>({});

  // Helpers for Teacher Profile Arrays (English)
  const [researchInput, setResearchInput] = useState("");
  const [achieveInput, setAchieveInput] = useState("");
  const [projectInput, setProjectInput] = useState("");
  const [influenceInput, setInfluenceInput] = useState("");

  // Helpers for Teacher Profile Arrays (Chinese)
  const [researchInputZh, setResearchInputZh] = useState("");
  const [achieveInputZh, setAchieveInputZh] = useState("");
  const [projectInputZh, setProjectInputZh] = useState("");
  const [influenceInputZh, setInfluenceInputZh] = useState("");

  useEffect(() => {
    const data = getPeople();
    setPeople(data);
    setFiltered(data);
  }, []);

  useEffect(() => {
    if (activeCategory === "All") {
      setFiltered(people);
    } else {
      setFiltered(people.filter((p) => p.category === activeCategory));
    }
  }, [people, activeCategory]);

  const handleSave = () => {
    let newItem = { ...editingItem } as Person;

    // Process textarea inputs into arrays for TeacherProfile if applicable
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

      // Save Chinese arrays
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

    let updated: Person[];
    if (newItem.id) {
      updated = people.map((p) => (p.id === newItem.id ? newItem : p));
    } else {
      newItem.id = Date.now().toString();
      updated = [...people, newItem];
    }
    setPeople(updated);
    savePeople(updated);
    setIsModalOpen(false);
    setEditingItem({});
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this person?")) {
      const updated = people.filter((p) => p.id !== id);
      setPeople(updated);
      savePeople(updated);
    }
  };

  const openModal = (item?: Person) => {
    const freshItem: Partial<Person> = item || {
      category: "Teachers",
      order: 1,
      avatar: "https://picsum.photos/400/400",
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

    // Load array data into textareas
    if (freshItem.teacherProfile) {
      setResearchInput(
        freshItem.teacherProfile.researchAreas?.join("\n") || ""
      );
      setAchieveInput(freshItem.teacherProfile.achievements?.join("\n") || "");
      setProjectInput(freshItem.teacherProfile.projects?.join("\n") || "");
      setInfluenceInput(freshItem.teacherProfile.influence?.join("\n") || "");

      // Load Chinese arrays
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
    } else {
      setResearchInput("");
      setAchieveInput("");
      setProjectInput("");
      setInfluenceInput("");
      setResearchInputZh("");
      setAchieveInputZh("");
      setProjectInputZh("");
      setInfluenceInputZh("");
    }

    setIsModalOpen(true);
  };

  const categories: PersonCategory[] = [
    "Teachers",
    "Visiting Scholars",
    "PhD",
    "Master",
    "Professional Master",
    "Academic Master",
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
            className="px-4 py-2 border rounded hover:bg-slate-50 flex items-center"
          >
            <Download size={16} className="mr-2" /> Export
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700 flex items-center"
          >
            <Plus size={16} className="mr-2" /> {t("admin.add")}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            activeCategory === "All"
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              activeCategory === c
                ? "bg-brand-red text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((person) => (
            <div
              key={person.id}
              className="border rounded-lg p-4 flex gap-4 items-start relative group bg-slate-50"
            >
              <img
                src={person.avatar}
                alt={person.name}
                className="w-14 h-14 rounded-full object-cover bg-slate-200"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">
                  {person.name}
                </h3>
                <p className="text-xs text-brand-red font-bold mb-0.5">
                  {person.category}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {person.title}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => openModal(person)}
                  className="p-1.5 bg-white border rounded text-blue-600 hover:bg-blue-50"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(person.id)}
                  className="p-1.5 bg-white border rounded text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h3 className="text-xl font-bold">
                {editingItem.id ? "Edit Person" : "Add Person"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-grow overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category: e.target.value as PersonCategory,
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Order (Sort Priority)
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
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name (En)
                  </label>
                  <input
                    value={editingItem.name || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, name: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name (Zh)
                  </label>
                  <input
                    value={editingItem.nameZh || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, nameZh: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title (En)
                  </label>
                  <input
                    value={editingItem.title || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, title: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="e.g. Professor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title (Zh)
                  </label>
                  <input
                    value={editingItem.titleZh || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        titleZh: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Avatar URL
                  </label>
                  <input
                    value={editingItem.avatar || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, avatar: e.target.value })
                    }
                    className="w-full p-2 border rounded text-xs text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    value={editingItem.email || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, email: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Homepage / Website
                  </label>
                  <input
                    value={editingItem.homepage || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        homepage: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bio (En)
                  </label>
                  <textarea
                    value={editingItem.bio || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, bio: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bio (Zh)
                  </label>
                  <textarea
                    value={editingItem.bioZh || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, bioZh: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
              </div>

              {/* Teacher Profile Section - Only show for Teachers/Visiting */}
              {["Teachers", "Visiting Scholars"].includes(
                editingItem.category as string
              ) && (
                <div className="border-t pt-6 mt-2">
                  <h4 className="text-lg font-bold text-slate-800 mb-4">
                    {t("admin.teacherProfile")}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Position (En)
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
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Position (Zh)
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
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Research Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Research Areas (En) - One per line
                        </label>
                        <textarea
                          value={researchInput}
                          onChange={(e) => setResearchInput(e.target.value)}
                          className="w-full p-2 border rounded text-sm bg-slate-50"
                          rows={4}
                          placeholder="NLP&#10;Computer Vision"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Research Areas (Zh) - One per line
                        </label>
                        <textarea
                          value={researchInputZh}
                          onChange={(e) => setResearchInputZh(e.target.value)}
                          className="w-full p-2 border rounded text-sm bg-slate-50"
                          rows={4}
                          placeholder="自然语言处理&#10;计算机视觉"
                        />
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Achievements (En) - One per line
                        </label>
                        <textarea
                          value={achieveInput}
                          onChange={(e) => setAchieveInput(e.target.value)}
                          className="w-full p-2 border rounded text-sm bg-slate-50"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Achievements (Zh) - One per line
                        </label>
                        <textarea
                          value={achieveInputZh}
                          onChange={(e) => setAchieveInputZh(e.target.value)}
                          className="w-full p-2 border rounded text-sm bg-slate-50"
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Projects (En) - One per line
                        </label>
                        <textarea
                          value={projectInput}
                          onChange={(e) => setProjectInput(e.target.value)}
                          className="w-full p-2 border rounded text-sm bg-slate-50"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Projects (Zh) - One per line
                        </label>
                        <textarea
                          value={projectInputZh}
                          onChange={(e) => setProjectInputZh(e.target.value)}
                          className="w-full p-2 border rounded text-sm bg-slate-50"
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* Influence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Influence / Service (En) - One per line
                        </label>
                        <textarea
                          value={influenceInput}
                          onChange={(e) => setInfluenceInput(e.target.value)}
                          className="w-full p-2 border rounded text-sm bg-slate-50"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Influence / Service (Zh) - One per line
                        </label>
                        <textarea
                          value={influenceInputZh}
                          onChange={(e) => setInfluenceInputZh(e.target.value)}
                          className="w-full p-2 border rounded text-sm bg-slate-50"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brand-red text-white rounded"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleManager;
