import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Fingerprint, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [use2FA, setUse2FA] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter your credentials');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-white"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-blue-600/30 mb-6">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">NetGuard Pro</h1>
          <p className="text-slate-500 mt-2">Secure Gateway Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div 
                onClick={() => setUse2FA(!use2FA)}
                className={cn(
                  "w-10 h-6 rounded-full transition-all relative",
                  use2FA ? "bg-blue-600" : "bg-slate-200"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                  use2FA ? "right-1" : "left-1"
                )} />
              </div>
              <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Enable 2FA</span>
            </label>
            <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-700">Forgot?</button>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <button className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all">
            <Fingerprint className="w-6 h-6 text-blue-600" />
            Biometric Login
          </button>
        </div>

        <p className="text-center text-slate-400 text-xs mt-8">
          NetGuard Pro v2.4.0 • Secure Firmware v4.1
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
