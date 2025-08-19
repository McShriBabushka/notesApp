package com.notesapp

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Environment
import android.os.Looper
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList

class NativeLocationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LocationListener {

    private var locationManager: LocationManager? = null
    private var lastKnownLocation: Location? = null
    private val MIN_DISTANCE_CHANGE_FOR_UPDATES = 50f // 50 meters
    private val MIN_TIME_BW_UPDATES = 10000L // 10 seconds
    
    // Store location history for CSV export
    private val locationHistory = ArrayList<LocationData>()

    companion object {
        const val NAME = "NativeLocationModule"
        const val LOCATION_UPDATE_EVENT = "locationUpdate"
        const val TAG = "NativeLocationModule"
    }

    data class LocationData(
        val latitude: Double,
        val longitude: Double,
        val accuracy: Float,
        val timestamp: Long,
        val provider: String,
        val dateTime: String
    )

    override fun getName(): String {
        return NAME
    }

    init {
        setupLocationManager()
    }

    private fun setupLocationManager() {
        try {
            locationManager = reactApplicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        } catch (e: Exception) {
            Log.e(TAG, "Error setting up location manager", e)
        }
    }

    @ReactMethod
    fun startLocationUpdates(promise: Promise) {
        try {
            if (locationManager == null) {
                promise.reject("LOCATION_MANAGER_NULL", "Location manager is null")
                return
            }

            // For this example, we're hardcoding permissions as true 
            val hasPermission = true

            if (!hasPermission) {
                promise.reject("PERMISSION_DENIED", "Location permissions not granted")
                return
            }

            // Check if GPS provider is enabled
            val isGPSEnabled = locationManager!!.isProviderEnabled(LocationManager.GPS_PROVIDER)
            val isNetworkEnabled = locationManager!!.isProviderEnabled(LocationManager.NETWORK_PROVIDER)

            if (!isGPSEnabled && !isNetworkEnabled) {
                promise.reject("LOCATION_DISABLED", "Location services are disabled")
                return
            }

            // Start location updates
            if (isGPSEnabled) {
                locationManager!!.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    MIN_TIME_BW_UPDATES,
                    MIN_DISTANCE_CHANGE_FOR_UPDATES,
                    this,
                    Looper.getMainLooper()
                )
            }
            
            if (isNetworkEnabled) {
                locationManager!!.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    MIN_TIME_BW_UPDATES,
                    MIN_DISTANCE_CHANGE_FOR_UPDATES,
                    this,
                    Looper.getMainLooper()
                )
            }

            // Try to get last known location immediately
            getLastKnownLocation()
            
