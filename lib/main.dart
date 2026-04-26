import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import 'package:netguard_pro/core/network/router_client.dart';
import 'package:netguard_pro/plugins/huawei/huawei_plugin.dart';
import 'package:netguard_pro/core/plugins/router_factory.dart';
import 'package:netguard_pro/core/utils/app_logger.dart';
import 'package:netguard_pro/core/plugins/router_plugin.dart';
import 'package:netguard_pro/core/errors/error_reporter.dart';
import 'package:netguard_pro/features/dashboard/widgets/traffic_graph.dart';
import 'package:netguard_pro/features/dashboard/widgets/system_status_card.dart';
import 'package:netguard_pro/core/engine/netguard_engine.dart';
import 'package:netguard_pro/plugins/openwrt/openwrt_plugin.dart';
import 'package:fl_chart/fl_chart.dart';

void main() {
  runZonedGuarded(() {
    WidgetsFlutterBinding.ensureInitialized();
    
    // Capture Flutter Framework errors
    FlutterError.onError = (FlutterErrorDetails details) {
      ErrorReporter.report(details.exception, details.stack ?? StackTrace.current);
    };

    runApp(
      const ProviderScope(
        child: NetGuardApp(),
      ),
    );
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
  String _statusMessage = "READY TO ESTABLISH LINK";
  bool _isConnecting = false;

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
    if (widget.plugin is OpenWrtPlugin) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(netGuardProvider.notifier).initialize(widget.plugin as OpenWrtPlugin);
      });
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final netState = ref.watch(netGuardProvider);
    
    // Process speeds for graphing
    double totalDl = 0;
    double totalUl = 0;
    netState.downloadSpeeds.forEach((_, s) => totalDl += s);
    netState.uploadSpeeds.forEach((_, s) => totalUl += s);

    // Convert B/s to Mbps for the existing graph UI logic if needed, 
    // but the graph looks better with raw Mbps. Let's convert for consistency.
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
