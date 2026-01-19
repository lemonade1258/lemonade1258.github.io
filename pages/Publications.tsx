import React, { useState, useEffect } from "react";
import { fetchPublications } from "../lib/dataStore";
import { Publication } from "../types";
import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  FileText,
  Layout,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const Publications: React.FC = () => {
  const { t } = useLanguage();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filterYear, setFilterYear] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPublications();
        setPublications(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const years = [
    "All",
    ...Array.from(new Set(publications.map((p) => p.year.toString())))
      .sort()
      .reverse(),
  ];

  const filteredPubs =
    filterYear === "All"
      ? publications
      : publications.filter((p) => p.year.toString() === filterYear);

  const groupedPubs: { [key: number]: Publication[] } = {};
  filteredPubs.forEach((pub) => {
    if (!groupedPubs[pub.year]) groupedPubs[pub.year] = [];
    groupedPubs[pub.year].push(pub);
  });

  const sortedYears = Object.keys(groupedPubs)
    .map(Number)
    .sort((a, b) => b - a);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Journal":
        return <BookOpen size={14} className="text-blue-500" />;
      case "Conference":
        return <GraduationCap size={14} className="text-brand-red" />;
      case "Preprint":
        return <FileText size={14} className="text-slate-400" />;
      default:
        return <Layout size={14} className="text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center text-slate-400 font-serif">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-20 pt-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-serif text-brand-dark mb-6">
              {t("publications.title")}
            </h1>
            <p className="text-xl text-slate-500 font-light max-w-2xl leading-relaxed">
              {t("publications.subtitle")}
            </p>
          </div>

          <div className="flex items-center space-x-4 animate-fade-in stagger-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {t("publications.filterYear")}
            </span>
            <div className="relative">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="appearance-none bg-transparent border-b border-brand-red py-2 pl-2 pr-8 text-brand-dark font-mono text-sm focus:outline-none cursor-pointer hover:bg-slate-50 transition-colors"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-brand-red">
                <ArrowUpRight size={14} className="rotate-90" />
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-24">
          {sortedYears.map((year, yIdx) => (
            <section
              key={year}
              className="animate-fade-in-up"
              style={{ animationDelay: `${yIdx * 100}ms` }}
            >
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-4xl font-serif font-bold text-brand-red/10 select-none">
                  {year}
                </h2>
                <div className="h-[1px] flex-grow bg-slate-100"></div>
              </div>

              <div className="grid grid-cols-1 gap-12">
                {groupedPubs[year].map((pub) => (
                  <div
                    key={pub.id}
                    className="group flex flex-col md:flex-row gap-6 md:gap-12 relative"
                  >
                    {/* Metadata Column */}
                    <div className="md:w-32 flex-shrink-0 pt-1.5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-50 border border-slate-100 w-fit">
                          {getTypeIcon(pub.type)}
                          <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600">
                            {pub.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-grow">
                      {pub.link ? (
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xl md:text-2xl font-serif text-brand-dark mb-3 leading-snug hover:text-brand-red transition-colors decoration-brand-red/20 underline-offset-8 group-hover:underline decoration-1"
                        >
                          {pub.title}
                        </a>
                      ) : (
                        <h3 className="text-xl md:text-2xl font-serif text-brand-dark mb-3 leading-snug">
                          {pub.title}
                        </h3>
                      )}

                      {/* Optimized Author Display: Uniform and clean */}
                      <div className="text-slate-600 font-normal mb-3 text-base md:text-lg leading-relaxed">
                        {pub.authors.map((author, i) => (
                          <span key={i} className="inline-block">
                            {author}
                            {i < pub.authors.length - 1 ? ",\u00A0" : ""}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-bold text-slate-800 italic bg-slate-50 px-2 py-0.5 rounded">
                          {pub.venue}
                        </span>
                        {pub.tags && pub.tags.length > 0 && (
                          <div className="flex gap-2">
                            {pub.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] text-slate-400 font-mono uppercase tracking-widest px-1.5 py-0.5 border border-slate-100 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 hidden md:block">
                      {pub.link && (
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-red text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
                        >
                          <ArrowUpRight size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {publications.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-light italic">
              {t("publications.noPubs")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Publications;
