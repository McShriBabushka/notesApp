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
  downloadLocationHistory(): Promise<{
    filePath: string;
    fileName: string;
    recordCount: number;
  }>;
  getLocationHistoryCount(): Promise<number>;
  clearLocationHistory(): Promise<string>;
  checkLocationPermissions(): Promise<boolean>;
  requestLocationPermissions(): Promise<'GRANTED' | 'DENIED'>;
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

  public async checkLocationPermissions(): Promise<boolean> {
    if (!NativeLocationModule) {
      throw new Error('NativeLocationModule is not available');
    }
    return NativeLocationModule.checkLocationPermissions();
  }

  public async requestLocationPermissions(): Promise<'GRANTED' | 'DENIED'> {
    if (!NativeLocationModule) {
      throw new Error('NativeLocationModule is not available');
    }
    return NativeLocationModule.requestLocationPermissions();
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

  public async downloadLocationHistory() {
    if (!NativeLocationModule) {
      throw new Error('NativeLocationModule is not available');
    }
    return NativeLocationModule.downloadLocationHistory();
  }

  public async getLocationHistoryCount(): Promise<number> {
    if (!NativeLocationModule) {
      throw new Error('NativeLocationModule is not available');
    }
    return NativeLocationModule.getLocationHistoryCount();
  }

  public async clearLocationHistory(): Promise<string> {
    if (!NativeLocationModule) {
      throw new Error('NativeLocationModule is not available');
    }
    return NativeLocationModule.clearLocationHistory();
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