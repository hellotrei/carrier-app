import { Linking, Share } from 'react-native';

export async function shareExportedFile(filePath: string): Promise<void> {
  await Share.share({
    message: filePath,
    url: `file://${filePath}`,
  });
}

export async function openExportedFile(filePath: string): Promise<void> {
  const fileUrl = `file://${filePath}`;
  const supported = await Linking.canOpenURL(fileUrl);

  if (!supported) {
    throw new Error('No app is available to open this exported file.');
  }

  await Linking.openURL(fileUrl);
}
