import { NativeModules } from 'react-native';

type BundleEntries = Record<string, string>;

type FileExportNativeModule = {
  writeBundleZip: (
    fileName: string,
    entries: BundleEntries,
  ) => Promise<string>;
  writeTextFile: (fileName: string, content: string) => Promise<string>;
};

export type FileExportGateway = {
  writeBundleExportFile: (params: {
    entries: BundleEntries;
    extension: string;
    prefix: string;
  }) => Promise<string>;
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
    async writeBundleExportFile({ entries, extension, prefix }) {
      if (!nativeModule) {
        throw new Error('FileExportModule is unavailable.');
      }

      return nativeModule.writeBundleZip(
        buildFileName(prefix, extension),
        entries,
      );
    },
  };
}
