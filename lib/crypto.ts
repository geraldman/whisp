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