import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "CarrierApp",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

@objc(FileExportModule)
class FileExportModule: NSObject, RCTBridgeModule {
  static func moduleName() -> String! {
    "FileExportModule"
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc(writeTextFile:content:resolver:rejecter:)
  func writeTextFile(
    _ fileName: String,
    content: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    do {
      let documentsUrl = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
      let exportsUrl = documentsUrl?.appendingPathComponent("exports", isDirectory: true)

      guard let exportsUrl else {
        reject("FILE_EXPORT_FAILED", "Documents directory is unavailable", nil)
        return
      }

      try FileManager.default.createDirectory(at: exportsUrl, withIntermediateDirectories: true)
      let fileUrl = exportsUrl.appendingPathComponent(fileName)
      try content.write(to: fileUrl, atomically: true, encoding: .utf8)
      resolve(fileUrl.path)
    } catch {
      reject("FILE_EXPORT_FAILED", error.localizedDescription, error)
    }
  }
}
