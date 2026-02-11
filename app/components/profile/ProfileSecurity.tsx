"use client";

import { useState } from "react";
import { changePassword } from "@/app/actions/profile/changePassword";

export default function ProfileSecurity() {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!pw || pw.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await changePassword(pw);
      alert("Password berhasil diupdate! Silakan login kembali dengan password baru.");
      setPw("");
    } catch (err: any) {
      console.error("Change password error:", err);
      setError(err.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: 20, padding: 16, border: "1px solid #e0e0e0", borderRadius: 8 }}>
      <h3>Keamanan</h3>
      <div style={{ marginTop: 10 }}>
        <input
          type="password"
          placeholder="Password baru (min. 6 karakter)"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setError(null);
          }}
          disabled={loading}
          style={{
            padding: "8px 12px",
            width: "100%",
            borderRadius: 4,
            border: error ? "1px solid red" : "1px solid #ccc",
            marginBottom: 8,
          }}
        />
        {error && (
          <p style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
            {error}
          </p>
        )}
        <button 
          onClick={submit}
          disabled={loading || !pw}
          style={{
            padding: "8px 16px",
            borderRadius: 4,
            border: "none",
            backgroundColor: loading || !pw ? "#ccc" : "#0070f3",
            color: "white",
            cursor: loading || !pw ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Mengupdate..." : "Ubah Password"}
        </button>
      </div>
    </div>
  );
}


