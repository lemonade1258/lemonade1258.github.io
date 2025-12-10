import React, { useEffect, useState } from "react";
import { UNIVERSITY_NAME, LAB_FULL_NAME } from "../constants";
import { ArrowUpRight } from "lucide-react";
import { getContact } from "../lib/dataStore";
import { ContactInfo } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

const Contact: React.FC = () => {
  const { language, t } = useLanguage();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    setContactInfo(getContact());
  }, []);

  if (!contactInfo)
    return <div className="pt-24 text-center">{t("common.loading")}</div>;

  const isZh = language === "zh";
  const intro = isZh ? contactInfo.introZh : contactInfo.introEn;
  const address = isZh ? contactInfo.addressZh : contactInfo.addressEn;
  const hiringText = isZh ? contactInfo.hiringTextZh : contactInfo.hiringTextEn;

  return (
    <div className="bg-white min-h-screen pt-24 pb-0 flex flex-col">
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 pt-10">
          <div className="animate-fade-in-up stagger-1">
            <h1 className="text-5xl md:text-6xl font-serif text-brand-dark mb-10">
              {t("nav.contact")}
            </h1>
            <p className="text-xl text-slate-500 font-light leading-relaxed mb-16">
              {intro}
            </p>

            <div className="space-y-12">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red mb-4">
                  {t("common.address")}
                </h3>
                <address className="not-italic text-lg text-brand-dark font-light leading-relaxed whitespace-pre-line">
                  {address}
                </address>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red mb-4">
                  Inquiries
                </h3>
                <div className="space-y-2">
                  <a
                    href={`mailto:${contactInfo.emailGeneral}`}
                    className="block text-lg text-brand-dark hover:text-brand-tech transition-colors"
                  >
                    General: {contactInfo.emailGeneral}
                  </a>
                  <a
                    href={`mailto:${contactInfo.emailAdmissions}`}
                    className="block text-lg text-brand-dark hover:text-brand-tech transition-colors"
                  >
                    Admissions: {contactInfo.emailAdmissions}
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red mb-4">
                  Join Us
                </h3>
                <p className="text-slate-600 font-light mb-4">{hiringText}</p>
                {contactInfo.hiringLink && (
                  <a
                    href={contactInfo.hiringLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-brand-tech font-bold uppercase tracking-widest text-sm hover:underline"
                  >
                    View Open Positions{" "}
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="h-[500px] lg:h-auto w-full bg-slate-100 relative grayscale invert-[.05] animate-fade-in-up stagger-2">
            <iframe
              width="100%"
              height="100%"
              title="map"
              className="absolute inset-0 w-full h-full mix-blend-multiply"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              scrolling="no"
              src={contactInfo.mapEmbedUrl}
            ></iframe>
            <div className="absolute inset-0 pointer-events-none border border-black/5 shadow-inner"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
