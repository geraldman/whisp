"use client";

import { generateQRCode } from "@/lib/utils/qrcode";

/**
 * Get QR code dari Google Apps Script
 * Jika belum ada, generate baru dan simpan
 */
export async function getQrFromGas(numericId: string): Promise<string> {
  if (!numericId) {
    throw new Error("Numeric ID tidak tersedia");
  }

  // Step 1: Try to get existing QR from Google Apps Script
  if (process.env.NEXT_PUBLIC_GAS_QR_ENDPOINT) {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_GAS_QR_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "get",
          numericId 
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.qrBase64) {
          console.log("QR code loaded from Google Sheets");
          return json.qrBase64;
        }
      }
    } catch (error) {
      console.warn("Failed to get QR from GAS, will generate new:", error);
    }
  }

  // Step 2: Generate new QR code locally
  console.log("Generating new QR code locally...");
  const qrBase64 = await generateQRCode(numericId);

  // Step 3: Save to Google Apps Script (if configured)
  if (process.env.NEXT_PUBLIC_GAS_QR_ENDPOINT) {
    try {
      await saveQrToGas(numericId, qrBase64);
      console.log("QR code saved to Google Sheets");
    } catch (error) {
      console.warn("Failed to save QR to GAS, but QR generated successfully:", error);
    }
  }

  return qrBase64;
}

/**
 * Save QR code to Google Apps Script
 */
async function saveQrToGas(numericId: string, qrBase64: string): Promise<void> {
  if (!process.env.NEXT_PUBLIC_GAS_QR_ENDPOINT) {
    return;
  }

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_GAS_QR_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        numericId,
        qrBase64,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to save QR");
    }
  } catch (error: any) {
    console.error("Save QR to GAS error:", error);
    throw error;
  }
}
