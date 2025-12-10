import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../lib/dataStore"; // Correct import source
import { useLanguage } from "../contexts/LanguageContext";
import { NewsItem } from "../types";

const News: React.FC = () => {
  const { t, language } = useLanguage();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync data on mount
  useEffect(() => {
    const data = getNews();
    // Sort by date descending (optional, but good for news)
    setNewsItems(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <p className="text-slate-400">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-20 pt-10 border-b border-black pb-8">
          <h1 className="text-5xl md:text-6xl font-serif text-brand-dark mb-6">
            {t("news.title")}
          </h1>
          <p className="text-xl text-slate-500 font-light">
            {t("news.subtitle")}
          </p>
        </header>

        <div className="space-y-16">
          {newsItems.length === 0 ? (
            <p className="text-slate-400 italic">{t("common.noData")}</p>
          ) : (
            newsItems.map((item, index) => {
              // i18n Logic: Prefer Current Lang, Fallback to Other
              const isZh = language === "zh";

              const displayTitle = isZh
                ? item.titleZh || item.title
                : item.title || item.titleZh;

              const displaySummary = isZh
                ? item.summaryZh || item.summary
                : item.summary || item.summaryZh;

              return (
                <article
                  key={item.id}
                  className="group grid grid-cols-1 md:grid-cols-4 gap-8 items-start animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="md:col-span-1 pt-1">
                    <span className="text-sm font-mono text-slate-400 block mb-2">
                      {item.date}
                    </span>
                    <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-widest font-bold border border-slate-200 text-slate-500 rounded-sm">
                      {item.category}
                    </span>
                  </div>
                  <div className="md:col-span-3 space-y-4">
                    <Link to={`/news/${item.id}`}>
                      <h2 className="text-2xl font-serif font-medium text-brand-dark group-hover:text-brand-red transition-colors cursor-pointer">
                        {displayTitle}
                      </h2>
                    </Link>
                    <p className="text-slate-600 leading-relaxed font-light text-lg line-clamp-3">
                      {displaySummary}
                    </p>
                    <div className="pt-2">
                      <Link
                        to={`/news/${item.id}`}
                        className="text-brand-tech text-sm font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                      >
                        {t("common.readMore")}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
