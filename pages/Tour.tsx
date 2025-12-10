import React, { useState, useEffect } from "react";
import { ArrowRight, Globe, Cpu, Network, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getNews } from "../lib/dataStore";
import { useLanguage } from "../contexts/LanguageContext";
import { NewsItem } from "../types";

const Tour: React.FC = () => {
  const { t, language } = useLanguage();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    setNewsItems(getNews().slice(0, 3));
  }, []);

  const isZh = language === "zh";

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center min-h-[85vh]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          <div className="lg:col-span-6 opacity-0 animate-fade-in-up stagger-1 z-10">
            <span className="text-brand-red font-bold tracking-widest uppercase text-xs mb-6 block flex items-center gap-2">
              <span className="w-8 h-[1px] bg-brand-red inline-block"></span>
              {t("hero.subtitle")}
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-medium text-brand-dark leading-[1.1] mb-8">
              {t("hero.title_1")} <br />
              {t("hero.title_2")}{" "}
              <span className="text-brand-red italic">&amp;</span> <br />
              {t("hero.title_3")}
            </h1>

            <p className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed max-w-2xl mb-12 border-l-2 border-brand-red pl-6">
              {t("hero.description")}
            </p>

            <div className="flex flex-wrap gap-6">
              <Link
                to="/publications"
                className="group inline-flex items-center text-sm font-semibold uppercase tracking-wider text-brand-dark hover:text-brand-red transition-colors"
              >
                {t("hero.viewPubs")}
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/people"
                className="group inline-flex items-center text-sm font-semibold uppercase tracking-wider text-slate-400 hover:text-brand-dark transition-colors"
              >
                {t("hero.meetTeam")}
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 hidden lg:flex justify-center justify-items-center opacity-0 animate-fade-in-up stagger-2 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gradient-to-tr from-brand-red/5 to-transparent rounded-full blur-3xl -z-10"></div>
            <img
              src="/clain_logo_full.png"
              alt="CLAIN Center for Language and Information Research"
              className="w-full max-w-xl object-contain transform hover:scale-[1.02] transition-transform duration-700 ease-out"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                      <div class="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 text-center">
                        <span class="text-brand-red font-bold text-4xl mb-2">CLAIN</span>
                        <span class="text-slate-400 text-sm">Image not found.<br/>Please add <b>clain_logo_full.png</b> to public folder.</span>
                      </div>
                    `;
                }
              }}
            />
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-slate-100 max-w-7xl mx-auto"></div>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          <div className="group cursor-default opacity-0 animate-fade-in-up stagger-2">
            <div className="mb-6 inline-block p-3 bg-slate-50 rounded-sm group-hover:bg-brand-red/5 transition-colors">
              <Globe
                className="h-8 w-8 text-brand-dark group-hover:text-brand-red transition-colors"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-2xl font-serif font-medium text-brand-dark mb-3 group-hover:text-brand-red transition-colors">
              {t("sections.connectivity")}
            </h3>
            <p className="text-slate-500 leading-relaxed font-light">
              {t("sections.connectivity_desc")}
            </p>
          </div>

          <div className="group cursor-default opacity-0 animate-fade-in-up stagger-3">
            <div className="mb-6 inline-block p-3 bg-slate-50 rounded-sm group-hover:bg-brand-red/5 transition-colors">
              <Cpu
                className="h-8 w-8 text-brand-dark group-hover:text-brand-red transition-colors"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-2xl font-serif font-medium text-brand-dark mb-3 group-hover:text-brand-red transition-colors">
              {t("sections.reasoning")}
            </h3>
            <p className="text-slate-500 leading-relaxed font-light">
              {t("sections.reasoning_desc")}
            </p>
          </div>

          <div className="group cursor-default opacity-0 animate-fade-in-up stagger-4">
            <div className="mb-6 inline-block p-3 bg-slate-50 rounded-sm group-hover:bg-brand-red/5 transition-colors">
              <Network
                className="h-8 w-8 text-brand-dark group-hover:text-brand-red transition-colors"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-2xl font-serif font-medium text-brand-dark mb-3 group-hover:text-brand-red transition-colors">
              {t("sections.social")}
            </h3>
            <p className="text-slate-500 leading-relaxed font-light">
              {t("sections.social_desc")}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-gray py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl font-serif text-brand-dark">
              {t("sections.updates")}
            </h2>
            <Link
              to="/news"
              className="text-brand-tech text-sm font-medium hover:underline"
            >
              {t("sections.viewArchive")}
            </Link>
          </div>

          <div className="grid gap-0 divide-y divide-slate-200 border-t border-b border-slate-200">
            {newsItems.map((item, idx) => {
              // Dynamic language logic here
              const displayTitle = isZh
                ? item.titleZh || item.title
                : item.title || item.titleZh;
              const displaySummary = isZh
                ? item.summaryZh || item.summary
                : item.summary || item.summaryZh;

              return (
                <Link
                  to={`/news/${item.id}`}
                  key={item.id}
                  className="group py-8 grid grid-cols-1 md:grid-cols-12 gap-6 hover:bg-white transition-colors duration-300"
                >
                  <div className="md:col-span-2 text-sm text-slate-400 font-mono pt-1">
                    {item.date}
                  </div>
                  <div className="md:col-span-8">
                    <h3 className="text-xl font-medium text-brand-dark group-hover:text-brand-red transition-colors mb-2">
                      {displayTitle}
                    </h3>
                    <p className="text-slate-500 font-light line-clamp-1">
                      {displaySummary}
                    </p>
                  </div>
                  <div className="md:col-span-2 flex justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-red mr-2">
                      {t("sections.read")}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-brand-red" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="h-[60vh] w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-dark/20 z-10"></div>
        <img
          src="https://my-web-clain.oss-cn-beijing.aliyuncs.com/main-2.jpg"
          alt="Abstract Lab"
          className="w-full h-full object-cover transition-all duration-1000 ease-out transform hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 p-8 z-20">
          <p className="text-white text-xs font-mono tracking-widest uppercase">
            Wuhan University &middot; Information Science Laboratory
          </p>
        </div>
      </section>
    </div>
  );
};

export default Tour;
