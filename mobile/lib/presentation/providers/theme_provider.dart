import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  return ThemeNotifier();
});

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier() : super(ThemeMode.dark) {
    _loadTheme();
  }

  void _loadTheme() {
    final box = Hive.box('settings');
    final isDark = box.get('isDarkMode', defaultValue: true);
    state = isDark ? ThemeMode.dark : ThemeMode.light;
  }

  void toggleTheme() {
    final box = Hive.box('settings');
    if (state == ThemeMode.dark) {
      state = ThemeMode.light;
      box.put('isDarkMode', false);
    } else {
      state = ThemeMode.dark;
      box.put('isDarkMode', true);
    }
  }
}
