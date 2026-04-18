/**
 * ============================================================================
 * NetGuard Pro - صفحة الأخطاء (Errors) - مراقبة مباشرة
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تحذف auto-refresh كل 5 ثوانٍ (refetchInterval: 5000).
 * 🚫 لا تحذف تجميع الأخطاء حسب التاريخ.
 * 🚫 لا تحذف إحصائيات الفئات.
 * 🚫 لا تحذف عرض الوقت نسبي (time-ago).
 * 🚫 لا تحذف تبديل الإشعارات.
 * 🚫 لا تحذف مؤشر "Live Monitoring" (مع animate-pulse).
 * ============================================================================
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import { useI18n } from '@/client/lib/i18n';
import {
  AlertTriangle,
  RefreshCw,
  Search,
  AlertCircle,
  Clock,
  Server,
  Wifi,
  Shield,
  Settings,
  ChevronDown,
  ChevronUp,
  Bell,
  BellOff,
} from 'lucide-react';

type ErrorLog = {
  _id: string;
  category: string;
  message: string;
  details?: string;
  timestamp: string;
};

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'connection':
      return Wifi;
    case 'device':
      return Server;
    case 'settings':
      return Settings;
    case 'security':
      return Shield;
    default:
      return AlertCircle;
  }
}

function ErrorCard({ error }: { error: ErrorLog }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = getCategoryIcon(error.category);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="card border-red-200 dark:border-red-900/50 p-5 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
          <Icon className="text-red-600 dark:text-red-400" size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <span className="badge badge-danger">{error.category}</span>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={12} />
              <span>{timeAgo(error.timestamp)}</span>
            </div>
          </div>

          <h3 className="font-medium text-gray-900 dark:text-white mt-3">
            {error.message}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date(error.timestamp).toLocaleString()}
          </p>

          {error.details && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expanded ? 'Hide details' : 'Show details'}
              </button>
              {expanded && (
                <div className="mt-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <pre className="text-xs text-red-800 dark:text-red-200 whitespace-pre-wrap overflow-x-auto">
                    {error.details}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ErrorsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { data: errors, isLoading, refetch } = useQuery({
    ...modelenceQuery<ErrorLog[]>('router.getErrors', { limit: 100 }),
    refetchInterval: 5000, // Check for new errors every 5 seconds
  });

  const filteredErrors = (errors || []).filter((error) =>
    error.message.toLowerCase().includes(search.toLowerCase()) ||
    error.category.toLowerCase().includes(search.toLowerCase()) ||
    error.details?.toLowerCase().includes(search.toLowerCase())
  );

  // Group errors by date
  const groupedErrors: Record<string, ErrorLog[]> = {};
  filteredErrors.forEach((error) => {
    const date = new Date(error.timestamp).toLocaleDateString();
    if (!groupedErrors[date]) {
      groupedErrors[date] = [];
    }
    groupedErrors[date].push(error);
  });

  // Category stats
  const categoryStats = (errors || []).reduce((acc, error) => {
    acc[error.category] = (acc[error.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('errorLogs')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredErrors.length} {t('errors')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`btn-secondary flex items-center gap-2 ${
              notificationsEnabled ? '' : 'text-gray-400'
            }`}
          >
            {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
          <button
            onClick={() => refetch()}
            className="btn-secondary flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            {t('refresh')}
          </button>
        </div>
      </div>

      {/* Error Stats */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
            Errors by Category
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(categoryStats).map(([category, count]) => {
              const Icon = getCategoryIcon(category);
              return (
                <div
                  key={category}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <Icon size={16} className="text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-xs bg-red-200 dark:bg-red-800 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={20} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search')}
          className="input-field ps-10"
        />
      </div>

      {/* Errors List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-secondary-700" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-secondary-700 rounded" />
                  <div className="h-5 w-full bg-gray-200 dark:bg-secondary-700 rounded mt-3" />
                  <div className="h-3 w-32 bg-gray-200 dark:bg-secondary-700 rounded mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredErrors.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('noErrors')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Everything is running smoothly
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedErrors).map(([date, dateErrors]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 sticky top-0 bg-gray-50 dark:bg-secondary-900 py-2 z-10">
                {date === new Date().toLocaleDateString() ? t('today') : date}
              </h3>
              <div className="space-y-4">
                {dateErrors.map((error, index) => (
                  <div
                    key={error._id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ErrorCard error={error} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real-time indicator */}
      <div className="fixed bottom-4 end-4 card p-3 flex items-center gap-2 shadow-lg">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Live monitoring
        </span>
      </div>
    </div>
  );
}
