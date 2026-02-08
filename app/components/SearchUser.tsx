"use client";

import { useState } from "react";
import { searchUserByNumericId } from "@/app/actions/searchUser";

export default function SearchUser({
  onSearchResult,
}: {
  onSearchResult: (result: any | null) => void;
}) {
  const [numericId, setNumericId] = useState("");
  const [error, setError] = useState("");

  async function handleSearch() {
    setError("");

    if (!/^\d{8}$/.test(numericId)) {
      setError("Numeric ID harus 8 digit");
      return;
    }

    const res = await searchUserByNumericId(numericId);

    if (!res.found) {
      setError("User tidak ditemukan");
      onSearchResult(null);
    } else {
      onSearchResult(res.user); // 🔴 KIRIM KE FRIEND REQUEST VIEW
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          border: "1px solid #ccc",
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <input
          value={numericId}
          onChange={(e) => {
            const val = e.target.value;
            setNumericId(val);

            // 🔁 JIKA INPUT DIKOSONGKAN → BALIK KE LIST
            if (val.trim() === "") {
              setError("");
              onSearchResult(null);
            }
          }}
          placeholder="Numeric ID"
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "none",
            outline: "none",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            width: 48,
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          🔍
        </button>
      </div>

      {error && <p style={{ color: "red", marginTop: 6 }}>{error}</p>}
    </div>
  );
}
