import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import type { RootStackScreenProps } from '../navigation/types';
import { fetchProductByBarcode } from '../services/openFoodFacts';

export default function ScannerScreen({ navigation }: RootStackScreenProps<'Scanner'>) {
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();
  const scanLock = useRef(false);            // blocks repeated scans instantly
  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBarcode, setLastBarcode] = useState('');

  // 1. Permission still loading
  if (!permission) {
    return <ActivityIndicator style={styles.center} size="large" />;
  }

  // 2. Permission not granted
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text variant="titleMedium" style={styles.centerText}>
          Camera access is needed to scan barcodes.
        </Text>
        {permission.canAskAgain ? (
          <Button mode="contained" onPress={requestPermission}>Allow camera</Button>
        ) : (
          <Button mode="contained" onPress={() => Linking.openSettings()}>Open settings</Button>
        )}
        <Button onPress={() => navigation.replace('ProductForm')}>Enter manually instead</Button>
      </View>
    );
  }

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanLock.current) return;            // already handling a scan
    scanLock.current = true;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLastBarcode(data);
    setLookingUp(true);
    setError(null);

    try {
      const info = await fetchProductByBarcode(data);
      navigation.replace(
        'ProductForm',
        info
          ? { barcode: data, name: info.name, brand: info.brand, imageUrl: info.imageUrl }
          : { barcode: data, notFound: true },
      );
    } catch {
      setError('Could not reach Open Food Facts. Check your internet connection.');
      setLookingUp(false);
      // the lock stays ON: the user chooses what to do next
    }
  };

  const retry = () => {
    setError(null);
    scanLock.current = false;
  };

  const busy = lookingUp || !!error;

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
          onBarcodeScanned={busy ? undefined : onBarcodeScanned}
        />
      )}

      {/* Aiming frame drawn over the camera */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame} />
        <Text style={styles.hint}>Point the camera at a barcode</Text>
      </View>

      {lookingUp && (
        <View style={styles.panel}>
          <ActivityIndicator />
          <Text>Looking up {lastBarcode}…</Text>
        </View>
      )}

      {error && (
        <View style={styles.panel}>
          <Text style={styles.error}>{error}</Text>
          <Button mode="contained" onPress={retry}>Scan again</Button>
          <Button onPress={() => navigation.replace('ProductForm', { barcode: lastBarcode, notFound: true })}>
            Enter manually
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  centerText: { textAlign: 'center' },
 overlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 16 },
  frame: { width: 260, height: 160, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 16 },
  hint: { color: '#FFFFFF', fontSize: 16 },
  panel: {
    position: 'absolute', left: 16, right: 16, bottom: 32,
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, gap: 8, alignItems: 'center',
  },
  error: { color: '#C62828', textAlign: 'center' },
});