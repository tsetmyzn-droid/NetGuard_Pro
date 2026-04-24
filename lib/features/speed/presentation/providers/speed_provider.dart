import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/entities/speed_result.dart';
import 'dart:async';

class SpeedState {
  final double currentDownload;
  final double currentUpload;
  final int currentPing;
  final bool isTesting;
  final List<SpeedResult> history;

  SpeedState({
    this.currentDownload = 0.0,
    this.currentUpload = 0.0,
    this.currentPing = 0,
    this.isTesting = false,
    this.history = const [],
  });

  SpeedState copyWith({
    double? currentDownload,
    double? currentUpload,
    int? currentPing,
    bool? isTesting,
    List<SpeedResult>? history,
  }) {
    return SpeedState(
      currentDownload: currentDownload ?? this.currentDownload,
      currentUpload: currentUpload ?? this.currentUpload,
      currentPing: currentPing ?? this.currentPing,
      isTesting: isTesting ?? this.isTesting,
      history: history ?? this.history,
    );
  }
}

class SpeedNotifier extends StateNotifier<SpeedState> {
  SpeedNotifier() : super(SpeedState());

  Future<void> runTest() async {
    state = state.copyWith(isTesting: true, currentDownload: 0, currentUpload: 0, currentPing: 0);
    
    // Simulate Download
    for (int i = 0; i < 20; i++) {
      await Future.delayed(const Duration(milliseconds: 100));
      state = state.copyWith(currentDownload: 20.0 + Random().nextDouble() * 80);
    }

    // Simulate Upload
    for (int i = 0; i < 15; i++) {
      await Future.delayed(const Duration(milliseconds: 100));
      state = state.copyWith(currentUpload: 5.0 + Random().nextDouble() * 35);
    }

    final result = SpeedResult(
      ts: DateTime.now(),
      downloadMbps: state.currentDownload,
      uploadMbps: state.currentUpload,
      pingMs: 15 + Random().nextInt(40),
    );

    state = state.copyWith(
      isTesting: false,
      currentPing: result.pingMs,
      history: [result, ...state.history],
    );
  }
}

final speedProvider = StateNotifierProvider<SpeedNotifier, SpeedState>((ref) => SpeedNotifier());
