import React from "react";
import MapPickerFallback from "./MapPickerFallback";

type Props = {
  initial?: { lat: number; lng: number };
  onPick: (position: { lat: number; lng: number }) => void;
};

export default function MapPicker({ initial, onPick }: Props) {
  // Always use fallback to avoid react-native-maps issues
  return <MapPickerFallback initial={initial} onPick={onPick} />;
}

