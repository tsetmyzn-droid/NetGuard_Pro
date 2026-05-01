import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import 'package:netguard_pro/core/network/router_client.dart';
import 'package:netguard_pro/core/plugins/router_factory.dart';
import 'package:netguard_pro/core/utils/app_logger.dart';
import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/core/errors/error_reporter.dart';
import 'package:netguard_pro/features/dashboard/widgets/traffic_graph.dart';
import 'package:netguard_pro/features/dashboard/widgets/system_status_card.dart';
import 'package:netguard_pro/core/engine/netguard_engine.dart';
import 'package:netguard_pro/core/diagnostics/crash_loop_protection.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';
import 'package:fl_chart/fl_chart.dart';

import 'package:netguard_pro/core/network/discovery_service.dart';
import 'package:netguard_pro/core/network/router_types.dart';
import 'package:netguard_pro/features/speed_test/speed_test_manager.dart';
import 'package:netguard_pro/features/speed_test/model/speed_test_result.dart';

void main() {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();
    
    // Initialize Logger
    final logger = NetGuardLogger();
    await logger.init();
    
    // Check for Crash Loop
    if (await CrashLoopProtection.shouldBlockRestart()) {
      logger.error("CRITICAL: Crash loop detected. Blocking startup.");
      runApp(const MaterialApp(home: CriticalFailureScreen(isLoop: true)));
      return;
    }

    logger.info("APP STARTING: NetGuard Pro Production Engine Initialized");
    
    // Capture Flutter Framework errors
    FlutterError.onError = (FlutterErrorDetails details) {
      ErrorReporter.report(details.exception, details.stack ?? StackTrace.current);
    };

    runApp(
      const ProviderScope(
        child: NetGuardApp(),
      ),
    );
    
    // Reset crash count on successful start
    Timer(const Duration(seconds: 10), () => CrashLoopProtection.reset());
    
  }, (error, stack) async {
    await CrashLoopProtection.recordCrash();
    ErrorReporter.report(error, stack);
    
    // Attempt to show error screen if possible
    runApp(MaterialApp(home: CriticalFailureScreen(error: error.toString())));
  });
}

