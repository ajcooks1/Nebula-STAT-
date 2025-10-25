import "dotenv/config.js";              // ensure env is loaded in THIS file
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !/^https:\/\/.+\.supabase\.co$/.test(url)) {
  throw new Error(`SUPABASE_URL is invalid: "${url ?? "undefined"}"`);
}
if (!key) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

export const supa = createClient(url, key);