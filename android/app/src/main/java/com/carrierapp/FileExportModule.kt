package com.carrierapp

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

class FileExportModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "FileExportModule"

  private fun getExportsDir(): File {
    val exportsDir = File(reactApplicationContext.filesDir, "exports")
    if (!exportsDir.exists()) {
      exportsDir.mkdirs()
    }

    return exportsDir
  }

  @ReactMethod
  fun writeTextFile(fileName: String, content: String, promise: Promise) {
    try {
      val outputFile = File(getExportsDir(), fileName)
      outputFile.writeText(content, Charsets.UTF_8)

      promise.resolve(outputFile.absolutePath)
    } catch (error: Exception) {
      promise.reject("FILE_EXPORT_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun writeBundleZip(fileName: String, entries: ReadableMap, promise: Promise) {
    try {
      val outputFile = File(getExportsDir(), fileName)

      ZipOutputStream(FileOutputStream(outputFile)).use { zipOutputStream ->
        val iterator = entries.keySetIterator()

        while (iterator.hasNextKey()) {
          val path = iterator.nextKey()
          val content = entries.getString(path) ?: ""
          zipOutputStream.putNextEntry(ZipEntry(path))
          zipOutputStream.write(content.toByteArray(Charsets.UTF_8))
          zipOutputStream.closeEntry()
        }
      }

      promise.resolve(outputFile.absolutePath)
    } catch (error: Exception) {
      promise.reject("FILE_EXPORT_FAILED", error.message, error)
    }
  }
}
