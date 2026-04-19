/**
 * ============================================================================
 * NetGuard Pro - جسر الاتصال (API Service Bridge)
 * ============================================================================
 * 
 * 🛡️ تصميم المعمارية: عزل منطق البيانات عن الواجهة
 * المسؤول عن:
 * 1. الاتصال مع خادم Node.js
 * 2. معالجة البيانات القادمة من Python Core
 * 3. تشفير الطلبات الحساسة
 * ============================================================================
 */
import axios from 'axios';

const API_BASE = '/api';

export const NetGuardAPI = {
  // --- أجهزة الشبكة ---
  getDevices: async () => {
    const response = await axios.get(`${API_BASE}/devices`);
    return response.data;
  },

  // --- إحصائيات الراوتر ---
  getStats: async () => {
    const response = await axios.get(`${API_BASE}/stats`);
    return response.data;
  },

  // --- سجلات النظام ---
  getSystemLogs: async () => {
    const response = await axios.get(`${API_BASE}/system/logs`);
    return response.data;
  },

  // --- اكتشاف الراوتر ---
  detectRouter: async () => {
    const response = await axios.post(`${API_BASE}/router/detect`);
    return response.data;
  },

  // --- التحكم في الاتصال ---
  connectRouter: async (config: any) => {
    const response = await axios.post(`${API_BASE}/router/connect`, config);
    return response.data;
  }
};
