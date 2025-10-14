import * as Location from "expo-location";
import { ShoppingStore } from "@/types/shopping";

export interface Position {
  lat: number;
  lng: number;
}

export async function getCurrentPosition(): Promise<Position | null> {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Location permission not granted");
      return null;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    console.warn("Error getting current position:", error);
    return null;
  }
}

export function distanceMeters(a: Position, b: Position): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;

  const a1 = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1 - a1));

  return R * c; // Distance in meters
}

export function pickNearestStore(
  position: Position,
  stores: ShoppingStore[],
  thresholdMeters: number = 150
): ShoppingStore | null {
  if (!stores.length) return null;

  let nearest: ShoppingStore | null = null;
  let minDistance = Infinity;

  for (const store of stores) {
    if (!store.lat || !store.lng) continue;

    const distance = distanceMeters(position, {
      lat: store.lat,
      lng: store.lng,
    });

    if (distance < minDistance && distance <= thresholdMeters) {
      minDistance = distance;
      nearest = store;
    }
  }

  return nearest;
}
