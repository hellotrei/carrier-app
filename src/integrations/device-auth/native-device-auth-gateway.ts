import ReactNativeBiometrics from 'react-native-biometrics';

export type DeviceAuthGateway = {
  authenticate: (promptMessage: string) => Promise<void>;
};

export function createNativeDeviceAuthGateway(): DeviceAuthGateway {
  const biometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });

  return {
    async authenticate(promptMessage: string) {
      const sensor = await biometrics.isSensorAvailable();

      if (!sensor.available) {
        throw new Error(sensor.error || 'Device authentication is unavailable.');
      }

      const result = await biometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
        fallbackPromptMessage: 'Use device credentials',
      });

      if (!result.success) {
        throw new Error(result.error || 'Device authentication was canceled.');
      }
    },
  };
}
