import 'package:flutter/material.dart';
import 'package:netguard_pro/core/network/router_client.dart';
import 'package:netguard_pro/plugins/huawei/huawei_plugin.dart';
import 'package:netguard_pro/core/utils/app_logger.dart';

void main() {
  runApp(const NetGuardApp());
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
      final huawei = HuaweiPlugin(ip);
      final success = await huawei.login("admin", "admin");
      
      setState(() {
        _statusMessage = success 
            ? "CONNECTED: ${huawei.modelName} active" 
            : "FAILED: Authentication rejected";
      });
    } else {
      setState(() {
        _statusMessage = "ERROR: Router not found at $ip";
      });
    }

    setState(() => _isConnecting = false);
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
