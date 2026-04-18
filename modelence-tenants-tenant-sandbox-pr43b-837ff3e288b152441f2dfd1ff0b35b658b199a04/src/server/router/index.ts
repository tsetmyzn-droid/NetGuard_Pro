/**
 * ============================================================================
 * NetGuard Pro - Router Module (الخادم)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 
 * 🚫 لا تحذف أي query أو mutation من هذا الملف!
 * 🚫 لا تنقل تعريف Stores إلى هذا الملف - تبقى في db.ts
 * 🚫 لا تنسَ تسجيل الـ module في src/server/app.ts
 * 
 * Queries المتاحة (لا تحذف أياً منها):
 * - getConfig          : جلب إعدادات الراوتر
 * - getDevices         : جلب جميع الأجهزة
 * - getDeviceUsage     : استهلاك جهاز محدد
 * - getTotalUsage      : الاستهلاك الكلي
 * - getDashboardStats  : إحصائيات لوحة التحكم
 * - getWifiSettings    : إعدادات WiFi
 * - getLogs            : السجلات مع فلاتر
 * - getErrors          : الأخطاء فقط
 * - getUsageByDevice   : الاستهلاك مجمع حسب الجهاز
 * 
 * Mutations المتاحة (لا تحذف أياً منها):
 * - saveConfig         : حفظ إعدادات الراوتر
 * - upsertDevice       : إضافة/تحديث جهاز
 * - toggleBlockDevice  : حظر/فك حظر جهاز
 * - setDeviceSpeedLimit: تحديد سرعة جهاز
 * - updateDeviceName   : تعديل اسم جهاز
 * - saveWifiSettings   : حفظ إعدادات WiFi
 * - recordUsage        : تسجيل استهلاك
 * - updatePackageInfo  : تحديث بيانات الباقة
 * - addLog             : إضافة سجل
 * - clearOldLogs       : مسح سجلات قديمة
 * - simulateConnection : محاكاة اتصال (للتجربة)
 * - deleteDevice       : حذف جهاز
 * 
 * 📝 قواعد مهمة:
 * 1. كل query/mutation تتحقق من user أولاً
 * 2. ObjectId يُنشأ من user.id باستخدام: new ObjectId(user.id)
 * 3. استخدم AuthError من 'modelence' للأخطاء غير المصادقة
 * 4. استخدم z من 'zod' لـ validation
 * 5. للاستعلام عن total usage: { macAddress: { $exists: false } }
 * 
 * 🔐 للنسخة القادمة: يجب تشفير routerPassword و wifi.password
 * أضف encrypt/decrypt قبل insertOne/updateOne وبعد findOne
 * ============================================================================
 */
import z from 'zod';
import { AuthError } from 'modelence';
import { Module, ObjectId, UserInfo } from 'modelence/server';
import {
  dbRouterConfig,
  dbDevices,
  dbUsageStats,
  dbLogs,
  dbWifiSettings,
  dbPackageInfo
} from './db';

// Helper to add log
async function addLog(
  userId: ObjectId,
  level: 'info' | 'warning' | 'error' | 'success',
  category: string,
  message: string,
  details?: string
) {
  await dbLogs.insertOne({
    userId,
    level,
    category,
    message,
    details,
    timestamp: new Date(),
  });
}

// Helper to format bytes
function formatBytes(bytes: number): { value: number; unit: string } {
  if (bytes >= 1073741824) {
    return { value: Math.round((bytes / 1073741824) * 100) / 100, unit: 'GB' };
  }
  return { value: Math.round((bytes / 1048576) * 100) / 100, unit: 'MB' };
}

