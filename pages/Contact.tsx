import React, { useEffect, useState } from "react";
import { fetchContact } from "../lib/dataStore";
import { ContactInfo } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import { Mail, MapPin, Briefcase } from "lucide-react";

const Contact: React.FC = () => {
  const { language, t } = useLanguage();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchContact();
        setContactInfo(data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  if (!contactInfo)
    return (
      <div className="pt-32 text-center text-slate-400 font-serif">
        {t("common.loading")}
      </div>
    );

  const isZh = language === "zh";
  const intro = isZh ? contactInfo.introZh : contactInfo.introEn;
  const address = isZh ? contactInfo.addressZh : contactInfo.addressEn;
  const hiringText = isZh ? contactInfo.hiringTextZh : contactInfo.hiringTextEn;

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="mb-20 pt-10 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-serif text-brand-dark mb-6">
            {t("nav.contact")}
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed max-w-3xl">
            {intro}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Left Column: Information */}
          <div className="lg:col-span-5 space-y-16 animate-fade-in-up stagger-1">
            {/* Address */}
            <div className="group">
              <div className="flex items-center gap-2 mb-4 text-brand-red">
                <MapPin size={18} />
                <h3 className="text-xs font-bold uppercase tracking-widest">
                  {t("common.address")}
                </h3>
              </div>
              <div className="pl-6 border-l border-slate-200 group-hover:border-brand-red transition-colors duration-300">
                <address className="not-italic text-lg text-slate-700 font-serif leading-relaxed whitespace-pre-line">
                  {address}
                </address>
              </div>
            </div>

            {/* Inquiries */}
            <div className="group">
              <div className="flex items-center gap-2 mb-4 text-brand-red">
                <Mail size={18} />
                <h3 className="text-xs font-bold uppercase tracking-widest">
                  {t("contact.inquiries")}
                </h3>
              </div>
              <div className="pl-6 border-l border-slate-200 group-hover:border-brand-red transition-colors duration-300 space-y-3">
                <div>
                  <span className="block text-xs uppercase text-slate-400 font-bold mb-1">
                    {t("contact.general")}
                  </span>
                  <a
                    href={`mailto:${contactInfo.emailGeneral}`}
                    className="text-lg text-slate-700 font-serif hover:text-brand-tech transition-colors break-all"
                  >
                    {contactInfo.emailGeneral}
                  </a>
                </div>
                <div>
                  <span className="block text-xs uppercase text-slate-400 font-bold mb-1">
                    {t("contact.admissions")}
                  </span>
                  <a
                    href={`mailto:${contactInfo.emailAdmissions}`}
                    className="text-lg text-slate-700 font-serif hover:text-brand-tech transition-colors break-all"
                  >
                    {contactInfo.emailAdmissions}
                  </a>
                </div>
              </div>
            </div>

            {/* Hiring */}
            <div className="group">
              <div className="flex items-center gap-2 mb-4 text-brand-red">
                <Briefcase size={18} />
                <h3 className="text-xs font-bold uppercase tracking-widest">
                  {t("contact.joinUs")}
                </h3>
              </div>
              <div className="pl-6 border-l border-slate-200 group-hover:border-brand-red transition-colors duration-300">
                <p className="text-slate-600 font-light leading-relaxed">
                  {hiringText}
                </p>
                {/* View Open Positions Link Removed as requested */}
              </div>
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="lg:col-span-7 animate-fade-in-up stagger-2">
            {/* 
                Styled to look "Hardcoded": 
                - Grayscale filter
                - High contrast border
                - Internal shadow
             */}
            <div className="w-full h-[500px] bg-slate-100 relative overflow-hidden rounded-sm border-2 border-slate-100 shadow-inner group">
              <iframe
                width="100%"
                height="100%"
                title="map"
                className="absolute inset-0 w-full h-full grayscale hover:grayscale-0 transition-all duration-700 ease-in-out mix-blend-multiply opacity-90 hover:opacity-100"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                scrolling="no"
                src={contactInfo.mapEmbedUrl}
                loading="lazy"
              ></iframe>

              {/* Decorative Overlay for "Tech" feel */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-mono uppercase tracking-widest border border-slate-200 text-slate-500 pointer-events-none">
                Lat: 30.54 • Long: 114.36
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
