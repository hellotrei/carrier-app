import messaging, {
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import {
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

type LocationPermissionModule = {
  getWhenInUseAuthorizationStatus: () => Promise<'granted' | 'denied' | 'idle'>;
  requestWhenInUseAuthorization: () => Promise<boolean>;
};

export type HardwarePermissionGateway = {
  getLocationWhenInUseStatus: () => Promise<'granted' | 'denied' | 'idle'>;
  getNotificationStatus: () => Promise<'granted' | 'denied' | 'idle'>;
  getNotificationToken: () => Promise<string | null>;
  requestLocationWhenInUse: () => Promise<boolean>;
  requestNotifications: () => Promise<boolean>;
};

function getLocationPermissionModule(): LocationPermissionModule {
  const nativeModule = NativeModules as {
    LocationPermissionModule?: LocationPermissionModule;
  };

  if (!nativeModule.LocationPermissionModule) {
    throw new Error('Location permission module is unavailable.');
  }

  return nativeModule.LocationPermissionModule;
}

async function requestAndroidLocationPermission(): Promise<boolean> {
  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ]);

  return (
    result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED ||
    result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED
  );
}

async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.Version < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function getAndroidLocationPermissionStatus(): Promise<
  'granted' | 'denied' | 'idle'
> {
  const fineGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  const coarseGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  );

  return fineGranted || coarseGranted ? 'granted' : 'idle';
}

async function getAndroidNotificationPermissionStatus(): Promise<
  'granted' | 'denied' | 'idle'
> {
  if (Platform.Version < 33) {
    return 'granted';
  }

  const granted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return granted ? 'granted' : 'idle';
}

export function createNativeHardwarePermissionGateway(): HardwarePermissionGateway {
  return {
    async getLocationWhenInUseStatus() {
      if (Platform.OS === 'android') {
        return getAndroidLocationPermissionStatus();
      }

      return getLocationPermissionModule().getWhenInUseAuthorizationStatus();
    },
    async getNotificationStatus() {
      if (Platform.OS === 'android') {
        return getAndroidNotificationPermissionStatus();
      }

      const status = await messaging().hasPermission();

      if (
        status === AuthorizationStatus.AUTHORIZED ||
        status === AuthorizationStatus.PROVISIONAL
      ) {
        return 'granted';
      }

      return status === AuthorizationStatus.DENIED ? 'denied' : 'idle';
    },
    async getNotificationToken() {
      const notificationStatus = await this.getNotificationStatus();

      if (notificationStatus !== 'granted') {
        return null;
      }

      return messaging().getToken();
    },
    async requestLocationWhenInUse() {
      if (Platform.OS === 'android') {
        return requestAndroidLocationPermission();
      }

      return getLocationPermissionModule().requestWhenInUseAuthorization();
    },
    async requestNotifications() {
      if (Platform.OS === 'android') {
        return requestAndroidNotificationPermission();
      }

      const status = await messaging().requestPermission();

      return (
        status === AuthorizationStatus.AUTHORIZED ||
        status === AuthorizationStatus.PROVISIONAL
      );
    },
  };
}
