/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Auth from './features/Auth';
import Dashboard from './features/Dashboard';
import DeviceList from './features/DeviceList';
import Analytics from './features/Analytics';
import Settings from './features/Settings';
import RouterProfiles from './features/RouterProfiles';
import WifiOptimizer from './services/WifiOptimizer';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import HelpCenter from './components/HelpCenter';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check session storage for auth session
    const session = sessionStorage.getItem('netguard_session');
    const lastActivity = sessionStorage.getItem('netguard_last_activity');
    
    if (session && lastActivity) {
      const lastTime = parseInt(lastActivity, 10);
      // Check if session is expired (30 mins)
      if (Date.now() - lastTime > 30 * 60 * 1000) {
        handleLogout();
      } else {
        setIsAuthenticated(true);
        sessionStorage.setItem('netguard_last_activity', Date.now().toString());
      }
    }
    setIsLoaded(true);

    // Update last activity on any user interaction
    const updateActivity = () => {
      if (sessionStorage.getItem('netguard_session')) {
        sessionStorage.setItem('netguard_last_activity', Date.now().toString());
      }
    };

    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);

    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('netguard_session', 'active');
    sessionStorage.setItem('netguard_last_activity', Date.now().toString());
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('netguard_session');
    sessionStorage.removeItem('netguard_last_activity');
  };

  if (!isLoaded) return null;

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onLogout={handleLogout} />;
      case 'devices': return <DeviceList />;
      case 'analytics': return <Analytics />;
      case 'profiles': return <RouterProfiles />;
      case 'optimizer': return <WifiOptimizer />;
      case 'settings': return <Settings />;
      default: return <Dashboard onLogout={handleLogout} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        onHelpClick={() => setIsHelpOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onHelpClick={() => setIsHelpOpen(true)}
      />
      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
