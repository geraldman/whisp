// crypto/hybrid.ts
import { aesEncrypt, aesDecrypt } from "./aes";
import { rsaDecrypt } from "./rsa";
import { getRSAKeyPair, setGroupKey, getGroupKey } from "./keyStore";

export async function decryptGroupKey(
  chatId: string,
  encryptedKey: number[]
) {
  const { privateKey } = getRSAKeyPair();
  const raw = await rsaDecrypt(privateKey, new Uint8Array(encryptedKey));
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
