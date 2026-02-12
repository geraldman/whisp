"use client";

import { generateSessionAESKey, exportSessionKey, importSessionKey } from "./sessionKey";

/**
 * Encrypt message with session AES key
 */
export async function encryptMessageWithSession(
  message: string,
  sessionKey: CryptoKey
): Promise<{ encryptedContent: string; iv: string }> {
  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt message
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    sessionKey,
    messageBytes
  );
  
  // Convert to base64
  const encryptedArray = Array.from(new Uint8Array(encrypted));
  const ivArray = Array.from(iv);
  
  return {
    encryptedContent: btoa(String.fromCharCode(...encryptedArray)),
    iv: btoa(String.fromCharCode(...ivArray)),
  };
}

/**
 * Decrypt message with session AES key
 */
export async function decryptMessageWithSession(
  encryptedContent: string,
  iv: string,
  sessionKey: CryptoKey
): Promise<string> {
  // Convert from base64
  const encryptedBytes = Uint8Array.from(atob(encryptedContent), c => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBytes,
    },
    sessionKey,
    encryptedBytes
  );
  
  // Convert to string
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
