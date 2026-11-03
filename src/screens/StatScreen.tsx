import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, ProgressBar, Text, useTheme } from 'react-native-paper';
import { useFavourites } from '../hooks/useFavourites';
import { useMonthStats } from '../hooks/useMonthStats';
import { useActiveProducts } from '../hooks/useProducts';
import { expiryColors } from '../theme';
import { computeFridgeOverview, wasteMessage } from '../utils/stats';

/** One icon + number + label. */
function Stat(props: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <MaterialCommunityIcons name={props.icon} size={22} color={props.color} />
      <Text variant="titleMedium" style={{ color: props.color }}>
        {props.value}
      </Text>
      <Text>{props.label}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { stats, loading, error } = useMonthStats();
  const { products } = useActiveProducts();
  const { favourites } = useFavourites();

  const fridge = computeFridgeOverview(products);
  const monthName = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}

      {/* 1. This month */}
      <Card mode="outlined">
        <Card.Title title="This month" subtitle={monthName} />
        <Card.Content style={styles.content}>
          {stats && stats.total > 0 ? (
            <>
              <Text variant="displaySmall" style={{ color: theme.colors.primary }}>
                {Math.round(stats.consumedRate * 100)}%
              </Text>
              <Text>of your products were eaten</Text>
              <ProgressBar
                progress={stats.consumedRate}
                color={theme.colors.primary}
                style={[styles.bar, { backgroundColor: expiryColors.expired.bg }]}
              />
              <View style={styles.row}>
                <Stat icon="check-circle-outline" color={theme.colors.primary} value={stats.consumed} label="eaten" />
                <Stat icon="delete-outline" color={expiryColors.expired.fg} value={stats.thrown} label="thrown away" />
              </View>
              <Text variant="bodyMedium">{wasteMessage(stats.consumedRate)}</Text>
            </>
          ) : (
            <Text>
              Nothing eaten or thrown away yet this month. Mark products from their detail screen.
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* 2. Fridge right now */}
      <Card mode="outlined">
        <Card.Title title="In your fridge now" />
        <Card.Content style={styles.row}>
          <Stat icon="fridge-outline" color={theme.colors.onSurface} value={fridge.total} label="products" />
          <Stat icon="clock-alert-outline" color={expiryColors.soon.fg} value={fridge.soon} label="soon" />
          <Stat icon="alert-circle-outline" color={expiryColors.expired.fg} value={fridge.expired} label="expired" />
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Tabs', { screen: 'Fridge' })}>Open my fridge</Button>
        </Card.Actions>
      </Card>

      {/* 3. Favourites */}
      <Card mode="outlined">
        <Card.Title title="Favourite recipes" />
        <Card.Content>
          <Stat icon="heart" color={theme.colors.error} value={favourites.length} label="saved" />
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Favourites')}>See favourites</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  content: { gap: 8 },
  bar: { height: 10, borderRadius: 5 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});