import { ArrowLeft, CalendarCheck, CalendarClock, Pencil, Receipt, Scale, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "@/app/pantry/DeleteButton";
import StarButton from "@/app/pantry/StarButton";
import { ButtonLink, CategoryIcon, FreshnessPill, StatusPill } from "@/app/components/ui";
import { formatDate, formatQuantity, getItem, isStarred } from "@/lib/pantry";
import { todayInTimeZone } from "@/lib/stats";

export default async function ItemPage({ params }: PageProps<"/pantry/[id]">) {
  const { id } = await params;
  const item = Number.isInteger(Number(id)) ? await getItem(Number(id)) : null;
  if (!item) notFound();
  const today = todayInTimeZone();

  const facts = [
    { Icon: Scale, label: "Quantity", value: formatQuantity(item) },
    { Icon: Tag, label: "Category", value: item.categories?.name ?? "—" },
    { Icon: Receipt, label: "Price", value: item.price === null ? "—" : `$${Number(item.price).toFixed(2)}` },
    { Icon: CalendarCheck, label: "Bought on", value: formatDate(item.purchased_on) },
    { Icon: CalendarClock, label: "Use by", value: formatDate(item.expires_on) },
  ];

  return (
    <div className="space-y-6">
      <Link href="/pantry" className="inline-flex items-center gap-1.5 text-sm font-semibold text-plum hover:text-eggplant">
        <ArrowLeft size={16} aria-hidden="true" /> Back to your pantry
      </Link>

      <article className="max-w-3xl rounded-card border border-lavender-200 bg-white p-8">
        <header className="flex flex-wrap items-start gap-4">
          <CategoryIcon name={item.categories?.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl font-medium text-eggplant">{item.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.in_stock ? <StatusPill tone="fresh">In stock</StatusPill> : <StatusPill tone="neutral">Out of stock</StatusPill>}
              {item.in_stock && <FreshnessPill expiresOn={item.expires_on} today={today} />}
              {isStarred(item) && <StatusPill tone="neutral">Staple</StatusPill>}
            </div>
          </div>
          <StarButton itemId={item.id} starred={isStarred(item)} />
        </header>

        <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(({ Icon, label, value }) => (
            <div key={label} className="rounded-lg bg-lavender p-4">
              <dt className="flex items-center gap-2 text-sm font-semibold text-muted">
                <Icon size={16} className="text-plum" aria-hidden="true" />
                {label}
              </dt>
              <dd className="font-display mt-1 text-2xl font-medium text-eggplant">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap items-start gap-3 border-t border-lavender-200 pt-6">
          <ButtonLink href={`/pantry/${item.id}/edit`} icon={<Pencil size={18} aria-hidden="true" />}>
            Edit
          </ButtonLink>
          <DeleteButton itemId={item.id} itemName={item.name} />
        </div>
      </article>
    </div>
  );
}
