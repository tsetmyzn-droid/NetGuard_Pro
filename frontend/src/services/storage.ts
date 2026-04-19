/**
 * ============================================================================
 * NetGuard Pro - خدمة التخزين المشفر (Secure Storage Service)
 * ============================================================================
 * 
 * 🔐 الحماية: AES-256 Encryption
 * المسؤول عن:
 * 1. تشفير البيانات الحساسة قبل حفظها في LocalStorage
 * 2. تأمين بيانات الجلسة (Session) ضد الوصول المتطفل
 * 3. التعامل بمرونة مع بيئات المعاينة التي قد تعطل التخزين المحلي
 * ============================================================================
 */
import CryptoJS from 'crypto-js';

// مفتاح التشفير (في الإنتاج يجب أن يكون متغيراً بيئياً)
const SECRET_KEY = 'netguard-pro-safe-key-2026';

const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

const _storage = isStorageAvailable() ? localStorage : {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

export const SecureStorage = {
  /**
   * حفظ بيانات مشفرة
   */
  setItem: (key: string, value: any) => {
    try {
      const data = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
      _storage.setItem(key, encrypted);
    } catch (error) {
      console.warn('SecureStorage: Failed to set item', error);
    }
  },

  /**
   * استرجاع بيانات وفك تشفيرها
   */
  getItem: (key: string) => {
    try {
      const encrypted = _storage.getItem(key);
      if (!encrypted) return null;
      
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.warn('SecureStorage: Failed to get item', error);
      return null;
    }
  },

  /**
   * حذف مفتاح
   */
  removeItem: (key: string) => {
    try {
      _storage.removeItem(key);
    } catch (error) {
      console.warn('SecureStorage: Failed to remove item', error);
    }
  },

  /**
   * مسح كافة البيانات
   */
  clear: () => {
    try {
      _storage.clear();
    } catch (error) {
      console.warn('SecureStorage: Failed to clear', error);
    }
  }
};
