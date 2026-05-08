"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/supabase";

interface Props {
  value: string;
  onChange: (url: string) => void;
  bucket: keyof typeof STORAGE_BUCKETS;
  className?: string;
}

export function ImageUpload({ value, onChange, bucket, className }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", bucket);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative inline-block">
          <div className="h-24 w-24 rounded-lg overflow-hidden border bg-muted">
            <Image
              src={value}
              alt="Preview"
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
            onClick={() => onChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <>
              <ImageIcon className="h-5 w-5" />
              <span className="text-xs">Upload</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {!value && (
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="gap-2 text-xs"
          >
            <Upload className="h-3 w-3" />
            {uploading ? "Uploading..." : "Choose file"}
          </Button>
          <span className="text-xs text-muted-foreground">or paste URL below</span>
        </div>
      )}

      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="text-xs"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
