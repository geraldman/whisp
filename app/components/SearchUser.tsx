"use client";

import { useState } from "react";
import { searchUserByNumericId } from "@/app/actions/searchUser";
import { useRouter } from "next/navigation";

export default function SearchUser() {
  const [numericId, setNumericId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSearch() {
    setError("");
    setResult(null);

    if (!/^\d{8}$/.test(numericId)) {
      setError("Numeric ID harus 8 digit");
      return;
    }

    const res = await searchUserByNumericId(numericId);

    if (!res.found) {
      setError("User tidak ditemukan");
    } else {
      setResult(res.user);
    }
  }

  return (
    <div style={{ padding: 16 }}>


      <input
        value={numericId}
        onChange={(e) => setNumericId(e.target.value)}
        placeholder="Search User"
        style={{ width: "100%", padding: 8 }}
      />

      <button
        onClick={handleSearch}
        style={{ marginTop: 8, width: "100%" }}
      >
        Search
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #ccc",
          }}
        >
          <p><strong>Username:</strong> {result.username}</p>
          <p><strong>Numeric ID:</strong> {result.numericId}</p>

          <button
            style={{ marginTop: 8 }}
            onClick={() => router.push(`/chat/${result.uid}`)}
          >
            Add Friend / Start Chat
          </button>
        </div>
      )}
    </div>
  );
}
