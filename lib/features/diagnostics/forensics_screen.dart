import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:netguard_pro/core/engine/netguard_engine.dart';

class ForensicsScreen extends ConsumerStatefulWidget {
  const ForensicsScreen({super.key});

  @override
  ConsumerState<ForensicsScreen> createState() => _ForensicsScreenState();
}

class _ForensicsScreenState extends ConsumerState<ForensicsScreen> {
  List<Map<String, dynamic>> _manifest = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadManifest();
  }

  Future<void> _loadManifest() async {
    setState(() => _isLoading = true);
    try {
      final engine = ref.read(netGuardProvider.notifier);
      final plugin = engine.currentPlugin;
      if (plugin != null) {
        final manifest = await plugin.getForensicManifest();
        setState(() => _manifest = manifest);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to load manifest: $e")),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _viewChunk(String id) async {
    showDialog(
      context: context,
      builder: (c) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final engine = ref.read(netGuardProvider.notifier);
      final chunk = await engine.currentPlugin?.pullForensicChunk(id);
      Navigator.pop(context); // Close loader

      if (chunk != null) {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: const Color(0xFF0F172A),
          builder: (c) => Container(
            height: MediaQuery.of(context).size.height * 0.8,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("FORENSIC CHUNK DATA", style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                    IconButton(onPressed: () => Navigator.pop(c), icon: const Icon(Icons.close)),
                  ],
                ),
                const Divider(),
                Expanded(
                  child: SingleChildScrollView(
                    child: Text(
                      chunk,
                      style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Colors.greenAccent),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: ElevatedButton.icon(
                    onPressed: () async {
                      await engine.currentPlugin?.acknowledgeForensicChunk(id);
                      Navigator.pop(c);
                      _loadManifest();
                    },
                    icon: const Icon(Icons.check_circle_outline),
                    label: const Text("ACKNOWLEDGE & DELETE FROM ROUTER"),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent.withOpacity(0.2)),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
       Navigator.pop(context);
       ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text("FORENSICS CENTER", style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadManifest,
          ),
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _manifest.isEmpty
          ? const Center(child: Text("NO FORENSIC DATA AVAILABLE", style: TextStyle(color: Colors.white24)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _manifest.length,
              itemBuilder: (context, index) {
                final item = _manifest[index];
                return Card(
                  color: Colors.white.withOpacity(0.05),
                  child: ListTile(
                    leading: const Icon(Icons.document_scanner_rounded, color: Colors.amberAccent),
                    title: Text(item['id'] ?? "Unknown ID"),
                    subtitle: Text("Size: ${item['size'] ?? '0'} bytes"),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => _viewChunk(item['id']),
                  ),
                );
              },
            ),
    );
  }
}
