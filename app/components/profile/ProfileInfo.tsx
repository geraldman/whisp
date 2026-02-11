"use client";

export default function ProfileInfo({ user }: { user: any }) {
  return (
    <div style={{ marginBottom: 20, padding: 16, border: "1px solid #e0e0e0", borderRadius: 8 }}>
      <h3>Informasi Akun</h3>
      <div style={{ fontSize: 14 }}>
        <p style={{ marginBottom: 8 }}>
          <strong>Email:</strong> {user.email || "-"}
        </p>
        <p style={{ marginBottom: 8 }}>
          <strong>Username:</strong> {user.username || "-"}
        </p>
        <p style={{ marginBottom: 0 }}>
          <strong>Numeric ID:</strong> <code>{user.numericId || "-"}</code>
        </p>
      </div>
    </div>
  );
}