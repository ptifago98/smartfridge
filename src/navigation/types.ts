import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type TabParamList = {
  Fridge: undefined;
  Recipes: undefined;
  Stats: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  ProductForm:
    | {
        productId?: string;   // edit mode
        barcode?: string;     // from the scanner
        name?: string;
        brand?: string;
        imageUrl?: string;
        notFound?: boolean;   // scanned but unknown in Open Food Facts
      }
    | undefined;
  ProductDetail: { productId: string };
  Scanner: undefined;
};

/** Props type for stack screens: gives typed `navigation` and `route`. */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Makes useNavigation() typed in every screen
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}