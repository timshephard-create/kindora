import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.famly.app',
  appName: 'Famly',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
