"use client";

interface NotificationBadgeProps {
  count: number;
}

export default function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "#ff4444",
        color: "white",
        borderRadius: "50%",
        width: 18,
        height: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: "bold",
        border: "2px solid white",
      }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
