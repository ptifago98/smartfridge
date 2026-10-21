import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import type { RootStackScreenProps } from '../navigation/types';
import { addProduct, getProduct, updateProduct } from '../services/products';
import { fromISODate, toISODate } from '../utils/expiry';




function today(): Date {
  const d = new Date();
  d.setDate(d.getDate());
  return d;
}

export default function ProductFormScreen({
  navigation,
  route,
}: RootStackScreenProps<"ProductForm">) {
  const params = route.params;                                         
  const productId = params?.productId;                                 
  const isEdit = !!productId;

  const [name, setName] = useState(params?.name ?? '');                
  const [brand, setBrand] = useState(params?.brand ?? '');             
  const [barcode, setBarcode] = useState(params?.barcode);             
  const [imageUrl, setImageUrl] = useState(params?.imageUrl);          
  const [date, setDate] = useState<Date>(today);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Header title depends on the mode
  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit product" : "Add product" });
  }, [navigation, isEdit]);

  // Edit mode: load the existing values once
  useEffect(() => {
    if (!productId) return;
    getProduct(productId).then((p) => {
      if (!p) return;
      setName(p.name);
      setBrand(p.brand ?? "");
      setDate(fromISODate(p.expiryDate));
      setBarcode(p.barcode);                                           
      setImageUrl(p.imageUrl);
    });
  }, [productId]);

  const onDatePicked = (_event: unknown, selected: Date) => {
    if (Platform.OS === "android") setShowPicker(false); // close the Android dialog
    setDate(selected);
  };

  const onDateDismissed = () => setShowPicker(false); // Android "Cancel"

  const save = async () => {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const data = {
        name: name.trim(),
        brand: brand.trim(),
        expiryDate: toISODate(date),
        barcode,                                                       
        imageUrl,
      };
      if (productId) {
        await updateProduct(productId, data);
      } else {
        await addProduct(data);
      }
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}

      {params?.notFound && (
        <Text style={styles.info}>
          Barcode {barcode} isn't in Open Food Facts yet. Please enter the details.
        </Text>
      )}
      <TextInput
        label="Name *"
        value={name}
        onChangeText={setName}
        mode="outlined"
      />
      <TextInput
        label="Brand"
        value={brand}
        onChangeText={setBrand}
        mode="outlined"
      />

      <View style={styles.dateRow}>
        <Text variant="bodyLarge">Expiry date</Text>
        {Platform.OS === "android" && (
          <Button
            mode="outlined"
            icon="calendar"
            onPress={() => setShowPicker(true)}
          >
            {date.toLocaleDateString()}
          </Button>
        )}
        {(Platform.OS === "ios" || showPicker) && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "compact" : "default"}
            onValueChange={onDatePicked}
            onDismiss={onDateDismissed}
          />
        )}
      </View>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <Button
        mode="contained"
        onPress={save}
        loading={saving}
        disabled={saving}
      >
        {isEdit ? "Save changes" : "Add to fridge"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  image: { width: '100%', height: 180, borderRadius: 12, resizeMode: 'contain' },   
  info: { backgroundColor: '#E3F4E8', padding: 12, borderRadius: 8 },               
});
