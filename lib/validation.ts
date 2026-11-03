// Validation rules for the pantry item form.
// Shared by the browser (instant messages) and the server action (the real check).

export type ItemField = "name" | "category" | "quantity" | "price";
export type FieldErrors = Partial<Record<ItemField, string>>;

// The raw text the user typed, keyed by form field name.
export type ItemFormValues = {
  name: string;
  category_id: string;
  new_category: string;
  quantity: string;
  unit: string;
  price: string;
  purchased_on: string;
  expires_on: string;
  in_stock: boolean;
};

export const NEW_CATEGORY = "new";

export function readItemForm(formData: FormData): ItemFormValues {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  return {
    name: text("name"),
    category_id: text("category_id"),
    new_category: text("new_category"),
    quantity: text("quantity"),
    unit: text("unit"),
    price: text("price"),
    purchased_on: text("purchased_on"),
    expires_on: text("expires_on"),
    in_stock: formData.get("in_stock") === "on",
  };
}

export function validateItem(v: ItemFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!v.name) errors.name = "Please enter a name.";

  if (!v.category_id) errors.category = "Please choose a category.";
  else if (v.category_id === NEW_CATEGORY && !v.new_category)
    errors.category = "Please type a name for the new category.";

  if (!v.quantity) errors.quantity = "Please enter a quantity.";
  else if (!Number.isFinite(Number(v.quantity))) errors.quantity = "Quantity needs to be a number.";
  else if (Number(v.quantity) < 0) errors.quantity = "Quantity can't be negative.";

  if (v.price) {
    if (!Number.isFinite(Number(v.price))) errors.price = "Price needs to be a number.";
    else if (Number(v.price) < 0) errors.price = "Price can't be negative.";
  }

  return errors;
}
