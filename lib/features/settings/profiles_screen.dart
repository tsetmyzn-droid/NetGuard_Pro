import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:netguard_pro/core/profiles/router_profile.dart';
import 'package:netguard_pro/core/profiles/profile_manager.dart';
import 'package:netguard_pro/core/engine/netguard_engine.dart';
import 'package:netguard_pro/core/plugins/router_factory.dart';

class ProfilesScreen extends ConsumerStatefulWidget {
  const ProfilesScreen({super.key});

  @override
  ConsumerState<ProfilesScreen> createState() => _ProfilesScreenState();
}

class _ProfilesScreenState extends ConsumerState<ProfilesScreen> {
  final ProfileManager _manager = ProfileManager();
  List<RouterProfile> _profiles = [];
  String? _activeId;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final list = await _manager.getProfiles();
    final active = await _manager.getActiveProfileId();
    if (mounted) {
      setState(() {
        _profiles = list;
        _activeId = active;
        _isLoading = false;
      });
    }
  }

  Future<void> _addProfile() async {
    final nameCtrl = TextEditingController();
    final ipCtrl = TextEditingController();
    final userCtrl = TextEditingController(text: "admin");
    final passCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text("ADD NEW ROUTER", style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildField("Display Name (e.g. Living Room)", nameCtrl),
              _buildField("IP Address (e.g. 192.168.1.1)", ipCtrl),
              _buildField("Username", userCtrl),
              _buildField("Password", passCtrl, isPassword: true),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("CANCEL")),
          ElevatedButton(
            onPressed: () async {
              if (nameCtrl.text.isEmpty || ipCtrl.text.isEmpty || passCtrl.text.isEmpty) return;
              
              final id = DateTime.now().millisecondsSinceEpoch.toString();
              final profile = RouterProfile(
                id: id,
                name: nameCtrl.text,
                ip: ipCtrl.text,
                username: userCtrl.text,
              );
              
              await _manager.saveProfile(profile, passCtrl.text);
              Navigator.pop(context);
              _load();
            },
            child: const Text("SAVE"),
          ),
        ],
      ),
    );
  }

  Widget _buildField(String label, TextEditingController ctrl, {bool isPassword = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: ctrl,
        obscureText: isPassword,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white38, fontSize: 12),
          filled: true,
          fillColor: Colors.black26,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text("ROUTER PROFILES", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addProfile,
        backgroundColor: Colors.blueAccent,
        child: const Icon(Icons.add_rounded),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator()) 
        : _profiles.isEmpty 
          ? const Center(child: Text("NO PROFILES ADDED", style: TextStyle(color: Colors.white12)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _profiles.length,
              itemBuilder: (context, index) {
                final p = _profiles[index];
                final isActive = p.id == _activeId;

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: isActive ? Colors.blueAccent.withOpacity(0.1) : Colors.white.withOpacity(0.04),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isActive ? Colors.blueAccent.withOpacity(0.3) : Colors.white10),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    title: Text(p.name.toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Text("${p.ip} (${p.username})", style: const TextStyle(color: Colors.white38, fontSize: 11)),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (!isActive)
                          IconButton(
                            icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                            onPressed: () async {
                              await _manager.deleteProfile(p.id);
                              _load();
                            },
                          ),
                        const Icon(Icons.chevron_right_rounded, color: Colors.white24),
                      ],
                    ),
                    onTap: () async {
                      if (isActive) return;
                      
                      final password = await _manager.getProfilePassword(p.id);
                      if (password != null) {
                        await _manager.setActiveProfileId(p.id);
                        final plugin = await RouterFactory.create(p.ip, p.username, password);
                        ref.read(netGuardProvider.notifier).initialize(plugin);
                        if (mounted) {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text("Switched to ${p.name}")),
                          );
                        }
                      }
                    },
                  ),
                );
              },
            ),
    );
  }
}
