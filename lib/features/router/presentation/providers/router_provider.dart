import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/router_repository_impl.dart';

class RouterState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;

  RouterState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.error,
  });

  RouterState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
  }) {
    return RouterState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
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
      state = state.copyWith(isAuthenticated: true, isLoading: false);
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
}

final routerProvider = StateNotifierProvider<RouterNotifier, RouterState>((ref) {
  final repo = ref.watch(routerRepositoryProvider);
  return RouterNotifier(repo);
});
