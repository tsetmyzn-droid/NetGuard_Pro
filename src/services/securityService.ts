import CryptoJS from 'crypto-js';

// بروتوكول العمل للتعامل مع ثغرات الذكاء الاصطناعي (AI Sanitization Protocol)
// 1. التحقق من المدخلات (Input Validation)
// 2. تشفير البيانات الحساسة (Sensitive Data Encryption)
// 3. منع هجمات القوة الغاشمة (Brute Force Prevention)

class SecurityService {
  private secretKey = import.meta.env.VITE_ENCRYPTION_KEY || 'default_fallback_key_change_in_prod'; 
  private loginAttempts: Record<string, { count: number, lastAttempt: number }> = {};
  private MAX_ATTEMPTS = 5;
  private LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
  private SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  // تشفير بيانات الراوتر (AES-256)
  encryptData(data: any): string {
    try {
      const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
      return ciphertext;
    } catch (e) {
      console.error('Encryption Error:', e);
      return '';
    }
  }

  // فك تشفير بيانات الراوتر
  decryptData(ciphertext: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedData;
    } catch (e) {
      console.error('Decryption Error:', e);
      return null;
    }
  }

  // كشف هجمات Hydra / Brute Force
  checkBruteForce(ip: string): boolean {
    const now = Date.now();
    const attempt = this.loginAttempts[ip];

    if (attempt && now - attempt.lastAttempt < this.LOCKOUT_TIME && attempt.count >= this.MAX_ATTEMPTS) {
      console.warn(`SECURITY ALERT: IP ${ip} is currently locked out due to multiple failed attempts.`);
      return true;
    }

    if (!attempt || now - attempt.lastAttempt > this.LOCKOUT_TIME) {
      this.loginAttempts[ip] = { count: 1, lastAttempt: now };
    } else {
      this.loginAttempts[ip].count++;
      this.loginAttempts[ip].lastAttempt = now;
    }
    
    if (this.loginAttempts[ip].count > this.MAX_ATTEMPTS) {
      console.warn(`SECURITY ALERT: Potential Hydra attack detected from ${ip}. Locking out.`);
      return true;
    }
    return false;
  }

  // التحقق من انتهاء الجلسة
  isSessionExpired(lastActivity: number): boolean {
    return Date.now() - lastActivity > this.SESSION_TIMEOUT;
  }

  // محاكاة حماية "الرجل في المنتصف" (MITM Protection)
  // عبر التحقق من بصمة شهادة الراوتر (SSL Pinning Simulation)
  verifyRouterIdentity(routerIp: string, expectedFingerprint: string): boolean {
    // في التطبيق الحقيقي، يتم فحص شهادة SSL الخاصة بالراوتر
    // للمعاينة، نقوم بمحاكاة التحقق بناءً على وجود بصمة
    return expectedFingerprint.length > 0; 
  }

  // تفعيل "درع الخصوصية" (Screen Shield)
  enablePrivacyShield() {
    // إزالة المستمعات الوهمية التي تعطي شعوراً زائفاً بالأمان
    // والتركيز على حماية الطباعة فقط
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }
}

export const securityService = new SecurityService();
