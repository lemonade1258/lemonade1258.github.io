import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Globe,
  Cpu,
  Network,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchNews, fetchContact } from "../lib/dataStore";
import { useLanguage } from "../contexts/LanguageContext";
import { NewsItem, ContactInfo } from "../types";

const Tour: React.FC = () => {
  const { t, language } = useLanguage();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Using Promise.all to fetch both in parallel
        const [newsData, contactData] = await Promise.all([
          fetchNews(),
          fetchContact(),
        ]);
        setNewsItems(newsData.slice(0, 3));
        setContactInfo(contactData);
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

  // Default fallback image
  const defaultImage =
    "https://images.unsplash.com/photo-1555431189-0fabf2667795?q=80&w=2574&auto=format&fit=crop";

  // Logic: Use backend images if available, otherwise default.
  // Wait for loading to finish to avoid flashing default image if we have real ones coming.
  const hasCustomImages =
    contactInfo?.heroImages && contactInfo.heroImages.length > 0;
  const heroImages = hasCustomImages ? contactInfo.heroImages! : [defaultImage];

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

            {/* Replaced Static Image with Dynamic Title Card using Flame Icon */}
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 backdrop-blur-sm text-center transform hover:scale-[1.02] transition-transform duration-700 ease-out w-full max-w-lg aspect-square">
              <div className="w-24 h-24 mb-6 text-brand-red flex items-center justify-center bg-white rounded-full shadow-sm">
                <Flame className="w-12 h-12" />
              </div>
              <span className="text-brand-red font-bold text-4xl mb-2 font-serif">
                {t("common.labName")}
              </span>
              <span className="text-slate-400 text-sm uppercase tracking-widest mb-1">
                {t("common.wuhanUniversity")}
              </span>
              <span className="text-slate-800 text-lg font-light leading-tight px-8">
                {t("common.labFullName")}
              </span>
            </div>
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

      {/* Bottom Hero Carousel */}
      <section className="h-[60vh] w-full relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-brand-dark/20 z-20 pointer-events-none"></div>

        {heroImages.map((img, idx) => (
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
        ))}

        {/* Carousel Indicators */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-8 left-8 z-30 flex space-x-2">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-12 h-1 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex
                    ? "bg-white"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-8 right-8 z-30">
          <p className="text-white text-xs font-mono tracking-widest uppercase opacity-80">
            {t("common.wuhanUniversity")} &middot; {t("common.labFullName")}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Tour;
