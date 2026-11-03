import Link from "next/link";
import ItemList from "@/app/pantry/ItemList";
import { listStaples } from "@/lib/pantry";

export default async function StaplesPage() {
  const staples = await listStaples();
  const toRestock = staples.filter((i) => !i.in_stock).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-heading">Staples</h1>
        <p className="text-sm text-gray-600">
          The items you always want at home.
          {toRestock > 0 && ` ${toRestock} need${toRestock === 1 ? "s" : ""} restocking.`}
        </p>
      </div>

      {staples.length === 0 ? (
        <div className="card text-gray-600">
          No staples yet. Tap the ☆ next to an item on your{" "}
          <Link href="/pantry" className="font-semibold text-primary">pantry</Link> to add it here.
        </div>
      ) : (
        <ItemList items={staples} highlightOutOfStock />
      )}
    </div>
  );
}
