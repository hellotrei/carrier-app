import messaging, {
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import {
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

type LocationPermissionModule = {
  requestWhenInUseAuthorization: () => Promise<boolean>;
};

export type HardwarePermissionGateway = {
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

export function createNativeHardwarePermissionGateway(): HardwarePermissionGateway {
  return {
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
