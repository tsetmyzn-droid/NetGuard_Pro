import 'package:equatable/equatable.dart';
import 'app_usage.dart';

class UsageSample extends Equatable {
  final DateTime ts;
  final int rxBytes; // total download
  final int txBytes; // total upload
  final List<AppUsage> appUsage;

  const UsageSample({
    required this.ts,
    required this.rxBytes,
    required this.txBytes,
    this.appUsage = const [],
  });

  @override
  List<Object?> get props => [ts, rxBytes, txBytes, appUsage];
}
