import { Linking } from 'react-native';

export async function openHardwarePermissionSettings(): Promise<void> {
  await Linking.openSettings();
}
