import 'dart:async';
import 'dart:collection';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:intl/intl.dart';

enum LogLevel { info, warn, error }

class LogEntry {
  final DateTime timestamp;
  final LogLevel level;
  final String message;

  LogEntry({
    required this.timestamp,
    required this.level,
    required this.message,
  });

  @override
  String toString() {
    final timeStr = DateFormat('yyyy-MM-dd HH:mm:ss.SSS').format(timestamp);
    final levelStr = level.toString().split('.').last.toUpperCase().padRight(5);
    return '[$timeStr] $levelStr: $message';
  }
}

class NetGuardLogger {
  static final NetGuardLogger _instance = NetGuardLogger._internal();
  factory NetGuardLogger() => _instance;

  NetGuardLogger._internal() {
    _startBufferTimer();
  }

  final Queue<LogEntry> _memoryBuffer = Queue<LogEntry>();
  static const int _maxMemoryEntries = 500;

  final List<String> _writeBuffer = [];
  Timer? _bufferTimer;
  bool _isInitializing = false;
  File? _logFile;

  // Configuration
  static const int _maxFileSize = 5 * 1024 * 1024; // 5MB
  static const int _maxRotationFiles = 3;

  Future<void> init() async {
    if (_isInitializing) return;
    _isInitializing = true;

    try {
      final docDir = await getApplicationDocumentsDirectory();
      final logsDir = Directory(p.join(docDir.path, 'logs'));
      if (!await logsDir.exists()) {
        await logsDir.create(recursive: true);
      }
      _logFile = File(p.join(logsDir.path, 'netguard.log'));
      await _checkRotation();
      _log('Logger initialized at ${_logFile?.path}', LogLevel.info, internal: true);
    } catch (e) {
      print('Failed to initialize logger: $e');
    } finally {
      _isInitializing = false;
    }
  }

  void info(String message) => _log(message, LogLevel.info);
  void warn(String message) => _log(message, LogLevel.warn);
  void error(String message) => _log(message, LogLevel.error);

  void _log(String message, LogLevel level, {bool internal = false}) {
    final entry = LogEntry(
      timestamp: DateTime.now(),
      level: level,
      message: message,
    );

    // Add to memory buffer
    _memoryBuffer.addLast(entry);
    if (_memoryBuffer.length > _maxMemoryEntries) {
      _memoryBuffer.removeFirst();
    }

    // Add to write buffer for file persistence
    _writeBuffer.add(entry.toString());

    // Print to console for development
    debugPrint(entry.toString());
  }

  void _startBufferTimer() {
    _bufferTimer?.cancel();
    _bufferTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      _flushBuffer();
    });
  }

  Future<void> _flushBuffer() async {
    if (_writeBuffer.isEmpty || _logFile == null) return;

    final linesToWrite = List<String>.from(_writeBuffer);
    _writeBuffer.clear();

    try {
      await _checkRotation();
      await _logFile!.writeAsString(
        '${linesToWrite.join('\n')}\n',
        mode: FileMode.append,
        flush: true,
      );
    } catch (e) {
      print('Failed to write logs to file: $e');
    }
  }

  Future<void> _checkRotation() async {
    if (_logFile == null || !await _logFile!.exists()) return;

    final size = await _logFile!.length();
    if (size >= _maxFileSize) {
      await _rotateFiles();
    }
  }

  Future<void> _rotateFiles() async {
    try {
      final logsDir = _logFile!.parent.path;
      
      // Delete the oldest file if it exists
      final oldestFile = File(p.join(logsDir, 'netguard.log.$_maxRotationFiles'));
      if (await oldestFile.exists()) {
        await oldestFile.delete();
      }

      // Shift existing rotation files
      for (int i = _maxRotationFiles - 1; i >= 1; i--) {
        final currentFile = File(p.join(logsDir, 'netguard.log.$i'));
        if (await currentFile.exists()) {
          await currentFile.rename(p.join(logsDir, 'netguard.log.${i + 1}'));
        }
      }

      // Rename current file to .1
      await _logFile!.rename(p.join(logsDir, 'netguard.log.1'));
      
      // Create new empty log file
      _logFile = File(p.join(logsDir, 'netguard.log'));
      await _logFile!.create();
    } catch (e) {
      print('Error during log rotation: $e');
    }
  }

  List<LogEntry> getEntries() => _memoryBuffer.toList();

  Future<void> dispose() async {
    _bufferTimer?.cancel();
    await _flushBuffer();
  }
}

// Simple debugPrint fallback
void debugPrint(String message) {
  // In a real app we might use foundation's debugPrint, 
  // but for simplicity in core we just use print or stdout.
  print(message);
}
