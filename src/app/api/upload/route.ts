import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucketKey = formData.get("bucket") as keyof typeof STORAGE_BUCKETS;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!bucketKey || !(bucketKey in STORAGE_BUCKETS)) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    const bucketName = STORAGE_BUCKETS[bucketKey];
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const allowedExts = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const fileName = `${uuidv4()}.${ext}`;
    const path = `${session.user.restaurantId || "shared"}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
