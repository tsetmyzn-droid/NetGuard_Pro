import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:netguard_pro/core/plugins/model/agent_traffic_stats.dart';

class ExportManager {
  static Future<File> exportStatsToCsv(List<AgentTrafficStats> stats, String filename) async {
    final buffer = StringBuffer();
    
    // Header
    buffer.writeln("Timestamp,MAC,Hostname,DownloadBytes,UploadBytes");
    
    for (var s in stats) {
      buffer.writeln("${s.timestamp},${s.macAddress},${s.hostname},${s.bytesDownloaded},${s.bytesUploaded}");
    }
    
    final directory = await getTemporaryDirectory();
    final file = File('${directory.path}/$filename.csv');
    await file.writeAsString(buffer.toString());
    
    return file;
  }
}
