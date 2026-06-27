const base64ToArrayBuffer = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const deriveKey = async (keyString: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(keyString),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    const salt = encoder.encode('budget-sync-v1');
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
};

export const encryptData = async (
    plaintext: string,
    keyString: string
): Promise<{ iv: string; data: string; tag: string }> => {
    const key = await deriveKey(keyString);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();

    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, tagLength: 128 },
        key,
        encoder.encode(plaintext)
    );

    const encryptedBytes = new Uint8Array(encryptedBuffer);
    const tagLength = 16;
    const ciphertext = encryptedBytes.slice(
        0,
        encryptedBytes.length - tagLength
    );
    const tag = encryptedBytes.slice(encryptedBytes.length - tagLength);

    return {
        iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
        data: arrayBufferToBase64(ciphertext.buffer as ArrayBuffer),
        tag: arrayBufferToBase64(tag.buffer as ArrayBuffer),
    };
};

export const decryptData = async (
    iv: string,
    data: string,
    tag: string,
    keyString: string
): Promise<string> => {
    const key = await deriveKey(keyString);
    const ivBytes = base64ToArrayBuffer(iv);
    const ciphertext = base64ToArrayBuffer(data);
    const tagBytes = base64ToArrayBuffer(tag);

    const ciphertextWithTag = new Uint8Array(
        ciphertext.length + tagBytes.length
    );
    ciphertextWithTag.set(ciphertext);
    ciphertextWithTag.set(tagBytes, ciphertext.length);

    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: ivBytes.buffer as ArrayBuffer,
            tagLength: 128,
        },
        key,
        ciphertextWithTag.buffer as ArrayBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
};

export const decryptBudgetData = async <T>(
    encryptedData: { iv: string; data: string; tag: string },
    keyHex: string
): Promise<T> => {
    const decrypted = await decryptData(
        encryptedData.iv,
        encryptedData.data,
        encryptedData.tag,
        keyHex
    );
    return JSON.parse(decrypted) as T;
};
