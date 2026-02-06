import { aesDecrypt, aesEncrypt } from "./aes";
import { deriveKeyFromPassword } from "./keyStore";
import { exportPublicKey, exportPrivateKey, generateRSAKeyPair } from "./rsa";

export * from "./rsa";
export * from "./aes";
export * from "./hybrid";
export * from "./groupKey";
export * from "./keyStore";

export async function createAccountProcedureSimplified(password: string){
    const RSAKeyPair = await generateRSAKeyPair();

    const salt = new Uint8Array(12);
    crypto.getRandomValues(salt);

    const saltBase64 = btoa(String.fromCharCode(...salt));
    const kdfPassword = await deriveKeyFromPassword(password, saltBase64);

    const privateKeyPKCS8 = await exportPrivateKey(RSAKeyPair.privateKey);
    const encryptedPrivateKey = await aesEncrypt(kdfPassword, privateKeyPKCS8);
    const publicKeyBase64 = await exportPublicKey(RSAKeyPair.publicKey);

    return{
        publicKey: publicKeyBase64,
        encryptedPrivateKey: btoa(String.fromCharCode(...encryptedPrivateKey.data)),
        iv: btoa(String.fromCharCode(...encryptedPrivateKey.iv)),
        salt: saltBase64
    }
}

export async function loginAccountProcedureSimplified(
    password: string, 
    encryptedPrivateKey: string,
    iv: string,
    salt: string
){  
    // salt is already in base64 format from database
    const kdfPassword = await deriveKeyFromPassword(password, salt);
    
    // Convert base64 strings to number arrays
    const ivArray = Array.from(Uint8Array.from(atob(iv), c => c.charCodeAt(0)));
    const dataArray = Array.from(Uint8Array.from(atob(encryptedPrivateKey), c => c.charCodeAt(0)));
    
    const decryptedPrivateKeyBase64 = await aesDecrypt(kdfPassword, ivArray, dataArray);
    
    // Return the base64-encoded private key directly
    // It will be imported as CryptoKey on the client side
    return {
        privateKeyPKCS8: decryptedPrivateKeyBase64
    }
}