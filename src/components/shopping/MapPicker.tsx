import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MapPickerFallback from "./MapPickerFallback";

// Try to import react-native-maps, fallback if not available
let MapView: any = null;
let Marker: any = null;
let MapPressEvent: any = null;

try {
  const maps = require("react-native-maps");
  MapView = maps.MapView;
  Marker = maps.Marker;
  MapPressEvent = maps.MapPressEvent;
} catch (error) {
  console.warn("react-native-maps not available, using fallback");
}

type Props = {
  initial?: { lat: number; lng: number };
  onPick: (position: { lat: number; lng: number }) => void;
};

export default function MapPicker({ initial, onPick }: Props) {
  // If react-native-maps is not available, use fallback
  if (!MapView || !Marker) {
    return <MapPickerFallback initial={initial} onPick={onPick} />;
  }

  const [region, setRegion] = useState({
    latitude: initial?.lat || 18.48,
    longitude: initial?.lng || -69.91,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initial?.lat || 18.48,
    longitude: initial?.lng || -69.91,
  });

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
  };

  const handleUseLocation = () => {
    onPick({
      lat: markerPosition.latitude,
      lng: markerPosition.longitude,
    });
    Alert.alert("Location Selected", `Lat: ${markerPosition.latitude.toFixed(4)}, Lng: ${markerPosition.longitude.toFixed(4)}`);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={markerPosition}
          draggable={true}
          onDragEnd={(event: any) => {
            const { latitude, longitude } = event.nativeEvent.coordinate;
            setMarkerPosition({ latitude, longitude });
          }}
        />
      </MapView>
      
      <View style={styles.overlay}>
        <Text style={styles.instruction}>
          Tap on the map or drag the marker to set location
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleUseLocation}>
          <Text style={styles.buttonText}>Use This Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  instruction: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

