import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as Haptics from "expo-haptics";

type Props = {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: { barcode: string }) => void;
};

export default function BarcodeScannerModal({ visible, onClose, onScanned }: Props) {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    if (!visible) return;
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

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={{ flex:1, backgroundColor:"#000" }}>
        {permission === false ? (
          <View style={styles.center}>
            <Text style={styles.msg}>Permiso de cámara denegado</Text>
            <TouchableOpacity onPress={onClose} style={styles.btn}><Text style={styles.btnTxt}>Cerrar</Text></TouchableOpacity>
          </View>
        ) : (
          <>
            <BarCodeScanner
              onBarCodeScanned={onCode}
              style={{ flex: 1 }}
            />
            <View style={styles.overlay}>
              <Text style={styles.overlayTxt}>Alinea el código de barras</Text>
              <TouchableOpacity onPress={onClose} style={styles.btn}><Text style={styles.btnTxt}>Cerrar</Text></TouchableOpacity>
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
});

