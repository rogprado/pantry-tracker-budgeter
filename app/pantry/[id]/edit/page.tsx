import { notFound } from "next/navigation";
import { saveItem } from "@/app/pantry/actions";
import ItemForm from "@/app/pantry/ItemForm";
import { getItem, listCategories } from "@/lib/pantry";

export default async function EditItemPage({ params }: PageProps<"/pantry/[id]/edit">) {
  const { id } = await params;
  const item = Number.isInteger(Number(id)) ? await getItem(Number(id)) : null;
  if (!item) notFound();
  const categories = await listCategories();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-heading">Edit {item.name}</h1>
      <ItemForm
        action={saveItem.bind(null, item.id)}
        categories={categories}
        item={item}
        cancelHref={`/pantry/${item.id}`}
      />
    </div>
  );
}
