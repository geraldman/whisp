"use client";

import { useState } from "react";
import { searchUserByNumericId } from "@/app/actions/searchUser";
import { useRouter } from "next/navigation";


export default function SearchUser({ onSearchResult }: any) {
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
      onSearchResult(res.user); // 🔴 KIRIM KE LAYOUT
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
          onChange={(e) => setNumericId(e.target.value)}
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

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
