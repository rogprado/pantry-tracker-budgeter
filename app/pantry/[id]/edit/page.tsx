import { notFound } from "next/navigation";
import { saveItem } from "@/app/pantry/actions";
import ItemForm from "@/app/pantry/ItemForm";
import { PageHeader } from "@/app/components/ui";
import { getItem, listCategories } from "@/lib/pantry";

export default async function EditItemPage({ params }: PageProps<"/pantry/[id]/edit">) {
  const { id } = await params;
  const item = Number.isInteger(Number(id)) ? await getItem(Number(id)) : null;
  if (!item) notFound();
  const categories = await listCategories();

  return (
    <div>
      <PageHeader eyebrow="Pantry" title={`Edit ${item.name}`} subtitle="Update what changed. Untick In stock when you run out." />
      <ItemForm
        action={saveItem.bind(null, item.id)}
        categories={categories}
        item={item}
        cancelHref={`/pantry/${item.id}`}
      />
    </div>
  );
}