class CriticalFailureScreen extends StatelessWidget {
  final String? error;
  final bool isLoop;
  const CriticalFailureScreen({super.key, this.error, this.isLoop = false});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.emergency_home_rounded, color: Colors.redAccent, size: 80),
              const SizedBox(height: 24),
              Text(
                isLoop ? "CRASH LOOP DETECTED" : "SYSTEM CORE FAILURE",
                style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Text(
                isLoop 
                  ? "The app has crashed too many times recently. Please contact support." 
                  : "An unexpected error occurred and the engine was halted for safety.",
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white38),
              ),
              if (error != null) ...[
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    error!,
                    style: const TextStyle(color: Colors.redAccent, fontFamily: 'monospace', fontSize: 10),
                  ),
                ),
              ],
              const SizedBox(height: 40),
              ElevatedButton(
                onPressed: () => CrashLoopProtection.reset().then((_) => exit(0)),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.white10),
                child: const Text("FORCED RESET & EXIT", style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }
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
  final DiscoveryService _discoveryService = DiscoveryService();
  String _statusMessage = "READY TO ESTABLISH LINK";
  bool _isConnecting = false;

  @override
  void initState() {
    super.initState();
    _tryAutoDiscover();
  }

  Future<void> _tryAutoDiscover() async {
    final result = await _discoveryService.autoDiscover();
    if (result.type != RouterType.unknown && mounted) {
      _ipController.text = result.ip;
      setState(() => _statusMessage = "AUTO-DETECTED: ${result.type.name.toUpperCase()} AT ${result.ip}");
    }
  }

  Future<void> _connect() async {
    setState(() {
      _isConnecting = true;
      _statusMessage = "PROBING GATEWAY NODES...";
    });

    final ip = _ipController.text;
    await Future.delayed(const Duration(milliseconds: 500)); // Smooth transition

    final identity = await _client.getGatewayIdentity(ip);
    
    if (identity != null) {
      final plugin = RouterFactory.getPluginFor(ip, identity); 
      
      if (plugin != null) {
        final success = await plugin.login("admin", "admin");
        
        if (success && mounted) {
           Navigator.pushReplacement(
              context,
              PageRouteBuilder(
                pageBuilder: (c, a1, a2) => DashboardScreen(plugin: plugin),
                transitionsBuilder: (c, anim, a2, child) => FadeTransition(opacity: anim, child: child),
                transitionDuration: const Duration(milliseconds: 500),
              ),
            );
            return;
        }
      }
      
      setState(() => _statusMessage = "CRITICAL: AUTHENTICATION REJECTED");
    } else {
      setState(() => _statusMessage = "OFFLINE: ROUTER NOT REACHABLE AT $ip");
    }

    if (mounted) setState(() => _isConnecting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topRight,
            radius: 1.5,
            colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildLogoSection(),
                const SizedBox(height: 50),
                _buildInputCard(),
                const SizedBox(height: 32),
                Text(
                  _statusMessage,
                  style: TextStyle(
                    color: _statusMessage.contains("CRITICAL") || _statusMessage.contains("OFFLINE") 
                        ? Colors.redAccent.withOpacity(0.8) 
                        : Colors.white38,
                    fontSize: 11,
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogoSection() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF38BDF8).withOpacity(0.1),
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.2)),
          ),
          child: const Icon(Icons.shield_rounded, size: 64, color: Color(0xFF38BDF8)),
        ),
        const SizedBox(height: 24),
        const Text(
          "NETGUARD PRO",
          style: TextStyle(
            fontSize: 28, 
            fontWeight: FontWeight.w900, 
            letterSpacing: 4,
            color: Colors.white,
          ),
        ),
        Text(
          "NATIVE SECURITY ENGINE V5",
          style: TextStyle(color: Colors.white24, fontSize: 10, letterSpacing: 2),
        ),
      ],
    );
  }

  Widget _buildInputCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      constraints: const BoxConstraints(maxWidth: 400),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withOpacity(0.5),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        children: [
          TextField(
            controller: _ipController,
            style: const TextStyle(fontFamily: 'Courier', letterSpacing: 1.5),
            decoration: InputDecoration(
              labelText: "GATEWAY IP",
              labelStyle: const TextStyle(color: Colors.white38, fontSize: 12),
              prefixIcon: const Icon(Icons.lan_outlined, color: Color(0xFF38BDF8), size: 20),
              filled: true,
              fillColor: Colors.black26,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFF38BDF8), width: 1),
              ),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton(
              onPressed: _isConnecting ? null : _connect,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF38BDF8),
                foregroundColor: const Color(0xFF0F172A),
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isConnecting 
                ? const SizedBox(
                    width: 20, 
                    height: 20, 
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0F172A))
                  ) 
                : const Text("INITIALIZE LINK", style: TextStyle(fontWeight: FontWeight.w900)),
            ),
          ),
        ],
      ),
    );
  }
}

