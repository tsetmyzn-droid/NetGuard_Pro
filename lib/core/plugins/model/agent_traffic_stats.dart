import 'package:isar/isar.dart';

part 'agent_traffic_stats.g.dart';

@collection
class AgentTrafficStats {
  Id id = Isar.autoIncrement;

  @Index(type: IndexType.value)
  final String routerId;

  @Index(type: IndexType.value)
  final String macAddress;

  final String hostname;
  
  final int timestamp; // Unix epoch

  final int bytesDownloaded;
  final int bytesUploaded;

  AgentTrafficStats({
    required this.routerId,
    required this.macAddress,
    required this.hostname,
    required this.timestamp,
    required this.bytesDownloaded,
    required this.bytesUploaded,
  });
}
