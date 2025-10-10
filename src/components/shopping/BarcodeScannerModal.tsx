import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import * as Haptics from "expo-haptics";

// Try to import BarCodeScanner, fallback if not available
let BarCodeScanner: any = null;
try {
  const scanner = require("expo-barcode-scanner");
  BarCodeScanner = scanner.BarCodeScanner;
} catch (error) {
  console.warn("expo-barcode-scanner not available, using fallback");
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: { barcode: string }) => void;
};

export default function BarcodeScannerModal({ visible, onClose, onScanned }: Props) {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [handled, setHandled] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  useEffect(() => {
    if (!visible || !BarCodeScanner) return;
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setPermission(status === "granted");
      setHandled(false);
    })();
  }, [visible]);

  const onCode = async ({ data }: any) => {
    if (handled) return;
    setHandled(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onScanned({ barcode: String(data) });
    onClose();
  };

  const handleManualScan = async () => {
    if (manualBarcode.trim()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onScanned({ barcode: manualBarcode.trim() });
      setManualBarcode("");
      onClose();
    }
  };

  // If BarCodeScanner is not available, show manual input fallback
  if (!BarCodeScanner) {
    return (
      <Modal visible={visible} onRequestClose={onClose} animationType="slide" transparent>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>Enter Barcode Manually</Text>
            <Text style={styles.subtitle}>Camera scanning not available</Text>
            <TextInput
              value={manualBarcode}
              onChangeText={setManualBarcode}
              placeholder="Enter barcode number"
              keyboardType="number-pad"
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={[styles.btn, styles.ghost]}>
                <Text style={styles.ghostTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleManualScan} style={[styles.btn, styles.primary]}>
                <Text style={styles.btnTxt}>Scan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={{ flex:1, backgroundColor:"#000" }}>
        {permission === false ? (
          <View style={styles.center}>
            <Text style={styles.msg}>Camera permission denied</Text>
            <TouchableOpacity onPress={onClose} style={styles.btn}><Text style={styles.btnTxt}>Close</Text></TouchableOpacity>
          </View>
        ) : (
          <>
            <BarCodeScanner
              onBarCodeScanned={onCode}
              style={{ flex: 1 }}
            />
            <View style={styles.overlay}>
              <Text style={styles.overlayTxt}>Align the barcode</Text>
              <TouchableOpacity onPress={onClose} style={styles.btn}><Text style={styles.btnTxt}>Close</Text></TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center:{ flex:1, alignItems:"center", justifyContent:"center" },
  msg:{ color:"#fff", marginBottom:10, fontWeight:"700" },
  overlay:{ position:"absolute", bottom:20, alignSelf:"center", alignItems:"center", gap:10 },
  overlayTxt:{ color:"#fff", fontWeight:"800" },
  btn:{ backgroundColor:"#111827", paddingHorizontal:12, paddingVertical:10, borderRadius:10 },
  btnTxt:{ color:"#fff", fontWeight:"800" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 15, padding: 20, width: "80%", maxWidth: 400 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 20, textAlign: "center" },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  footer: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  primary: { backgroundColor: "#111827" },
  ghost: { backgroundColor: "#e5e7eb" },
  ghostTxt: { color: "#111827", fontWeight: "700", fontSize: 16 },
});

