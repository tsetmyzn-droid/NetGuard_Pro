import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Fingerprint, 
  ArrowRight,
  ShieldAlert,
  Globe,
  Eye,
  EyeOff,
  Server,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { routerService } from '../services/routerService';

import { useTranslation } from '../contexts/LanguageContext';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const { t, language, setLanguage, isRTL } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [routerAddress, setRouterAddress] = useState('192.168.1.1');
  const [protocol, setProtocol] = useState<'SSH' | 'API' | 'WEB'>('API');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'router' | 'mobile'>('router');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const [routerType, setRouterType] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    
    try {
      if (loginType === 'router') {
        const success = await routerService.connect(routerAddress, username, password, protocol, remember);
        
        if (success) {
          onLogin();
        } else {
          setError(t('auth_error_auth'));
        }
      } else {
        // Mobile data login simulation
        setTimeout(() => {
          onLogin();
          setIsLoading(false);
        }, 2000);
        return;
      }
    } catch (err: any) {
      if (err.message === 'CHECK_HOME_WIFI') {
        setError(t('check_home_wifi'));
      } else if (err.message === 'IP_LOCKED_OUT') {
        setError(t('auth_error_brute'));
      } else {
        setError(t('auth_error_conn'));
      }
    } finally {
      if (loginType === 'router') setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 relative overflow-hidden"
      >
        <div className="absolute top-6 right-6 flex gap-2">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center gap-2 text-xs font-bold"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'AR' : 'EN'}
          </button>
        </div>

        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-blue-600/30 mb-6">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">NetGuard Pro</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('secure_gateway')}</p>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mt-6 w-full">
            <button
              type="button"
              onClick={() => setLoginType('router')}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                loginType === 'router' 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              {t('router_login') || 'اتصال الراوتر'}
            </button>
            <button
              type="button"
              onClick={() => setLoginType('mobile')}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                loginType === 'mobile' 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              {t('mobile_login') || 'بيانات الجوال'}
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </div>
          )}

          {loginType === 'router' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mx-1">{t('router_address')}</label>
                <div className="relative">
                  <Server className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400",
                    isRTL ? "right-4" : "left-4"
                  )} />
                  <input 
                    type="text" 
                    placeholder="192.168.1.1"
                    value={routerAddress}
                    onChange={(e) => setRouterAddress(e.target.value)}
                    className={cn(
                      "w-full py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white",
                      isRTL ? "pr-12 pl-24 text-right" : "pl-12 pr-24 text-left"
                    )}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoading(true);
                      const result = await routerService.autoDetectRouter();
                      if (result.brand !== 'Unknown') {
                        setRouterType(result.brand);
                        // In a real app, we might also set the IP if it was discovered
                      }
                      setIsLoading(false);
                    }}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black hover:bg-blue-600/20 transition-all uppercase tracking-widest",
                      isRTL ? "left-3" : "right-3"
                    )}
                  >
                    {t('auto_detect')}
                  </button>
                </div>
                {routerType && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mt-1 px-1"
                  >
                    {t('router_found').replace('{ip}', routerType)}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mx-1">{t('username')}</label>
                <div className="relative">
                  <User className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400",
                    isRTL ? "right-4" : "left-4"
                  )} />
                  <input 
                    type="text" 
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={cn(
                      "w-full py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white",
                      isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mx-1">{t('password')}</label>
                <div className="relative">
                  <Lock className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400",
                    isRTL ? "right-4" : "left-4"
                  )} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "w-full py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white",
                      isRTL ? "pr-12 pl-12 text-right" : "pl-12 pr-12 text-left"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors",
                      isRTL ? "left-4" : "right-4"
                    )}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mx-1">{t('phone_number') || 'رقم الهاتف'}</label>
                <div className="relative">
                  <Smartphone className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400",
                    isRTL ? "right-4" : "left-4"
                  )} />
                  <input 
                    type="tel" 
                    placeholder="01xxxxxxxxx"
                    className={cn(
                      "w-full py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white",
                      isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"
                    )}
                  />
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-xs text-blue-600 dark:text-blue-400 font-medium">
                {t('mobile_data_info') || 'سيتم سحب بيانات الاستهلاك مباشرة من شريحة الهاتف النشطة.'}
              </div>
            </>
          )}

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div 
                onClick={() => setRemember(!remember)}
                className={cn(
                  "w-10 h-6 rounded-full transition-all relative",
                  remember ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                )}
              >
                <div className={cn(
                   "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                   remember 
                    ? (isRTL ? "left-1" : "right-1") 
                    : (isRTL ? "right-1" : "left-1")
                )} />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t('remember_password')}</span>
            </label>
            <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-700">{t('forgot')}</button>
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
                {t('sign_in')} <ArrowRight className={cn("w-5 h-5", isRTL && "rotate-180")} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
          <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
            <Fingerprint className="w-6 h-6 text-blue-600" />
            {t('biometric_login')}
          </button>
        </div>

        <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-8">
          NetGuard Pro v2.4.0 • Secure Firmware v4.1
        </p>
      </motion.div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-2xl flex flex-col items-center text-center max-w-xs w-full"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-blue-100 dark:border-slate-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Server className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {t('loading_router') || 'جاري التحميل...'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('detecting_router') || 'يتم الآن التعرف على نوع الراوتر وتأمين الاتصال'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
