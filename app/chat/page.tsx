"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "notfound") {
      setErrorMessage("Chat not found. The chat may have been deleted due to inactivity.");
      
      // Clear error message after 5 seconds
      const timeout = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);

      return () => clearTimeout(timeout);
    } else if (error === "expired") {
      setErrorMessage("This chat expired due to inactivity. Select it again to recreate with new encryption keys.");
      
      // Clear error message after 6 seconds
      const timeout = setTimeout(() => {
        setErrorMessage(null);
      }, 6000);

      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center", 
      height: "100%",
      padding: 20,
      gap: 16
    }}>
      {errorMessage && (
        <div style={{
          padding: "12px 20px",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: 8,
          color: "#856404",
          maxWidth: 400,
          textAlign: "center"
        }}>
          {errorMessage}
        </div>
      )}
      <p style={{ color: "#999" }}>
        Select a chat to start messaging
      </p>
    </div>
  );
}
