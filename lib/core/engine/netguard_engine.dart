import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:netguard_pro/plugins/openwrt/openwrt_plugin.dart';
import 'package:netguard_pro/OpenWrt/Model/InterfaceStatus.dart';
import 'package:netguard_pro/OpenWrt/Model/ConnectedDevice.dart';

class NetGuardSystemState {
  final bool isActive;
  final List<ConnectedDevice> devices;
  final Map<String, double> downloadSpeeds; // Bits per second? Better as Bytes/s
  final Map<String, double> uploadSpeeds;
  final String? error;

  NetGuardSystemState({
    this.isActive = false,
    this.devices = const [],
    this.downloadSpeeds = const {},
    this.uploadSpeeds = const {},
    this.error,
  });

  NetGuardSystemState copyWith({
    bool? isActive,
    List<ConnectedDevice>? devices,
    Map<String, double>? downloadSpeeds,
    Map<String, double>? uploadSpeeds,
    String? error,
  }) {
    return NetGuardSystemState(
      isActive: isActive ?? this.isActive,
      devices: devices ?? this.devices,
      downloadSpeeds: downloadSpeeds ?? this.downloadSpeeds,
      uploadSpeeds: uploadSpeeds ?? this.uploadSpeeds,
      error: error,
    );
  }
}

final netGuardProvider = StateNotifierProvider<NetGuardEngine, NetGuardSystemState>((ref) {
  return NetGuardEngine();
});

class NetGuardEngine extends StateNotifier<NetGuardSystemState> {
  Timer? _pollingTimer;
  OpenWrtPlugin? _currentPlugin;
  
  Map<String, int> _prevRx = {};
  Map<String, int> _prevTx = {};
  DateTime? _lastPollTime;

  NetGuardEngine() : super(NetGuardSystemState());

  void initialize(OpenWrtPlugin plugin) {
    _currentPlugin = plugin;
    state = state.copyWith(isActive: true);
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
      }

      Map<String, double> downSpeeds = {};
      Map<String, double> upSpeeds = {};

      for (var interface in stats) {
        if (_prevRx.containsKey(interface.name)) {
          int rxDelta = interface.rxBytes - _prevRx[interface.name]!;
          int txDelta = interface.txBytes - _prevTx[interface.name]!;
          
          // Handle counter overflow/reset
          if (rxDelta < 0) rxDelta = 0;
          if (txDelta < 0) txDelta = 0;

          downSpeeds[interface.name] = rxDelta / timeDiff;
          upSpeeds[interface.name] = txDelta / timeDiff;
        }
        
        _prevRx[interface.name] = interface.rxBytes;
        _prevTx[interface.name] = interface.txBytes;
      }

      _lastPollTime = now;
      state = state.copyWith(
        devices: devices,
        downloadSpeeds: downSpeeds,
        uploadSpeeds: upSpeeds,
      );
    } catch (e) {
      state = state.copyWith(error: "System Synchronization Failed");
    }
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }
}
