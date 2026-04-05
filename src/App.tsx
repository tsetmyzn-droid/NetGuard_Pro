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
import WifiOptimizer from './features/WifiOptimizer';
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
    // Check local storage for auth session
    const session = localStorage.getItem('netguard_session');
    if (session) {
      setIsAuthenticated(true);
    }
    setIsLoaded(true);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('netguard_session', 'active');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('netguard_session');
  };

  if (!isLoaded) return null;

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'devices': return <DeviceList />;
      case 'analytics': return <Analytics />;
      case 'profiles': return <RouterProfiles />;
      case 'optimizer': return <WifiOptimizer />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        onHelpClick={() => setIsHelpOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
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
