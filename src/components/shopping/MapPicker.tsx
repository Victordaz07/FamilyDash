import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";

export default function MapPicker({
  initial, onPick
}: { initial?: {lat:number; lng:number}; onPick: (p:{lat:number; lng:number}) => void }) {
  const [pos, setPos] = useState(initial ?? { lat: 18.48, lng: -69.91 });

  const onPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPos({ lat: latitude, lng: longitude });
  };

  return (
    <View style={{ height: 260, borderRadius: 12, overflow: "hidden" }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: pos.lat, longitude: pos.lng, latitudeDelta: 0.02, longitudeDelta: 0.02
        }}
        onPress={onPress}
      >
        <Marker coordinate={{ latitude: pos.lat, longitude: pos.lng }} />
      </MapView>
      <TouchableOpacity style={styles.save} onPress={() => onPick(pos)}>
        <Text style={styles.saveTxt}>Usar esta ubicación</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  save: { position: "absolute", bottom: 10, alignSelf: "center", backgroundColor: "#111827cc", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  saveTxt: { color: "#fff", fontWeight: "800" }
});

