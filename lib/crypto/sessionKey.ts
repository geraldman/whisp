"use client";

import { aesEncrypt, aesDecrypt } from "./aes";

/**
 * Generate a new AES-256 session key for chat encryption
 */
export async function generateSessionAESKey(): Promise<CryptoKey> {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
  
  return key;
}

/**
 * Export AES key to raw bytes (base64 for storage)
 */
export async function exportSessionKey(key: CryptoKey): Promise<string> {
  const rawKey = await crypto.subtle.exportKey("raw", key);
  const keyArray = Array.from(new Uint8Array(rawKey));
  return btoa(String.fromCharCode(...keyArray));
}

/**
 * Import AES key from base64 string
 */
export async function importSessionKey(base64Key: string): Promise<CryptoKey> {
  const keyBytes = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  
  return await crypto.subtle.importKey(
    "raw",
    keyBytes,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt session AES key with user's RSA public key
 */
export async function encryptSessionKeyForUser(
  sessionKeyBase64: string,
  publicKeyBase64: string
): Promise<string> {
  // Import public key
  const publicKeyBytes = Uint8Array.from(atob(publicKeyBase64), c => c.charCodeAt(0));
  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBytes,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"]
  );
  
  // Encrypt session key with RSA
  const sessionKeyBytes = Uint8Array.from(atob(sessionKeyBase64), c => c.charCodeAt(0));
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    sessionKeyBytes
  );
  
  // Return as base64
  const encryptedArray = Array.from(new Uint8Array(encrypted));
  return btoa(String.fromCharCode(...encryptedArray));
}

/**
 * Decrypt session AES key with user's RSA private key
 */
export async function decryptSessionKey(
  encryptedKeyBase64: string,
  privateKey: CryptoKey
): Promise<string> {
  // Decrypt with RSA private key
  const encryptedBytes = Uint8Array.from(atob(encryptedKeyBase64), c => c.charCodeAt(0));
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedBytes
  );
  
  // Return as base64
  const decryptedArray = Array.from(new Uint8Array(decrypted));
  return btoa(String.fromCharCode(...decryptedArray));
}