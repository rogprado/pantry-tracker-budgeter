// Data isolation (PLAN.md, test 1).
// Given User A has a pantry item and User B has none, when B (signed in as B) lists
// pantry items and asks for A's item by its id, then B gets an empty list and no row.
//
// Runs against the real Supabase project with two throwaway users created through the
// admin API (secret key) and deleted afterwards. Their categories and items go with
// them through "on delete cascade".

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const secretKey = process.env.SUPABASE_SECRET_KEY!;

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secretKey, noSession); // bypasses RLS: setup and cleanup only

const run = randomUUID().slice(0, 8);
const password = `Test-${randomUUID()}`;
const createdUserIds: string[] = [];

// Creates a confirmed throwaway account and returns a client signed in as it (publishable key, so RLS applies).
async function throwawayUser(label: string): Promise<{ id: string; client: SupabaseClient }> {
  const email = `pantry-test-${label}-${run}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`Could not create test user ${label}: ${error?.message}`);
  createdUserIds.push(data.user.id);

  const client = createClient(url, publishableKey, noSession);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`Could not sign in as test user ${label}: ${signInError.message}`);
  return { id: data.user.id, client };
}

let userB: SupabaseClient;
let itemIdOfA: number;

beforeAll(async () => {
  if (!url || !publishableKey || !secretKey) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY in .env.local");
  }

  // User A adds a category and one item, signed in as A (the normal app path).
  const a = await throwawayUser("a");
  const { data: category, error: categoryError } = await a.client
    .from("categories")
    .insert({ name: "Test category" })
    .select("id")
    .single();
  if (categoryError) throw new Error(`A could not add a category: ${categoryError.message}`);

  const { data: item, error: itemError } = await a.client
    .from("pantry_items")
    .insert({ name: "Test rice", category_id: category.id, quantity: 1 })
    .select("id")
    .single();
  if (itemError) throw new Error(`A could not add an item: ${itemError.message}`);
  itemIdOfA = item.id;

  // Sanity check so the test can't pass by accident: A can see their own item.
  const { data: ownRows } = await a.client.from("pantry_items").select("id").eq("id", itemIdOfA);
  if (ownRows?.length !== 1) throw new Error("Setup failed: User A cannot see their own item");

  // User B has no items.
  userB = (await throwawayUser("b")).client;
});

afterAll(async () => {
  // Deleting the auth users cascades to public.users, categories and pantry_items.
  for (const id of createdUserIds) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) console.error(`Could not delete test user ${id}: ${error.message}`);
  }
});

describe("data isolation between users", () => {
  it("User B's pantry list is empty (A's item is not visible)", async () => {
    // Select only ids, so a failure never prints anyone's item names.
    const { data, error } = await userB.from("pantry_items").select("id");
    expect(error).toBeNull();
    expect(data?.map((row) => row.id)).not.toContain(itemIdOfA);
    expect(data).toHaveLength(0);
  });

  it("User B asking for A's item by id gets no row", async () => {
    const { data, error } = await userB.from("pantry_items").select("id").eq("id", itemIdOfA).maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeNull();
  });
});
