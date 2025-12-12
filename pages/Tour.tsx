import React, { useState, useEffect } from "react";
import { ArrowRight, Flame } from "lucide-react";
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
        const [contactData, newsData] = await Promise.all([
          fetchContact(),
          fetchNews(),
        ]);
        setContactInfo(contactData);
        setNewsItems(newsData.slice(0, 3));
      } catch (err) {
        console.error("Failed to load data for home", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Carousel Logic
  useEffect(() => {
    if (contactInfo?.heroImages && contactInfo.heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          (prev) => (prev + 1) % contactInfo.heroImages!.length
        );
      }, 5000); // Change every 5 seconds
      return () => clearInterval(interval);
    }
  }, [contactInfo]);

  const isZh = language === "zh";

  // Carousel Images
  const hasCustomImages =
    contactInfo?.heroImages && contactInfo.heroImages.length > 0;
  const heroImages = hasCustomImages ? contactInfo.heroImages! : [];

  // Content Text
  const welcomeTitle = isZh
    ? contactInfo?.welcomeTitleZh || "欢迎来到语言与信息研究中心 (CLAIR)! 👋"
    : contactInfo?.welcomeTitleEn ||
      "Welcome to the Center for Language and Information Research (CLAIR)! 👋";
  const welcomeText = isZh
    ? contactInfo?.welcomeTextZh || ""
    : contactInfo?.welcomeTextEn || "";
  const researchText = isZh
    ? contactInfo?.researchAreasTextZh || ""
    : contactInfo?.researchAreasTextEn || "";

  // Partners
  const partners = contactInfo?.partners || [];

  return (
    <div className="bg-white">
      {/* 1. Welcome Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-brand-dark mb-8 leading-tight">
          {welcomeTitle}
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-light leading-relaxed whitespace-pre-line max-w-4xl mx-auto">
          {welcomeText}
        </p>
      </section>

      {/* 2. Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="relative w-full aspect-video md:aspect-[21/9] bg-slate-100 rounded-lg overflow-hidden shadow-sm border border-slate-100">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
              Loading Images...
            </div>
          )}

          {heroImages.length > 0 ? (
            heroImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Lab Showcase ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  idx === currentImageIndex
                    ? "opacity-100 scale-105"
                    : "opacity-0 scale-100"
                }`}
                style={{ transitionProperty: "opacity, transform" }}
              />
            ))
          ) : (
            // Empty Placeholder if no images, but keeps space
            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
              <Flame className="w-16 h-16 text-slate-200" />
            </div>
          )}

          {/* Indicators */}
          {heroImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex
                      ? "bg-white scale-125"
                      : "bg-white/40 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="w-full h-px bg-slate-100 max-w-7xl mx-auto"></div>

      {/* 3. Research Areas */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-medium text-brand-dark mb-12 text-center">
          {t("common.researchAreas")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-600 leading-relaxed font-light text-lg">
          {/* Changed to whitespace-pre-wrap to better handle newlines entered in textarea */}
          <div className="whitespace-pre-wrap bg-slate-50 p-8 rounded-lg border border-slate-100">
            {researchText}
          </div>
          <div className="flex flex-col justify-center space-y-6">
            {/* Right side teaser for news or publications */}
            <div className="p-6 border border-slate-100 rounded-lg hover:border-brand-red/30 transition-colors group">
              <h3 className="font-bold text-brand-dark mb-2 flex items-center gap-2">
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
                      {isZh
                        ? item.titleZh || item.title
                        : item.title || item.titleZh}
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

            <div className="p-6 border border-slate-100 rounded-lg hover:border-brand-red/30 transition-colors">
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

      {/* 4. Partners / Collaborating Institutions */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-medium text-brand-dark mb-10 text-center">
            {t("common.partners")}
          </h2>

          {partners.length > 0 ? (
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
              {partners.map((partner, idx) => (
                <a
                  key={idx}
                  href={partner.link || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="group transition-opacity hover:opacity-100"
                  title={isZh ? partner.nameZh || partner.name : partner.name}
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-12 md:h-16 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </a>
              ))}
            </div>
          ) : (
            <div className="h-32 border-2 border-dashed border-slate-100 rounded-lg flex items-center justify-center text-slate-300 italic">
              {t("common.noData")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Tour;
