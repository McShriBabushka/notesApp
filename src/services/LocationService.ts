// src/services/LocationService.ts
import { NativeModules, NativeEventEmitter, Platform, NativeModule } from 'react-native';

interface NativeLocationModuleInterface extends NativeModule{
  startLocationUpdates(): Promise<string>;
  stopLocationUpdates(): Promise<string>;
  getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  }>;
}

const { NativeLocationModule } = NativeModules as { NativeLocationModule: NativeLocationModuleInterface };

let locationEventEmitter: NativeEventEmitter | null = null;

if (Platform.OS === 'android' && NativeLocationModule) {
  locationEventEmitter = new NativeEventEmitter(NativeLocationModule);
}

export class LocationService {
  private static instance: LocationService;
  private locationListener: any = null;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  public async startLocationUpdates(): Promise<string> {
    if (!NativeLocationModule) {
      throw new Error('NativeLocationModule is not available');
    }
    return NativeLocationModule.startLocationUpdates();
  }

  public async stopLocationUpdates(): Promise<string> {
    if (!NativeLocationModule) {
      throw new Error('NativeLocationModule is not available');
    }
    return NativeLocationModule.stopLocationUpdates();
  }

  public async getCurrentLocation() {
    if (!NativeLocationModule) {
      throw new Error('NativeLocationModule is not available');
    }
    return NativeLocationModule.getCurrentLocation();
  }

  public subscribeToLocationUpdates(callback: (location: any) => void): (() => void) | null {
    if (!locationEventEmitter) {
      console.warn('Location event emitter is not available');
      return null;
    }

    this.locationListener = locationEventEmitter.addListener(
      'locationUpdate',
      callback
    );

    return () => {
      if (this.locationListener) {
        this.locationListener.remove();
        this.locationListener = null;
      }
    };
  }

  public unsubscribeFromLocationUpdates(): void {
    if (this.locationListener) {
      this.locationListener.remove();
      this.locationListener = null;
    }
  }
}

export default LocationService.getInstance();