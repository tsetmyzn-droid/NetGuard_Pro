import 'package:flutter/material.dart';
import 'dart:async';
import 'package:netguard_pro/core/network/router_client.dart';
import 'package:netguard_pro/plugins/huawei/huawei_plugin.dart';
import 'package:netguard_pro/core/plugins/router_factory.dart';
import 'package:netguard_pro/core/utils/app_logger.dart';
import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/core/errors/error_reporter.dart';

void main() {
  runZonedGuarded(() {
    WidgetsFlutterBinding.ensureInitialized();
    
    // Capture Flutter Framework errors
    FlutterError.onError = (FlutterErrorDetails details) {
      ErrorReporter.report(details.exception, details.stack ?? StackTrace.current);
    };

    runApp(const NetGuardApp());
  }, (error, stack) {
    // Capture async/background errors
    ErrorReporter.report(error, stack);
  });
}

class NetGuardApp extends StatelessWidget {
  const NetGuardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NetGuard Pro',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: const Color(0xFF38BDF8),
        useMaterial3: true,
      ),
      home: const ConnectionScreen(),
    );
  }
}

class ConnectionScreen extends StatefulWidget {
  const ConnectionScreen({super.key});

  @override
  State<ConnectionScreen> createState() => _ConnectionScreenState();
}

class _ConnectionScreenState extends State<ConnectionScreen> {
  final TextEditingController _ipController = TextEditingController(text: '192.168.1.1');
  final RouterClient _client = RouterClient();
  String _statusMessage = "Ready to connect";
  bool _isConnecting = false;

  Future<void> _connect() async {
    setState(() {
      _isConnecting = true;
      _statusMessage = "Probing Gateway...";
    });

    final ip = _ipController.text;
    AppLogger.log("Starting connection to $ip");

    final isAlive = await _client.probeGateway(ip);
    
    if (isAlive) {
      // استخدام المصنع الذكي بدلاً من الـ Plugin المباشر
      final plugin = RouterFactory.getPluginFor(ip, "huawei"); 
      
      if (plugin != null) {
        final success = await plugin.login("admin", "admin");
        
        if (success && mounted) {
           Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => DashboardScreen(plugin: plugin)),
            );
            return;
        }
      }
      
      setState(() {
        _statusMessage = "FAILED: Authentication rejected";
      });
    } else {
      setState(() {
        _statusMessage = "ERROR: Router not found at $ip";
      });
    }

    if (mounted) setState(() => _isConnecting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
          padding: const EdgeInsets.all(32.0),
          constraints: const BoxConstraints(maxWidth: 400),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.shield_outlined, size: 80, color: Color(0xFF38BDF8)),
              const SizedBox(height: 24),
              const Text(
                "NETGUARD PRO",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 1.5),
              ),
              const SizedBox(height: 40),
              TextField(
                controller: _ipController,
                decoration: InputDecoration(
                  labelText: "Router Gateway IP",
                  prefixIcon: const Icon(Icons.router_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isConnecting ? null : _connect,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF38BDF8),
                    foregroundColor: const Color(0xFF0F172A),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isConnecting 
                    ? const CircularProgressIndicator(color: Color(0xFF0F172A)) 
                    : const Text("ESTABLISH CONNECTION", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                _statusMessage,
                style: TextStyle(
                  color: _statusMessage.contains("ERROR") ? Colors.redAccent : Colors.white60,
                  fontSize: 13,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  final RouterPlugin plugin;
  const DashboardScreen({super.key, required this.plugin});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  double _dl = 0.0;
  double _ul = 0.0;
  double _totalGB = 0.0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startPolling();
  }

  void _startPolling() {
    _timer = Timer.periodic(const Duration(seconds: 2), (timer) async {
      final stats = await widget.plugin.fetchTraffic();
      if (mounted) {
        setState(() {
          _dl = stats['download'] ?? 0.0;
          _ul = stats['upload'] ?? 0.0;
          // Calculate delta usage (mock logic)
          _totalGB += (_dl + _ul) * 2 / 8192;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    bool isOverLimit = _totalGB > 0.05; // Alert at 50MB for demo

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.plugin.modelName),
        centerTitle: true,
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            _buildStatBox("DOWNLOAD", _dl, "Mbps", Colors.green),
            const SizedBox(height: 20),
            _buildStatBox("UPLOAD", _ul, "Mbps", Colors.blue),
            const SizedBox(height: 20),
            _buildStatBox(
              "TOTAL USAGE", 
              _totalGB, 
              "GB", 
              isOverLimit ? Colors.red : Colors.orange,
              isWarning: isOverLimit
            ),
            const Spacer(),
            if (isOverLimit)
              const Text(
                "⚠️ USAGE ALERT: DATA LIMIT EXCEEDED",
                style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold),
              ),
            const Text(
              "Monitoring active via Native Armor v5",
              style: TextStyle(color: Colors.white24, fontSize: 10),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatBox(String label, double value, String unit, Color color, {bool isWarning = false}) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 500),
      padding: const EdgeInsets.all(24),
      width: double.infinity,
      decoration: BoxDecoration(
        color: isWarning ? const Color(0xFF450a0a) : const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border(left: BorderSide(color: color, width: 4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.white54,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value.toStringAsFixed(2),
                style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold),
              ),
              const SizedBox(width: 8),
              Text(
                unit,
                style: const TextStyle(fontSize: 16, color: Colors.white38),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
