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

const RouterProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<RouterProfile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    ip: '192.168.1.1',
    user: 'admin',
    pass: '',
    type: 'Auto-Detect'
  });

  useEffect(() => {
    setProfiles(routerServiceV2.getProfiles());
  }, []);

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
    setNewProfile({ name: '', ip: '192.168.1.1', user: 'admin', pass: '', type: 'Auto-Detect' });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Router Profiles</h2>
          <p className="text-slate-500">Manage encrypted credentials for multiple gateways</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Add New Router
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-400">No Profiles Saved</h3>
            <p className="text-slate-400 text-sm">Add your first router to start monitoring</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <DashboardCard key={profile.id} className="group cursor-pointer hover:border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{profile.profileName}</h3>
              <p className="text-sm text-slate-500 mb-6">{profile.routerType}</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-mono text-slate-600">{profile.routerIp}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AES-256 Encrypted</span>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-all">
                Connect Now
                <ChevronRight className="w-4 h-4" />
              </button>
            </DashboardCard>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Add Router Profile</h3>
            <form onSubmit={handleAddProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Profile Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Home Router, Office, etc."
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Router IP</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={newProfile.ip}
                      onChange={(e) => setNewProfile({...newProfile, ip: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={newProfile.user}
                      onChange={(e) => setNewProfile({...newProfile, user: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    placeholder="Router Admin Password"
                    value={newProfile.pass}
                    onChange={(e) => setNewProfile({...newProfile, pass: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  Save Profile
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
