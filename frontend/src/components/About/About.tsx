/**
 * ============================================================================
 * NetGuard Pro - صفحة معلومات النظام (About System)
 * ============================================================================
 * 
 * 🛡️ الهوية: Branding & Vision
 * المسؤول عن:
 * 1. عرض معلومات الإصدار والترخيص
 * 2. شرح رؤية التطبيق Enterprise OS
 * ============================================================================
 */
import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Info, Globe, Lock, Cpu } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

export const About: React.FC = () => {
  const { lang, t } = useI18n();
  const isRtl = lang === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto space-y-8 py-12"
    >
      <div className="text-center space-y-6">
        <div className="inline-flex p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 mb-4 animate-bounce">
          <ShieldCheck className="w-12 h-12 text-cyan-400 glow-text" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter">NetGuard Pro <span className="text-cyan-400">Enterprise</span></h2>
        <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          <span>v1.0.0-PRO</span>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <span>Kernel Stable</span>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <span>Security Audited</span>
        </div>
      </div>

      <div className="glass-card p-10 space-y-8 relative overflow-hidden">
        <div className="scanner-line !h-[1px] !opacity-5" />
        
        <div className="flex gap-6">
          <div className="p-3 h-fit rounded-2xl bg-white/5 border border-white/10">
            <Info className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-widest">{lang === 'ar' ? 'عن النظام' : 'About System'}</h3>
            <p className="text-sm text-white/60 leading-relaxed font-medium">
              {lang === 'ar' 
                ? "يعد NetGuard Pro الحل المتكامل لإدارة الشبكات المنزلية والمكتبية، حيث يجمع بين واجهة المستخدم المتقدمة (Command Center) وقوة المعالجة السحابية لتوفير بيئة رقمية آمنة ومستقرة."
                : "NetGuard Pro is the integrated solution for home and office network management, combining an advanced Command Center interface with cloud processing power to provide a secure and stable digital environment."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-white/5 text-purple-400">
                <Lock className="w-5 h-5" />
             </div>
             <div>
                <span className="block text-[10px] font-black text-white uppercase tracking-widest">Encryption</span>
                <span className="text-[10px] text-white/30 truncate">AES-256 Bit Advanced</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-white/5 text-emerald-400">
                <Globe className="w-5 h-5" />
             </div>
             <div>
                <span className="block text-[10px] font-black text-white uppercase tracking-widest">Global Support</span>
                <span className="text-[10px] text-white/30 truncate">Bilingual AR/EN Engine</span>
             </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.5em]">
          Powered by NetGuard Engine &copy; 2026
        </p>
        <p className="text-[7px] text-cyan-400/20 font-mono italic">
          Authorized for Professional Enterprise Deployment Only
        </p>
      </div>
    </motion.div>
  );
};