export default new Module('router', {
  stores: [dbRouterConfig, dbDevices, dbUsageStats, dbLogs, dbWifiSettings, dbPackageInfo],

  queries: {
    // Get router configuration
    getConfig: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const config = await dbRouterConfig.findOne({ userId: new ObjectId(user.id) });
      if (!config) return null;

      return {
        routerIp: config.routerIp,
        routerUsername: config.routerUsername,
        routerModel: config.routerModel,
        routerBrand: config.routerBrand,
        firmwareVersion: config.firmwareVersion,
        isConnected: config.isConnected,
        lastConnectedAt: config.lastConnectedAt,
      };
    },

    // Get all devices
    getDevices: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const devices = await dbDevices.fetch({ userId: new ObjectId(user.id) });
      return devices.map(d => ({
        _id: d._id.toString(),
        macAddress: d.macAddress,
        ipAddress: d.ipAddress,
        deviceName: d.deviceName || 'Unknown Device',
        deviceType: d.deviceType || 'unknown',
        isOnline: d.isOnline,
        isBlocked: d.isBlocked,
        speedLimit: d.speedLimit,
        lastSeen: d.lastSeen,
      }));
    },

    // Get device usage
    getDeviceUsage: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { macAddress, period } = z.object({
        macAddress: z.string(),
        period: z.enum(['daily', 'weekly', 'monthly']),
      }).parse(args);

      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      const stats = await dbUsageStats.fetch({
        userId: new ObjectId(user.id),
        macAddress,
        date: { $gte: startDate },
        periodType: 'daily',
      });

      const totalDownload = stats.reduce((sum, s) => sum + s.downloadBytes, 0);
      const totalUpload = stats.reduce((sum, s) => sum + s.uploadBytes, 0);

      return {
        download: formatBytes(totalDownload),
        upload: formatBytes(totalUpload),
        total: formatBytes(totalDownload + totalUpload),
        history: stats.map(s => ({
          date: s.date,
          download: s.downloadBytes,
          upload: s.uploadBytes,
        })),
      };
    },

    // Get total router usage
    getTotalUsage: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { period } = z.object({
        period: z.enum(['daily', 'weekly', 'monthly']),
      }).parse(args);

      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      // Get total usage (macAddress is undefined for router total)
      const stats = await dbUsageStats.fetch({
        userId: new ObjectId(user.id),
        macAddress: { $exists: false },
        date: { $gte: startDate },
        periodType: 'daily',
      });

      const totalDownload = stats.reduce((sum, s) => sum + s.downloadBytes, 0);
      const totalUpload = stats.reduce((sum, s) => sum + s.uploadBytes, 0);

      return {
        download: formatBytes(totalDownload),
        upload: formatBytes(totalUpload),
        total: formatBytes(totalDownload + totalUpload),
        history: stats.map(s => ({
          date: s.date,
          download: s.downloadBytes,
          upload: s.uploadBytes,
        })),
      };
    },

    // Get dashboard stats
    getDashboardStats: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const userId = new ObjectId(user.id);

      // Get device counts
      const allDevices = await dbDevices.fetch({ userId });
      const onlineDevices = allDevices.filter(d => d.isOnline).length;
      const blockedDevices = allDevices.filter(d => d.isBlocked).length;

      // Get today's usage
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayStats = await dbUsageStats.fetch({
        userId,
        macAddress: { $exists: false },
        date: { $gte: today },
        periodType: 'daily',
      });

      const todayDownload = todayStats.reduce((sum, s) => sum + s.downloadBytes, 0);
      const todayUpload = todayStats.reduce((sum, s) => sum + s.uploadBytes, 0);

      // Get weekly usage
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weeklyStats = await dbUsageStats.fetch({
        userId,
        macAddress: { $exists: false },
        date: { $gte: weekAgo },
        periodType: 'daily',
      });

      const weeklyTotal = weeklyStats.reduce((sum, s) => sum + s.totalBytes, 0);

      // Get monthly usage
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyStats = await dbUsageStats.fetch({
        userId,
        macAddress: { $exists: false },
        date: { $gte: monthStart },
        periodType: 'daily',
      });

      const monthlyTotal = monthlyStats.reduce((sum, s) => sum + s.totalBytes, 0);

      // Get router config
      const config = await dbRouterConfig.findOne({ userId });

      // Get package info
      const packageInfo = await dbPackageInfo.findOne({ userId });

      return {
        totalDevices: allDevices.length,
        onlineDevices,
        blockedDevices,
        todayUsage: formatBytes(todayDownload + todayUpload),
        todayDownload: formatBytes(todayDownload),
        todayUpload: formatBytes(todayUpload),
        weeklyUsage: formatBytes(weeklyTotal),
        monthlyUsage: formatBytes(monthlyTotal),
        isConnected: config?.isConnected || false,
        routerModel: config?.routerModel,
        routerBrand: config?.routerBrand,
        dataRemaining: packageInfo?.remainingQuotaGB,
        renewalDate: packageInfo?.renewalDate,
      };
    },

    // Get WiFi settings
    getWifiSettings: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const settings = await dbWifiSettings.findOne({ userId: new ObjectId(user.id) });
      if (!settings) return null;

      return {
        ssid: settings.ssid,
        isHidden: settings.isHidden,
        channel: settings.channel,
        securityType: settings.securityType,
        isEnabled: settings.isEnabled,
        maxDownloadMbps: settings.maxDownloadMbps,
        maxUploadMbps: settings.maxUploadMbps,
      };
    },

    // Get logs
    getLogs: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { level, category, limit } = z.object({
        level: z.enum(['info', 'warning', 'error', 'success']).optional(),
        category: z.string().optional(),
        limit: z.number().default(100),
      }).parse(args);

      const query: Record<string, unknown> = { userId: new ObjectId(user.id) };
      if (level) query.level = level;
      if (category) query.category = category;

      const logs = await dbLogs.fetch(query, { limit, sort: { timestamp: -1 } });

      return logs.map(l => ({
        _id: l._id.toString(),
        level: l.level,
        category: l.category,
        message: l.message,
        details: l.details,
        timestamp: l.timestamp,
      }));
    },

    // Get error logs only
    getErrors: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { limit } = z.object({
        limit: z.number().default(50),
      }).parse(args);

      const logs = await dbLogs.fetch(
        { userId: new ObjectId(user.id), level: 'error' },
        { limit, sort: { timestamp: -1 } }
      );

      return logs.map(l => ({
        _id: l._id.toString(),
        category: l.category,
        message: l.message,
        details: l.details,
        timestamp: l.timestamp,
      }));
    },

    // Get usage by device (for detailed breakdown)
    getUsageByDevice: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { period } = z.object({
        period: z.enum(['daily', 'weekly', 'monthly']),
      }).parse(args);

      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      const userId = new ObjectId(user.id);

      // Get all devices
      const devices = await dbDevices.fetch({ userId });

      // Get usage for each device
      const deviceUsage = await Promise.all(
        devices.map(async (device) => {
          const stats = await dbUsageStats.fetch({
            userId,
            macAddress: device.macAddress,
            date: { $gte: startDate },
            periodType: 'daily',
          });

          const totalBytes = stats.reduce((sum, s) => sum + s.totalBytes, 0);

          return {
            _id: device._id.toString(),
            deviceName: device.deviceName || 'Unknown Device',
            macAddress: device.macAddress,
            isOnline: device.isOnline,
            usage: formatBytes(totalBytes),
            usageBytes: totalBytes,
          };
        })
      );

      // Sort by usage descending
      return deviceUsage.sort((a, b) => b.usageBytes - a.usageBytes);
    },
  },

  mutations: {
    // Save router configuration
    saveConfig: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const data = z.object({
        routerIp: z.string(),
        routerUsername: z.string(),
        routerPassword: z.string(),
        routerModel: z.string().optional(),
        routerBrand: z.string().optional(),
      }).parse(args);

      const userId = new ObjectId(user.id);
      const now = new Date();

      const existing = await dbRouterConfig.findOne({ userId });

      if (existing) {
        await dbRouterConfig.updateOne(
          { userId },
          {
            $set: {
              ...data,
              isConnected: false, // Will be set to true after successful connection
              updatedAt: now,
            }
          }
        );
      } else {
        await dbRouterConfig.insertOne({
          userId,
          ...data,
          isConnected: false,
          createdAt: now,
          updatedAt: now,
        });
      }

      await addLog(userId, 'info', 'settings', 'Router configuration saved');

      return { success: true };
    },

    // Add or update a device
    upsertDevice: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const data = z.object({
        macAddress: z.string(),
        ipAddress: z.string().optional(),
        deviceName: z.string().optional(),
        deviceType: z.string().optional(),
        isOnline: z.boolean().default(true),
      }).parse(args);

      const userId = new ObjectId(user.id);
      const now = new Date();

      const existing = await dbDevices.findOne({ userId, macAddress: data.macAddress });

      if (existing) {
        await dbDevices.updateOne(
          { userId, macAddress: data.macAddress },
          {
            $set: {
              ...data,
              lastSeen: now,
              updatedAt: now,
            }
          }
        );
      } else {
        await dbDevices.insertOne({
          userId,
          ...data,
          isBlocked: false,
          lastSeen: now,
          createdAt: now,
          updatedAt: now,
        });

        await addLog(userId, 'info', 'device', `New device detected: ${data.deviceName || data.macAddress}`);
      }

      return { success: true };
    },

    // Block/unblock device
    toggleBlockDevice: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { macAddress, block } = z.object({
        macAddress: z.string(),
        block: z.boolean(),
      }).parse(args);

      const userId = new ObjectId(user.id);

      const result = await dbDevices.updateOne(
        { userId, macAddress },
        { $set: { isBlocked: block, updatedAt: new Date() } }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Device not found');
      }

      await addLog(
        userId,
        block ? 'warning' : 'success',
        'device',
        block ? `Device blocked: ${macAddress}` : `Device unblocked: ${macAddress}`
      );

      return { success: true };
    },

    // Set device speed limit
    setDeviceSpeedLimit: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { macAddress, speedLimit } = z.object({
        macAddress: z.string(),
        speedLimit: z.number().nullable(),
      }).parse(args);

      const userId = new ObjectId(user.id);

      const result = await dbDevices.updateOne(
        { userId, macAddress },
        { $set: { speedLimit: speedLimit || undefined, updatedAt: new Date() } }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Device not found');
      }

      await addLog(
        userId,
        'info',
        'device',
        speedLimit
          ? `Speed limit set to ${speedLimit} Mbps for ${macAddress}`
          : `Speed limit removed for ${macAddress}`
      );

      return { success: true };
    },

    // Update device name
    updateDeviceName: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { macAddress, deviceName } = z.object({
        macAddress: z.string(),
        deviceName: z.string(),
      }).parse(args);

      const userId = new ObjectId(user.id);

      const result = await dbDevices.updateOne(
        { userId, macAddress },
        { $set: { deviceName, updatedAt: new Date() } }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Device not found');
      }

      return { success: true };
    },

    // Save WiFi settings
    saveWifiSettings: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const data = z.object({
        ssid: z.string().optional(),
        password: z.string().optional(),
        isHidden: z.boolean().optional(),
        channel: z.number().optional(),
        securityType: z.string().optional(),
        isEnabled: z.boolean().optional(),
        maxDownloadMbps: z.number().optional(),
        maxUploadMbps: z.number().optional(),
      }).parse(args);

      const userId = new ObjectId(user.id);
      const now = new Date();

      const existing = await dbWifiSettings.findOne({ userId });

      if (existing) {
        await dbWifiSettings.updateOne(
          { userId },
          { $set: { ...data, updatedAt: now } }
        );
      } else {
        await dbWifiSettings.insertOne({
          userId,
          isHidden: data.isHidden ?? false,
          isEnabled: data.isEnabled ?? true,
          ...data,
          updatedAt: now,
        });
      }

      await addLog(userId, 'success', 'settings', 'WiFi settings updated');

      return { success: true };
    },

    // Record usage stats
    recordUsage: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const data = z.object({
        macAddress: z.string().optional(), // undefined for total router usage
        downloadBytes: z.number(),
        uploadBytes: z.number(),
      }).parse(args);

      const userId = new ObjectId(user.id);
      const now = new Date();
      const dateKey = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Check if we have a record for today
      const query: Record<string, unknown> = {
        userId,
        date: dateKey,
        periodType: 'daily',
      };
      if (data.macAddress) {
        query.macAddress = data.macAddress;
      } else {
        query.macAddress = { $exists: false };
      }

      const existing = await dbUsageStats.findOne(query);

      if (existing) {
        await dbUsageStats.updateOne(
          { _id: existing._id },
          {
            $set: {
              downloadBytes: data.downloadBytes,
              uploadBytes: data.uploadBytes,
              totalBytes: data.downloadBytes + data.uploadBytes,
            }
          }
        );
      } else {
        await dbUsageStats.insertOne({
          userId,
          macAddress: data.macAddress,
          date: dateKey,
          downloadBytes: data.downloadBytes,
          uploadBytes: data.uploadBytes,
          totalBytes: data.downloadBytes + data.uploadBytes,
          periodType: 'daily',
          createdAt: now,
        });
      }

      return { success: true };
    },

    // Update package info
    updatePackageInfo: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const data = z.object({
        totalQuotaGB: z.number().optional(),
        usedQuotaGB: z.number().optional(),
        remainingQuotaGB: z.number().optional(),
        renewalDate: z.string().optional(),
        packageName: z.string().optional(),
      }).parse(args);

      const userId = new ObjectId(user.id);
      const now = new Date();

      const updateData = {
        ...data,
        renewalDate: data.renewalDate ? new Date(data.renewalDate) : undefined,
        lastUpdated: now,
      };

      const existing = await dbPackageInfo.findOne({ userId });

      if (existing) {
        await dbPackageInfo.updateOne(
          { userId },
          { $set: updateData }
        );
      } else {
        await dbPackageInfo.insertOne({
          userId,
          ...updateData,
        });
      }

      return { success: true };
    },

    // Log an action
    addLog: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const data = z.object({
        level: z.enum(['info', 'warning', 'error', 'success']),
        category: z.string(),
        message: z.string(),
        details: z.string().optional(),
      }).parse(args);

      await addLog(new ObjectId(user.id), data.level, data.category, data.message, data.details);

      return { success: true };
    },

    // Clear old logs
    clearOldLogs: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { daysOld } = z.object({
        daysOld: z.number().default(30),
      }).parse(args);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await dbLogs.deleteMany({
        userId: new ObjectId(user.id),
        timestamp: { $lt: cutoffDate },
      });

      await addLog(
        new ObjectId(user.id),
        'info',
        'system',
        `Cleared ${result.deletedCount} old logs`
      );

      return { deleted: result.deletedCount };
    },

    // Simulate router connection (placeholder for actual router integration)
    simulateConnection: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { connected } = z.object({
        connected: z.boolean(),
      }).parse(args);

      const userId = new ObjectId(user.id);

      await dbRouterConfig.updateOne(
        { userId },
        {
          $set: {
            isConnected: connected,
            lastConnectedAt: connected ? new Date() : undefined,
            updatedAt: new Date(),
          }
        }
      );

      await addLog(
        userId,
        connected ? 'success' : 'warning',
        'connection',
        connected ? 'Connected to router' : 'Disconnected from router'
      );

      return { success: true };
    },

    // Delete a device
    deleteDevice: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');

      const { macAddress } = z.object({
        macAddress: z.string(),
      }).parse(args);

      const userId = new ObjectId(user.id);

      const result = await dbDevices.deleteOne({ userId, macAddress });

      if (result.deletedCount === 0) {
        throw new Error('Device not found');
      }

      await addLog(userId, 'info', 'device', `Device removed: ${macAddress}`);

      return { success: true };
    },
  },
});
