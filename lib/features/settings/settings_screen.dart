import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:netguard_pro/core/engine/persistence_manager.dart';
import 'package:netguard_pro/core/diagnostics/netguard_logger.dart';
import 'package:netguard_pro/core/diagnostics/crash_loop_protection.dart';
import 'package:netguard_pro/core/engine/netguard_engine.dart';
import 'package:netguard_pro/features/diagnostics/log_viewer_screen.dart';
import 'package:netguard_pro/features/settings/profiles_screen.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final engineState = ref.watch(netGuardProvider);
    final engineNotifier = ref.read(netGuardProvider.notifier);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text("APP SETTINGS", style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader("ENGINE CONFIGURATION"),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.04),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Monitored Interface", style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: DropdownButton<String>(
                    value: engineState.selectedInterface,
                    dropdownColor: const Color(0xFF1E293B),
                    isExpanded: true,
                    underline: const SizedBox(),
                    items: const [
                      DropdownMenuItem(value: "all", child: Text("All Interfaces (Total)", style: TextStyle(color: Colors.white70))),
                      DropdownMenuItem(value: "br-lan", child: Text("br-lan (Local Bridge)", style: TextStyle(color: Colors.white70))),
                      DropdownMenuItem(value: "wlan0", child: Text("wlan0 (Wireless)", style: TextStyle(color: Colors.white70))),
                      DropdownMenuItem(value: "eth0", child: Text("eth0 (WAN/Cable)", style: TextStyle(color: Colors.white70))),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        engineNotifier.setSelectedInterface(val);
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _buildSectionHeader("SYSTEM & DATA"),
          _buildSettingItem(
            context,
            title: "Manage Router Profiles",
            subtitle: "Add or switch between routers",
            icon: Icons.router_rounded,
            color: Colors.blueAccent,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ProfilesScreen()),
              );
            },
          ),
          _buildSettingItem(
            context,
            title: "Reset Crash Loop Data",
            subtitle: "Manually reset the local crash counter.",
            icon: Icons.refresh_rounded,
            color: Colors.amberAccent,
            onTap: () async {
              await CrashLoopProtection.reset();
              NetGuardLogger().info("User manually reset crash loop data via Settings.", category: LogCategory.ui);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("System crash counter has been reset.")),
                );
              }
            },
          ),
          const SizedBox(height: 24),
          _buildSectionHeader("DIAGNOSTICS"),
          _buildSettingItem(
            context,
            title: "View Engine Logs",
            subtitle: "Real-time records of system operations and errors.",
            icon: Icons.terminal_rounded,
            color: const Color(0xFF38BDF8),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const LogViewerScreen()),
              );
            },
          ),
          _buildSettingItem(
            context,
            title: "Export Logs to File",
            subtitle: "Save logs to device documents for support.",
            icon: Icons.save_alt_rounded,
            color: Colors.greenAccent,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Logs are preserved in secure .nglog format.")),
              );
            },
          ),
          const SizedBox(height: 40),
          Center(
            child: Text(
              "NetGuard Pro v5.1.0 (Phase 8 Optimized)",
              style: TextStyle(color: Colors.white.withOpacity(0.1), fontSize: 10),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(
        title,
        style: const TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
      ),
    );
  }

  Widget _buildSettingItem(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white05),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(subtitle, style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 12)),
        ),
        onTap: onTap,
      ),
    );
  }
}
