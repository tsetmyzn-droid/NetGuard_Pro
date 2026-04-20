import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../data/models/router_model.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _ipController = TextEditingController(text: '192.168.1.1');
  final _passController = TextEditingController();
  RouterType _selectedType = RouterType.zte;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final themeMode = ref.watch(themeProvider);
    final isDark = themeMode == ThemeMode.dark;
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          // Background Gradient Glow
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                color: Colors.cyan.withOpacity(0.05),
                shape: BoxShape.circle,
              ),
            ).animate(onPlay: (controller) => controller.repeat(reverse: true))
             .scale(begin: const Offset(1, 1), end: const Offset(1.5, 1.5), duration: 5.seconds)
             .blur(begin: const Offset(50, 50), end: const Offset(100, 100)),
          ),
          
          SafeArea(
            child: Align(
              alignment: Alignment.topLeft,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: IconButton(
                  icon: Icon(isDark ? LucideIcons.sun : LucideIcons.moon, color: Colors.cyan),
                  onPressed: () => ref.read(themeProvider.notifier).toggleTheme(),
                ),
              ),
            ),
          ),

          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo Section
                  const Icon(LucideIcons.shieldCheck, size: 80, color: Colors.cyan)
                      .animate()
                      .scale(duration: 600.ms, curve: Curves.backOut)
                      .shimmer(delay: 800.ms, duration: 2.seconds),
                  
                  const SizedBox(height: 24),
                  
                  Text(
                    'NETGUARD PRO',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2, end: 0),
                  
                  const Text(
                    'NATIVE SECURITY ENGINE',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                      color: Colors.cyan,
                    ),
                  ).animate().fadeIn(delay: 400.ms),

                  const SizedBox(height: 60),

                  // Login Form Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(32),
                      border: Border.all(color: Colors.cyan.withOpacity(0.1)),
                      boxShadow: isDark ? [] : [
                        BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, spreadRadius: 0)
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _buildInputField(
                          context: context,
                          controller: _ipController,
                          label: 'GATEWAY IP',
                          icon: LucideIcons.network,
                        ),
                        const SizedBox(height: 20),
                        _buildInputField(
                          context: context,
                          controller: _passController,
                          label: 'ADMIN PASSWORD',
                          icon: LucideIcons.lock,
                          isPassword: true,
                        ),
                        const SizedBox(height: 20),
                        
                        // Router Type Selection
                        _buildTypeDropdown(context),
                        
                        const SizedBox(height: 32),
                        
                        if (authState.error != null)
                          _buildErrorSection(authState.error!),

                        SizedBox(
                          height: 56,
                          child: ElevatedButton(
                            onPressed: authState.isLoading ? null : _handleLogin,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.cyan,
                              foregroundColor: Colors.black,
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            child: authState.isLoading 
                              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 3, color: Colors.black))
                              : const Text('INITIATE CONNECTION', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1)),
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.1, end: 0),
                  
                  const SizedBox(height: 40),
                  Text(
                    'AUTHORIZED ACCESS ONLY',
                    style: TextStyle(
                      color: isDark ? Colors.white12 : Colors.black26, 
                      fontSize: 10, 
                      fontWeight: FontWeight.bold, 
                      letterSpacing: 1
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField({
    required BuildContext context,
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool isPassword = false,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: isDark ? Colors.white38 : Colors.black38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          obscureText: isPassword,
          style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontSize: 15, fontWeight: FontWeight.w600),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 18, color: Colors.cyan.withOpacity(0.5)),
            filled: true,
            fillColor: isDark ? Colors.black.withOpacity(0.3) : Colors.grey.withOpacity(0.1),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.cyan.withOpacity(0.1))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Colors.cyan)),
          ),
        ),
      ],
    );
  }

  Widget _buildTypeDropdown(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('ROUTER PROTOCOL', style: TextStyle(color: isDark ? Colors.white38 : Colors.black38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: isDark ? Colors.black.withOpacity(0.3) : Colors.grey.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.cyan.withOpacity(0.1)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<RouterType>(
              value: _selectedType,
              isExpanded: true,
              icon: const Icon(LucideIcons.chevronDown, size: 16, color: Colors.cyan),
              dropdownColor: isDark ? const Color(0xFF111111) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              items: RouterType.values.where((e) => e != RouterType.unknown).map((type) {
                return DropdownMenuItem(
                  value: type,
                  child: Text(
                    type.toString().split('.').last.toUpperCase(),
                    style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                );
              }).toList(),
              onChanged: (val) => setState(() => _selectedType = val!),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildErrorSection(String error) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.redAccent.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.redAccent.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.alertTriangle, color: Colors.redAccent, size: 16),
          const SizedBox(width: 12),
          Expanded(child: Text(error, style: const TextStyle(color: Colors.redAccent, fontSize: 12))),
        ],
      ),
    ).animate().shake();
  }

  void _handleLogin() async {
    final success = await ref.read(authProvider.notifier).login(
      _ipController.text,
      _passController.text,
      _selectedType,
    );
    
    if (!success && mounted) {
      Feedback.forTap(context);
    }
  }
}

  Widget _buildErrorSection(String error) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.redAccent.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.redAccent.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.alertTriangle, color: Colors.redAccent, size: 16),
          const SizedBox(width: 12),
          Expanded(child: Text(error, style: const TextStyle(color: Colors.redAccent, fontSize: 12))),
        ],
      ),
    ).animate().shake();
  }

  void _handleLogin() async {
    final success = await ref.read(authProvider.notifier).login(
      _ipController.text,
      _passController.text,
      _selectedType,
    );
    
    if (!success && mounted) {
      Feedback.forTap(context);
    }
  }
}
