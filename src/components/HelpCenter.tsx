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
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

const helpTopics: HelpTopic[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Understand your real-time network statistics.',
    icon: <LayoutDashboard className="w-5 h-5 text-blue-500" />,
    details: [
      'Download/Upload: Shows current speed updated every 500ms.',
      'Total Usage: Tracks data consumed since the app started.',
      'Session Timer: Displays how long you have been monitoring.',
      'Quota Alert: Turns red when you exceed your set data limit.'
    ]
  },
  {
    id: 'optimizer',
    title: 'Wi-Fi Optimizer',
    description: 'How to improve your Wi-Fi signal stability.',
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
    details: [
      'Spectrum Scan: Analyzes all 11 channels for interference.',
      'Recommended Channel: Highlights the cleanest channel in green.',
      'Apply to Router: Updates your router settings to the best channel.',
      'Tip: Channels 1, 6, and 11 are best for 2.4GHz networks.'
    ]
  },
  {
    id: 'security',
    title: 'Security Shield',
    description: 'Learn about the military-grade protection.',
    icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
    details: [
      'AES-256: All router passwords are encrypted locally.',
      'Hydra Detection: Blocks repeated failed login attempts.',
      'MITM Shield: Verifies router identity to prevent spoofing.',
      'Privacy Mode: Disables screenshots and text copying.'
    ]
  },
  {
    id: 'devices',
    title: 'Device Management',
    description: 'Control who accesses your network.',
    icon: <Smartphone className="w-5 h-5 text-purple-500" />,
    details: [
      'Block/Unblock: Instantly cut off internet for any device.',
      'Rename: Give devices friendly names (e.g., "Dad\'s Phone").',
      'Signal Strength: See how far a device is from the router.',
      'Export: Download a CSV list of all network devices.'
    ]
  }
];

const HelpCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

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
                  <h3 className="text-xl font-bold text-slate-900">Help Center</h3>
                  <p className="text-xs text-slate-500 font-medium">How can we help you today?</p>
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
                    ← Back to Topics
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
                      placeholder="Search for a feature or issue..."
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
                Still need help? <span className="text-blue-600 font-bold cursor-pointer hover:underline">Contact Support</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HelpCenter;
