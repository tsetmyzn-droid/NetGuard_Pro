/**
 * ============================================================================
 * NetGuard Pro - نقطة دخول الخادم (Server Entry Point)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تحذف routerModule من قائمة modules!
 * 🚫 لا تحذف startApp - هو الـ API الأساسي لـ Modelence.
 * 🚫 لا تستخدم Express/Fastify مباشرة.
 * 
 * 📦 Modules المسجلة:
 * - exampleModule : موجود في starter (يمكن حذفه لاحقاً)
 * - routerModule  : ⭐ الموديول الرئيسي لـ NetGuard Pro
 * 
 * 🔄 لإضافة module جديد:
 * 1. أنشئ مجلد جديد في src/server/newModule/
 * 2. أنشئ index.ts مع Module export
 * 3. أضف import هنا
 * 4. أضف في modules array
 * ============================================================================
 */
import { startApp } from 'modelence/server';
import exampleModule from '@/server/example';
import routerModule from '@/server/router';
import { createDemoUser } from '@/server/migrations/createDemoUser';

startApp({
  modules: [exampleModule, routerModule],

  security: {
    frameAncestors: ['https://modelence.com', 'https://*.modelence.com', 'http://localhost:*'],
  },

  migrations: [{
    version: 1,
    description: 'Create demo user',
    handler: createDemoUser,
  }],
});
