import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/router_repository_impl.dart';
import '../../domain/entities/device.dart';

class DeviceState {
  final List<Device> devices;
  final bool isLoading;
  final String? error;

  DeviceState({
    this.devices = const [],
    this.isLoading = false,
    this.error,
  });

  DeviceState copyWith({
    List<Device>? devices,
    bool? isLoading,
    String? error,
  }) {
    return DeviceState(
      devices: devices ?? this.devices,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class DeviceNotifier extends StateNotifier<DeviceState> {
  final RouterRepositoryImpl _repository;

  DeviceNotifier(this._repository) : super(DeviceState()) {
    fetchDevices();
  }

  Future<void> fetchDevices() async {
    state = state.copyWith(isLoading: true);
    try {
      final devices = await _repository.getDevices();
      state = state.copyWith(devices: devices, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> blockDevice(String mac) async {
    try {
      await _repository.blockDevice(mac);
      await fetchDevices();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

final deviceProvider = StateNotifierProvider<DeviceNotifier, DeviceState>((ref) {
  final repo = ref.watch(routerRepositoryProvider);
  return DeviceNotifier(repo);
});
