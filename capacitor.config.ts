import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kindora.app',
  appName: 'Kindora',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
