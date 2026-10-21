export type TabParamList = {
  Fridge: undefined;      // undefined = no params
  Recipes: undefined;
  Stats: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  ProductForm: { productId?: string } | undefined;  // optional: edit mode in week 2
};