import React, { useState, useEffect } from "react";
import { getPeople } from "../lib/dataStore";
import { Person, PersonCategory } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Mail,
  Globe,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Briefcase,
  Star,
} from "lucide-react";

const TeacherCard: React.FC<{ person: Person }> = ({ person }) => {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const isZh = language === "zh";

  const name = isZh ? person.nameZh || person.name : person.name;
  const title = isZh ? person.titleZh || person.title : person.title;
  const bio = isZh ? person.bioZh || person.bio : person.bio;
  const position = isZh
    ? person.teacherProfile?.positionZh || person.teacherProfile?.position
    : person.teacherProfile?.position;

  // Determine which arrays to display based on language
  const researchAreas = isZh
    ? person.teacherProfile?.researchAreasZh?.length
      ? person.teacherProfile.researchAreasZh
      : person.teacherProfile?.researchAreas
    : person.teacherProfile?.researchAreas;

  const achievements = isZh
    ? person.teacherProfile?.achievementsZh?.length
      ? person.teacherProfile.achievementsZh
      : person.teacherProfile?.achievements
    : person.teacherProfile?.achievements;

  const projects = isZh
    ? person.teacherProfile?.projectsZh?.length
      ? person.teacherProfile.projectsZh
      : person.teacherProfile?.projects
    : person.teacherProfile?.projects;

  const influence = isZh
    ? person.teacherProfile?.influenceZh?.length
      ? person.teacherProfile.influenceZh
      : person.teacherProfile?.influence
    : person.teacherProfile?.influence;

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Avatar Side */}
        <div className="md:w-64 md:flex-shrink-0 bg-slate-50 relative group">
          <div className="aspect-[3/4] md:h-full w-full">
            <img
              src={person.avatar}
              alt={name}
              className="w-full h-full object-cover transition-all duration-500"
            />
          </div>
        </div>

        {/* Content Side */}
        <div className="p-6 md:p-8 flex-grow flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-serif font-bold text-brand-dark mb-1">
                {name}
              </h3>
              <p className="text-brand-red font-medium text-sm uppercase tracking-wide mb-2">
                {title}
              </p>
              {position && (
                <p className="text-slate-500 text-sm mb-4 italic">{position}</p>
              )}
            </div>

            <div className="flex gap-3">
              {person.email && (
                <a
                  href={`mailto:${person.email}`}
                  className="text-slate-400 hover:text-brand-tech"
                  title={t("common.email")}
                >
                  <Mail size={18} />
                </a>
              )}
              {person.homepage && (
                <a
                  href={person.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-brand-tech"
                  title={t("common.website")}
                >
                  <Globe size={18} />
                </a>
              )}
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed font-light mb-6 flex-grow">
            {bio}
          </p>

          {/* Research Areas Tags */}
          {researchAreas && researchAreas.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                {t("people.profile.research")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {researchAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-brand-gray text-slate-600 text-xs rounded-full border border-slate-200"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Expanded Details */}
          {expanded && person.teacherProfile && (
            <div className="mt-4 pt-6 border-t border-slate-100 space-y-6 animate-fade-in">
              {achievements && achievements.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-brand-dark font-medium">
                    <Award size={16} className="text-brand-red" />
                    <h4>{t("people.profile.achievements")}</h4>
                  </div>
                  <ul className="list-disc list-outside ml-5 text-sm text-slate-600 space-y-1">
                    {achievements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {projects && projects.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-brand-dark font-medium">
                    <Briefcase size={16} className="text-brand-tech" />
                    <h4>{t("people.profile.projects")}</h4>
                  </div>
                  <ul className="list-disc list-outside ml-5 text-sm text-slate-600 space-y-1">
                    {projects.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {influence && influence.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-brand-dark font-medium">
                    <Star size={16} className="text-yellow-500" />
                    <h4>{t("people.profile.influence")}</h4>
                  </div>
                  <ul className="list-disc list-outside ml-5 text-sm text-slate-600 space-y-1">
                    {influence.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="self-start mt-2 text-brand-tech text-sm font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
          >
            {expanded
              ? t("people.profile.lessInfo")
              : t("people.profile.moreInfo")}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentCard: React.FC<{ person: Person }> = ({ person }) => {
  const { t, language } = useLanguage();
  const isZh = language === "zh";
  const name = isZh ? person.nameZh || person.name : person.name;
  const title = isZh ? person.titleZh || person.title : person.title;
  const bio = isZh ? person.bioZh || person.bio : person.bio;

  return (
    <div className="bg-white border border-slate-100 rounded p-4 hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-50 flex-shrink-0">
          <img
            src={person.avatar}
            alt={name}
            className="w-full h-full object-cover transition-all duration-500"
          />
        </div>
        <div>
          <h3 className="font-serif font-bold text-slate-800 group-hover:text-brand-red transition-colors">
            {name}
          </h3>
          <p className="text-xs uppercase text-slate-400 font-medium">
            {title}
          </p>
          {person.grade && (
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
              {person.grade}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed font-light line-clamp-3 mb-4 flex-grow">
        {bio}
      </p>
      {person.email && (
        <a
          href={`mailto:${person.email}`}
          className="text-xs font-bold text-brand-tech self-start hover:underline"
        >
          EMAIL
        </a>
      )}
    </div>
  );
};

const People: React.FC = () => {
  const { t } = useLanguage();
  const [people, setPeople] = useState<Person[]>([]);
  const [activeTab, setActiveTab] = useState<string>("Teachers");
  const [loading, setLoading] = useState(true);

  const categories: { key: string; label: string }[] = [
    { key: "Teachers", label: t("people.categories.Teachers") },
    {
      key: "Visiting Scholars",
      label: t("people.categories.Visiting Scholars"),
    },
    { key: "PhD", label: t("people.categories.PhD") },
    { key: "Master", label: t("people.categories.Master") },
    { key: "Other", label: "Research Staff" }, // Group RA/Intern/Secretary
  ];

  useEffect(() => {
    const data = getPeople();
    // Sort by order
    data.sort((a, b) => (a.order || 99) - (b.order || 99));
    setPeople(data);
    setLoading(false);
  }, []);

  // Filter Logic with Safety Check
  const filteredPeople = people.filter((p) => {
    if (!p.category) return false;
    if (activeTab === "Master") return p.category.includes("Master");
    if (activeTab === "Other")
      return ["RA", "Intern", "Secretary"].includes(p.category);
    return p.category === activeTab;
  });

  // Secondary Grouping for Master/Other
  const renderGrouped = () => {
    if (activeTab === "Master") {
      const prof = filteredPeople.filter(
        (p) => p.category === "Professional Master"
      );
      const acad = filteredPeople.filter(
        (p) => p.category === "Academic Master"
      );

      return (
        <div className="space-y-12 animate-fade-in-up">
          {prof.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-400 mb-6 border-b pb-2">
                {t("people.categories.Professional Master")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {prof.map((p) => (
                  <StudentCard key={p.id} person={p} />
                ))}
              </div>
            </div>
          )}
          {acad.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-400 mb-6 border-b pb-2">
                {t("people.categories.Academic Master")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {acad.map((p) => (
                  <StudentCard key={p.id} person={p} />
                ))}
              </div>
            </div>
          )}

          {/* Fallback if data doesn't match subcategories but is labeled 'Master' */}
          {prof.length === 0 &&
            acad.length === 0 &&
            filteredPeople.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPeople.map((p) => (
                  <StudentCard key={p.id} person={p} />
                ))}
              </div>
            )}

          {filteredPeople.length === 0 && (
            <p className="text-slate-400 italic">{t("common.noData")}</p>
          )}
        </div>
      );
    }

    // Default Grid for 'Other' and fallback
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
        {filteredPeople.length > 0 ? (
          filteredPeople.map((p) => <StudentCard key={p.id} person={p} />)
        ) : (
          <p className="text-slate-400 italic col-span-3">
            {t("common.noData")}
          </p>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen pt-24 text-center">
        {t("common.loading")}
      </div>
    );

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 pt-10">
          <h1 className="text-5xl md:text-6xl font-serif text-brand-dark mb-6">
            {t("nav.people")}
          </h1>
          <p className="text-xl text-slate-500 font-light max-w-3xl leading-relaxed">
            {t("hero.description")}
          </p>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={`mr-8 pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                activeTab === cat.key
                  ? "text-brand-red border-b-2 border-brand-red"
                  : "text-slate-400 hover:text-brand-dark"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {activeTab === "Teachers" || activeTab === "Visiting Scholars" ? (
            <div className="space-y-8 animate-fade-in-up">
              {filteredPeople.map((person) => (
                <TeacherCard key={person.id} person={person} />
              ))}
              {filteredPeople.length === 0 && (
                <p className="text-slate-400 italic">{t("common.noData")}</p>
              )}
            </div>
          ) : (
            renderGrouped()
          )}
        </div>
      </div>
    </div>
  );
};

export default People;
