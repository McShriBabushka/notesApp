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

const SimpleMap = ({ location, style }: { location: any; style: any }) => {
  if (!location) {
    return (
      <View style={[style, styles.mapPlaceholder]}>
        <Text style={styles.mapPlaceholderText}>
          Waiting for location...
        </Text>
      </View>
    );
  }

  return (
    <View style={[style, styles.mapContainer]}>
      {/* Simple representation - I'll replace with actual map later*/}
      <View style={styles.mapContent}>
        <View style={styles.pin} />
        <Text style={styles.coordinatesText}>
          📍 Lat: {location.latitude.toFixed(6)}
        </Text>
        <Text style={styles.coordinatesText}>
          📍 Lng: {location.longitude.toFixed(6)}
        </Text>
        <Text style={styles.accuracyText}>
          📶 Accuracy: {location.accuracy.toFixed(2)}m
        </Text>
        <Text style={styles.timestampText}>
          🕐 {new Date(location.timestamp).toLocaleTimeString()}
        </Text>
      </View>
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

      <SimpleMap 
        location={currentLocation} 
        style={styles.map}
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
            <Text style={styles.statusText}>
              Provider: {currentLocation.provider || 'Unknown'}
            </Text>
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
  map: {
    flex: 1,
    margin: 20,
    borderRadius: 10,
  },
  mapContainer: {
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 10,
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
  mapContent: {
    alignItems: 'center',
  },
  pin: {
    width: 20,
    height: 20,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coordinatesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
    marginVertical: 2,
  },
  accuracyText: {
    fontSize: 14,
    color: '#059669',
    marginVertical: 2,
  },
  timestampText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
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
});

export default LocationScreen;