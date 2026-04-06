import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Fingerprint, 
  ArrowRight,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { routerService } from '../services/routerService';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [routerAddress, setRouterAddress] = useState('192.168.1.1');
  const [protocol, setProtocol] = useState<'SSH' | 'API' | 'WEB'>('API');
  const [isLoading, setIsLoading] = useState(false);
  const [use2FA, setUse2FA] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Default credentials for preview (only in dev mode)
    const IS_PREVIEW = !import.meta.env.PROD;
    const DEFAULT_USER = 'admin';
    const DEFAULT_PASS = 'admin123';

    if (!username || !password || !routerAddress) {
      setError('Please enter all credentials');
      return;
    }

    if (IS_PREVIEW && (username !== DEFAULT_USER || password !== DEFAULT_PASS)) {
      setError('Invalid username or password. Try admin / admin123');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate protocol-specific connection
      if (protocol === 'SSH') await routerService.connectViaSSH(routerAddress, username, password);
      else if (protocol === 'API') await routerService.connectViaAPI(routerAddress, username, password);
      else await routerService.connectViaWeb(routerAddress, username, password);

      onLogin();
    } catch (err) {
      setError('Failed to connect to router. Check address and credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-blue-600/30 mb-6">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">NetGuard Pro</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Secure Gateway Management</p>
          
          {!import.meta.env.PROD && (
            <div className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-800">
              Preview Mode: Use <span className="text-blue-800 dark:text-blue-200">admin</span> / <span className="text-blue-800 dark:text-blue-200">admin123</span>
            </div>
          )}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Connection Protocol</label>
            <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
              {(['SSH', 'API', 'WEB'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProtocol(p)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                    protocol === p 
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
              {protocol === 'SSH' && 'Paramiko (SSH) for CLI access'}
              {protocol === 'API' && 'Requests (HTTP) for REST API'}
              {protocol === 'WEB' && 'Selenium (Web) for scraping dashboard'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Router Address</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="192.168.1.1"
                value={routerAddress}
                onChange={(e) => setRouterAddress(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div 
                onClick={() => setUse2FA(!use2FA)}
                className={cn(
                  "w-10 h-6 rounded-full transition-all relative",
                  use2FA ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                  use2FA ? "right-1" : "left-1"
                )} />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Enable 2FA</span>
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

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
          <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <Fingerprint className="w-6 h-6 text-blue-600" />
            Biometric Login
          </button>
        </div>

        <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-8">
          NetGuard Pro v2.4.0 • Secure Firmware v4.1
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
