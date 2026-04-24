import 'package:equatable/equatable.dart';

enum AppCategory {
  social,
  streaming,
  gaming,
  productivity,
  system,
  other
}

class AppUsage extends Equatable {
  final String appName;
  final AppCategory category;
  final int bytes;
  final String? icon;

  const AppUsage({
    required this.appName,
    required this.category,
    required this.bytes,
    this.icon,
  });

  @override
  List<Object?> get props => [appName, category, bytes, icon];
}
