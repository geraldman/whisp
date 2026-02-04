"use server";

import _sodium from 'libsodium-wrappers';

export async function encryptMessage(message: string, recipientPublicKey: string) {
  await _sodium.ready;
  const sodium = _sodium;
  
  // Convert keys and message to proper format
  const messageBytes = sodium.from_string(message);
  const publicKey = sodium.from_base64(recipientPublicKey);
  
  // Encrypt (sealed box - anonymous encryption)
  const encrypted = sodium.crypto_box_seal(messageBytes, publicKey);
  
  return sodium.to_base64(encrypted);
}

export async function generateKeyPair() {
  await _sodium.ready;
  const sodium = _sodium;
  
  const keyPair = sodium.crypto_box_keypair();
  
  return {
    publicKey: sodium.to_base64(keyPair.publicKey),
    privateKey: sodium.to_base64(keyPair.privateKey)
  };
}

export async function loginAccountProcedure(password: string, ){

  await _sodium.ready;
  const sodium = _sodium;

  
}

export async function createAccountProcedure(password: string){
  
  await _sodium.ready;
  const sodium = _sodium;

  const identityKeyPair = sodium.crypto_sign_keypair(); // CSPRNG (Private and Public key still in raw bytes)
  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES); // protects password
  
  const passwordKey = sodium.crypto_pwhash( // KDF (Argon2Id13)
    32,
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );

  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES); // SecretBox XSalsa20 + Poly1305 (protects encrpytion)

  const encryptedPrivateKey = sodium.crypto_secretbox_easy(
    identityKeyPair.privateKey,
    nonce, 
    passwordKey,
  );

  return{
    salt: sodium.to_base64(salt),
    publicKey: sodium.to_base64(identityKeyPair.publicKey),
    encryptedPrivateKey: sodium.to_base64(encryptedPrivateKey),
    nonce: sodium.to_base64(nonce),
  }  
}