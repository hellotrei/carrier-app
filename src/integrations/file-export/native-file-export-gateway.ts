import { NativeModules } from 'react-native';

type FileExportNativeModule = {
  writeTextFile: (fileName: string, content: string) => Promise<string>;
};

export type FileExportGateway = {
  writeExportFile: (params: {
    content: string;
    extension: string;
    prefix: string;
  }) => Promise<string>;
};

function buildFileName(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return `${prefix}-${timestamp}.${extension}`;
}

export function createNativeFileExportGateway(): FileExportGateway {
  const nativeModule = NativeModules
    .FileExportModule as FileExportNativeModule | undefined;

  return {
    async writeExportFile({ content, extension, prefix }) {
      if (!nativeModule) {
        throw new Error('FileExportModule is unavailable.');
      }

      return nativeModule.writeTextFile(
        buildFileName(prefix, extension),
        content,
      );
    },
  };
}
