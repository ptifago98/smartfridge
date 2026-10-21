import { useNavigation } from '@react-navigation/native';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, FAB, Text } from 'react-native-paper';
import { auth, db } from '../services/firebase';

export default function FridgeScreen() {
  const navigation = useNavigation();
  const [result, setResult] = useState('');

  const testFirestore = async () => {
    try {
      const uid = auth.currentUser!.uid;
      await setDoc(doc(db, 'users', uid, 'meta', 'ping'), { at: Date.now() });
      setResult('OK ✅');
    } catch (e) {
      setResult(String(e));
    }
  };

  return (
    <View style={styles.container}>          {/* ← the ONE parent */}
      <Text variant="titleMedium">My fridge</Text>

      <Text>User: {auth.currentUser?.uid}</Text>
      <Button mode="outlined" onPress={testFirestore} style={styles.button}>
        Test Firestore
      </Button>
      <Text>{result}</Text>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  button: { alignSelf: 'flex-start' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});