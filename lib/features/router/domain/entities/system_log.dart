import 'package:equatable/equatable.dart';

enum LogLevel { info, warning, error, security }

class SystemLog extends Equatable {
  final DateTime ts;
  final String message;
  final LogLevel level;
  final String? source;

  const SystemLog({
    required this.ts,
    required this.message,
    required this.level,
    this.source,
  });

  @override
  List<Object?> get props => [ts, message, level, source];
}
