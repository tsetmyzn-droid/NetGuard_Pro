import CryptoJS from 'crypto-js';

// خدمة الأمن - تشفير AES-256، حماية القوة الغاشمة، تخزين الآمن (IndexedDB)، التحقق من الهجمات

class SecurityService {
  private secretKey: string;
  private loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};
  private MAX_ATTEMPTS = 5;
  private LOCKOUT_TIME = 15 * 60 * 1000; // 15 دقيقة

  constructor() {
    this.secretKey =
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ENCRYPTION_KEY)
        || process.env.VITE_ENCRYPTION_KEY
        || 'default_fallback_key_change_in_prod';
  }

  // ========== التشفير وفك التشفير ==========
  encryptData(data: any): string {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
    } catch (error) {
      console.error('Encryption Error:', error);
      return '';
    }
  }

  decryptData(ciphertext: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption Error:', error);
      return null;
    }
  }

  // ========== حماية القوة الغاشمة - Brute Force ==========
  checkBruteForce(ip: string): boolean {
    const now = Date.now();
    if (!this.loginAttempts[ip]) {
      this.loginAttempts[ip] = { count: 0, lastAttempt: 0 };
    }
    let attempt = this.loginAttempts[ip];

    if (now - attempt.lastAttempt > this.LOCKOUT_TIME) {
      attempt.count = 0;
    }

    attempt.count++;
    attempt.lastAttempt = now;

    if (attempt.count > this.MAX_ATTEMPTS) {
      console.warn(`🔴 SECURITY ALERT: Brute Force attack detected from ${ip}`);
      return true;
    }
    return false;
  }

  // ========== التخزين الآمن (IndexedDB) ==========
  async saveCredentialsSecurely(credentials: any): Promise<boolean> {
    try {
      const encrypted = this.encryptData(credentials);
      await this._indexedDBSet('saved_credentials', encrypted);
      return true;
    } catch (error) {
      console.error('Failed to save credentials:', error);
      return false;
    }
  }

  async retrieveCredentialsSecurely(): Promise<any> {
    try {
      const encrypted = await this._indexedDBGet('saved_credentials');
      return encrypted ? this.decryptData(encrypted) : null;
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      return null;
    }
  }

  async deleteCredentialsSecurely(): Promise<boolean> {
    try {
      await this._indexedDBDelete('saved_credentials');
      return true;
    } catch (error) {
      console.error('Failed to delete credentials:', error);
      return false;
    }
  }

  // ========== IndexedDB Utils ==========
  private async _openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NetGuardProDB', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('secure_credentials')) {
          db.createObjectStore('secure_credentials');
        }
      };
    });
  }

  private async _indexedDBSet(key: string, value: any) {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['secure_credentials'], 'readwrite');
      const store = transaction.objectStore('secure_credentials');
      const request = store.put(value, key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  private async _indexedDBGet(key: string): Promise<any> {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['secure_credentials'], 'readonly');
      const store = transaction.objectStore('secure_credentials');
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  private async _indexedDBDelete(key: string) {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['secure_credentials'], 'readwrite');
      const store = transaction.objectStore('secure_credentials');
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  // ========== تحقق من هوية الراوتر (تعمية SSL Pinning (محاكاة)) ==========
  verifyRouterIdentity(_routerIp: string, expectedFingerprint: string): boolean {
    // لأغراض محاكاة! يجب فحص شهادة SSL فعليا في التطبيقات الحقيقية
    return !!expectedFingerprint;
  }
}

export const securityService = new SecurityService();
