import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:netguard_pro/core/engine/netguard_engine.dart';
import 'package:netguard_pro/features/dashboard/screens/agent_setup_wizard.dart';

class SystemStatusCard extends ConsumerWidget {
  const SystemStatusCard({super.key});

  String _formatSpeed(double bytesPerSec) {
    if (bytesPerSec > 1024 * 1024) {
      return "${(bytesPerSec / (1024 * 1024)).toStringAsFixed(2)} MB/s";
    } else if (bytesPerSec > 1024) {
      return "${(bytesPerSec / 1024).toStringAsFixed(1)} KB/s";
    }
    return "${bytesPerSec.toStringAsFixed(0)} B/s";
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(netGuardProvider);
    
    // Calculate total speeds
    double totalDown = 0;
    double totalUp = 0;
    state.downloadSpeeds.forEach((_, s) => totalDown += s);
    state.uploadSpeeds.forEach((_, s) => totalUp += s);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [const Color(0xFF1E293B), const Color(0xFF0F172A).withOpacity(0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "NETGUARD CORE",
                    style: TextStyle(
                      color: Color(0xFF38BDF8),
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    "System Engine Active",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.greenAccent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.greenAccent.withOpacity(0.2)),
                ),
                child: const Row(
                  children: [
                    CircleAvatar(radius: 3, backgroundColor: Colors.greenAccent),
                    SizedBox(width: 8),
                    Text(
                      "OPTIMIZED",
                      style: TextStyle(color: Colors.greenAccent, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 30),
          Row(
            children: [
              _buildMetric(context, "DOWNLOAD", _formatSpeed(totalDown), Icons.arrow_downward_rounded, Colors.greenAccent),
              const SizedBox(width: 20),
              _buildMetric(context, "UPLOAD", _formatSpeed(totalUp), Icons.arrow_upward_rounded, const Color(0xFF38BDF8)),
            ],
          ),
          const SizedBox(height: 24),
          const Divider(color: Colors.white10),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Connected Nodes: ${state.devices.length}",
                style: const TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w600),
              ),
              const Icon(Icons.hub_outlined, color: Colors.white24, size: 16),
            ],
          ),
          if (state.hasAgentSupport) ...[
            const SizedBox(height: 16),
            const Divider(color: Colors.white10),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildSmallMetric(
                  "CPU LOAD", 
                  "${state.routerMetrics['health']?['load_avg']?.toString().split(' ')[0] ?? '0.00'}", 
                  Icons.memory_rounded, 
                  Colors.blueAccent
                ),
                _buildSmallMetric(
                  "TEMP", 
                  "${state.routerMetrics['health']?['temp']?.toStringAsFixed(1) ?? '--'}°C", 
                  Icons.thermostat_rounded, 
                  Colors.orangeAccent
                ),
                _buildSmallMetric(
                  "THREAT", 
                  "LEVEL ${state.routerMetrics['threat_level'] ?? '1'}", 
                  Icons.gpp_maybe_rounded, 
                  Colors.redAccent
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.bolt_rounded, color: Colors.amberAccent, size: 14),
                const SizedBox(width: 8),
                Text(
                  "ADVANCED AGENT ACTIVE",
                  style: TextStyle(
                    color: Colors.amberAccent.withOpacity(0.8),
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
          ] else ...[
            const SizedBox(height: 16),
            const Divider(color: Colors.white10),
            const SizedBox(height: 16),
            InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => AgentSetupWizard(routerIp: state.routerIp),
                  ),
                );
              },
              child: Row(
                children: [
                  const Icon(Icons.add_moderator_outlined, color: Colors.white38, size: 14),
                  const SizedBox(width: 8),
                  Text(
                    "ACTIVATE ADVANCED MONITORING",
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.4),
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                  const Spacer(),
                  const Icon(Icons.chevron_right, color: Colors.white10, size: 14),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSmallMetric(String label, String value, IconData icon, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 10),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(color: Colors.white24, fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1)),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
        ),
      ],
    );
  }

  Widget _buildMetric(BuildContext context, String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 14),
                const SizedBox(width: 8),
                Text(
                  label,
                  style: TextStyle(color: color.withOpacity(0.5), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
