import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';

class AgentRequestSigner {
  /// توليد توقيع رقمي للطلب لضمان النزاهة والمصادقة
  /// [sharedKey]: المفتاح المشترك بين التطبيق والراوتر
  /// [method]: HTTP Method (GET, POST, etc.)
  /// [path]: المسار المطلوب (e.g., /cgi-bin/netguard/stats)
  /// [nonce]: رقم عشوائي فريد لمنع Replay Attacks
  /// [timestamp]: وقت الطلب بالثواني (Epoch)
  /// [body]: محتوى الطلب (اختياري)
  static String generateSignature({
    required String sharedKey,
    required String method,
    required String path,
    required String nonce,
    required int timestamp,
    String? body,
  }) {
    final key = utf8.encode(sharedKey);
    
    // بناء النص الذي سيتم توقيعه (Payload String)
    // نستخدم ترتيباً صارماً للحقول لضمان التطابق في جانب الراوتر
    final payload = [
      method.toUpperCase(),
      path,
      timestamp.toString(),
      nonce,
      body ?? '',
    ].join('|');

    final bytes = utf8.encode(payload);
    final hmac = Hmac(sha256, key);
    final digest = hmac.convert(bytes);

    return digest.toString();
  }

  /// توليد Nonce عشوائي بطول 16 حرفاً
  static String generateNonce() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    final rnd = Random.secure();
    return List.generate(16, (index) => chars[rnd.nextInt(chars.length)]).join();
  }

  /// جلب الوقت الحالي بالثواني
  static int currentTimestamp() {
    return DateTime.now().millisecondsSinceEpoch ~/ 1000;
  }
}
