import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "@/app/pantry/DeleteButton";
import { formatDate, formatQuantity, getItem } from "@/lib/pantry";

export default async function ItemPage({ params }: PageProps<"/pantry/[id]">) {
  const { id } = await params;
  const item = Number.isInteger(Number(id)) ? await getItem(Number(id)) : null;
  if (!item) notFound();

  const rows: [string, string][] = [
    ["Category", item.categories?.name ?? "—"],
    ["Quantity", formatQuantity(item)],
    ["Price", item.price === null ? "—" : `$${Number(item.price).toFixed(2)}`],
    ["Purchased on", formatDate(item.purchased_on)],
    ["Expires on", formatDate(item.expires_on)],
    ["In stock", item.in_stock ? "Yes" : "No"],
  ];

  return (
    <div className="space-y-4">
      <Link href="/pantry" className="text-sm font-semibold text-primary">
        ← Back to pantry
      </Link>
      <div className="card space-y-4">
        <h1 className="text-2xl font-bold text-heading">{item.name}</h1>
        <dl className="divide-y divide-lavender">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between py-2">
              <dt className="text-gray-500">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex items-start gap-4 pt-2">
          <Link href={`/pantry/${item.id}/edit`} className="btn">
            Edit
          </Link>
          <div className="pt-2">
            <DeleteButton itemId={item.id} itemName={item.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
