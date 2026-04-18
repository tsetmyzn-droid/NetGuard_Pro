import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Globe, Moon, Shield, Save, Lock } from 'lucide-react';
import { TRANSLATIONS, Language } from '../constants';

interface SettingsProps {
  lang: Language;
}

export const Settings: React.FC<SettingsProps> = ({ lang }) => {
  const cur = TRANSLATIONS[lang];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-black">{cur.settings}</h2>
      </div>

      <div className="glass-card p-8 space-y-8">
        {/* Language Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-white/40" />
            <h3 className="font-bold text-lg">{cur.language}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className={`p-4 rounded-xl border ${lang === 'ar' ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-white/5'}`}>العربية</button>
            <button className={`p-4 rounded-xl border ${lang === 'en' ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-white/5'}`}>English</button>
          </div>
        </section>

        {/* Theme Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-white/40" />
            <h3 className="font-bold text-lg">{cur.theme}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-xl border border-cyan-500 bg-cyan-500/10">Dark Mode</button>
            <button className="p-4 rounded-xl border border-white/5 bg-white/5">Light Mode</button>
          </div>
        </section>

        {/* Security Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-white/40" />
            <h3 className="font-bold text-lg">{cur.security}</h3>
          </div>
          <input 
            type="password" 
            placeholder={cur.changePass}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-500 transition-colors"
          />
        </section>

        <button className="w-full py-4 rounded-xl bg-cyan-500 text-black font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Save className="w-5 h-5" />
          {cur.save}
        </button>
      </div>
    </motion.div>
  );
};

export default Settings;
