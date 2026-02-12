"use client";

// crypto/keyStore.ts
function ensureCryptoAvailable() {
  if (typeof window === 'undefined') {
    throw new Error('Crypto operations must run in browser environment');
  }
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available. Ensure you are using HTTPS or localhost.');
  }
}

let rsaKeyPair: CryptoKeyPair | null = null;
const groupKeys = new Map<string, CryptoKey>();

export function setRSAKeyPair(pair: CryptoKeyPair) {
  rsaKeyPair = pair;
}

export function getRSAKeyPair() {
  if (!rsaKeyPair) throw new Error("RSA key not initialized");
  return rsaKeyPair;
}

export function setGroupKey(chatId: string, key: CryptoKey) {
  groupKeys.set(chatId, key);
}

export function getGroupKey(chatId: string) {
  return groupKeys.get(chatId);
}

export async function deriveKeyFromPassword(password: string, salt: string) {
  ensureCryptoAvailable();
  const enc = new TextEncoder();

  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const saltBytes = Uint8Array.from(atob(salt), c => c.charCodeAt(0));

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

