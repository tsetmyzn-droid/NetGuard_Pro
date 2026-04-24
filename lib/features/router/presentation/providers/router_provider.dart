import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/router_repository_impl.dart';
import '../../domain/entities/router_info.dart';

class RouterState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;
  final RouterInfo? router;

  RouterState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.error,
    this.router,
  });

  RouterState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
    RouterInfo? router,
  }) {
    return RouterState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      router: router ?? this.router,
    );
  }
}

class RouterNotifier extends StateNotifier<RouterState> {
  final RouterRepositoryImpl _repository;

  RouterNotifier(this._repository) : super(RouterState());

  Future<bool> login(String ip, String username, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repository.login(ip, username, password);
      
      // Determine type for simulation or use fingerprint
      RouterType type = RouterType.generic;
      if (ip.endsWith('.1')) type = RouterType.tplink;
      if (ip.endsWith('.8.1')) type = RouterType.huawei;

      final info = RouterInfo(
        ip: ip,
        type: type,
        model: 'AX3000 Series',
        firmwareVersion: 'v2.1.0-sec-patch',
      );

      state = state.copyWith(isAuthenticated: true, isLoading: false, router: info);
      return true;
    } catch (e) {
      state = state.copyWith(
        isAuthenticated: false, 
        isLoading: false, 
        error: e.toString().replaceAll('Exception: ', ''),
      );
      return false;
    }
  }

  void logout() {
    _repository.logout();
    state = state.copyWith(isAuthenticated: false);
  }

  Future<void> reboot() async {
    state = state.copyWith(isLoading: true);
    try {
      await _repository.reboot();
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> updateWifiSsid(String ssid) async {
    state = state.copyWith(isLoading: true);
    try {
      await _repository.updateWifiSsid(ssid);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final routerProvider = StateNotifierProvider<RouterNotifier, RouterState>((ref) {
  final repo = ref.watch(routerRepositoryProvider);
  return RouterNotifier(repo);
});
