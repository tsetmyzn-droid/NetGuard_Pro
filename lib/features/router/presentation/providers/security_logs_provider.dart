import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/router_repository_impl.dart';
import '../../domain/entities/system_log.dart';

final securityLogsProvider = FutureProvider<List<SystemLog>>((ref) async {
  final repo = ref.watch(routerRepositoryProvider);
  return repo.getLogs();
});
