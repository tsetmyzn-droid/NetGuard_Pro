import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.netguardpro.app',
  appName: 'NetGuard Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
