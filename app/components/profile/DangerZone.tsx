"use client";

import { useState } from "react";
import { deleteAccount } from "@/app/actions/profile/deleteAccount";
import { useRouter } from "next/navigation";

export default function DangerZone() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function remove() {
    const confirm1 = confirm("PERINGATAN: Akun Anda akan dihapus secara permanen!\n\nSemua data termasuk chat dan QR code akan hilang.\n\nLanjutkan?");
    if (!confirm1) return;

    const confirm2 = confirm("Apakah Anda benar-benar yakin?\n\nTindakan ini TIDAK BISA dibatalkan!");
    if (!confirm2) return;

    try {
      setLoading(true);
      await deleteAccount();
      alert("Akun berhasil dihapus");
      router.push("/login");
    } catch (error: any) {
      console.error("Delete account error:", error);
      alert("Gagal menghapus akun: " + (error.message || "Terjadi kesalahan"));
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      border: "2px solid #dc3545", 
      padding: 16, 
      borderRadius: 8,
      backgroundColor: "#fff5f5",
      marginTop: 20 
    }}>
      <h3 style={{ color: "#dc3545", marginBottom: 8 }}>⚠️ Zona Berbahaya</h3>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
        Tindakan di bawah ini tidak dapat dibatalkan. Harap berhati-hati.
      </p>
      <button 
        style={{ 
          background: loading ? "#999" : "#dc3545", 
          color: "#fff",
          padding: "10px 16px",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }} 
        onClick={remove}
        disabled={loading}
      >
        {loading ? "Menghapus..." : "Hapus Akun Permanen"}
      </button>
    </div>
  );
}
