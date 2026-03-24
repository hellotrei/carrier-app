import UIKit
import React
import CoreLocation
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

  @objc(writeBundleZip:entries:resolver:rejecter:)
  func writeBundleZip(
    _ fileName: String,
    entries: NSDictionary,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    do {
      guard #available(iOS 16.0, *) else {
        reject("FILE_EXPORT_FAILED", "ZIP export requires iOS 16 or newer.", nil)
        return
      }

      let documentsUrl = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
      let exportsUrl = documentsUrl?.appendingPathComponent("exports", isDirectory: true)

      guard let exportsUrl else {
        reject("FILE_EXPORT_FAILED", "Documents directory is unavailable", nil)
        return
      }

      let tempDir = exportsUrl.appendingPathComponent(UUID().uuidString, isDirectory: true)
      try FileManager.default.createDirectory(at: tempDir, withIntermediateDirectories: true)

      for (key, value) in entries {
        guard let relativePath = key as? String, let content = value as? String else {
          continue
        }

        let fileUrl = tempDir.appendingPathComponent(relativePath)
        let parentDir = fileUrl.deletingLastPathComponent()
        try FileManager.default.createDirectory(at: parentDir, withIntermediateDirectories: true)
        try content.write(to: fileUrl, atomically: true, encoding: .utf8)
      }

      try FileManager.default.createDirectory(at: exportsUrl, withIntermediateDirectories: true)
      let destinationUrl = exportsUrl.appendingPathComponent(fileName)
      if FileManager.default.fileExists(atPath: destinationUrl.path) {
        try FileManager.default.removeItem(at: destinationUrl)
      }

      try FileManager.default.zipItem(at: tempDir, to: destinationUrl)
      try? FileManager.default.removeItem(at: tempDir)

      resolve(destinationUrl.path)
    } catch {
      reject("FILE_EXPORT_FAILED", error.localizedDescription, error)
    }
  }
}

@objc(LocationPermissionModule)
class LocationPermissionModule: NSObject, RCTBridgeModule, CLLocationManagerDelegate {
  private var locationManager: CLLocationManager?
  private var pendingResolve: RCTPromiseResolveBlock?

  static func moduleName() -> String! {
    "LocationPermissionModule"
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc(requestWhenInUseAuthorization:rejecter:)
  func requestWhenInUseAuthorization(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let status = CLLocationManager.authorizationStatus()

    if status == .authorizedAlways || status == .authorizedWhenInUse {
      resolve(true)
      return
    }

    if status == .denied || status == .restricted {
      resolve(false)
      return
    }

    pendingResolve = resolve

    let manager = CLLocationManager()
    manager.delegate = self
    locationManager = manager
    manager.requestWhenInUseAuthorization()
  }

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    let status = manager.authorizationStatus

    if status == .authorizedAlways || status == .authorizedWhenInUse {
      pendingResolve?(true)
      clearPendingCallbacks()
      return
    }

    if status == .denied || status == .restricted {
      pendingResolve?(false)
      clearPendingCallbacks()
    }
  }

  private func clearPendingCallbacks() {
    pendingResolve = nil
    locationManager = nil
  }
}
