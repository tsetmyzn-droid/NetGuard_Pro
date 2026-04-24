import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'features/router/presentation/screens/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: NetGuardApp(),
    ),
  );
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
        primarySwatch: Colors.cyan,
        scaffoldBackgroundColor: const Color(0xFF050A0F),
        textTheme: GoogleFonts.tajawalTextTheme(ThemeData.dark().textTheme),
        colorScheme: const ColorScheme.dark(
          primary: Colors.cyan,
          secondary: Colors.cyanAccent,
          surface: Color(0xFF0A1118),
        ),
      ),
      home: const LoginScreen(),
    );
  }
}
