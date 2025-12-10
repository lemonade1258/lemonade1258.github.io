import React, { useState, useEffect } from "react";
import { getContact, saveContact } from "../../lib/dataStore";
import { ContactInfo } from "../../types";
import { Save } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const ContactManager: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<ContactInfo | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setData(getContact());
  }, []);

  const handleSave = () => {
    if (data) {
      saveContact(data);
      setMsg("Saved successfully!");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Manage Contact Info
        </h2>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700 flex items-center"
        >
          <Save size={16} className="mr-2" /> Save Changes
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-green-100 text-green-800 rounded mb-4">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Intro Section */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="font-bold text-slate-600 border-b pb-2">
            Introduction Text
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1">
              Intro (English)
            </label>
            <textarea
              rows={3}
              className="w-full p-2 border rounded"
              value={data.introEn}
              onChange={(e) => setData({ ...data, introEn: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Intro (Chinese)
            </label>
            <textarea
              rows={3}
              className="w-full p-2 border rounded"
              value={data.introZh}
              onChange={(e) => setData({ ...data, introZh: e.target.value })}
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="font-bold text-slate-600 border-b pb-2">Address</h3>
          <div>
            <label className="block text-sm font-medium mb-1">
              Address (English)
            </label>
            <textarea
              rows={4}
              className="w-full p-2 border rounded"
              value={data.addressEn}
              onChange={(e) => setData({ ...data, addressEn: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Address (Chinese)
            </label>
            <textarea
              rows={4}
              className="w-full p-2 border rounded"
              value={data.addressZh}
              onChange={(e) => setData({ ...data, addressZh: e.target.value })}
            />
          </div>
        </div>

        {/* Hiring Section */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="font-bold text-slate-600 border-b pb-2">
            Hiring / Join Us
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1">
              Text (English)
            </label>
            <input
              className="w-full p-2 border rounded"
              value={data.hiringTextEn}
              onChange={(e) =>
                setData({ ...data, hiringTextEn: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Text (Chinese)
            </label>
            <input
              className="w-full p-2 border rounded"
              value={data.hiringTextZh}
              onChange={(e) =>
                setData({ ...data, hiringTextZh: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link URL</label>
            <input
              className="w-full p-2 border rounded"
              value={data.hiringLink}
              onChange={(e) => setData({ ...data, hiringLink: e.target.value })}
            />
          </div>
        </div>

        {/* General Section */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="font-bold text-slate-600 border-b pb-2">
            Emails & Map
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1">
              General Email
            </label>
            <input
              className="w-full p-2 border rounded"
              value={data.emailGeneral}
              onChange={(e) =>
                setData({ ...data, emailGeneral: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Admissions Email
            </label>
            <input
              className="w-full p-2 border rounded"
              value={data.emailAdmissions}
              onChange={(e) =>
                setData({ ...data, emailAdmissions: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Google Maps Embed URL
            </label>
            <input
              className="w-full p-2 border rounded text-xs"
              value={data.mapEmbedUrl}
              onChange={(e) =>
                setData({ ...data, mapEmbedUrl: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;
