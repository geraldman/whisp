"use client";

import { useEffect, useState, useCallback } from "react";
import { getQrFromGas } from "@/app/actions/profile/getQrFromGas";

export default function ProfileQR({ numericId }: { numericId: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQrCode = useCallback(() => {
    if (!numericId) {
      setError("Numeric ID tidak tersedia");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    getQrFromGas(numericId)
      .then((qrData) => {
        console.log("✅ QR code generated/loaded successfully");
        setQr(qrData);
        setError(null);
      })
      .catch((err) => {
        console.error("❌ QR generation failed:", err);
        setError(err.message || "Gagal membuat QR code");
        setQr(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [numericId]);

  useEffect(() => {
    loadQrCode();
  }, [loadQrCode]);

  const downloadQR = () => {
    if (!qr) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${qr}`;
    link.download = `qr-code-${numericId}.png`;
    link.click();
  };

  const shareQR = async () => {
    if (!qr) return;
    
    try {
      // Convert base64 to blob
      const response = await fetch(`data:image/png;base64,${qr}`);
      const blob = await response.blob();
      const file = new File([blob], `qr-code-${numericId}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'QR Code Saya',
          text: `ID: ${numericId}`,
          files: [file],
        });
      } else {
        // Fallback: copy to clipboard
        alert('Share tidak didukung. Gunakan tombol Download untuk menyimpan QR code.');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div style={{ marginBottom: 20, padding: 16, border: "1px solid #e0e0e0", borderRadius: 8 }}>
      <h3>QR Code Saya</h3>
      <p style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
        Bagikan QR code ini untuk menambahkan teman
      </p>
      
      {loading && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #0070f3",
            borderRadius: "50%",
            margin: "0 auto 10px",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ color: "#666" }}>Membuat QR code...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      {error && !loading && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <p style={{ color: "red", fontSize: 14, marginBottom: 10 }}>
            ⚠️ {error}
          </p>
          <button
            onClick={loadQrCode}
            style={{
              padding: "8px 16px",
              borderRadius: 4,
              border: "1px solid #0070f3",
              backgroundColor: "white",
              color: "#0070f3",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            🔄 Coba Lagi
          </button>
        </div>
      )}
      
      {qr && !loading && !error && (
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            display: "inline-block", 
            padding: 16, 
            backgroundColor: "white",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <img 
              src={`data:image/png;base64,${qr}`} 
              alt="QR Code" 
              width={200} 
              height={200}
              style={{ display: "block" }}
            />
          </div>
          
          <p style={{ fontSize: 12, color: "#666", marginTop: 12, marginBottom: 16 }}>
            <strong>ID:</strong> <code style={{ 
              backgroundColor: "#f5f5f5", 
              padding: "2px 6px", 
              borderRadius: 3,
              fontSize: 13
            }}>{numericId}</code>
          </p>

          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={downloadQR}
              style={{
                padding: "8px 16px",
                borderRadius: 4,
                border: "1px solid #0070f3",
                backgroundColor: "#0070f3",
                color: "white",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              📥 Download
            </button>
            <button
              onClick={shareQR}
              style={{
                padding: "8px 16px",
                borderRadius: 4,
                border: "1px solid #666",
                backgroundColor: "white",
                color: "#666",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              📤 Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

