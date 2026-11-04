import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Load .env.local (Supabase URL and keys) into process.env for the tests.
    env: loadEnv("test", process.cwd(), ""),
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
