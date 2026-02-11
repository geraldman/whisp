"use client";

import { useState } from "react";
import { updateAvatar } from "@/app/actions/profile/updateAvatar";

const AVATARS = ["/window.svg", "/globe.svg", "/file.svg"];

export default function ProfileAvatar({
  uid,
  avatar,
  onChange,
}: {
  uid: string;
  avatar: string;
  onChange: (avatar: string) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleAvatarChange(newAvatar: string) {
    try {
      setSaving(true);
      await updateAvatar(uid, newAvatar);
      onChange(newAvatar);
    } catch (error: any) {
      console.error("Failed to update avatar:", error);
      alert("Gagal mengupdate avatar. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <h3>Profile Avatar</h3>
      <img 
        src={avatar} 
        width={80} 
        height={80}
        style={{ borderRadius: "50%", objectFit: "cover" }} 
        alt="Profile Avatar"
      />
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        {AVATARS.map((a) => (
          <button 
            key={a} 
            onClick={() => handleAvatarChange(a)}
            disabled={saving || avatar === a}
            style={{
              padding: "8px 12px",
              borderRadius: 4,
              border: avatar === a ? "2px solid #0070f3" : "1px solid #ccc",
              cursor: avatar === a || saving ? "not-allowed" : "pointer",
              opacity: avatar === a || saving ? 0.6 : 1,
            }}
          >
            {a.replace("/", "").replace(".svg", "")}
          </button>
        ))}
      </div>
      {saving && <p style={{ fontSize: 12, color: "#666" }}>Menyimpan...</p>}
    </div>
  );
}
