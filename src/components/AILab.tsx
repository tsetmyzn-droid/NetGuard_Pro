import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Send, Bot, User, Zap } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface AILabProps {
  lang: Language;
}

export const AILab: React.FC<AILabProps> = ({ lang }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'مرحباً! أنا NetGuard AI. كيف يمكنني مساعدتك في تأمين شبكتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const cur = TRANSLATIONS[lang];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'جاري تحليل طلبك... تم فحص سجلات الأمان ولم يتم العثور على أي تهديدات نشطة حالياً.' 
      }]);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-[calc(100vh-12rem)]"
    >
      <div className="glass-card p-4 mb-4 flex items-center justify-between bg-cyan-400/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-400/20">
            <Brain className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold">{cur.aiLab}</h2>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Neural Link Active</span>
            </div>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-cyan-500 text-black font-medium rounded-tr-none' 
                  : 'glass-card border-white/10 rounded-tl-none'
              }`}>
                <div className="flex items-center gap-2 mb-1 opacity-50">
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  <span className="text-[8px] uppercase font-bold tracking-tighter">
                    {msg.role === 'user' ? 'Operator' : 'NetGuard AI'}
                  </span>
                </div>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about network security..."
          className="w-full glass-card bg-white/5 border-white/10 py-4 px-6 pr-14 text-xs outline-none focus:border-cyan-400/50 transition-colors"
        />
        <button 
          onClick={handleSend}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {['Scan Network', 'Check Logs'].map((action, i) => (
          <button key={i} className="glass-card p-2 text-[10px] font-bold text-white/40 hover:text-cyan-400 hover:border-cyan-400/30 transition-all flex items-center justify-center gap-2">
            <Zap className="w-3 h-3" />
            {action}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
