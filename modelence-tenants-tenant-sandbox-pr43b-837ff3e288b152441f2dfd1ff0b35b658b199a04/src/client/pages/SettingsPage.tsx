/**
 * ============================================================================
 * NetGuard Pro - صفحة الإعدادات (Settings)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تحذف قسم Router Connection (IP، اسم، كلمة مرور، موديل).
 * 🚫 لا تحذف قوائم الـ brands (Huawei, ZTE, TP-Link, D-Link, Netgear, ASUS).
 * 🚫 لا تحذف قسم WiFi Settings (SSID، password، channel، security).
 * 🚫 لا تحذف قسم Bandwidth Control.
 * 🚫 لا تحذف Danger Zone (reboot، factory reset).
 * 
 * 🔐 مطلوب إضافة (لم يتم بعد):
 * - تشفير routerPassword قبل حفظها في DB (crypto-js)
 * - تشفير wifi.password قبل حفظها في DB
 * - زر "Auto-Detect Router Model" يتعرف على الموديل من 192.168.1.1
 * 
 * 🎯 الراوترات المصرية المستهدفة:
 * - Huawei DG8045 (فودافون)
 * - Huawei HG630 V2 (اتصالات المنزلية)
 * - ZTE ZXHN H168N (WE / المصرية للاتصالات)
 * - TP-Link Archer series
 * ============================================================================
 */
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation, createQueryKey } from '@modelence/react-query';
import { useI18n } from '@/client/lib/i18n';
import toast from 'react-hot-toast';
import {
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Power,
  AlertTriangle,
  Router,
  Gauge,
  RotateCcw,
} from 'lucide-react';

type RouterConfig = {
  routerIp: string;
  routerUsername: string;
  routerModel?: string;
  routerBrand?: string;
  firmwareVersion?: string;
  isConnected: boolean;
  lastConnectedAt?: string;
};

type WifiSettings = {
  ssid?: string;
  isHidden: boolean;
  channel?: number;
  securityType?: string;
  isEnabled: boolean;
  maxDownloadMbps?: number;
  maxUploadMbps?: number;
};

function SettingSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Icon className="text-primary-600 dark:text-primary-400" size={20} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // Router Config State
  const [routerIp, setRouterIp] = useState('192.168.1.1');
  const [routerUsername, setRouterUsername] = useState('admin');
  const [routerPassword, setRouterPassword] = useState('');
  const [routerModel, setRouterModel] = useState('');
  const [routerBrand, setRouterBrand] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // WiFi Settings State
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [channel, setChannel] = useState('');
  const [securityType, setSecurityType] = useState('WPA2');
  const [isWifiEnabled, setIsWifiEnabled] = useState(true);
  const [maxDownload, setMaxDownload] = useState('');
  const [maxUpload, setMaxUpload] = useState('');

  // Queries
  const { data: config, isLoading: configLoading } = useQuery({
    ...modelenceQuery<RouterConfig>('router.getConfig', {}),
  });

  const { data: wifiSettings, isLoading: wifiLoading } = useQuery({
    ...modelenceQuery<WifiSettings>('router.getWifiSettings', {}),
  });

  // Mutations
  const { mutate: saveConfig, isPending: savingConfig } = useMutation({
    ...modelenceMutation('router.saveConfig'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('router.getConfig', {}) });
      toast.success(t('settingsSaved'));
    },
    onError: () => {
      toast.error(t('error'));
    },
  });

  const { mutate: saveWifiSettings, isPending: savingWifi } = useMutation({
    ...modelenceMutation('router.saveWifiSettings'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('router.getWifiSettings', {}) });
      toast.success(t('settingsSaved'));
    },
  });

  const { mutate: simulateConnection, isPending: connecting } = useMutation({
    ...modelenceMutation('router.simulateConnection'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('router.getConfig', {}) });
      queryClient.invalidateQueries({ queryKey: createQueryKey('router.getDashboardStats', {}) });
    },
  });

  // Load config into state
  useEffect(() => {
    if (config) {
      setRouterIp(config.routerIp || '192.168.1.1');
      setRouterUsername(config.routerUsername || 'admin');
      setRouterModel(config.routerModel || '');
      setRouterBrand(config.routerBrand || '');
    }
  }, [config]);

  // Load WiFi settings into state
  useEffect(() => {
    if (wifiSettings) {
      setSsid(wifiSettings.ssid || '');
      setIsHidden(wifiSettings.isHidden);
      setChannel(wifiSettings.channel?.toString() || '');
      setSecurityType(wifiSettings.securityType || 'WPA2');
      setIsWifiEnabled(wifiSettings.isEnabled);
      setMaxDownload(wifiSettings.maxDownloadMbps?.toString() || '');
      setMaxUpload(wifiSettings.maxUploadMbps?.toString() || '');
    }
  }, [wifiSettings]);

  const handleSaveConfig = () => {
    if (!routerIp || !routerUsername) {
      toast.error('Please fill in all required fields');
      return;
    }

    saveConfig({
      routerIp,
      routerUsername,
      routerPassword,
      routerModel: routerModel || undefined,
      routerBrand: routerBrand || undefined,
    });
  };

  const handleSaveWifi = () => {
    saveWifiSettings({
      ssid: ssid || undefined,
      password: wifiPassword || undefined,
      isHidden,
      channel: channel ? parseInt(channel) : undefined,
      securityType,
      isEnabled: isWifiEnabled,
      maxDownloadMbps: maxDownload ? parseInt(maxDownload) : undefined,
      maxUploadMbps: maxUpload ? parseInt(maxUpload) : undefined,
    });
  };

  const handleConnect = () => {
    simulateConnection({ connected: !config?.isConnected });
  };

  void (configLoading || wifiLoading); // Available for future loading state UI

  const routerBrands = ['Huawei', 'ZTE', 'TP-Link', 'D-Link', 'Netgear', 'ASUS', 'Other'];
  const routerModels: Record<string, string[]> = {
    'Huawei': ['HG630 V2', 'HG531 V1', 'HG8245H', 'DG8045', 'HG8546M'],
    'ZTE': ['ZXHN H168N', 'ZXHN H108N', 'ZXHN F660', 'ZXV10 W300'],
    'TP-Link': ['Archer C7', 'Archer C20', 'TD-W8961N', 'TL-WR840N'],
    'D-Link': ['DSL-2750U', 'DIR-615', 'DSL-2640U'],
    'Netgear': ['R6700', 'R7000', 'R8000'],
    'ASUS': ['RT-AC68U', 'RT-AX86U', 'RT-N12'],
    'Other': ['Custom'],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('routerInfo')}</p>
      </div>

      {/* Connection Status */}
      <div className={`card p-4 flex items-center justify-between ${
        config?.isConnected ? 'border-green-500/50' : 'border-yellow-500/50'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            config?.isConnected
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-yellow-100 dark:bg-yellow-900/30'
          }`}>
            {config?.isConnected ? (
              <Wifi className="text-green-600 dark:text-green-400" size={24} />
            ) : (
              <WifiOff className="text-yellow-600 dark:text-yellow-400" size={24} />
            )}
          </div>
          <div>
            <p className={`font-medium ${
              config?.isConnected ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {config?.isConnected ? t('connected') : t('disconnected')}
            </p>
            {config?.lastConnectedAt && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(config.lastConnectedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleConnect}
          disabled={connecting}
          className={config?.isConnected ? 'btn-secondary' : 'btn-primary'}
        >
          {connecting ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : config?.isConnected ? (
            t('disconnect')
          ) : (
            t('connect')
          )}
        </button>
      </div>

      {/* Router Configuration */}
      <SettingSection title={t('routerConnection')} icon={Router}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('routerIp')}
            </label>
            <input
              type="text"
              value={routerIp}
              onChange={(e) => setRouterIp(e.target.value)}
              className="input-field"
              placeholder="192.168.1.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('username')}
            </label>
            <input
              type="text"
              value={routerUsername}
              onChange={(e) => setRouterUsername(e.target.value)}
              className="input-field"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={routerPassword}
                onChange={(e) => setRouterPassword(e.target.value)}
                className="input-field pe-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('routerBrand')}
            </label>
            <select
              value={routerBrand}
              onChange={(e) => {
                setRouterBrand(e.target.value);
                setRouterModel('');
              }}
              className="input-field"
            >
              <option value="">Select Brand</option>
              {routerBrands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {routerBrand && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('routerModel')}
              </label>
              <select
                value={routerModel}
                onChange={(e) => setRouterModel(e.target.value)}
                className="input-field"
              >
                <option value="">Select Model</option>
                {routerModels[routerBrand]?.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className="btn-primary flex items-center gap-2"
          >
            {savingConfig ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {t('saveChanges')}
          </button>
        </div>
      </SettingSection>

      {/* WiFi Settings */}
      <SettingSection title={t('wifiSettings')} icon={Wifi}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('networkName')}
            </label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className="input-field"
              placeholder="My WiFi Network"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('password')}
            </label>
            <input
              type="text"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
              className="input-field"
              placeholder="New password (leave empty to keep current)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('channel')}
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="input-field"
            >
              <option value="">Auto</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('security')}
            </label>
            <select
              value={securityType}
              onChange={(e) => setSecurityType(e.target.value)}
              className="input-field"
            >
              <option value="WPA3">WPA3</option>
              <option value="WPA2">WPA2</option>
              <option value="WPA">WPA</option>
              <option value="Open">Open (Not Recommended)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-6 space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-secondary-900 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <EyeOff size={20} className="text-gray-500" />
              <span>{t('hideNetwork')}</span>
            </div>
            <button
              onClick={() => setIsHidden(!isHidden)}
              className={`w-12 h-6 rounded-full transition-colors ${
                isHidden ? 'bg-primary-600' : 'bg-gray-300 dark:bg-secondary-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                isHidden ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-secondary-900 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Wifi size={20} className="text-gray-500" />
              <span>{isWifiEnabled ? t('disableWifi') : t('enableWifi')}</span>
            </div>
            <button
              onClick={() => setIsWifiEnabled(!isWifiEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                isWifiEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-secondary-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                isWifiEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveWifi}
            disabled={savingWifi}
            className="btn-primary flex items-center gap-2"
          >
            {savingWifi ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {t('saveChanges')}
          </button>
        </div>
      </SettingSection>

      {/* Bandwidth Control */}
      <SettingSection title={t('bandwidthControl')} icon={Gauge}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('maxDownload')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={maxDownload}
                onChange={(e) => setMaxDownload(e.target.value)}
                className="input-field"
                placeholder="100"
                min="1"
                max="1000"
              />
              <span className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 text-sm">
                {t('mbps')}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('maxUpload')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={maxUpload}
                onChange={(e) => setMaxUpload(e.target.value)}
                className="input-field"
                placeholder="50"
                min="1"
                max="1000"
              />
              <span className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 text-sm">
                {t('mbps')}
              </span>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Danger Zone */}
      <div className="card border-red-200 dark:border-red-900/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-secondary-900 rounded-lg">
            <div>
              <p className="font-medium">{t('rebootRouter')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('confirmReboot')}</p>
            </div>
            <button className="btn-secondary flex items-center gap-2">
              <Power size={18} />
              {t('rebootRouter')}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">{t('factoryReset')}</p>
              <p className="text-sm text-red-500/80">{t('confirmReset')}</p>
            </div>
            <button className="btn-danger flex items-center gap-2">
              <RotateCcw size={18} />
              {t('factoryReset')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
