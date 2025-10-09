import { Linking, Platform } from "react-native";

export function openInMaps(lat: number, lng: number, label?: string) {
  const qLabel = encodeURIComponent(label || "Store");
  if (Platform.OS === "ios") {
    const url = `http://maps.apple.com/?ll=${lat},${lng}&q=${qLabel}`;
    Linking.openURL(url);
  } else {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${qLabel}`;
    Linking.openURL(url);
  }
}

