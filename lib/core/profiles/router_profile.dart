import 'dart:convert';

class RouterProfile {
  final String id;
  final String name;
  final String ip;
  final String username;
  final bool useHttps;

  RouterProfile({
    required this.id,
    required this.name,
    required this.ip,
    required this.username,
    this.useHttps = true,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'ip': ip,
    'username': username,
    'useHttps': useHttps,
  };

  factory RouterProfile.fromJson(Map<String, dynamic> json) {
    return RouterProfile(
      id: json['id'],
      name: json['name'],
      ip: json['ip'],
      username: json['username'],
      useHttps: json['useHttps'] ?? true,
    );
  }
}
