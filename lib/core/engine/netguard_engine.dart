import 'dart:async';
import 'dart:collection';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/core/plugins/model/interface_status.dart';
import 'package:netguard_pro/core/plugins/model/connected_device.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';
import 'package:netguard_pro/core/engine/persistence_manager.dart';
import 'package:netguard_pro/core/diagnostics/performance_monitor.dart';
import 'package:netguard_pro/core/profiles/profile_manager.dart';
import 'package:netguard_pro/core/profiles/router_profile.dart';
import 'package:netguard_pro/core/plugins/router_factory.dart';
import 'package:netguard_pro/features/dashboard/repositories/agent_stats_repository.dart';

class NetGuardSystemState {
  final bool isActive;
  final List<ConnectedDevice> devices;
  final Map<String, double> downloadSpeeds; 
  final Map<String, double> uploadSpeeds;
  final Map<String, int> totalDownloaded; 
  final Map<String, int> totalUploaded;
  final List<double> dlHistory; // Phase 8: Speed history
  final List<double> ulHistory; // Phase 8: Speed history
  final String selectedInterface; // Phase 8: Interface selection
  final bool hasAgentSupport;
  final String routerIp;
  final String? error;

  NetGuardSystemState({
    this.isActive = false,
    this.routerIp = "",
    this.devices = const [],
    this.downloadSpeeds = const {},
    this.uploadSpeeds = const {},
    this.totalDownloaded = const {},
    this.totalUploaded = const {},
    this.dlHistory = const [],
    this.ulHistory = const [],
    this.selectedInterface = "all",
    this.hasAgentSupport = false,
    this.error,
  });

  NetGuardSystemState copyWith({
    bool? isActive,
    List<ConnectedDevice>? devices,
    Map<String, double>? downloadSpeeds,
    Map<String, double>? uploadSpeeds,
    Map<String, int>? totalDownloaded,
    Map<String, int>? totalUploaded,
    List<double>? dlHistory,
    List<double>? ulHistory,
    String? selectedInterface,
    bool? hasAgentSupport,
    String? routerIp,
    String? error,
  }) {
    return NetGuardSystemState(
      isActive: isActive ?? this.isActive,
      routerIp: routerIp ?? this.routerIp,
      devices: devices ?? this.devices,
      downloadSpeeds: downloadSpeeds ?? this.downloadSpeeds,
      uploadSpeeds: uploadSpeeds ?? this.uploadSpeeds,
      totalDownloaded: totalDownloaded ?? this.totalDownloaded,
      totalUploaded: totalUploaded ?? this.totalUploaded,
      dlHistory: dlHistory ?? this.dlHistory,
      ulHistory: ulHistory ?? this.ulHistory,
      selectedInterface: selectedInterface ?? this.selectedInterface,
      hasAgentSupport: hasAgentSupport ?? this.hasAgentSupport,
      error: error,
    );
  }

  Map<String, dynamic> toJson() => {
    'totalDownloaded': totalDownloaded,
    'totalUploaded': totalUploaded,
    'selectedInterface': selectedInterface,
  };

