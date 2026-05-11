import 'dart:async';
import 'package:isar/isar.dart';
import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/core/plugins/model/agent_traffic_stats.dart';
import 'package:netguard_pro/core/engine/database_manager.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';

import 'package:netguard_pro/core/diagnostics/notification_manager.dart';

class AgentStatsRepository {
  final DatabaseManager _dbManager = DatabaseManager();
  final NetGuardLogger _logger = NetGuardLogger();
  final NotificationManager _notifications = NotificationManager();

  /// عتبة التنبيه (مثلاً 1 جيجابايت)
  static const int _alertThresholdBytes = 1024 * 1024 * 1024;

  /// مزامنة البيانات من الوكيل وحفظها في القاعدة المحلية
  Future<void> syncFromAgent(RouterPlugin router) async {
    if (!router.hasAgentSupport || router.agent == null) return;

    try {
      final data = await router.agent!.getTelemetryData();
      if (data.isEmpty || !data.containsKey('traffic_data')) return;

      final trafficList = data['traffic_data'] as List<dynamic>;
      final timestamp = data['timestamp'] as int;
      final db = await _dbManager.db;

      final List<AgentTrafficStats> statsToSave = [];

      for (var entry in trafficList) {
        final map = entry as Map<String, dynamic>;
        final dl = (map['rx'] ?? 0) as int;
        final host = map['host'] ?? 'unknown';

        // Check for high usage
        if (dl > _alertThresholdBytes) {
           _notifications.showNotification(
             id: host.hashCode,
             title: "HIGH USAGE ALERT",
             body: "Device $host has exceeded 1GB of download traffic.",
           );
        }

        statsToSave.add(AgentTrafficStats(
          routerId: router.ip,
          macAddress: map['mac'] ?? 'unknown',
          hostname: host,
          timestamp: timestamp,
          bytesDownloaded: dl,
          bytesUploaded: (map['tx'] ?? 0) as int,
        ));
      }

      await db.writeTxn(() async {
        await db.agentTrafficStats.putAll(statsToSave);
      });

      _logger.info("Synced ${statsToSave.length} records from agent at ${router.ip}");
    } catch (e) {
      _logger.error("Sync failed: $e");
    }
  }

  /// جلب استهلاك جهاز محدد خلال فترة زمنية
  Future<List<AgentTrafficStats>> getHistory(String mac, {int? since}) async {
    final db = await _dbManager.db;
    var query = db.agentTrafficStats.filter().macAddressEqualTo(mac);
    
    if (since != null) {
      query = query.timestampGreaterThan(since);
    }

    return await query.sortByTimestamp().findAll();
  }
}
