package com.carrierapp

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class FileExportModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "FileExportModule"

  @ReactMethod
  fun writeTextFile(fileName: String, content: String, promise: Promise) {
    try {
      val exportsDir = File(reactApplicationContext.filesDir, "exports")
      if (!exportsDir.exists()) {
        exportsDir.mkdirs()
      }

      val outputFile = File(exportsDir, fileName)
      outputFile.writeText(content, Charsets.UTF_8)

      promise.resolve(outputFile.absolutePath)
    } catch (error: Exception) {
      promise.reject("FILE_EXPORT_FAILED", error.message, error)
    }
  }
}
