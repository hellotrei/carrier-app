/**
 * @format
 */

import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { handleBackgroundNotificationMessage } from './src/state/permission/permission-actions';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  await handleBackgroundNotificationMessage(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
