/**
 * ============================================================================
 * NetGuard Pro - صفحة لوحة التحكم (Dashboard)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تحذف بطاقات الإحصائيات (اليومي، الأسبوعي، الشهري، الأجهزة).
 * 🚫 لا تحذف قسم حالة الاتصال بالراوتر.
 * 🚫 لا تحذف قسم الاستهلاك حسب الجهاز (مع progress bars).
 * 🚫 لا تحذف auto-refresh كل 30 ثانية (refetchInterval).
 * 
 * 📊 مطلوب إضافة (لم يتم بعد):
 * - Line chart للاستهلاك عبر الزمن (Recharts)
 * - Pie chart لتوزيع الاستهلاك بين الأجهزة
 * - Bar chart للاستهلاك اليومي/الأسبوعي
 * 
 * ✨ عند إضافة charts:
 * ```
 * npm install recharts
 * ```
 * ============================================================================
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import { useI18n } from '@/client/lib/i18n';
import {
  Wifi,
  WifiOff,
  Download,
  Upload,
  Laptop2,
  Ban,
  Signal,
  Clock,
  Calendar,
  HardDrive,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

type DashboardStats = {
  totalDevices: number;
  onlineDevices: number;
  blockedDevices: number;
  todayUsage: { value: number; unit: string };
  todayDownload: { value: number; unit: string };
  todayUpload: { value: number; unit: string };
  weeklyUsage: { value: number; unit: string };
  monthlyUsage: { value: number; unit: string };
  isConnected: boolean;
  routerModel?: string;
  routerBrand?: string;
  dataRemaining?: number;
  renewalDate?: string;
};

type DeviceUsage = {
  _id: string;
  deviceName: string;
  macAddress: string;
  isOnline: boolean;
  usage: { value: number; unit: string };
  usageBytes: number;
};

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color = 'primary',
  subLabel,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  subLabel?: string;
}) {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <div className="card card-hover p-5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
            {unit && <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ms-1">{unit}</span>}
          </p>
          {subLabel && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subLabel}</p>}
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{label}</p>
    </div>
  );
}

function UsageChart({ data }: { data: DeviceUsage[] }) {
  const { t } = useI18n();
  const maxUsage = Math.max(...data.map(d => d.usageBytes), 1);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t('noDevices')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.slice(0, 5).map((device, index) => (
        <div key={device._id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${device.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium truncate max-w-[150px]">{device.deviceName}</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {device.usage.value} {device.usage.unit}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-secondary-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${(device.usageBytes / maxUsage) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    ...modelenceQuery<DashboardStats>('router.getDashboardStats', {}),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: deviceUsage, isLoading: usageLoading } = useQuery({
    ...modelenceQuery<DeviceUsage[]>('router.getUsageByDevice', { period: 'daily' }),
    refetchInterval: 30000,
  });

  const isLoading = statsLoading || usageLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('appDescription')}</p>
        </div>
        <button
          onClick={() => refetchStats()}
          className="btn-secondary flex items-center gap-2 self-start"
          disabled={isLoading}
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          {t('refresh')}
        </button>
      </div>

      {/* Connection Status */}
      <div className={`card p-4 flex items-center gap-4 ${stats?.isConnected ? 'border-green-500/50' : 'border-red-500/50'}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          stats?.isConnected
            ? 'bg-green-100 dark:bg-green-900/30'
            : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          {stats?.isConnected ? (
            <Wifi className="text-green-600 dark:text-green-400" size={24} />
          ) : (
            <WifiOff className="text-red-600 dark:text-red-400" size={24} />
          )}
        </div>
        <div className="flex-1">
          <p className={`font-medium ${stats?.isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {stats?.isConnected ? t('connected') : t('disconnected')}
          </p>
          {stats?.routerModel && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.routerBrand} {stats.routerModel}
            </p>
          )}
        </div>
        {stats?.dataRemaining !== undefined && (
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {stats.dataRemaining} {t('gb')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('dataRemaining')}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Download}
          label={t('todayUsage')}
          value={stats?.todayUsage.value || 0}
          unit={stats?.todayUsage.unit || 'MB'}
          color="primary"
        />
        <StatCard
          icon={TrendingUp}
          label={t('weeklyUsage')}
          value={stats?.weeklyUsage.value || 0}
          unit={stats?.weeklyUsage.unit || 'GB'}
          color="success"
        />
        <StatCard
          icon={Calendar}
          label={t('monthlyUsage')}
          value={stats?.monthlyUsage.value || 0}
          unit={stats?.monthlyUsage.unit || 'GB'}
          color="warning"
        />
        <StatCard
          icon={Laptop2}
          label={t('connectedDevices')}
          value={stats?.onlineDevices || 0}
          subLabel={`${stats?.totalDevices || 0} ${t('all')}`}
          color="primary"
        />
      </div>

      {/* Download/Upload Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Download className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('downloadSpeed')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats?.todayDownload.value || 0} {stats?.todayDownload.unit || 'MB'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Upload className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('uploadSpeed')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats?.todayUpload.value || 0} {stats?.todayUpload.unit || 'MB'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage by Device */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('usage')} - {t('today')}
        </h2>
        <UsageChart data={deviceUsage || []} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <Signal className="mx-auto text-primary-600 dark:text-primary-400 mb-2" size={24} />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{stats?.onlineDevices || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('online')}</p>
        </div>
        <div className="card p-4 text-center">
          <Ban className="mx-auto text-red-600 dark:text-red-400 mb-2" size={24} />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{stats?.blockedDevices || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('blocked')}</p>
        </div>
        <div className="card p-4 text-center">
          <HardDrive className="mx-auto text-yellow-600 dark:text-yellow-400 mb-2" size={24} />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{stats?.dataRemaining || '---'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('dataRemaining')}</p>
        </div>
        <div className="card p-4 text-center">
          <Clock className="mx-auto text-green-600 dark:text-green-400 mb-2" size={24} />
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {stats?.renewalDate ? new Date(stats.renewalDate).getDate() : '---'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('renewalDate')}</p>
        </div>
      </div>
    </div>
  );
}
