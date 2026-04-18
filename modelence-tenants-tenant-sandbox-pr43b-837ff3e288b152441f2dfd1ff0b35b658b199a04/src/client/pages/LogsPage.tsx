/**
 * ============================================================================
 * NetGuard Pro - صفحة السجلات (Logs)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تحذف فلاتر المستوى (all, info, warning, error, success).
 * 🚫 لا تحذف فلتر الفئة.
 * 🚫 لا تحذف البحث.
 * 🚫 لا تحذف زر Export إلى ملف .txt.
 * 🚫 لا تحذف زر مسح السجلات القديمة (>30 يوم).
 * ============================================================================
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation, createQueryKey } from '@modelence/react-query';
import { useI18n } from '@/client/lib/i18n';
import toast from 'react-hot-toast';
import {
  FileText,
  RefreshCw,
  Search,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type Log = {
  _id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  details?: string;
  timestamp: string;
};

function LogIcon({ level }: { level: string }) {
  switch (level) {
    case 'error':
      return <AlertCircle className="text-red-500" size={18} />;
    case 'warning':
      return <AlertTriangle className="text-yellow-500" size={18} />;
    case 'success':
      return <CheckCircle className="text-green-500" size={18} />;
    default:
      return <Info className="text-blue-500" size={18} />;
  }
}

function LogItem({ log }: { log: Log }) {
  const [expanded, setExpanded] = useState(false);

  const levelColors = {
    info: 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10',
    warning: 'border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-900/10',
    error: 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10',
    success: 'border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10',
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${levelColors[log.level]}`}>
      <div className="flex items-start gap-3">
        <LogIcon level={log.level} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-info">{log.category}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(log.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-gray-900 dark:text-white">{log.message}</p>
          {log.details && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expanded ? 'Hide details' : 'Show details'}
              </button>
              {expanded && (
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-secondary-800 rounded-lg text-xs overflow-x-auto">
                  {log.details}
                </pre>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LogsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: logs, isLoading, refetch } = useQuery({
    ...modelenceQuery<Log[]>('router.getLogs', { limit: 200 }),
    refetchInterval: 10000,
  });

  const { mutate: clearLogs, isPending: clearing } = useMutation({
    ...modelenceMutation('router.clearOldLogs'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('router.getLogs', { limit: 200 }) });
      const result = data as { deleted: number };
      toast.success(`Cleared ${result.deleted} old logs`);
    },
  });

  const filteredLogs = (logs || []).filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.category.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase());

    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  const categories = [...new Set((logs || []).map((l) => l.category))];

  const logCounts = {
    all: logs?.length || 0,
    info: logs?.filter((l) => l.level === 'info').length || 0,
    warning: logs?.filter((l) => l.level === 'warning').length || 0,
    error: logs?.filter((l) => l.level === 'error').length || 0,
    success: logs?.filter((l) => l.level === 'success').length || 0,
  };

  const exportLogs = () => {
    const content = filteredLogs
      .map((log) => `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}${log.details ? '\n' + log.details : ''}`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `router-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('systemLogs')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredLogs.length} {t('logs')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportLogs}
            className="btn-secondary flex items-center gap-2"
            disabled={filteredLogs.length === 0}
          >
            <Download size={18} />
            {t('export')}
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

      {/* Level Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['all', 'info', 'warning', 'error', 'success'] as const).map((level) => (
          <button
            key={level}
            onClick={() => setLevelFilter(level)}
            className={`card p-3 text-center transition-all ${
              levelFilter === level ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {level !== 'all' && <LogIcon level={level} />}
              <span className="font-medium">{logCounts[level]}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
              {level === 'all' ? t('all') : t(level)}
            </p>
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="input-field ps-10"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="all">{t('all')} Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={() => clearLogs({ daysOld: 30 })}
          disabled={clearing}
          className="btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          {clearing ? <RefreshCw size={18} className="animate-spin" /> : <Trash2 size={18} />}
          {t('clear')}
        </button>
      </div>

      {/* Logs List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-secondary-700" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-secondary-700 rounded" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-secondary-700 rounded mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">{t('noLogs')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log, index) => (
            <div key={log._id} className="animate-slide-up" style={{ animationDelay: `${index * 20}ms` }}>
              <LogItem log={log} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
