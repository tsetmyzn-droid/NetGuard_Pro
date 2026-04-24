import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'features/router/presentation/screens/login_screen.dart';
import 'core/utils/theme_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: NetGuardApp(),
    ),
  );
}

class NetGuardApp extends ConsumerWidget {
  const NetGuardApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);
    
    return MaterialApp(
      title: 'NetGuard Pro',
      debugShowCheckedModeBanner: false,
      themeMode: themeMode,
      theme: ThemeData(
        brightness: Brightness.light,
        primarySwatch: Colors.cyan,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        textTheme: GoogleFonts.tajawalTextTheme(ThemeData.light().textTheme),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          iconTheme: IconThemeData(color: Colors.black87),
        ),
        colorScheme: ColorScheme.light(
          primary: Colors.cyan,
          secondary: Colors.cyanAccent,
          surface: Colors.white,
          background: const Color(0xFFF8FAFC),
        ),
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.cyan,
        scaffoldBackgroundColor: const Color(0xFF050A0F),
        textTheme: GoogleFonts.tajawalTextTheme(ThemeData.dark().textTheme),
        colorScheme: const ColorScheme.dark(
          primary: Colors.cyan,
          secondary: Colors.cyanAccent,
          surface: Color(0xFF0A1118),
          background: Color(0xFF050A0F),
        ),
      ),
      home: const LoginScreen(),
    );
  }
}
