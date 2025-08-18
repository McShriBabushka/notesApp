// src/screens/LocationScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../store/hooks';
import {
  setCurrentLocation,
  setLocationError,
  setLocationLoading,
  setLocationTracking,
  clearLocationError,
} from '../store/slices/locationSlices';
import LocationService from '../services/LocationService';

const SimpleWebMap = ({ location, style }: { location: any; style: any }) => {
  if (!location) {
    return (
      <View style={[style, styles.mapPlaceholder]}>
        <Text style={styles.mapPlaceholderText}>
          Waiting for location...
        </Text>
      </View>
    );
  }

  const { latitude, longitude } = location;
  const zoom = 16; // Good zoom level for location tracking
  
  // Create HTML content for the map
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .info-box {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px;
          border-radius: 5px;
          font-size: 12px;
          z-index: 1000;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
      </style>
    </head>
    <body>
      <div class="info-box">
        <div>📶 Accuracy: ${location.accuracy?.toFixed(2) || 'N/A'}m</div>
        <div>🕐 ${new Date(location.timestamp).toLocaleTimeString()}</div>
      </div>
      <div id="map"></div>
      <script>
        // Initialize the map
        var map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add a marker for current location
        var marker = L.marker([${latitude}, ${longitude}]).addTo(map);
        marker.bindPopup('<b>Your Location</b><br>Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}').openPopup();
        
        // Add a circle to show accuracy
        var circle = L.circle([${latitude}, ${longitude}], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.1,
          radius: ${location.accuracy || 50}
        }).addTo(map);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[style, styles.mapContainer]}>
      <WebView
        source={{ html: mapHtml }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
      />
    </View>
  );
};

const LocationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { currentLocation, isTracking, error, loading } = useAppSelector(
    (state) => state.location
  );
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Subscribe to location updates when component mounts
    const unsubscribe = LocationService.subscribeToLocationUpdates((location) => {
      console.log('Location update received:', location);
      dispatch(setCurrentLocation(location));
    });

    unsubscribeRef.current = unsubscribe;

    // Get initial location
    handleGetCurrentLocation();

    return () => {
      // Cleanup on unmount
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      LocationService.unsubscribeFromLocationUpdates();
    };
  }, [dispatch]);

  const handleGetCurrentLocation = async () => {
    try {
      dispatch(setLocationLoading(true));
      dispatch(clearLocationError());
      
      const location = await LocationService.getCurrentLocation();
      dispatch(setCurrentLocation(location));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      dispatch(setLocationError(errorMessage));
      Alert.alert('Location Error', errorMessage);
    } finally {
      dispatch(setLocationLoading(false));
    }
  };

  const handleStartTracking = async () => {
    try {
      dispatch(setLocationLoading(true));
      dispatch(clearLocationError());
      
      const result = await LocationService.startLocationUpdates();
      dispatch(setLocationTracking(true));
      console.log('Location tracking started:', result);
      
      Alert.alert('Success', 'Location tracking started');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start tracking';
      dispatch(setLocationError(errorMessage));
      Alert.alert('Tracking Error', errorMessage);
    } finally {
      dispatch(setLocationLoading(false));
    }
  };

  const handleStopTracking = async () => {
    try {
      dispatch(setLocationLoading(true));
      dispatch(clearLocationError());
      
      const result = await LocationService.stopLocationUpdates();
      dispatch(setLocationTracking(false));
      console.log('Location tracking stopped:', result);
      
      Alert.alert('Success', 'Location tracking stopped');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop tracking';
      dispatch(setLocationError(errorMessage));
      Alert.alert('Tracking Error', errorMessage);
    } finally {
      dispatch(setLocationLoading(false));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Location Tracker</Text>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}
      </View>

      <SimpleWebMap 
        location={currentLocation} 
        style={styles.mapSection}
      />

      <View style={styles.controlsContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleGetCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>Get Location</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              isTracking ? styles.dangerButton : styles.successButton,
            ]}
            onPress={isTracking ? handleStopTracking : handleStartTracking}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Status: {isTracking ? '🟢 Tracking Active' : '🔴 Tracking Inactive'}
          </Text>
          {currentLocation && (
            <>
              <Text style={styles.statusText}>
                Provider: {currentLocation.provider || 'Unknown'}
              </Text>
              <Text style={styles.coordinatesText}>
                📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#EF4444',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
  mapSection: {
    flex: 1,
    margin: 20,
    borderRadius: 10,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  mapPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  mapPlaceholderText: {
    fontSize: 18,
    color: '#666',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#374151',
    marginVertical: 2,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#2563EB',
    marginVertical: 2,
  },
});

export default LocationScreen;