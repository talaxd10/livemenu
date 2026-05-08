import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role (for uploads)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Public client
export const supabase = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const STORAGE_BUCKETS = {
  LOGOS: "logos",
  COVERS: "covers",
  MENU_ITEMS: "menu-items",
  OFFERS: "offers",
} as const;

export async function uploadImage(
  bucket: string,
  file: File,
  path: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteImage(bucket: string, path: string): Promise<void> {
  await supabaseAdmin.storage.from(bucket).remove([path]);
}
