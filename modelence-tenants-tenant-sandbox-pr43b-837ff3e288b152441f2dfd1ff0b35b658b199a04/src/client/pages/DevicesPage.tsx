/**
 * ============================================================================
 * NetGuard Pro - صفحة الأجهزة (Devices)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تحذف grid الأجهزة مع الـ icons حسب النوع.
 * 🚫 لا تحذف قائمة الإجراءات (حظر، فك حظر، تحديد سرعة، تعديل اسم، حذف).
 * 🚫 لا تحذف البحث والفلترة.
 * 🚫 لا تحذف modal تحديد السرعة.
 * 
 * أنواع الأجهزة المدعومة (deviceType):
 * - phone, laptop, tablet, tv, desktop, iot, other
 * ============================================================================
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation, createQueryKey } from '@modelence/react-query';
import { useI18n } from '@/client/lib/i18n';
import toast from 'react-hot-toast';
import {
  Laptop2,
  Smartphone,
  Tv,
  Tablet,
  Monitor,
  Gamepad2,
  WifiOff,
  Ban,
  Shield,
  Search,
  RefreshCw,
  MoreVertical,
  Edit3,
  Trash2,
  Gauge,
  X,
  Check,
} from 'lucide-react';

type Device = {
  _id: string;
  macAddress: string;
  ipAddress?: string;
  deviceName: string;
  deviceType: string;
  isOnline: boolean;
  isBlocked: boolean;
  speedLimit?: number;
  lastSeen: string;
};

function getDeviceIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'phone':
    case 'smartphone':
      return Smartphone;
    case 'tablet':
      return Tablet;
    case 'tv':
    case 'smart tv':
      return Tv;
    case 'gaming':
    case 'console':
      return Gamepad2;
    case 'desktop':
    case 'pc':
      return Monitor;
    default:
      return Laptop2;
  }
}

function DeviceCard({
  device,
  onBlock,
  onSetSpeedLimit,
  onRename,
  onDelete,
}: {
  device: Device;
  onBlock: (mac: string, block: boolean) => void;
  onSetSpeedLimit: (mac: string, limit: number | null) => void;
  onRename: (mac: string, name: string) => void;
  onDelete: (mac: string) => void;
}) {
  const { t, isRTL } = useI18n();
  const [showMenu, setShowMenu] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(device.deviceName);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [speedLimit, setSpeedLimit] = useState(device.speedLimit?.toString() || '');

  const Icon = getDeviceIcon(device.deviceType);

  const handleSaveName = () => {
    if (newName.trim() && newName !== device.deviceName) {
      onRename(device.macAddress, newName.trim());
    }
    setEditingName(false);
  };

  const handleSaveSpeedLimit = () => {
    const limit = speedLimit ? parseInt(speedLimit) : null;
    onSetSpeedLimit(device.macAddress, limit);
    setShowSpeedModal(false);
  };

  return (
    <div className={`card card-hover p-4 transition-all duration-300 ${device.isBlocked ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Device Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          device.isOnline && !device.isBlocked
            ? 'bg-green-100 dark:bg-green-900/30'
            : device.isBlocked
            ? 'bg-red-100 dark:bg-red-900/30'
            : 'bg-gray-100 dark:bg-secondary-700'
        }`}>
          <Icon
            size={24}
            className={
              device.isOnline && !device.isBlocked
                ? 'text-green-600 dark:text-green-400'
                : device.isBlocked
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
            }
          />
        </div>

        {/* Device Info */}
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input-field py-1 px-2 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
              />
              <button onClick={handleSaveName} className="p-1 text-green-600 hover:bg-green-100 rounded">
                <Check size={16} />
              </button>
              <button onClick={() => setEditingName(false)} className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                <X size={16} />
              </button>
            </div>
          ) : (
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {device.deviceName}
            </h3>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
            {device.ipAddress || device.macAddress}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Status Badge */}
            <span className={`badge ${
              device.isBlocked
                ? 'badge-danger'
                : device.isOnline
                ? 'badge-success'
                : 'badge-warning'
            }`}>
              {device.isBlocked ? t('blocked') : device.isOnline ? t('online') : t('offline')}
            </span>

            {/* Speed Limit Badge */}
            {device.speedLimit && (
              <span className="badge badge-info">
                <Gauge size={12} className={`${isRTL ? 'ml-1' : 'mr-1'}`} />
                {device.speedLimit} {t('mbps')}
              </span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <MoreVertical size={20} className="text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-1 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-gray-200 dark:border-secondary-700 z-20 animate-slide-down`}>
                <button
                  onClick={() => {
                    setEditingName(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
                >
                  <Edit3 size={18} />
                  <span>{t('edit')}</span>
                </button>

                <button
                  onClick={() => {
                    setShowSpeedModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors"
                >
                  <Gauge size={18} />
                  <span>{t('limitSpeed')}</span>
                </button>

                <button
                  onClick={() => {
                    onBlock(device.macAddress, !device.isBlocked);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors ${
                    device.isBlocked ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {device.isBlocked ? <Shield size={18} /> : <Ban size={18} />}
                  <span>{device.isBlocked ? t('unblockDevice') : t('blockDevice')}</span>
                </button>

                <button
                  onClick={() => {
                    onDelete(device.macAddress);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors text-red-600"
                >
                  <Trash2 size={18} />
                  <span>{t('delete')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Speed Limit Modal */}
      {showSpeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSpeedModal(false)}>
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 w-full max-w-sm mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t('limitSpeed')}</h3>
            <input
              type="number"
              value={speedLimit}
              onChange={(e) => setSpeedLimit(e.target.value)}
              placeholder={t('mbps')}
              className="input-field mb-4"
              min="1"
              max="1000"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('maxDownload')}: {speedLimit || '∞'} {t('mbps')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowSpeedModal(false)} className="btn-secondary flex-1">
                {t('cancel')}
              </button>
              <button onClick={handleSaveSpeedLimit} className="btn-primary flex-1">
                {t('saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DevicesPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'blocked'>('all');

  const { data: devices, isLoading, refetch } = useQuery({
    ...modelenceQuery<Device[]>('router.getDevices', {}),
    refetchInterval: 10000,
  });

  const { mutate: toggleBlock } = useMutation({
    ...modelenceMutation('router.toggleBlockDevice'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('router.getDevices', {}) });
      toast.success(t('settingsSaved'));
    },
    onError: () => {
      toast.error(t('error'));
    },
  });

  const { mutate: setSpeedLimit } = useMutation({
    ...modelenceMutation('router.setDeviceSpeedLimit'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('router.getDevices', {}) });
      toast.success(t('settingsSaved'));
    },
  });

  const { mutate: updateName } = useMutation({
    ...modelenceMutation('router.updateDeviceName'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('router.getDevices', {}) });
    },
  });

  const { mutate: deleteDevice } = useMutation({
    ...modelenceMutation('router.deleteDevice'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('router.getDevices', {}) });
      toast.success(t('settingsSaved'));
    },
  });

  const filteredDevices = (devices || []).filter((device) => {
    const matchesSearch =
      device.deviceName.toLowerCase().includes(search.toLowerCase()) ||
      device.macAddress.toLowerCase().includes(search.toLowerCase()) ||
      device.ipAddress?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'online' && device.isOnline && !device.isBlocked) ||
      (filter === 'blocked' && device.isBlocked);

    return matchesSearch && matchesFilter;
  });

  const onlineCount = (devices || []).filter((d) => d.isOnline && !d.isBlocked).length;
  const blockedCount = (devices || []).filter((d) => d.isBlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('devices')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {onlineCount} {t('online')} • {blockedCount} {t('blocked')}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-secondary flex items-center gap-2 self-start"
          disabled={isLoading}
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          {t('refresh')}
        </button>
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

        <div className="flex gap-2">
          {(['all', 'online', 'blocked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-secondary-600'
              }`}
            >
              {f === 'all' ? t('all') : f === 'online' ? t('online') : t('blocked')}
            </button>
          ))}
        </div>
      </div>

      {/* Devices Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-secondary-700" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-secondary-700 rounded" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-secondary-700 rounded mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="card p-12 text-center">
          <WifiOff className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">{t('noDevices')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDevices.map((device, index) => (
            <div key={device._id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-up">
              <DeviceCard
                device={device}
                onBlock={(mac, block) => toggleBlock({ macAddress: mac, block })}
                onSetSpeedLimit={(mac, limit) => setSpeedLimit({ macAddress: mac, speedLimit: limit })}
                onRename={(mac, name) => updateName({ macAddress: mac, deviceName: name })}
                onDelete={(mac) => deleteDevice({ macAddress: mac })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
