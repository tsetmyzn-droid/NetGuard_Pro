import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  ChevronRight, 
  Search, 
  Zap, 
  ShieldCheck, 
  LayoutDashboard, 
  Smartphone, 
  BarChart3,
  Lock,
  Globe,
  Clock,
  Database,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useTranslation } from '../contexts/LanguageContext';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

const HelpCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

  const helpTopics: HelpTopic[] = [
    {
      id: 'dashboard',
      title: t('dashboard_overview'),
      description: t('understand_stats'),
      icon: <LayoutDashboard className="w-5 h-5 text-blue-500" />,
      details: [
        t('help_dashboard_1'),
        t('help_dashboard_2'),
        t('help_dashboard_3'),
        t('help_dashboard_4')
      ]
    },
    {
      id: 'optimizer',
      title: t('wifi_optimizer'),
      description: t('improve_signal'),
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      details: [
        t('help_optimizer_1'),
        t('help_optimizer_2'),
        t('help_optimizer_3'),
        t('help_optimizer_4')
      ]
    },
    {
      id: 'security',
      title: t('security_shield'),
      description: t('learn_protection'),
      icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
      details: [
        t('help_security_1'),
        t('help_security_2'),
        t('help_security_3'),
        t('help_security_4')
      ]
    },
    {
      id: 'connectivity',
      title: t('router_connectivity'),
      description: t('router_connectivity_help'),
      icon: <Globe className="w-5 h-5 text-blue-500" />,
      details: [
        t('help_conn_1'),
        t('help_conn_2'),
        t('help_conn_3'),
        t('help_conn_4')
      ]
    },
    {
      id: 'analytics',
      title: t('advanced_analytics'),
      description: t('detailed_consumption_help'),
      icon: <BarChart3 className="w-5 h-5 text-orange-500" />,
      details: [
        t('help_analytics_1'),
        t('help_analytics_2'),
        t('help_analytics_3'),
        t('help_analytics_4')
      ]
    },
    {
      id: 'devices',
      title: t('device_management'),
      description: t('control_access'),
      icon: <Smartphone className="w-5 h-5 text-purple-500" />,
      details: [
        t('help_devices_1'),
        t('help_devices_2'),
        t('help_devices_3'),
        t('help_devices_4')
      ]
    },
    {
      id: 'dns',
      title: t('dns_settings'),
      description: t('configure_dns_help'),
      icon: <Server className="w-5 h-5 text-indigo-500" />,
      details: [
        t('help_dns_1'),
        t('help_dns_2'),
        t('help_dns_3'),
        t('help_dns_4')
      ]
    },
    {
      id: 'translation',
      title: t('ai_translation'),
      description: t('ai_translation_help'),
      icon: <Globe className="w-5 h-5 text-cyan-500" />,
      details: [
        t('help_ai_1'),
        t('help_ai_2'),
        t('help_ai_3'),
        t('help_ai_4')
      ]
    }
  ];

  const filteredTopics = helpTopics.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <HelpCircle className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{t('help_center')}</h3>
                  <p className="text-xs text-slate-500 font-medium">{t('how_can_we_help')}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedTopic ? (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="space-y-6"
                >
                  <button 
                    onClick={() => setSelectedTopic(null)}
                    className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    ← {t('back_to_topics')}
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                      {selectedTopic.icon}
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900">{selectedTopic.title}</h4>
                  </div>
                  <p className="text-slate-600 font-medium">{selectedTopic.description}</p>
                  <div className="space-y-3">
                    {selectedTopic.details.map((detail, i) => (
                      <div key={i} className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                          <ChevronRight className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{detail}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder={t('search_help_placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTopics.map((topic) => (
                      <button 
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        className="p-5 bg-white border border-slate-100 rounded-3xl text-left hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
                      >
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                          {topic.icon}
                        </div>
                        <h5 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{topic.title}</h5>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{topic.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500 font-medium">
                {t('still_need_help')} <span className="text-blue-600 font-bold cursor-pointer hover:underline">{t('contact_support')}</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HelpCenter;
