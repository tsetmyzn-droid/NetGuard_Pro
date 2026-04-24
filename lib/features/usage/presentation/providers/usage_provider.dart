import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/usage_sample.dart';
import '../../domain/entities/device_usage.dart';
import '../../domain/repository/usage_repository.dart';
import '../../data/usage_repository_impl.dart';
import '../../../router/presentation/providers/router_provider.dart';

import '../../domain/entities/app_usage.dart';

class UsageState {
  final UsageSample? currentTotal;
  final List<DeviceUsage>? currentDevices;
  final List<UsageSample> history;
  final Map<String, List<DeviceUsage>> allDevicesHistory;
  final bool isTracking;

  UsageState({
    this.currentTotal,
    this.currentDevices,
    this.history = const [],
    this.allDevicesHistory = const {},
    this.isTracking = false,
  });

  UsageState copyWith({
    UsageSample? currentTotal,
    List<DeviceUsage>? currentDevices,
    List<UsageSample>? history,
    Map<String, List<DeviceUsage>>? allDevicesHistory,
    bool? isTracking,
  }) {
    return UsageState(
      currentTotal: currentTotal ?? this.currentTotal,
      currentDevices: currentDevices ?? this.currentDevices,
      history: history ?? this.history,
      allDevicesHistory: allDevicesHistory ?? this.allDevicesHistory,
      isTracking: isTracking ?? this.isTracking,
    );
  }
}

class UsageNotifier extends StateNotifier<UsageState> {
  final UsageRepository _repository;
  Timer? _pollingTimer;

  UsageNotifier(this._repository) : super(UsageState());

  void startTracking() {
    if (state.isTracking) return;
    state = state.copyWith(isTracking: true);
    
    // Initial fetch
    fetchUsage();
    
    // Polling every 5 seconds
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) => fetchUsage());
  }

  void stopTracking() {
    _pollingTimer?.cancel();
    state = state.copyWith(isTracking: false);
  }

  Future<void> fetchUsage() async {
    final total = await _repository.getLatestTotalUsage();
    final devices = await _repository.getLatestDevicesUsage();
    
    if (total != null) {
      await _repository.saveUsageSample(total);
    }
    if (devices != null) {
      await _repository.saveDeviceUsage(devices);
    }

    final history = await _repository.getHistory(
      DateTime.now().subtract(const Duration(hours: 24)),
      DateTime.now(),
    );

    final allDevicesHistory = await _repository.getAllDevicesHistory(
      DateTime.now().subtract(const Duration(hours: 24)),
      DateTime.now(),
    );

    state = state.copyWith(
      currentTotal: total,
      currentDevices: devices,
      history: history,
      allDevicesHistory: allDevicesHistory,
    );
  }

  Future<List<DeviceUsage>> getDeviceHistory(String mac) async {
    return await _repository.getDeviceHistory(
      mac,
      DateTime.now().subtract(const Duration(hours: 24)),
      DateTime.now(),
    );
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }
}

final usageRepositoryProvider = Provider((ref) {
  final routerRepo = ref.watch(routerRepositoryProvider);
  return UsageRepositoryImpl(routerRepo);
});

final usageProvider = StateNotifierProvider<UsageNotifier, UsageState>((ref) {
  final repo = ref.watch(usageRepositoryProvider);
  return UsageNotifier(repo);
});
