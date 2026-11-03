import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PantryPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-heading">Your pantry</h1>
      <p className="mt-3 text-gray-600">Your pantry is empty. Items you add will show up here.</p>
    </div>
  );
}
