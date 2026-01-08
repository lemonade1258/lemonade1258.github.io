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
  ArrowUpRight,
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
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 mb-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start">
        <div className="w-full md:w-72 md:flex-shrink-0 bg-slate-50 relative group border-b md:border-b-0 md:border-r border-slate-100">
          <div className="aspect-[3/4] w-full">
            <img
              src={person.avatar}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>

        <div className="p-8 md:p-10 flex-grow flex flex-col w-full min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h3 className="text-3xl font-serif font-bold text-brand-dark mb-1.5 leading-tight">
                {name}
              </h3>
              <p className="text-brand-red font-semibold text-sm uppercase tracking-widest mb-2">
                {title}
              </p>
              {position && (
                <p className="text-slate-400 text-sm italic font-light">
                  {position}
                </p>
              )}
            </div>

            <div className="flex gap-3 flex-shrink-0">
              {person.email && (
                <a
                  href={`mailto:${person.email}`}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-white hover:bg-brand-red transition-all duration-300"
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
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-white hover:bg-brand-tech transition-all duration-300"
                  title={t("common.website")}
                >
                  <Globe size={18} />
                </a>
              )}
            </div>
          </div>

          <div
            className={`text-slate-600 leading-relaxed font-light mb-8 text-lg relative ${
              expanded ? "" : "line-clamp-3"
            }`}
          >
            {bio}
          </div>

          {researchAreas && researchAreas.length > 0 && (
            <div className="mb-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-3">
                {t("people.profile.research")}
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {researchAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-50 text-slate-500 text-xs rounded-full border border-slate-100"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {expanded && person.teacherProfile && (
            <div className="mt-2 pt-8 border-t border-slate-100 space-y-8 animate-fade-in origin-top">
              {achievements && achievements.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 text-brand-dark font-medium">
                    <Award size={18} className="text-brand-red" />
                    <h4 className="text-base font-bold">
                      {t("people.profile.achievements")}
                    </h4>
                  </div>
                  <ul className="list-disc list-outside ml-6 text-sm text-slate-500 space-y-2 marker:text-slate-300 font-light">
                    {achievements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {projects && projects.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 text-brand-dark font-medium">
                    <Briefcase size={18} className="text-brand-tech" />
                    <h4 className="text-base font-bold">
                      {t("people.profile.projects")}
                    </h4>
                  </div>
                  <ul className="list-disc list-outside ml-6 text-sm text-slate-500 space-y-2 marker:text-slate-300 font-light">
                    {projects.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {influence && influence.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 text-brand-dark font-medium">
                    <Star size={18} className="text-yellow-500" />
                    <h4 className="text-base font-bold">
                      {t("people.profile.influence")}
                    </h4>
                  </div>
                  <ul className="list-disc list-outside ml-6 text-sm text-slate-500 space-y-2 marker:text-slate-300 font-light">
                    {influence.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-auto pt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-brand-red transition-colors"
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

/**
 * Minimal Member Card for Students, RA, and Staff
 * Optimized for clarity and elegance by removing the bio section.
 */
const CompactPersonCard: React.FC<{ person: Person }> = ({ person }) => {
  const { language } = useLanguage();
  const isZh = language === "zh";
  const name = isZh ? person.nameZh || person.name : person.name;
  const title = isZh ? person.titleZh || person.title : person.title;

  const Wrapper = person.homepage ? "a" : "div";
  const props = person.homepage
    ? { href: person.homepage, target: "_blank", rel: "noreferrer" }
    : {};

  return (
    <Wrapper
      {...props}
      className={`block bg-white border border-slate-100 rounded-xl p-8 transition-all duration-500 group hover:shadow-xl hover:border-brand-red/10 animate-fade-in-up flex items-center gap-8 ${
        person.homepage ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {/* Increased image size for better presence in the minimal layout */}
      <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-50 flex-shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-100 transition-transform duration-500 group-hover:scale-105">
        <img
          src={person.avatar}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="min-w-0 flex-grow py-1">
        <div className="flex justify-between items-center">
          <div>
            {/* Prominent Serif font for Name */}
            <h3 className="font-serif font-bold text-slate-900 text-xl md:text-2xl group-hover:text-brand-red transition-colors truncate">
              {name}
            </h3>
            {/* Refined Title: Slightly lowered with spacing and optimized color */}
            <div className="mt-3.5 flex items-center gap-3">
              <p className="text-xs uppercase text-brand-red/60 font-bold tracking-[0.15em] leading-none">
                {title}
              </p>
              {person.grade && (
                <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded text-slate-400 font-mono border border-slate-100">
                  {person.grade}
                </span>
              )}
            </div>
          </div>

          {/* Minimal external link indicator */}
          {person.homepage && (
            <div className="w-9 h-9 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-brand-red group-hover:border-brand-red/20 transition-all duration-300 group-hover:bg-brand-red/[0.02]">
              <ArrowUpRight size={16} />
            </div>
          )}
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
      <div className="min-h-screen pt-24 text-center text-slate-400 font-serif">
        {t("common.loading")}
      </div>
    );

  const faculty = getByCategory("Teachers");
  const visiting = getByCategory("Visiting Scholars");
  const phd = getByCategory("PhD");
  const masterAcad = getByCategory("Academic Master");
  const masterProf = getByCategory("Professional Master");
  const masterGeneral = getByCategory("Master");
  const ra = getByCategory("RA");
  const internAndSecretary = getByCategories(["Intern", "Secretary"]);

  const Section: React.FC<{
    title: string;
    children: React.ReactNode;
    count: number;
  }> = ({ title, children, count }) => {
    if (count === 0) return null;
    return (
      <section className="mb-24">
        <div className="flex items-center gap-6 mb-12 border-b border-slate-100 pb-5">
          <h2 className="text-3xl font-serif font-bold text-brand-dark">
            {title}
          </h2>
          <span className="text-xs font-mono text-slate-300 border border-slate-100 px-2.5 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        {children}
      </section>
    );
  };

  const CompactGrid: React.FC<{ items: Person[] }> = ({ items }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {items.map((p) => (
        <CompactPersonCard key={p.id} person={p} />
      ))}
    </div>
  );

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-20 pt-10 text-center md:text-left border-l-4 border-brand-red pl-8">
          <h1 className="text-5xl md:text-7xl font-serif text-brand-dark mb-6 tracking-tight">
            {t("nav.people")}
          </h1>
          <p className="text-xl text-slate-400 font-light max-w-3xl leading-relaxed">
            Our team brings together diverse perspectives to push the boundaries
            of language processing and information systems.
          </p>
        </header>

        {/* Teachers - Maintain full cards with Bio and expand functionality */}
        <Section title={t("people.categories.Teachers")} count={faculty.length}>
          <div className="space-y-10">
            {faculty.map((p) => (
              <TeacherCard key={p.id} person={p} />
            ))}
          </div>
        </Section>

        {/* Student and Staff Sections - Using the Minimal CompactGrid layout */}
        <Section
          title={t("people.categories.Visiting Scholars")}
          count={visiting.length}
        >
          <CompactGrid items={visiting} />
        </Section>

        <Section title={t("people.categories.PhD")} count={phd.length}>
          <CompactGrid items={phd} />
        </Section>

        <Section
          title={t("people.categories.Academic Master")}
          count={masterAcad.length}
        >
          <CompactGrid items={masterAcad} />
        </Section>

        <Section
          title={t("people.categories.Professional Master")}
          count={masterProf.length}
        >
          <CompactGrid items={masterProf} />
        </Section>

        <Section
          title={t("people.categories.Master")}
          count={masterGeneral.length}
        >
          <CompactGrid items={masterGeneral} />
        </Section>

        <Section title={t("people.categories.RA")} count={ra.length}>
          <CompactGrid items={ra} />
        </Section>

        <Section
          title={t("people.categories.InternAndSecretary")}
          count={internAndSecretary.length}
        >
          <CompactGrid items={internAndSecretary} />
        </Section>

        {people.length === 0 && !loading && (
          <div className="py-24 text-center text-slate-300 italic font-serif">
            {t("common.noData")}
          </div>
        )}
      </div>
    </div>
  );
};

export default People;
