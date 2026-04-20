import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/router_model.dart';
import '../../data/repositories/auth_repository.dart';

// الحالة الخاصة بالمصادقة
class AuthState {
  final bool isLoading;
  final RouterModel? router;
  final String? error;

  AuthState({this.isLoading = false, this.router, this.error});

  AuthState copyWith({bool? isLoading, RouterModel? router, String? error}) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      router: router ?? this.router,
      error: error ?? this.error,
    );
  }
}

// الـ Provider المسؤول عن إدارة حالة الدخول
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;

  AuthNotifier(this._repository) : super(AuthState());

  // التحقق من وجود جلسة سابقة (تُستدعى عند تشغيل التطبيق)
  Future<void> checkSession() async {
    state = state.copyWith(isLoading: true);
    final router = await _repository.getCurrentSession();
    state = state.copyWith(isLoading: false, router: router);
  }

  // تنفيذ عملية الدخول
  Future<bool> login(String ip, String password, RouterType type) async {
    state = state.copyWith(isLoading: true, error: null);
    final success = await _repository.login(ip, password, type);
    
    if (success) {
      final router = await _repository.getCurrentSession();
      state = state.copyWith(isLoading: false, router: router);
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: 'فشل الاتصال بالراوتر، تحقق من البيانات');
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = AuthState();
  }
}

// تعريف الـ Providers للحقن في الواجهة
final authRepositoryProvider = Provider((ref) => AuthRepository());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repo = ref.watch(authRepositoryProvider);
  return AuthNotifier(repo);
});
