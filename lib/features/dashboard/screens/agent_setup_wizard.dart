import 'package:flutter/material.dart';
import 'package:netguard_pro/core/network/agent_deployer.dart';
import 'package:netguard_pro/core/engine/persistence_manager.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';
import 'dart:math';

class AgentSetupWizard extends StatefulWidget {
  final String routerIp;

  const AgentSetupWizard({super.key, required this.routerIp});

  @override
  State<AgentSetupWizard> createState() => _AgentSetupWizardState();
}

class _AgentSetupWizardState extends State<AgentSetupWizard> {
  final _usernameController = TextEditingController(text: 'root');
  final _passwordController = TextEditingController();
  final _deployer = AgentDeployer();
  bool _isDeploying = false;
  String? _statusMessage;

  void _startDeployment() async {
    if (_passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("SSH password is required"))
      );
      return;
    }

    setState(() {
      _isDeploying = true;
      _statusMessage = "Connecting and deploying agent...";
    });

    // Generate a unique shared key for this router-app pair
    final sharedKey = _generateRandomKey();

    final success = await _deployer.deploy(
      ip: widget.routerIp,
      username: _usernameController.text,
      password: _passwordController.text,
      agentKey: sharedKey,
    );

    if (success) {
      // Save the key locally
      await PersistenceManager().saveAgentKey(widget.routerIp, sharedKey);
      setState(() {
        _isDeploying = false;
        _statusMessage = "✅ Agent deployed successfully!";
      });
      
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) Navigator.pop(context, true);
      });
    } else {
      setState(() {
        _isDeploying = false;
        _statusMessage = "❌ Deployment failed. Check credentials/SSH access.";
      });
    }
  }

  String _generateRandomKey() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%^&*';
    final rnd = Random.secure();
    return List.generate(32, (index) => chars[rnd.nextInt(chars.length)]).join();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("AGENT SETUP WIZARD")),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0F172A), Color(0xFF020617)],
          ),
        ),
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.bolt_rounded, size: 64, color: Colors.amberAccent),
            const SizedBox(height: 24),
            const Text(
              "UPGRADE ROUTER TO ADVANCED AGENT",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              "This will install a small monitoring script on your OpenWrt router via SSH.",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Colors.white60),
            ),
            const SizedBox(height: 48),
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(
                labelText: "SSH USERNAME",
                labelStyle: TextStyle(fontSize: 10, color: Colors.white30),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white10)),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: "SSH PASSWORD",
                labelStyle: TextStyle(fontSize: 10, color: Colors.white30),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white10)),
              ),
            ),
            const SizedBox(height: 48),
            if (_isDeploying)
              const CircularProgressIndicator(color: Colors.amberAccent)
            else
              ElevatedButton(
                onPressed: _startDeployment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.amberAccent,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text("INSTALL NOW", style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            if (_statusMessage != null) ...[
              const SizedBox(height: 24),
              Text(
                _statusMessage!,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: _statusMessage!.contains("✅") ? Colors.greenAccent : Colors.redAccent,
                  fontSize: 12,
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
