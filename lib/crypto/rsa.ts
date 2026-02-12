"use client";

// crypto/rsa.ts
function ensureCryptoAvailable() {
  if (typeof window === 'undefined') {
    throw new Error('Crypto operations must run in browser environment');
  }
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available. Ensure you are using HTTPS or localhost.');
  }
}

export async function generateRSAKeyPair() {
  ensureCryptoAvailable();
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportPublicKey(key: CryptoKey) {
  ensureCryptoAvailable();
  const spki = await crypto.subtle.exportKey("spki", key);
  return btoa(String.fromCharCode(...new Uint8Array(spki)));
}

export async function exportPrivateKey(key: CryptoKey) {
  ensureCryptoAvailable();
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", key);
  return btoa(String.fromCharCode(...new Uint8Array(pkcs8)));
}

export async function importPublicKey(base64: string) {
  ensureCryptoAvailable();
  const buf = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "spki",
    buf,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
}

export async function rsaEncrypt(publicKey: CryptoKey, data: ArrayBuffer) {
  ensureCryptoAvailable();
  return crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data);
}

export async function rsaDecrypt(privateKey: CryptoKey, data: ArrayBuffer) {
  ensureCryptoAvailable();
  return crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, data);
}
