import React, { useState, useEffect } from "react";
import { fetchPublications } from "../lib/dataStore";
import { Publication } from "../types";
import { ArrowUpRight } from "lucide-react";

const Publications: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filter, setFilter] = useState<string>("All");
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
    filter === "All"
      ? publications
      : publications.filter((p) => p.year.toString() === filter);

  // Group by year for display if 'All' is selected (Assuming backend already sorts, but client sort is safe)
  const displayedPubs = filteredPubs.sort((a, b) => b.year - a.year);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 text-center text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-20 pt-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif text-brand-dark mb-6">
              Publications
            </h1>
            <p className="text-xl text-slate-500 font-light max-w-2xl">
              Selected research papers, conference proceedings, and technical
              reports.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Filter Year
            </span>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-transparent border-b border-brand-red py-2 pl-2 pr-8 text-brand-dark font-mono text-sm focus:outline-none cursor-pointer hover:bg-slate-50"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="space-y-4">
          {displayedPubs.map((pub, index) => (
            <div
              key={pub.id}
              className="group relative border-t border-slate-200 py-8 hover:bg-slate-50 transition-colors duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-baseline">
                <div className="md:w-32 flex-shrink-0">
                  <span className="font-mono text-sm text-brand-red">
                    {pub.year}
                  </span>
                </div>

                <div className="flex-grow">
                  {pub.link ? (
                    <a
                      href={pub.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xl md:text-2xl font-serif text-brand-dark mb-2 leading-tight hover:text-brand-red transition-colors"
                    >
                      {pub.title}
                    </a>
                  ) : (
                    <h3 className="text-xl md:text-2xl font-serif text-brand-dark mb-2 leading-tight">
                      {pub.title}
                    </h3>
                  )}

                  <div className="text-slate-600 font-light mb-3">
                    {pub.authors.map((author, i) => (
                      <span
                        key={i}
                        className={
                          author.includes("Zhang")
                            ? "font-medium text-brand-dark underline decoration-brand-red/30"
                            : ""
                        }
                      >
                        {author}
                        {i < pub.authors.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs tracking-wider uppercase">
                    <span className="font-bold text-brand-dark">
                      {pub.conference}
                    </span>
                    {pub.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-slate-400 px-2 py-1 border border-slate-200 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {pub.link && (
                    <a
                      href={pub.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-brand-tech transition-colors"
                      title="View Project"
                    >
                      <ArrowUpRight size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredPubs.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-light italic">
              No publications found for the selected year.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Publications;
