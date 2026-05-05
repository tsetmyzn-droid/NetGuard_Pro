import 'dart:async';
import 'dart:collection';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:intl/intl.dart';

import 'package:encrypt/encrypt.dart' as enc;
import 'package:crypto/crypto.dart';
import 'package:netguard_pro/core/security/encryption_key_manager.dart';

enum LogLevel { info, warn, error }
enum LogCategory { system, network, security, engine, ui }

class LogEntry {
  final DateTime timestamp;
  final LogLevel level;
  final LogCategory category;
  final String message;

  LogEntry({
    required this.timestamp,
    required this.level,
    required this.category,
    required this.message,
  });

  @override
  String toString() {
    final timeStr = DateFormat('yyyy-MM-dd HH:mm:ss.SSS').format(timestamp);
    final levelStr = level.toString().split('.').last.toUpperCase().padRight(5);
    final catStr = category.toString().split('.').last.toUpperCase().padRight(8);
    return '[$timeStr] $levelStr [$catStr]: $message';
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
  static const int _maxWriteBufferSize = 1000;
  Timer? _bufferTimer;
  bool _isInitializing = false;
  bool _isFlushing = false;
  File? _logFile;
  final _keyManager = EncryptionKeyManager();

  // Deduplication state
  String? _lastLogMessage;
  int _repeatCount = 0;
  DateTime? _lastLogTime;

  // Configuration
  static const int _maxFileSize = 2 * 1024 * 1024; // Lowered to 2MB for encryption efficiency
  static const int _maxRotationFiles = 2;

  Future<void> init() async {
    if (_isInitializing) return;
    _isInitializing = true;

    try {
      final docDir = await getApplicationDocumentsDirectory();
      final logsDir = Directory(p.join(docDir.path, 'logs'));
      if (!await logsDir.exists()) {
        await logsDir.create(recursive: true);
      }
      // Security: use .nglog extension
      _logFile = File(p.join(logsDir.path, 'netguard.nglog'));
      await _checkRotation();
      _log('Logger initialized with encryption at ${_logFile?.path}', LogLevel.info, internal: true);
    } catch (e) {
      if (kDebugMode) print('Failed to initialize logger: $e');
    } finally {
      _isInitializing = false;
    }
  }

  void info(String message, {LogCategory category = LogCategory.system}) => _log(message, LogLevel.info, category: category);
  void warn(String message, {LogCategory category = LogCategory.system}) => _log(message, LogLevel.warn, category: category);
  void error(String message, {LogCategory category = LogCategory.system}) => _log(message, LogLevel.error, category: category);

  String _sanitize(String input) {
    // Phase 5: Enhanced Sensitive Data Protection
    final patterns = [
      RegExp(r'(password|pass|passwd|secret|key|cookie)=([^&\s]+)', caseSensitive: false),
      RegExp(r'(token|auth|sessionId|sysauth)=([^&\s]+)', caseSensitive: false),
      RegExp(r'"(password|token|auth|session|secret|key|cookie)"\s*:\s*"([^"]+)"', caseSensitive: false),
      RegExp(r'Bearer\s+([a-zA-Z0-9\.\-_]+)', caseSensitive: false), 
      // Phase 12 Security: PII Masking
      RegExp(r'([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}'), // MAC
      RegExp(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'), // IP
    ];
    
    String sanitized = input;
    for (var pattern in patterns) {
      sanitized = sanitized.replaceAllMapped(pattern, (match) {
        if (match.groupCount >= 1 && match.group(1) != null) {
          final keyPart = match.group(1)!;
          return '$keyPart=***';
        }
        return '***';
      });
    }
    return sanitized;
  }

  void _log(String message, LogLevel level, {LogCategory category = LogCategory.system, bool internal = false}) {
    final now = DateTime.now();

    // Deduplication logic
    if (message == _lastLogMessage && _lastLogTime != null && now.difference(_lastLogTime!).inSeconds < 5) {
      _repeatCount++;
      return;
    }

    if (_lastLogMessage != null && _repeatCount > 0) {
      final summaryEntry = LogEntry(
        timestamp: now,
        level: LogLevel.info,
        category: LogCategory.system,
        message: "Previous message [$_lastLogMessage] repeated $_repeatCount times",
      );
      _memoryBuffer.addLast(summaryEntry);
      _writeBuffer.add(summaryEntry.toString());
    }

    _lastLogMessage = message;
    _lastLogTime = now;
    _repeatCount = 0;

    final sanitizedMessage = _sanitize(message);
    final entry = LogEntry(
      timestamp: now,
      level: level,
      category: category,
      message: sanitizedMessage,
    );

    // Add to memory buffer
    _memoryBuffer.addLast(entry);
    if (_memoryBuffer.length > _maxMemoryEntries) {
      _memoryBuffer.removeFirst();
    }

    // Add to write buffer for file persistence
    if (_writeBuffer.length < _maxWriteBufferSize) {
      _writeBuffer.add(entry.toString());
    }

    // Print to console for development ONLY in Debug mode
    if (kDebugMode) {
      print(entry.toString());
    }
  }

  void _startBufferTimer() {
    _bufferTimer?.cancel();
    _bufferTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      _flushBuffer();
    });
  }

