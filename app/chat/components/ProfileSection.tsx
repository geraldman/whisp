"use client";
import React from "react";
import { User, numbericid } from "@/firebase/firebase";

export default function ProfileSection({ user }: any) {
  return (
    <div
      style={{
        padding: 16,
        borderBottom: "1px solid #eee",
      }}
    >
      <strong>{user?.email}</strong>

      <div style={{ marginTop: 6, fontSize: 14, color: "#555" }}>
        <div>Username: {user?.username ?? "-"}</div>
        <div>Numeric ID: {user?.numericId ?? "-"}</div>
      </div>
    </div>
  );
}