            promise.resolve("Location updates started")
            Log.d(TAG, "Location updates started successfully")

        } catch (e: Exception) {
            Log.e(TAG, "Error starting location updates", e)
            promise.reject("START_LOCATION_ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopLocationUpdates(promise: Promise) {
        try {
            locationManager?.removeUpdates(this)
            promise.resolve("Location updates stopped")
            Log.d(TAG, "Location updates stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping location updates", e)
            promise.reject("STOP_LOCATION_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getCurrentLocation(promise: Promise) {
        try {
            getLastKnownLocation()
            if (lastKnownLocation != null) {
                val locationData = Arguments.createMap().apply {
                    putDouble("latitude", lastKnownLocation!!.latitude)
                    putDouble("longitude", lastKnownLocation!!.longitude)
                    putDouble("accuracy", lastKnownLocation!!.accuracy.toDouble())
                    putDouble("timestamp", lastKnownLocation!!.time.toDouble())
                }
                promise.resolve(locationData)
            } else {
                promise.reject("NO_LOCATION", "No location available")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting current location", e)
            promise.reject("GET_LOCATION_ERROR", e.message)
        }
    }

    @ReactMethod
    fun downloadLocationHistory(promise: Promise) {
        try {
            if (locationHistory.isEmpty()) {
                promise.reject("NO_DATA", "No location data to export")
                return
            }

            val csvContent = generateCSVContent()
            val fileName = "location_history_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())}.csv"
            
            // Use Downloads directory which is accessible to user
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val appDir = File(downloadsDir, "LocationTracker")
            
            if (!appDir.exists()) {
                appDir.mkdirs()
            }
            
            val file = File(appDir, fileName)
            
            FileWriter(file).use { writer ->
                writer.write(csvContent)
            }
            
            val result = Arguments.createMap().apply {
                putString("filePath", file.absolutePath)
                putString("fileName", fileName)
                putInt("recordCount", locationHistory.size)
            }
            
            promise.resolve(result)
            Log.d(TAG, "CSV file saved successfully: ${file.absolutePath}")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error downloading location history", e)
            promise.reject("DOWNLOAD_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getLocationHistoryCount(promise: Promise) {
        try {
            promise.resolve(locationHistory.size)
        } catch (e: Exception) {
            promise.reject("COUNT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearLocationHistory(promise: Promise) {
        try {
            locationHistory.clear()
            promise.resolve("Location history cleared")
            Log.d(TAG, "Location history cleared")
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing location history", e)
            promise.reject("CLEAR_ERROR", e.message)
        }
    }

    private fun generateCSVContent(): String {
        val header = "Latitude,Longitude,Accuracy,Timestamp,DateTime,Provider\n"
        val rows = locationHistory.joinToString("\n") { location ->
            "${location.latitude},${location.longitude},${location.accuracy},${location.timestamp},\"${location.dateTime}\",${location.provider}"
        }
        return header + rows
    }

    private fun getLastKnownLocation() {
        try {
            if (locationManager != null) {
                val gpsLocation = locationManager!!.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                val networkLocation = locationManager!!.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)

                // Choose the most accurate location
                lastKnownLocation = when {
                    gpsLocation != null && networkLocation != null -> {
                        if (gpsLocation.accuracy < networkLocation.accuracy) gpsLocation else networkLocation
                    }
                    gpsLocation != null -> gpsLocation
                    networkLocation != null -> networkLocation
                    else -> null
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting last known location", e)
        }
    }

    private fun sendLocationUpdate(location: Location) {
        try {
            val params = Arguments.createMap().apply {
                putDouble("latitude", location.latitude)
                putDouble("longitude", location.longitude)
                putDouble("accuracy", location.accuracy.toDouble())
                putDouble("timestamp", location.time.toDouble())
                putString("provider", location.provider ?: "unknown")
            }

            reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(LOCATION_UPDATE_EVENT, params)

            // Store location in history for CSV export
            val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
            val locationData = LocationData(
                latitude = location.latitude,
                longitude = location.longitude,
                accuracy = location.accuracy,
                timestamp = location.time,
                provider = location.provider ?: "unknown",
                dateTime = dateFormat.format(Date(location.time))
            )
            locationHistory.add(locationData)

            Log.d(TAG, "Location update sent and stored: ${location.latitude}, ${location.longitude}")
        } catch (e: Exception) {
            Log.e(TAG, "Error sending location update", e)
        }
    }

    // LocationListener methods
    override fun onLocationChanged(location: Location) {
        Log.d(TAG, "Location changed: ${location.latitude}, ${location.longitude}")
        
        // Check if location has changed significantly (50m threshold is handled by the system)
        if (shouldUpdateLocation(location)) {
            lastKnownLocation = location
            sendLocationUpdate(location)
        }
    }

    private fun shouldUpdateLocation(newLocation: Location): Boolean {
        if (lastKnownLocation == null) {
            return true
        }
        
        val distance = lastKnownLocation!!.distanceTo(newLocation)
        return distance >= MIN_DISTANCE_CHANGE_FOR_UPDATES
    }

    @Deprecated("Deprecated in API level 29")
    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {
        Log.d(TAG, "Location provider status changed: $provider, status: $status")
    }

    override fun onProviderEnabled(provider: String) {
        Log.d(TAG, "Location provider enabled: $provider")
    }

    override fun onProviderDisabled(provider: String) {
        Log.d(TAG, "Location provider disabled: $provider")
    }
}