/**
 * ============================================================================
 * NetGuard Pro - تعريف الـ Routes (التنقل)
 * ============================================================================
 * 
 * ⚠️ تحذير للنموذج Gemini:
 * 🚫 لا تحذف أي route موجود هنا!
 * 🚫 لا تستخدم <BrowserRouter> - Modelence يستخدم createBrowserRouter.
 * 🚫 لا تغير بنية التجميع (Private > AppLayout > routes).
 * 
 * 📋 بنية الـ Routes:
 * 
 * Public (بدون auth):
 * - /terms       : شروط الاستخدام
 * - /logout      : تسجيل خروج
 * 
 * Guest (فقط غير المسجلين):
 * - /login       : تسجيل دخول
 * - /signup      : إنشاء حساب
 * 
 * Private + Layout (مسجل دخول فقط):
 * - /            : Dashboard
 * - /devices     : Devices
 * - /settings    : Settings
 * - /logs        : Logs
 * - /errors      : Errors
 * - *            : 404 NotFound
 * 
 * ✨ ميزة: lazy loading لكل صفحة للسرعة.
 * ✨ ميزة: _redirect param في login للعودة للصفحة الأصلية.
 * ============================================================================
 */
import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouteObject, useLocation, useSearchParams } from 'react-router-dom';
import { useSession } from 'modelence/client';
import Layout from './components/Layout';

// For guest-only routes (login, signup) - redirects to home if already logged in
function GuestRoute() {
  const { user } = useSession();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const encodedRedirect = searchParams.get('_redirect');
  const redirect = encodedRedirect ? decodeURIComponent(encodedRedirect) : '/';

  if (user) {
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// For protected routes - redirects to login if not authenticated
function PrivateRoute() {
  const { user } = useSession();
  const location = useLocation();

  if (!user) {
    const fullPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?_redirect=${encodeURIComponent(fullPath)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}

// App layout wrapper for authenticated routes
function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// Public routes (no auth required)
const publicRoutes: RouteObject[] = [
  {
    path: '/terms',
    Component: lazy(() => import('./pages/TermsPage'))
  },
  {
    path: '/logout',
    Component: lazy(() => import('./pages/LogoutPage'))
  },
];

// Guest routes (redirect to home if already logged in)
const guestRoutes: RouteObject[] = [
  {
    path: '/login',
    Component: lazy(() => import('./pages/LoginPage'))
  },
  {
    path: '/signup',
    Component: lazy(() => import('./pages/SignupPage'))
  }
];

// Private routes with app layout (redirect to login if not authenticated)
const appRoutes: RouteObject[] = [
  {
    path: '/',
    Component: lazy(() => import('./pages/DashboardPage'))
  },
  {
    path: '/devices',
    Component: lazy(() => import('./pages/DevicesPage'))
  },
  {
    path: '/settings',
    Component: lazy(() => import('./pages/SettingsPage'))
  },
  {
    path: '/logs',
    Component: lazy(() => import('./pages/LogsPage'))
  },
  {
    path: '/errors',
    Component: lazy(() => import('./pages/ErrorsPage'))
  },
  {
    path: '*',
    Component: lazy(() => import('./pages/NotFoundPage'))
  }
];

export const router = createBrowserRouter([
  ...publicRoutes,
  {
    Component: GuestRoute,
    children: guestRoutes
  },
  {
    Component: PrivateRoute,
    children: [
      {
        Component: AppLayout,
        children: appRoutes
      }
    ]
  }
]);
