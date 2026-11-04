import { PageHeader } from "@/app/components/ui";
import ImportClient from "@/app/pantry/import/ImportClient";
import { createClient } from "@/lib/supabase/server";

export default async function ImportPage() {
  const supabase = await createClient();
  // RLS: only my items. Used to show "adds to existing" in the preview.
  const { data: items } = await supabase.from("pantry_items").select("name");
  return (
    <div>
      <PageHeader
        eyebrow="Pantry"
        title="Import from a spreadsheet"
        subtitle="Back from a big shop? Add everything at once from a .csv or Excel file. You'll see a preview before anything is saved."
      />
      <ImportClient existingNames={(items ?? []).map((i) => i.name)} />
    </div>
  );
}
