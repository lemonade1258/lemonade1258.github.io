import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchContact, fetchNews } from "../lib/dataStore";
import { useLanguage } from "../contexts/LanguageContext";
import { ContactInfo, NewsItem } from "../types";

const Tour: React.FC = () => {
  const { t, language } = useLanguage();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[Home] Fetching data...");
        const [contactData, newsData] = await Promise.all([
          fetchContact(),
          fetchNews(),
        ]);
        setContactInfo(contactData);
        setNewsItems(newsData.slice(0, 3));
      } catch (err) {
        console.error("[Home] Load Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Carousel
  useEffect(() => {
    if (contactInfo?.heroImages && contactInfo.heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          (prev) => (prev + 1) % contactInfo.heroImages!.length
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [contactInfo]);

  const isZh = language === "zh";

  const getText = (zh?: string, en?: string, defaultText: string = "") => {
    if (isZh) return zh || en || defaultText;
    return en || zh || defaultText;
  };

  const welcomeTitle = getText(
    contactInfo?.welcomeTitleZh,
    contactInfo?.welcomeTitleEn,
    isZh
      ? "欢迎来到语言与信息研究中心 (CLAIR)! 👋"
      : "Welcome to the Center for Language and Information Research (CLAIR)! 👋"
  );

  const welcomeText = getText(
    contactInfo?.welcomeTextZh,
    contactInfo?.welcomeTextEn,
    ""
  );

  const researchText = getText(
    contactInfo?.researchAreasTextZh,
    contactInfo?.researchAreasTextEn,
    ""
  );

  const heroImages = contactInfo?.heroImages || [];
  const partners = contactInfo?.partners || [];

  return (
    <div className="bg-white">
      {/* 1. Welcome Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-brand-dark mb-8 leading-tight">
          {loading ? (
            <span className="text-slate-200 animate-pulse">Loading...</span>
          ) : (
            welcomeTitle
          )}
        </h1>
        {!loading && welcomeText && (
          <p className="text-lg md:text-xl text-slate-500 font-light leading-relaxed whitespace-pre-line max-w-4xl mx-auto">
            {welcomeText}
          </p>
        )}
      </section>

      {/* 2. Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="relative w-full aspect-video md:aspect-[21/9] bg-slate-100 rounded-lg overflow-hidden shadow-sm border border-slate-100">
          {!loading && heroImages.length > 0
            ? heroImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Slide ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    idx === currentImageIndex
                      ? "opacity-100 scale-105"
                      : "opacity-0 scale-100"
                  }`}
                  style={{ transitionProperty: "opacity, transform" }}
                />
              ))
            : !loading && (
                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                  <Flame className="w-16 h-16 text-slate-200" />
                </div>
              )}
        </div>
      </section>

      {/* 3. Research Areas (HTML Enabled) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <h2 className="text-3xl font-serif font-medium text-brand-dark mb-12 text-center">
          {t("common.researchAreas")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-600 leading-relaxed font-light text-lg">
          <div className="bg-slate-50 p-8 rounded-lg border border-slate-100">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
              </div>
            ) : (
              <div
                className="prose prose-slate prose-sm md:prose-base max-w-none 
                        prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-light
                        prose-strong:text-brand-dark prose-strong:font-bold
                        prose-ul:list-disc prose-ul:pl-4 prose-li:text-slate-500"
                dangerouslySetInnerHTML={{
                  __html: researchText || t("common.noData"),
                }}
              />
            )}
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div className="p-6 border border-slate-100 rounded-lg hover:border-brand-red/30 transition-colors group bg-white shadow-sm">
              <h3 className="font-bold text-brand-dark mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-red rounded-full"></span>
                {t("nav.news")}
              </h3>
              <ul className="space-y-4">
                {newsItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/news/${item.id}`}
                      className="block text-sm text-slate-500 hover:text-brand-red transition-colors line-clamp-1"
                    >
                      {getText(item.titleZh, item.title)}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/news"
                className="inline-block mt-4 text-xs font-bold uppercase tracking-wider text-brand-tech hover:underline"
              >
                {t("sections.viewArchive")} &rarr;
              </Link>
            </div>

            <div className="p-6 border border-slate-100 rounded-lg hover:border-brand-red/30 transition-colors bg-white shadow-sm">
              <h3 className="font-bold text-brand-dark mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-tech rounded-full"></span>
                {t("nav.publications")}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Explore our latest research papers in top-tier conferences (ACL,
                CVPR, NeurIPS).
              </p>
              <Link
                to="/publications"
                className="inline-block text-xs font-bold uppercase tracking-wider text-brand-tech hover:underline"
              >
                {t("hero.viewPubs")} &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Partners (Restyled for uniformity and better visibility) */}
      <section className="py-20 bg-slate-50 border-t border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-medium text-brand-dark mb-12 text-center">
            {t("common.partners")}
          </h2>

          {!loading && partners.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {partners.map((partner, idx) => (
                <a
                  key={idx}
                  href={partner.link || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col items-center"
                >
                  {/* Uniform Logo Container with subtle background to support white logos */}
                  <div className="w-full aspect-[3/2] bg-slate-100/50 rounded-lg border border-slate-200/60 p-4 flex items-center justify-center group-hover:bg-white group-hover:shadow-md group-hover:border-brand-red/20 transition-all duration-300">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {/* Normalized Caption */}
                  <div className="mt-3 text-center px-1">
                    <p className="text-xs font-bold text-slate-700 group-hover:text-brand-red transition-colors line-clamp-1">
                      {getText(partner.nameZh, partner.name)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {isZh ? partner.name : partner.nameZh || ""}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-300 italic">
              {loading ? "..." : t("common.noData")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Tour;
