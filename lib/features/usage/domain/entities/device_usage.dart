import 'package:equatable/equatable.dart';
import 'app_usage.dart';

class DeviceUsage extends Equatable {
  final String mac;
  final int rxBytes;
  final int txBytes;
  final DateTime ts;
  final List<AppUsage> appUsage;

  const DeviceUsage({
    required this.mac,
    required this.rxBytes,
    required this.txBytes,
    required this.ts,
    this.appUsage = const [],
  });

  @override
  List<Object?> get props => [mac, rxBytes, txBytes, ts, appUsage];
}
