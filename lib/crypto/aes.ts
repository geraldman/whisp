// crypto/aes.ts
export async function generateAESKey() {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/*
    IV is used for:
    preventing duplicate entries producing same keys
    > encrypt("hello", key) → "abc123"
    > encrypt("hello", key) → "abc123"
    to be
    > encrypt("hello", key, iv1) → "abc123"
    > encrypt("hello", key, iv2) → "xyz789" 
*/

export async function aesEncrypt(key: CryptoKey, plaintext: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(cipher)),
  };
}

export async function aesDecrypt(
  key: CryptoKey,
  iv: number[],
  data: number[]
) {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    new Uint8Array(data)
  );

  return new TextDecoder().decode(decrypted);
}
