import Link from "next/link";
import StarButton from "@/app/pantry/StarButton";
import { formatDate, formatQuantity, isStarred, type PantryItem } from "@/lib/pantry";

// Item rows with a star toggle. highlightOutOfStock is used on the Staples page.
export default function ItemList({
  items,
  highlightOutOfStock = false,
}: {
  items: PantryItem[];
  highlightOutOfStock?: boolean;
}) {
  return (
    <ul className="card divide-y divide-lavender overflow-hidden p-0">
      {items.map((item) => {
        const restock = highlightOutOfStock && !item.in_stock;
        return (
          <li
            key={item.id}
            className={`flex items-center gap-3 pl-4 ${restock ? "border-l-4 border-warning bg-amber-50" : ""}`}
          >
            <StarButton itemId={item.id} starred={isStarred(item)} />
            <Link
              href={`/pantry/${item.id}`}
              className="flex flex-1 items-center justify-between gap-4 py-4 pr-5 hover:opacity-80"
            >
              <div>
                <p className="font-semibold">
                  {item.name}
                  {!item.in_stock &&
                    (restock ? (
                      <span className="ml-2 rounded-full bg-warning px-2 py-0.5 text-xs font-bold text-white">
                        Out of stock
                      </span>
                    ) : (
                      <span className="ml-2 text-xs font-normal text-gray-500">(out of stock)</span>
                    ))}
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
        );
      })}
    </ul>
  );
}
