"use client";

function ensureCryptoAvailable() {
  if (typeof window === 'undefined') {
    throw new Error('Crypto operations must run in browser environment');
  }
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available. Ensure you are using HTTPS or localhost.');
  }
}

// crypto/hybrid.ts
import { aesEncrypt, aesDecrypt } from "./aes";
import { rsaDecrypt } from "./rsa";
import { getRSAKeyPair, setGroupKey, getGroupKey } from "./keyStore";

export async function decryptGroupKey(
  chatId: string,
  encryptedKey: number[]
) {
  ensureCryptoAvailable();
  const { privateKey } = getRSAKeyPair();
  const raw = await rsaDecrypt(privateKey, new Uint8Array(encryptedKey).buffer);
  const aesKey = await crypto.subtle.importKey(
    "raw",
    raw,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
  setGroupKey(chatId, aesKey);
}

export async function encryptMessage(chatId: string, text: string) {
  const key = getGroupKey(chatId);
  if (!key) throw new Error("Group key missing");
  return aesEncrypt(key, text);
}

export async function decryptMessage(
  chatId: string,
  iv: number[],
  data: number[]
) {
  const key = getGroupKey(chatId);
  if (!key) throw new Error("Group key missing");
  return aesDecrypt(key, iv, data);
}
