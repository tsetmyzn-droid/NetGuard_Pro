import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/device_model.dart';
import 'auth_provider.dart';

class DeviceState {
  final List<DeviceModel> devices;
  final bool isLoading;
  final Map<String, dynamic> traffic;

  DeviceState({
    this.devices = const [],
    this.isLoading = false,
    this.traffic = const {'download': '0 B/s', 'upload': '0 B/s'},
  });

  DeviceState copyWith({
    List<DeviceModel>? devices,
    bool? isLoading,
    Map<String, dynamic>? traffic,
  }) {
    return DeviceState(
      devices: devices ?? this.devices,
      isLoading: isLoading ?? this.isLoading,
      traffic: traffic ?? this.traffic,
    );
  }
}

class DeviceNotifier extends StateNotifier<DeviceState> {
  final Ref _ref;
  Timer? _refreshTimer;

  DeviceNotifier(this._ref) : super(DeviceState()) {
    // البدء في جلب البيانات فوراً عند تفعيل الـ Provider
    refreshData();
    // تفعيل التحديث الدوري كل 10 ثوانٍ
    _refreshTimer = Timer.periodic(const Duration(seconds: 10), (timer) {
      refreshData();
    });
  }

  Future<void> refreshData() async {
    final authRepo = _ref.read(authRepositoryProvider);
    final plugin = authRepo.activePlugin;

    if (plugin == null) return;

    try {
      final deviceMaps = await plugin.fetchDevices();
      final stats = await plugin.fetchTrafficStats();

      final deviceModels = deviceMaps.map((m) => DeviceModel.fromMap(m)).toList();

      state = state.copyWith(
        devices: deviceModels,
        traffic: stats,
        isLoading: false,
      );
    } catch (e) {
      print('NetGuard Monitor Error: $e');
    }
  }

  Future<bool> blockDevice(String macAddress) async {
    final authRepo = _ref.read(authRepositoryProvider);
    final plugin = authRepo.activePlugin;

    if (plugin == null) return false;

    try {
      final success = await plugin.blockDevice(macAddress);
      if (success) {
        // تحديث الحالة محلياً فوراً لجعل الـ UI يستجيب بسرعة
        refreshData();
      }
      return success;
    } catch (e) {
      return false;
    }
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }
}

final deviceProvider = StateNotifierProvider<DeviceNotifier, DeviceState>((ref) {
  return DeviceNotifier(ref);
});
