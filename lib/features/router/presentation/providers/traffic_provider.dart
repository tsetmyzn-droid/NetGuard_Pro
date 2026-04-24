import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/router_repository_impl.dart';
import '../../domain/entities/traffic.dart';

class TrafficState {
  final List<TrafficSample> history;
  final bool isMonitoring;

  TrafficState({
    this.history = const [],
    this.isMonitoring = false,
  });

  TrafficState copyWith({
    List<TrafficSample>? history,
    bool? isMonitoring,
  }) {
    return TrafficState(
      history: history ?? this.history,
      isMonitoring: isMonitoring ?? this.isMonitoring,
    );
  }
}

class TrafficNotifier extends StateNotifier<TrafficState> {
  final RouterRepositoryImpl _repository;
  Timer? _timer;

  TrafficNotifier(this._repository) : super(TrafficState());

  void startMonitoring() {
    _timer?.cancel();
    state = state.copyWith(isMonitoring: true);
    _timer = Timer.periodic(const Duration(seconds: 2), (_) => _tick());
  }

  void stopMonitoring() {
    _timer?.cancel();
    state = state.copyWith(isMonitoring: false);
  }

  Future<void> _tick() async {
    try {
      final sample = await _repository.getTraffic();
      final newHistory = List<TrafficSample>.from(state.history)..add(sample);
      
      // Keep last 30 samples
      if (newHistory.length > 30) {
        newHistory.removeAt(0);
      }
      
      state = state.copyWith(history: newHistory);
    } catch (e) {
      // Handle error quietly or log
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

final trafficProvider = StateNotifierProvider<TrafficNotifier, TrafficState>((ref) {
  final repo = ref.watch(routerRepositoryProvider);
  return TrafficNotifier(repo);
});
