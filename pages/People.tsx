import React, { useState, useEffect } from "react";
import { fetchPeople } from "../lib/dataStore";
import { Person } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Mail,
  Globe,
  ChevronDown,
  ChevronUp,
  Award,
  Briefcase,
  Star,
  ArrowRight,
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
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 mb-8">
      <div className="flex flex-col md:flex-row items-start">
        <div className="w-full md:w-64 md:flex-shrink-0 bg-slate-50 relative group border-b md:border-b-0 md:border-r border-slate-100">
          <div className="aspect-[3/4] w-full">
            <img
              src={person.avatar}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>

        <div className="p-6 md:p-8 flex-grow flex flex-col w-full min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div>
              <h3 className="text-2xl font-serif font-bold text-brand-dark mb-1 leading-tight">
                {name}
              </h3>
              <p className="text-brand-red font-medium text-sm uppercase tracking-wide mb-2">
                {title}
              </p>
              {position && (
                <p className="text-slate-500 text-sm italic">{position}</p>
              )}
            </div>

            <div className="flex gap-3 flex-shrink-0">
              {person.email && (
                <a
                  href={`mailto:${person.email}`}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-white hover:bg-brand-red transition-colors"
                  title={t("common.email")}
                >
                  <Mail size={16} />
                </a>
              )}
              {person.homepage && (
                <a
                  href={person.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-white hover:bg-brand-tech transition-colors"
                  title={t("common.website")}
                >
                  <Globe size={16} />
                </a>
              )}
            </div>
          </div>

          <div
            className={`text-slate-600 leading-relaxed font-light mb-6 relative ${
              expanded ? "" : "line-clamp-4 md:line-clamp-5"
            }`}
          >
            {bio}
          </div>

          {researchAreas && researchAreas.length > 0 && (
            <div className="mb-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                {t("people.profile.research")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {researchAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs rounded border border-slate-200"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {expanded && person.teacherProfile && (
            <div className="mt-2 pt-6 border-t border-slate-100 space-y-6 animate-fade-in origin-top">
              {achievements && achievements.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-brand-dark font-medium">
                    <Award size={16} className="text-brand-red" />
                    <h4 className="text-sm font-bold">
                      {t("people.profile.achievements")}
                    </h4>
                  </div>
                  <ul className="list-disc list-outside ml-5 text-sm text-slate-600 space-y-1.5 marker:text-slate-300">
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
                    <h4 className="text-sm font-bold">
                      {t("people.profile.projects")}
                    </h4>
                  </div>
                  <ul className="list-disc list-outside ml-5 text-sm text-slate-600 space-y-1.5 marker:text-slate-300">
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
                    <h4 className="text-sm font-bold">
                      {t("people.profile.influence")}
                    </h4>
                  </div>
                  <ul className="list-disc list-outside ml-5 text-sm text-slate-600 space-y-1.5 marker:text-slate-300">
                    {influence.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-auto pt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-brand-red transition-colors"
            >
              {expanded ? (
                <>
                  {t("people.profile.lessInfo")}
                  <ChevronUp
                    size={14}
                    className="group-hover:-translate-y-0.5 transition-transform"
                  />
                </>
              ) : (
                <>
                  {t("people.profile.moreInfo")}
                  <ChevronDown
                    size={14}
                    className="group-hover:translate-y-0.5 transition-transform"
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact Grid Card for students/staff - 2 per row
const CompactPersonCard: React.FC<{ person: Person }> = ({ person }) => {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const name = isZh ? person.nameZh || person.name : person.name;
  const title = isZh ? person.titleZh || person.title : person.title;
  const bio = isZh ? person.bioZh || person.bio : person.bio;

  const Wrapper = person.homepage ? "a" : "div";
  const props = person.homepage
    ? { href: person.homepage, target: "_blank", rel: "noreferrer" }
    : {};

  return (
    <Wrapper
      {...props}
      className={`block bg-white border border-slate-100 rounded-lg p-5 transition-all duration-300 group hover:shadow-lg hover:border-brand-red/20 ${
        person.homepage ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
          <img
            src={person.avatar}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-serif font-bold text-slate-800 text-lg group-hover:text-brand-red transition-colors truncate">
                {name}
              </h3>
              <p className="text-xs uppercase text-slate-400 font-medium truncate">
                {title}
              </p>
              {person.grade && (
                <span className="inline-block mt-1 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                  {person.grade}
                </span>
              )}
            </div>
            {person.homepage && (
              <ArrowRight
                size={16}
                className="text-slate-300 group-hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
              />
            )}
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-light line-clamp-2 mt-2">
            {bio}
          </p>
        </div>
      </div>
    </Wrapper>
  );
};

const People: React.FC = () => {
  const { t } = useLanguage();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPeople();
        data.sort((a, b) => (a.order || 99) - (b.order || 99));
        setPeople(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getByCategory = (cat: string) =>
    people.filter((p) => p.category === cat);
  const getByCategories = (cats: string[]) =>
    people.filter((p) => cats.includes(p.category));

  if (loading)
    return (
      <div className="min-h-screen pt-24 text-center">
        {t("common.loading")}
      </div>
    );

  const faculty = getByCategory("Teachers");
  const visiting = getByCategory("Visiting Scholars");
  const staff = getByCategories(["Secretary", "RA"]);
  const phd = getByCategory("PhD");
  const masterProf = getByCategory("Professional Master");
  const masterAcad = getByCategory("Academic Master");
  const master = getByCategory("Master"); // fallback
  const interns = getByCategory("Intern");

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 pt-10">
          <h1 className="text-4xl md:text-5xl font-serif text-brand-dark mb-4">
            {t("nav.people")}
          </h1>
          <p className="text-lg text-slate-500 font-light max-w-2xl">
            Meet the faculty, students, and staff of CLAIN.
          </p>
        </header>

        {/* 1. Faculty - Detailed View */}
        {faculty.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 border-b pb-4">
              {t("people.categories.Teachers")}
            </h2>
            <div className="space-y-8">
              {faculty.map((p) => (
                <TeacherCard key={p.id} person={p} />
              ))}
            </div>
          </section>
        )}

        {/* 2. Staff & Visiting - Grid 2 Col */}
        {(staff.length > 0 || visiting.length > 0) && (
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {visiting.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-700 mb-6">
                    {t("people.categories.Visiting Scholars")}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {visiting.map((p) => (
                      <CompactPersonCard key={p.id} person={p} />
                    ))}
                  </div>
                </div>
              )}
              {staff.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-700 mb-6">
                    Staff & RA
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {staff.map((p) => (
                      <CompactPersonCard key={p.id} person={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. PhD - Grid 2 Col */}
        {phd.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 border-b pb-4">
              {t("people.categories.PhD")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {phd.map((p) => (
                <CompactPersonCard key={p.id} person={p} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Masters - Split if data exists, else grouped */}
        {(masterProf.length > 0 ||
          masterAcad.length > 0 ||
          master.length > 0) && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 border-b pb-4">
              {t("people.categories.Master")}
            </h2>

            {masterAcad.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-500 mb-4">
                  {t("people.categories.Academic Master")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {masterAcad.map((p) => (
                    <CompactPersonCard key={p.id} person={p} />
                  ))}
                </div>
              </div>
            )}

            {masterProf.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-500 mb-4">
                  {t("people.categories.Professional Master")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {masterProf.map((p) => (
                    <CompactPersonCard key={p.id} person={p} />
                  ))}
                </div>
              </div>
            )}

            {master.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {master.map((p) => (
                  <CompactPersonCard key={p.id} person={p} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 5. Interns */}
        {interns.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 border-b pb-4">
              {t("people.categories.Intern")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {interns.map((p) => (
                <CompactPersonCard key={p.id} person={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default People;
