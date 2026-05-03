import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'router_profile.dart';

class ProfileManager {
  static final ProfileManager _instance = ProfileManager._internal();
  factory ProfileManager() => _instance;
  ProfileManager._internal();

  final _storage = const FlutterSecureStorage();
  static const String _profilesKey = 'netguard_profiles';
  static const String _activeProfileKey = 'netguard_active_profile';

  Future<List<RouterProfile>> getProfiles() async {
    final prefs = await SharedPreferences.getInstance();
    final String? profilesJson = prefs.getString(_profilesKey);
    if (profilesJson == null) return [];
    
    final List<dynamic> decoded = jsonDecode(profilesJson);
    return decoded.map((item) => RouterProfile.fromJson(item)).toList();
  }

  Future<void> saveProfile(RouterProfile profile, String password) async {
    final prefs = await SharedPreferences.getInstance();
    final profiles = await getProfiles();
    
    // Check if updating existing
    final index = profiles.indexWhere((p) => p.id == profile.id);
    if (index != -1) {
      profiles[index] = profile;
    } else {
      profiles.add(profile);
    }

    await prefs.setString(_profilesKey, jsonEncode(profiles.map((p) => p.toJson()).toList()));
    
    // Encrypt password
    await _storage.write(key: 'pwd_${profile.id}', value: password);
  }

  Future<String?> getProfilePassword(String profileId) async {
    return await _storage.read(key: 'pwd_$profileId');
  }

  Future<void> deleteProfile(String profileId) async {
    final prefs = await SharedPreferences.getInstance();
    final profiles = await getProfiles();
    profiles.removeWhere((p) => p.id == profileId);
    await prefs.setString(_profilesKey, jsonEncode(profiles.map((p) => p.toJson()).toList()));
    await _storage.delete(key: 'pwd_$profileId');
  }

  Future<void> setActiveProfileId(String? id) async {
    final prefs = await SharedPreferences.getInstance();
    if (id == null) {
      await prefs.remove(_activeProfileKey);
    } else {
      await prefs.setString(_activeProfileKey, id);
    }
  }

  Future<String?> getActiveProfileId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_activeProfileKey);
  }
}
