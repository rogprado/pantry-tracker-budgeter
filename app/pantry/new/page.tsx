import { saveItem } from "@/app/pantry/actions";
import ItemForm from "@/app/pantry/ItemForm";
import { PageHeader } from "@/app/components/ui";
import { listCategories } from "@/lib/pantry";

export default async function NewItemPage() {
  const categories = await listCategories();
  return (
    <div>
      <PageHeader eyebrow="Pantry" title="Add to your shelves" subtitle="Just back from the shop? Add what you bought. Only the name, category and quantity are needed." />
      <ItemForm action={saveItem.bind(null, undefined)} categories={categories} cancelHref="/pantry" />
    </div>
  );
}