class DashboardScreen extends ConsumerStatefulWidget {
  final RouterPlugin plugin;
  const DashboardScreen({super.key, required this.plugin});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> with SingleTickerProviderStateMixin {
  final List<FlSpot> _dlSpots = [];
  final List<FlSpot> _ulSpots = [];
  int _counter = 0;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    
    // Initialize NetGuard Engine
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(netGuardProvider.notifier).initialize(widget.plugin);
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _runSpeedTest() async {
    final manager = SpeedTestManager();
    final result = await manager.runIsolatedTest();
    if (result != null && mounted) {
      showDialog(
        context: context,
        builder: (c) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: const Text("SPEED TEST COMPLETE"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildSimpleStat("DOWNLOAD", "${result.downloadSpeedMbps.toStringAsFixed(2)} Mbps", Colors.greenAccent),
              _buildSimpleStat("UPLOAD", "${result.uploadSpeedMbps.toStringAsFixed(2)} Mbps", const Color(0xFF38BDF8)),
              _buildSimpleStat("LATENCY", "${result.pingMs} ms", Colors.amberAccent),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(c), child: const Text("CLOSE")),
          ],
        ),
      );
    }
  }

  Widget _buildSimpleStat(String label, String val, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.white38)),
          Text(val, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final netState = ref.watch(netGuardProvider);
    
    // Process speeds for graphing
    double totalDl = 0;
    double totalUl = 0;
    netState.downloadSpeeds.forEach((_, s) => totalDl += s);
    netState.uploadSpeeds.forEach((_, s) => totalUl += s);

    // Cumulative Data (Bytes to GB)
    int accumDl = 0;
    int accumUl = 0;
    netState.totalDownloaded.forEach((_, v) => accumDl += v);
    netState.totalUploaded.forEach((_, v) => accumUl += v);
    double totalGB = (accumDl + accumUl) / (1024 * 1024 * 1024);

    // Convert B/s to Mbps
    double dlMbps = (totalDl * 8) / (1024 * 1024);
    double ulMbps = (totalUl * 8) / (1024 * 1024);

    _counter++;
    _dlSpots.add(FlSpot(_counter.toDouble(), dlMbps));
    _ulSpots.add(FlSpot(_counter.toDouble(), ulMbps));
    
    if (_dlSpots.length > 30) {
      _dlSpots.removeAt(0);
      _ulSpots.removeAt(0);
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            FadeTransition(
              opacity: _pulseController,
              child: Container(
                width: 8, height: 8,
                decoration: const BoxDecoration(color: Colors.greenAccent, shape: BoxShape.circle),
              ),
            ),
            const SizedBox(width: 12),
            Text(widget.plugin.modelName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: Column(
          children: [
            const SizedBox(height: 20),
            const SystemStatusCard(),
            const SizedBox(height: 24),
            _buildStatBox("SESSION DATA USAGE", totalGB, "GB", Colors.amberAccent, Icons.data_usage_rounded),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton.icon(
                onPressed: _runSpeedTest,
                icon: const Icon(Icons.speed_rounded, size: 20),
                label: const Text("RUN ISOLATED SPEED TEST", style: TextStyle(letterSpacing: 1, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: Colors.white.withOpacity(0.1)),
                  foregroundColor: Colors.white70,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 24),
            _buildGraphBox("REAL-TIME DOWNLOAD", _dlSpots, Colors.greenAccent, dlMbps, "Mbps"),
            const SizedBox(height: 16),
            _buildGraphBox("REAL-TIME UPLOAD", _ulSpots, const Color(0xFF38BDF8), ulMbps, "Mbps"),
            const SizedBox(height: 32),
            _buildFooter(netState.error != null),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildGraphBox(String label, List<FlSpot> spots, Color color, double currentVal, String unit) {
    return Container(
      height: 180,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withOpacity(0.5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white24, letterSpacing: 1.5)),
              Text("${currentVal.toStringAsFixed(2)} $unit", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: color, fontFamily: 'monospace')),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(child: TrafficGraph(points: spots, color: color)),
        ],
      ),
    );
  }

  Widget _buildFooter(bool isOverLimit) {
    return Column(
      children: [
        if (isOverLimit)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.redAccent.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
            ),
            child: const Text(
              "TRAFFIC ANOMALY DETECTED",
              style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
            ),
          ),
        const SizedBox(height: 16),
        const Text(
          "ENCRYPTED CHANNEL V5.0 • PROTECTED",
          style: TextStyle(color: Colors.white10, fontSize: 9, letterSpacing: 1.5),
        ),
      ],
    );
  }

  Widget _buildStatBox(String label, double value, String unit, Color color, IconData icon, {bool isWarning = false}) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 400),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isWarning ? const Color(0xFF450a0a).withOpacity(0.5) : const Color(0xFF1E293B).withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white24, letterSpacing: 1)),
                const SizedBox(height: 4),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(value.toStringAsFixed(2), style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                    const SizedBox(width: 4),
                    Text(unit, style: TextStyle(fontSize: 12, color: color.withOpacity(0.5), fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
