import { saveItem } from "@/app/pantry/actions";
import ItemForm from "@/app/pantry/ItemForm";
import { listCategories } from "@/lib/pantry";

export default async function NewItemPage() {
  const categories = await listCategories();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-heading">Add an item</h1>
      <ItemForm action={saveItem.bind(null, undefined)} categories={categories} cancelHref="/pantry" />
    </div>
  );
}
