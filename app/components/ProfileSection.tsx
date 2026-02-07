"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import SettingsMenu from "./SettingsMenu";

export default function ProfileSection({ user }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    async function fetchProfile() {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setProfile(snap.data());
      }
    }

    fetchProfile();
  }, [user?.uid]);

  return (
    <div
      style={{
        padding: 16,
        borderBottom: "1px solid #eee",
      }}
    >
      {/* EMAIL + SETTINGS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong>{user?.email}</strong>
        <span
          style={{ cursor: "pointer" }}
          onClick={() => setOpenSettings((v) => !v)}
        >
          ⚙️
        </span>
      </div>

      {/* USER INFO */}
      <div style={{ marginTop: 8, fontSize: 14, color: "#555" }}>
        <div>Username: {profile?.username ?? "-"}</div>
        <div>User ID: {profile?.numericId ?? "-"}</div>
      </div>

      {/* SETTINGS MENU */}
      {openSettings && <SettingsMenu />}
    </div>
  );
}
