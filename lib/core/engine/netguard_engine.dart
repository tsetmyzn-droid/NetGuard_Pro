import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/OpenWrt/Model/InterfaceStatus.dart';
import 'package:netguard_pro/OpenWrt/Model/ConnectedDevice.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';
import 'package:netguard_pro/core/engine/persistence_manager.dart';

class NetGuardSystemState {
  final bool isActive;
  final List<ConnectedDevice> devices;
  final Map<String, double> downloadSpeeds; 
  final Map<String, double> uploadSpeeds;
  final Map<String, int> totalDownloaded; // New: Cumulative data
  final Map<String, int> totalUploaded;
  final String? error;

  NetGuardSystemState({
    this.isActive = false,
    this.devices = const [],
    this.downloadSpeeds = const {},
    this.uploadSpeeds = const {},
    this.totalDownloaded = const {},
    this.totalUploaded = const {},
    this.error,
  });

  NetGuardSystemState copyWith({
    bool? isActive,
    List<ConnectedDevice>? devices,
    Map<String, double>? downloadSpeeds,
    Map<String, double>? uploadSpeeds,
    Map<String, int>? totalDownloaded,
    Map<String, int>? totalUploaded,
    String? error,
  }) {
    return NetGuardSystemState(
      isActive: isActive ?? this.isActive,
      devices: devices ?? this.devices,
      downloadSpeeds: downloadSpeeds ?? this.downloadSpeeds,
      uploadSpeeds: uploadSpeeds ?? this.uploadSpeeds,
      totalDownloaded: totalDownloaded ?? this.totalDownloaded,
      totalUploaded: totalUploaded ?? this.totalUploaded,
      error: error,
    );
  }

  Map<String, dynamic> toJson() => {
    'totalDownloaded': totalDownloaded,
    'totalUploaded': totalUploaded,
  };

  static NetGuardSystemState fromJson(Map<String, dynamic> json) {
    return NetGuardSystemState(
      totalDownloaded: Map<String, int>.from(json['totalDownloaded'] ?? {}),
      totalUploaded: Map<String, int>.from(json['totalUploaded'] ?? {}),
    );
  }
}

final netGuardProvider = StateNotifierProvider<NetGuardEngine, NetGuardSystemState>((ref) {
  return NetGuardEngine();
});

class NetGuardEngine extends StateNotifier<NetGuardSystemState> {
  Timer? _pollingTimer;
  RouterPlugin? _currentPlugin;
  final PersistenceManager _persistence = PersistenceManager();
  final NetGuardLogger _logger = NetGuardLogger();
  
  Map<String, int> _prevRx = {};
  Map<String, int> _prevTx = {};
  DateTime? _lastPollTime;

  // Smoothing & Calibration
  static const double _smoothingFactor = 0.7; // Exponential Moving Average Alpha
  static const double _maxSpikeThreshold = 5.0; // 500% jump rejection

  NetGuardEngine() : super(NetGuardSystemState()) {
    _loadStoredState();
  }

  Future<void> _loadStoredState() async {
    final stored = await _persistence.loadState();
    if (stored != null) {
      state = NetGuardSystemState.fromJson(stored);
      _logger.info("Engine restored cumulative stats from offline buffer.");
    }
  }

  void initialize(RouterPlugin plugin) {
    _currentPlugin = plugin;
    state = state.copyWith(isActive: true);
    _logger.info("NetGuardEngine: Initializing monitoring session for ${plugin.modelName}...");
    _startMonitoring();
  }

  void _startMonitoring() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      _pollData();
    });
  }

  Future<void> _pollData() async {
    if (_currentPlugin == null) return;

    try {
      final devices = await _currentPlugin!.getConnectedDevices();
      final stats = await _currentPlugin!.getTrafficStats();
      
      final now = DateTime.now();
      double timeDiff = 1.0;
      if (_lastPollTime != null) {
        timeDiff = now.difference(_lastPollTime!).inMilliseconds / 1000.0;
        if (timeDiff <= 0) timeDiff = 0.1; // Safety
      }

      Map<String, double> downSpeeds = Map.from(state.downloadSpeeds);
      Map<String, double> upSpeeds = Map.from(state.uploadSpeeds);
      Map<String, int> totalDown = Map.from(state.totalDownloaded);
      Map<String, int> totalUp = Map.from(state.totalUploaded);

      for (var interface in stats) {
        final name = interface.name;
        if (_prevRx.containsKey(name)) {
          int rxDelta = interface.rxBytes - _prevRx[name]!;
          int txDelta = interface.txBytes - _prevTx[name]!;
          
          // Handle Router Counter Reset
          if (rxDelta < 0) {
             _logger.warn("Interface $name counter reset detected (RX). Calibration updated.");
             rxDelta = 0;
          }
          if (txDelta < 0) {
             _logger.warn("Interface $name counter reset detected (TX). Calibration updated.");
             txDelta = 0;
          }

          double rawDown = rxDelta / timeDiff;
          double rawUp = txDelta / timeDiff;

          // Spike Rejection
          if (downSpeeds.containsKey(name)) {
            if (rawDown > downSpeeds[name]! * _maxSpikeThreshold && rawDown > 1024 * 1024) {
               _logger.warn("Spike detected on $name (Down): ${rawDown.toStringAsFixed(2)} B/s. Rejecting.");
               rawDown = downSpeeds[name]!;
            }
          }

          // EMA Smoothing
          downSpeeds[name] = _smoothingFactor * rawDown + (1 - _smoothingFactor) * (downSpeeds[name] ?? 0);
          upSpeeds[name] = _smoothingFactor * rawUp + (1 - _smoothingFactor) * (upSpeeds[name] ?? 0);

          // Update Cumulative Totals
          totalDown[name] = (totalDown[name] ?? 0) + rxDelta;
          totalUp[name] = (totalUp[name] ?? 0) + txDelta;
        }
        
        _prevRx[name] = interface.rxBytes;
        _prevTx[name] = interface.txBytes;
      }

      _lastPollTime = now;
      state = state.copyWith(
        devices: devices,
        downloadSpeeds: downSpeeds,
        uploadSpeeds: upSpeeds,
        totalDownloaded: totalDown,
        totalUploaded: totalUp,
        error: null,
      );

      // Persist state periodically (every poll or every few polls)
      _persistence.saveState(state.toJson());

    } catch (e) {
      _logger.error("Data Polling Error: $e");
      state = state.copyWith(error: "Real-time sync interrupted");
    }
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _persistence.saveState(state.toJson());
    super.dispose();
  }
}
