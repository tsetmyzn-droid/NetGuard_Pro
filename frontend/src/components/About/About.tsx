import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Activity, Info, Globe, Lock, Cpu, Server, Terminal, CheckCircle } from 'lucide-react';
import { Language } from '../../types/index';
import { TRANSLATIONS } from '../../constants';

interface AboutProps {
  lang: Language;
}

export const About: React.FC<AboutProps> = ({ lang }) => {
  const cur = TRANSLATIONS[lang];
  const isAr = lang === 'ar';

  const features = [
    {
      icon: Shield,
      title: isAr ? "دفاع سيبراني متقدم" : "Advanced Cyber Defense",
      desc: isAr ? "نظام حماية مدعوم بالذكاء الاصطناعي يكتشف التهديدات قبل وقوعها." : "AI-powered protection system that detects threats before they happen."
    },
    {
      icon: Zap,
      title: isAr ? "تحسين الأداء اللحظي" : "Real-time Optimization",
      desc: isAr ? "تحليل حركة البيانات وتقليل التأخير لضمان أفضل سرعة اتصال." : "Traffic analysis and latency reduction to ensure the best connection speed."
    },
    {
      icon: Activity,
      title: isAr ? "مراقبة الأجهزة" : "Device Monitoring",
      desc: isAr ? "رؤية كاملة لكافة الأجهزة المتصلة واستهلاكها للبيانات." : "Full visibility of all connected devices and their data usage."
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border-l-4 border-cyan-500"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-cyan-500/20 rounded-xl">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">NetGuard Pro v2.5</h2>
            <p className="text-cyan-400/80 text-sm font-mono uppercase tracking-widest">{isAr ? "نظام التشغيل السيبراني" : "Cyber Operating System"}</p>
          </div>
        </div>
        
        <p className="text-gray-400 leading-relaxed italic">
          {isAr 
            ? "يعد NetGuard Pro الحل المتكامل لإدارة الشبكات المنزلية والمكتبية، حيث يجمع بين واجهة المستخدم المتقدمة (Command Center) وقوة المعالجة السحابية لتوفير بيئة رقمية آمنة ومستقرة."
            : "NetGuard Pro is the integrated solution for home and office network management, combining an advanced Command Center interface with cloud processing power to provide a secure and stable digital environment."}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 flex gap-4 items-start"
          >
            <div className="p-2 bg-gray-800/50 rounded-lg text-cyan-400">
              <f.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Cpu className="w-24 h-24 text-cyan-500" />
        </div>
        
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          {isAr ? "المواصفات التقنية" : "Technical Specs"}
        </h3>
        
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-gray-500">ENGINE</span>
            <span className="text-cyan-400">NODE_SERVER V4 + PYTHON 3.11</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-gray-500">PROTOCOL</span>
            <span className="text-cyan-400">WSS (SECURE WEBSOCKET)</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-gray-500">ENCRYPTION</span>
            <span className="text-cyan-400">AES-256-GCM / SHA-512</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">DATABASE</span>
            <span className="text-cyan-400">SQLITE3 (ENCRYPTED)</span>
          </div>
        </div>
      </motion.div>

      <div className="text-center p-4">
        <p className="text-gray-600 text-[10px] uppercase tracking-tighter">
          {isAr ? "تم التطوير بواسطة فريق الأمن الرقمي المتقدم" : "Developed by Advanced Digital Security Team"}
          <br />
          © 2026 NetGuard Pro Enterprise. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};
