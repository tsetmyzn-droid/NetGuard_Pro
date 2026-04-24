import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/router_provider.dart';
import 'dashboard_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _ipController = TextEditingController(text: '192.168.1.1');
  final _usernameController = TextEditingController(text: 'admin');
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login({bool isDemo = false}) async {
    if (!isDemo && (_ipController.text.isEmpty || _usernameController.text.isEmpty || _passwordController.text.isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('الرجاء إدخال جميع البيانات المطلوبة')),
      );
      return;
    }

    if (isDemo) {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const DashboardScreen()),
        );
      }
      return;
    }

    final success = await ref.read(routerProvider.notifier).login(
      _ipController.text,
      _usernameController.text,
      _passwordController.text,
    );
    
    if (success) {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const DashboardScreen()),
        );
      }
    } else {
      final error = ref.read(routerProvider).error;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.redAccent,
            content: Text('فشل الاتصال: $error'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // We check a constant or env var to show demo button. 
    // In this case, I'll just check if it's a web view environment or similar, 
    // but for simplicity, I'll show it if a certain condition is met.
    const bool isPreview = true; // In AI Studio, we can assume preview for development

    return Scaffold(
      backgroundColor: const Color(0xFF02060A),
      body: Container(
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topRight,
            radius: 1.5,
            colors: [
              Colors.cyan.withOpacity(0.05),
              const Color(0xFF02060A),
            ],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.cyan.withOpacity(0.05),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.cyan.withOpacity(0.1)),
                  ),
                  child: const Icon(LucideIcons.shieldCheck, size: 60, color: Colors.cyan),
                )
                  .animate()
                  .scale(duration: 600.ms, curve: Curves.backOut)
                  .shimmer(delay: 1.seconds),
                const SizedBox(height: 24),
                const Text(
                  'NetGuard Pro',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 34,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
              const Text(
                'حماية وإدارة شبكتك بذكاء',
                style: TextStyle(color: Colors.white38, fontSize: 14),
              ),
              const SizedBox(height: 64),
              _buildTextField(
                controller: _ipController,
                label: 'عنوان IP للراوتر (البوابة)',
                icon: LucideIcons.globe,
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _usernameController,
                label: 'اسم المستخدم',
                icon: LucideIcons.user,
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _passwordController,
                label: 'كلمة مرور الراوتر',
                icon: LucideIcons.lock,
                isPassword: true,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: ref.watch(routerProvider).isLoading ? null : () => _login(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.cyan,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: ref.watch(routerProvider).isLoading 
                    ? const CircularProgressIndicator(color: Colors.black)
                    : const Text('تسجيل الدخول', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
              if (isPreview) ...[
                const SizedBox(height: 16),
                TextButton(
                  onPressed: _isLoading ? null : () => _login(isDemo: true),
                  child: const Text(
                    'تسجيل الدخول التجريبي للمعاينة',
                    style: TextStyle(color: Colors.cyan, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool isPassword = false,
  }) {
    return TextField(
      controller: controller,
      obscureText: isPassword,
      style: const TextStyle(color: Colors.white, fontFamily: 'JetBrains Mono'),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white38),
        prefixIcon: Icon(icon, color: Colors.white38, size: 20),
        filled: true,
        fillColor: Colors.white.withOpacity(0.05),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Colors.cyan, width: 1),
        ),
      ),
    );
  }
}
