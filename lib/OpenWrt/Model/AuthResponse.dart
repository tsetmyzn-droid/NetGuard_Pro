class AuthResponse {
  final int? id;
  final String? result;
  final Map<String, dynamic>? error;

  AuthResponse({this.id, this.result, this.error});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      id: json['id'],
      result: json['result'],
      error: json['error'],
    );
  }

  bool get isSuccess => result != null && error == null;
}
