import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatQuantity, listItems } from "@/lib/pantry";

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
        <ul className="card divide-y divide-lavender p-0">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/pantry/${item.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-lavender/50">
                <div>
                  <p className="font-semibold">
                    {item.name}
                    {!item.in_stock && <span className="ml-2 text-xs font-normal text-gray-500">(out of stock)</span>}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.categories?.name} · {formatQuantity(item)}
                  </p>
                </div>
                <p className="shrink-0 text-right text-sm text-gray-600">
                  <span className="block text-xs text-gray-400">Expires</span>
                  {formatDate(item.expires_on)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