  static NetGuardSystemState fromJson(Map<String, dynamic> json) {
    return NetGuardSystemState(
      totalDownloaded: Map<String, int>.from(json['totalDownloaded'] ?? {}),
      totalUploaded: Map<String, int>.from(json['totalUploaded'] ?? {}),
      selectedInterface: json['selectedInterface'] ?? "all",
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
  final PerformanceMonitor _perfMonitor = PerformanceMonitor();
  final AgentStatsRepository _agentRepo = AgentStatsRepository();
  
  Map<String, int> _prevRx = {};
  Map<String, int> _prevTx = {};
  DateTime? _lastPollTime;

  // Phase 11: Performance & Safety
  final Queue<double> _dlQueue = Queue();
  final Queue<double> _ulQueue = Queue();
  static const int _maxHistory = 60;
  static const double _maxPhysicalLimit = 125 * 1024 * 1024; // 125MB/s (1Gbps)

  // Phase 11: Device Caching
  DateTime? _lastDevicesUpdate;
  static const Duration _deviceCacheTTL = Duration(seconds: 30);
  List<ConnectedDevice> _cachedDevices = [];

  // Smoothing & Calibration
  static const double _smoothingFactor = 0.7; 
  static const double _maxSpikeThreshold = 5.0; 

  NetGuardEngine() : super(NetGuardSystemState()) {
    _loadStoredState().then((_) => _checkActiveProfile());
  }

  Future<void> _checkActiveProfile() async {
    final activeId = await ProfileManager().getActiveProfileId();
    if (activeId != null) {
      final profiles = await ProfileManager().getProfiles();
      final p = profiles.where((element) => element.id == activeId).firstOrNull;
      if (p != null) {
        final password = await ProfileManager().getProfilePassword(p.id);
        if (password != null) {
          _logger.info("Engine: Found active profile ${p.name}, auto-connecting...", category: LogCategory.engine);
          final plugin = await RouterFactory.create(p.ip, p.username, password);
          initialize(plugin);
        }
      }
    }
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
    _prevRx.clear();
    _prevTx.clear();
    _lastPollTime = null;
    _dlQueue.clear();
    _ulQueue.clear();
    state = state.copyWith(
      isActive: true,
      hasAgentSupport: plugin.hasAgentSupport,
      routerIp: plugin.ip,
    );
    _logger.info("NetGuardEngine: Initializing monitoring session for ${plugin.modelName}...", category: LogCategory.engine);
    _startMonitoring();
  }

  void setSelectedInterface(String interface) {
    _logger.info("Engine: Filter interface changed to $interface", category: LogCategory.engine);
    _prevRx.clear();
    _prevTx.clear();
    state = state.copyWith(selectedInterface: interface);
  }

  void _startMonitoring() {
    _pollingTimer?.cancel();
    _adaptiveLoop();
  }

  Future<void> _adaptiveLoop() async {
    if (!state.isActive) return;

    await _pollData();

    // Adjust interval based on performance
    final snapshot = _perfMonitor.getSnapshot();
    int intervalSeconds = 1;

    if (snapshot.errorsPerMinute > 5) {
      intervalSeconds = 5; // Severe issues
    } else if (snapshot.errorsPerMinute > 0 || snapshot.avgPollMs > 1200) {
      intervalSeconds = 2; // Warning level
    } else {
      intervalSeconds = 1; // Healthy - High Performance
    }

    _pollingTimer = Timer(Duration(seconds: intervalSeconds), () {
      _adaptiveLoop();
    });
  }

  bool _isPollRetry = false;

  Future<void> _pollData() async {
    if (_currentPlugin == null) return;
    final sw = Stopwatch()..start();

    try {
      final now = DateTime.now();

      // Phase 11: Optimized Device Caching
      List<ConnectedDevice> devices = _cachedDevices;
      if (_lastDevicesUpdate == null || now.difference(_lastDevicesUpdate!) > _deviceCacheTTL) {
        devices = await _currentPlugin!.getConnectedDevices();
        _cachedDevices = devices;
        _lastDevicesUpdate = now;
      }

      final stats = await _currentPlugin!.getTrafficStats();
      
      _isPollRetry = false; // Success, reset retry flag
      double timeDiff = 1.0;
      if (_lastPollTime != null) {
        timeDiff = now.difference(_lastPollTime!).inMilliseconds / 1000.0;
        timeDiff = timeDiff > 0 ? timeDiff : 0.1; 
        timeDiff = timeDiff > 2.0 ? 2.0 : timeDiff; // Fix: cap timeDiff
      }

      Map<String, double> downSpeeds = Map.from(state.downloadSpeeds);
      Map<String, double> upSpeeds = Map.from(state.uploadSpeeds);
      Map<String, int> totalDown = Map.from(state.totalDownloaded);
      Map<String, int> totalUp = Map.from(state.totalUploaded);

      double currentIntervalDl = 0;
      double currentIntervalUl = 0;

      for (var interface in stats) {
        final name = interface.name;

        // Phase 8: Interface selection filter
        if (state.selectedInterface != "all" && name != state.selectedInterface) {
          continue;
        }

        if (_prevRx.containsKey(name)) {
          int rxDelta = interface.rxBytes - _prevRx[name]!;
          int txDelta = interface.txBytes - _prevTx[name]!;
          
          if (rxDelta < 0) rxDelta = 0;
          if (txDelta < 0) txDelta = 0;

          double rawDown = rxDelta / timeDiff;
          double rawUp = txDelta / timeDiff;

          // Phase 8: Hard Spike Rejection (Physical Limit)
          if (rawDown > _maxPhysicalLimit || rawUp > _maxPhysicalLimit) {
            _logger.warn("Extreme spike REJECTED on $name: ${rawDown.toInt()} B/s", category: LogCategory.engine);
            rawDown = downSpeeds[name] ?? 0;
            rawUp = upSpeeds[name] ?? 0;
          }

          // Spike Rejection (Relative jump)
          if (downSpeeds.containsKey(name)) {
            if (rawDown > downSpeeds[name]! * _maxSpikeThreshold) {
               rawDown = downSpeeds[name]!;
            }
          }

          downSpeeds[name] = _smoothingFactor * rawDown + (1 - _smoothingFactor) * (downSpeeds[name] ?? 0);
          upSpeeds[name] = _smoothingFactor * rawUp + (1 - _smoothingFactor) * (upSpeeds[name] ?? 0);

          currentIntervalDl += downSpeeds[name]!;
          currentIntervalUl += upSpeeds[name]!;

          totalDown[name] = (totalDown[name] ?? 0) + rxDelta;
          totalUp[name] = (totalUp[name] ?? 0) + txDelta;
        }
        
        _prevRx[name] = interface.rxBytes;
        _prevTx[name] = interface.txBytes;
      }

      // Update Queues for O(1)
      _dlQueue.addLast(currentIntervalDl);
      _ulQueue.addLast(currentIntervalUl);
      if (_dlQueue.length > _maxHistory) {
        _dlQueue.removeFirst();
        _ulQueue.removeFirst();
      }

      _lastPollTime = now;
      state = state.copyWith(
        devices: devices,
        downloadSpeeds: downSpeeds,
        uploadSpeeds: upSpeeds,
        totalDownloaded: totalDown,
        totalUploaded: totalUp,
        dlHistory: _dlQueue.toList(),
        ulHistory: _ulQueue.toList(),
        error: null,
      );

      // Sync with Agent every 60 seconds
      if (now.second == 0 && _currentPlugin != null) {
        _agentRepo.syncFromAgent(_currentPlugin!);
      }

      // Phase 12 Security/Efficiency: Throttled persistence (Every 30 seconds or on major manual update)
      if (now.second % 30 == 0) {
        _persistence.saveState(state.toJson());
      }
      
      sw.stop();
      _perfMonitor.recordPollDuration(sw.elapsed);

    } catch (e) {
      _logger.error("Data Polling Error: $e");
      _perfMonitor.recordError();
      
      // Phase 4: Retry poll once with backoff
      if (!_isPollRetry) {
        _isPollRetry = true;
        _logger.warn("Retrying poll in 3 seconds (Exponential Backoff)...");
        Future.delayed(const Duration(seconds: 3), () => _pollData());
      } else {
        _isPollRetry = false; // Give up
        state = state.copyWith(error: "Real-time sync interrupted. Connection unstable.");
      }
    }
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _persistence.saveState(state.toJson());
    super.dispose();
  }
}
