import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Shield, 
  Trash2, 
  Edit3, 
  Lock, 
  Globe, 
  User, 
  Key,
  ChevronRight,
  Database
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { routerServiceV2, RouterProfile } from '../services/routerServiceV2';
import { cn } from '../lib/utils';

import { useTranslation } from '../contexts/LanguageContext';

const RouterProfiles: React.FC = () => {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<RouterProfile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [newProfile, setNewProfile] = useState({
    name: '',
    ip: '192.168.1.1',
    user: 'admin',
    pass: '',
    type: t('auto_detect')
  });

  useEffect(() => {
    setProfiles(routerServiceV2.getProfiles());
  }, []);

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConnect = async (profile: RouterProfile) => {
    const pass = securityService.decryptData(profile.passwordEncrypted);
    const success = await routerService.connect(profile.routerIp, profile.username, pass, 'API');
    if (success) {
      // We might want to trigger a refresh or redirect to dashboard
      window.location.reload(); // Simple way to reset state with new connection
    }
  };

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await routerServiceV2.saveProfile(
      newProfile.name,
      newProfile.ip,
      newProfile.user,
      newProfile.pass,
      newProfile.type
    );
    setProfiles(routerServiceV2.getProfiles());
    setShowAddModal(false);
    setNewProfile({ name: '', ip: '192.168.1.1', user: 'admin', pass: '', type: t('auto_detect') });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('router_profiles')}</h2>
          <p className="text-slate-500 dark:text-slate-400">{t('manage_gateways')}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          {t('add_router')}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500">{t('no_profiles')}</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm">{t('add_first_router')}</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <DashboardCard key={profile.id} className="group cursor-pointer hover:border-blue-200 dark:hover:border-blue-800">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{profile.profileName}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{profile.routerType}</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{profile.routerIp}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-green-500 dark:text-green-400" />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                      {showPasswords[profile.id] ? profile.routerPass : '••••••••'}
                    </span>
                  </div>
                  <button 
                    onClick={() => togglePassword(profile.id)}
                    className="text-[10px] font-bold text-blue-500 hover:text-blue-600"
                  >
                    {showPasswords[profile.id] ? t('hide_password') : t('show_password')}
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Shield className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('aes_encrypted')}</span>
                </div>
              </div>

              <button 
                onClick={() => handleConnect(profile)}
                className="w-full mt-6 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-all"
              >
                {t('connect_now')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </DashboardCard>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('add_router')}</h3>
            <form onSubmit={handleAddProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('profile_name')}</label>
                <input 
                  type="text" 
                  required
                  placeholder={t('profile_placeholder')}
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('router_ip')}</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={newProfile.ip}
                      onChange={(e) => setNewProfile({...newProfile, ip: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('username')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={newProfile.user}
                      onChange={(e) => setNewProfile({...newProfile, user: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('password')}</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    placeholder={t('pass_placeholder')}
                    value={newProfile.pass}
                    onChange={(e) => setNewProfile({...newProfile, pass: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  {t('save_profile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouterProfiles;
