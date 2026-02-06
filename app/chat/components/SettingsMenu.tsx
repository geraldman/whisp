"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

export default function SettingsMenu() {
  return (
    <div
      style={{
        marginTop: 10,
        border: "1px solid #ddd",
        padding: 10,
        borderRadius: 6,
        background: "#fff",
      }}
    >
      <p style={{ cursor: "pointer" }}>Profile</p>
      <p style={{ cursor: "pointer" }}>Settings</p>
      <p
        style={{ cursor: "pointer", color: "red" }}
        onClick={() => signOut(auth)}
      >
        Logout
      </p>
    </div>
  );
}
