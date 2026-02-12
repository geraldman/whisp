"use client";

function ensureCryptoAvailable() {
  if (typeof window === 'undefined') {
    throw new Error('Crypto operations must run in browser environment');
  }
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available. Ensure you are using HTTPS or localhost.');
  }
}

// crypto/groupKey.ts
import { generateAESKey } from "./aes";
import { rsaEncrypt, importPublicKey } from "./rsa";

export async function createEncryptedGroupKey(
  membersPublicKeys: Record<string, string>
) {
  ensureCryptoAvailable();
  const aesKey = await generateAESKey();
  const rawKey = await crypto.subtle.exportKey("raw", aesKey);

  const encryptedKeys: Record<string, number[]> = {};

  for (const uid in membersPublicKeys) {
    const pub = await importPublicKey(membersPublicKeys[uid]);
    const enc = await rsaEncrypt(pub, rawKey);
    encryptedKeys[uid] = Array.from(new Uint8Array(enc));
  }

  return { aesKey, encryptedKeys };
}
