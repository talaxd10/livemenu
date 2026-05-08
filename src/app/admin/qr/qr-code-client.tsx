"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { QrCode, Download, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateQrCode } from "@/actions/qr-codes";
import { toast } from "@/hooks/use-toast";

type QrCodeRecord = {
  id: string;
  publicUrl: string;
  qrImageUrl: string | null;
};

interface Props {
  restaurantId: string;
  restaurantSlug: string;
  existingQr: QrCodeRecord | null;
}

export function QrCodeClient({ restaurantId, restaurantSlug, existingQr }: Props) {
  const [isPending, startTransition] = useTransition();
  const [qrData, setQrData] = useState<{ qrDataUrl: string; publicUrl: string } | null>(
    existingQr?.qrImageUrl
      ? { qrDataUrl: existingQr.qrImageUrl, publicUrl: existingQr.publicUrl }
      : null
  );

  function handleGenerate() {
    startTransition(async () => {
      try {
        const result = await generateQrCode(restaurantId);
        setQrData({ qrDataUrl: result.qrDataUrl, publicUrl: result.publicUrl });
        toast({ title: "QR code generated!" });
      } catch (e: unknown) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "An error occurred", variant: "destructive" });
      }
    });
  }

  function handleDownload() {
    if (!qrData?.qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrData.qrDataUrl;
    a.download = `${restaurantSlug}-qr-code.png`;
    a.click();
  }

  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrData ? (
            <>
              <div className="flex justify-center">
                <div className="border rounded-xl p-4 bg-white inline-block">
                  <Image
                    src={qrData.qrDataUrl}
                    alt="QR Code"
                    width={240}
                    height={240}
                    className="block"
                    unoptimized
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted px-3 py-2">
                <p className="text-xs text-muted-foreground mb-1">Menu URL</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs truncate">{qrData.publicUrl}</code>
                  <Button asChild variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                    <Link href={qrData.publicUrl} target="_blank">
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleGenerate}
                  disabled={isPending}
                >
                  <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
                <Button className="flex-1 gap-2" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Download PNG
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-4">
              <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">No QR code yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate your QR code to share with customers
                </p>
              </div>
              <Button onClick={handleGenerate} disabled={isPending} size="lg">
                {isPending ? "Generating..." : "Generate QR Code"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">How to use your QR code</h3>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Generate your QR code above</li>
            <li>Download the PNG image</li>
            <li>Print it and place it on tables in your café</li>
            <li>Customers scan it to see your live menu instantly</li>
            <li>Update your menu anytime — the QR code never changes</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
