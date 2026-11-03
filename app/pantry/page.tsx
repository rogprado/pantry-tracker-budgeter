import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ItemList from "@/app/pantry/ItemList";
import { listItems } from "@/lib/pantry";

export default async function PantryPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const items = await listItems();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">Your pantry</h1>
        <Link href="/pantry/new" className="btn">
          Add item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="card text-gray-600">Your pantry is empty. Add your first item to get started.</div>
      ) : (
        <ItemList items={items} />
      )}
    </div>
  );
}
