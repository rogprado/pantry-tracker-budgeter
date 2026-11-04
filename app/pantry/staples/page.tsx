import { CircleCheck, Star } from "lucide-react";
import { ItemRow } from "@/app/pantry/ItemList";
import { ButtonLink, Card, CardTitle, EmptyState, PageHeader } from "@/app/components/ui";
import { listStaples } from "@/lib/pantry";
import { todayInTimeZone } from "@/lib/stats";

export default async function StaplesPage() {
  const staples = await listStaples();
  const today = todayInTimeZone();
  const runningLow = staples.filter((i) => !i.in_stock);
  const onShelf = staples.filter((i) => i.in_stock);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Staples"
        title="Your staples"
        subtitle="The things you always want at home. Star an item on your pantry to add it here."
        actions={runningLow.length > 0 && <ButtonLink href="/shopping">Plan a shop</ButtonLink>}
      />

      {staples.length === 0 ? (
        <EmptyState
          icon={<Star size={26} aria-hidden="true" />}
          title="No staples yet"
          body="Tap the star next to the things you always keep around, like eggs, olive oil or rice, and we'll tell you when they run out."
          action={<ButtonLink href="/pantry" variant="secondary">Go to your pantry</ButtonLink>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card padded={false}>
            <div className="px-6 pt-6">
              <CardTitle icon={<Star size={20} aria-hidden="true" />} title="Running low" sub={runningLow.length ? "Out of stock: time to restock." : undefined} />
            </div>
            {runningLow.length === 0 ? (
              <p className="flex items-center gap-2 px-6 pb-6 text-base font-semibold text-fresh-ink">
                <CircleCheck size={18} aria-hidden="true" /> All stocked up. Nothing to restock.
              </p>
            ) : (
              <ul className="divide-y divide-lavender-200/70 px-1 pb-2">
                {runningLow.map((item) => (
                  <ItemRow key={item.id} item={item} today={today} showCategory fade={false} />
                ))}
              </ul>
            )}
          </Card>
          <Card padded={false}>
            <div className="px-6 pt-6">
              <CardTitle icon={<CircleCheck size={20} aria-hidden="true" />} title="On the shelf" />
            </div>
            {onShelf.length === 0 ? (
              <p className="px-6 pb-6 text-base text-muted">None of your staples are in stock right now.</p>
            ) : (
              <ul className="divide-y divide-lavender-200/70 px-1 pb-2">
                {onShelf.map((item) => (
                  <ItemRow key={item.id} item={item} today={today} showCategory />
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