  Future<void> _flushBuffer() async {
    if (_writeBuffer.isEmpty || _logFile == null || _isFlushing) return;
    _isFlushing = true;

    final linesToWrite = List<String>.from(_writeBuffer);
    _writeBuffer.clear();

    try {
      await _checkRotation();
      final content = '${linesToWrite.join('\n')}\n';
      
      // Phase 5: Log Encryption & Integrity (SHA256)
      final key = await _keyManager.getKey();
      final iv = enc.IV.fromSecureRandom(16);
      final encrypter = enc.Encrypter(enc.AES(key));
      final encrypted = encrypter.encrypt(content, iv: iv);
      
      final chunkBytes = encrypted.bytes;
      final checksum = sha256.convert(chunkBytes).bytes;
      
      // [ChunkSize (4 bytes)] + [Checksum (32 bytes)] + [IV (16 bytes)] + [Ciphertext]
      final header = ByteData(52);
      header.setUint32(0, chunkBytes.length);
      for(int r=0; r<32; r++) header.setUint8(4 + r, checksum[r]);
      for(int r=0; r<16; r++) header.setUint8(36 + r, iv.bytes[r]);
      
      final fullChunk = Uint8List.fromList(header.buffer.asUint8List() + chunkBytes);

      await _logFile!.writeAsBytes(
        fullChunk,
        mode: FileMode.append,
        flush: true,
      );
    } catch (e) {
      if (kDebugMode) print('Failed to write encrypted logs to file: $e');
    } finally {
      _isFlushing = false;
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
      final baseName = p.basenameWithoutExtension(_logFile!.path);
      final ext = p.extension(_logFile!.path);
      
      for (int i = _maxRotationFiles - 1; i >= 1; i--) {
        final currentFile = File(p.join(logsDir, '$baseName.$i$ext'));
        if (await currentFile.exists()) {
          await currentFile.rename(p.join(logsDir, '$baseName.${i + 1}$ext'));
        }
      }

      await _logFile!.rename(p.join(logsDir, '$baseName.1$ext'));
      _logFile = File(p.join(logsDir, '$baseName$ext'));
      await _logFile!.create();
    } catch (e) {
      if (kDebugMode) print('Error during log rotation: $e');
    }
  }

  List<LogEntry> getEntries() => _memoryBuffer.toList();

  // Phase 5: Query System
  List<LogEntry> getLogsByCategory(LogCategory category) => 
      _memoryBuffer.where((e) => e.category == category).toList();

  List<LogEntry> getLogsByLevel(LogLevel level) => 
      _memoryBuffer.where((e) => e.level == level).toList();

  List<LogEntry> getLogsByTimeRange(DateTime start, DateTime end) => 
      _memoryBuffer.where((e) => e.timestamp.isAfter(start) && e.timestamp.isBefore(end)).toList();

  Future<void> dispose() async {
    _bufferTimer?.cancel();
    await _flushBuffer();
  }
}

// Removed custom debugPrint fallback in favor of foundation kDebugMode
