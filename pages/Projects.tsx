import React, { useState, useEffect } from "react";
import { fetchProjects } from "../lib/dataStore";
import { Project } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import {
  ExternalLink,
  Github,
  Database,
  Box,
  FileText,
  Link as LinkIcon,
} from "lucide-react";

const Projects: React.FC = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data.sort((a, b) => (a.order || 99) - (b.order || 99)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "GitHub":
        return <Github size={16} />;
      case "Try Online":
        return <ExternalLink size={16} />;
      case "Model":
        return <Box size={16} />;
      case "Dataset":
        return <Database size={16} />;
      case "Paper":
        return <FileText size={16} />;
      default:
        return <LinkIcon size={16} />;
    }
  };

  if (loading)
    return (
      <div className="min-h-screen pt-24 text-center">
        {t("common.loading")}
      </div>
    );

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 pt-10">
          <h1 className="text-5xl md:text-6xl font-serif text-brand-dark mb-6">
            {t("projects.title")}
          </h1>
          <p className="text-xl text-slate-500 font-light">
            {t("projects.subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {projects.length === 0 ? (
            <div className="col-span-full text-center text-slate-400 italic py-10">
              {t("common.noData")}
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {project.image && (
                  <div className="w-full aspect-video bg-slate-50 border-b border-slate-100">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="text-2xl font-serif font-bold text-brand-dark mb-4">
                    {project.title}
                  </h3>
                  <p className="text-slate-600 font-light leading-relaxed mb-8 flex-grow whitespace-pre-line">
                    {project.description}
                  </p>

                  {/* Links */}
                  {project.links && project.links.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-auto">
                      {project.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded border border-slate-200 text-sm font-medium text-slate-600 hover:text-brand-red hover:border-brand-red transition-colors bg-slate-50"
                        >
                          {getIcon(link.label)}
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
