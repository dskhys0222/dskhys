/**
 * Web Crypto API を使用したAES-256-GCM復号化
 *
 * サーバーから取得した暗号化されたポートフォリオデータを
 * クライアント側で復号化します。
 */

/**
 * Base64文字列をUint8Arrayに変換
 */
const base64ToArrayBuffer = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

/**
 * 16進数文字列をUint8Arrayに変換
 */
const hexToArrayBuffer = (hex: string): Uint8Array => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Number.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
};

/**
 * AES-256-GCMでデータを復号化
 *
 * @param encryptedBase64 - 暗号化されたデータ（Base64）
 * @param ivBase64 - 初期化ベクトル（Base64）
 * @param authTagBase64 - 認証タグ（Base64）
 * @param keyHex - 暗号化キー（16進数文字列、64文字 = 32バイト）
 * @returns 復号化された文字列
 */
export const decrypt = async (
    encryptedBase64: string,
    ivBase64: string,
    tagBase64: string,
    keyHex: string
): Promise<string> => {
    // キーの検証
    if (keyHex.length !== 64) {
        throw new Error('Encryption key must be 64 hex characters (32 bytes)');
    }

    // Base64/Hexからバイナリに変換
    const encrypted = base64ToArrayBuffer(encryptedBase64);
    const iv = base64ToArrayBuffer(ivBase64);
    const tag = base64ToArrayBuffer(tagBase64);
    const keyBytes = hexToArrayBuffer(keyHex);

    // Web Crypto APIでは暗号文と認証タグを結合する必要がある
    const ciphertext = new Uint8Array(encrypted.length + tag.length);
    ciphertext.set(encrypted);
    ciphertext.set(tag, encrypted.length);

    // 暗号化キーをインポート
    const key = await crypto.subtle.importKey(
        'raw',
        keyBytes.buffer as ArrayBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    // 復号化
    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv.buffer as ArrayBuffer,
            tagLength: 128, // 16バイト = 128ビット
        },
        key,
        ciphertext
    );

    // ArrayBufferを文字列に変換
    return new TextDecoder().decode(decrypted);
};

/**
 * 暗号化されたポートフォリオデータを復号化してパース
 *
 * @param encryptedData - サーバーから取得した暗号化データ
 * @param keyHex - 暗号化キー（16進数文字列）
 * @returns パースされたポートフォリオデータ
 */
export const decryptPortfolioData = async <T>(
    encryptedData: {
        iv: string;
        data: string;
        tag: string;
    },
    keyHex: string
): Promise<T> => {
    const decrypted = await decrypt(
        encryptedData.data,
        encryptedData.iv,
        encryptedData.tag,
        keyHex
    );
    return JSON.parse(decrypted) as T;
};

/**
 * ArrayBufferをBase64文字列に変換
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

/**
 * 文字列キーからAES-256-GCMキーを導出（PBKDF2）
 * saltは固定値 "portfolio-sync-v1"（共通キー前提）
 */
const deriveKey = async (keyString: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(keyString),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    const salt = encoder.encode('portfolio-sync-v1');
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

/**
 * AES-256-GCMでデータを暗号化（PBKDF2キー導出）
 *
 * AES-GCMのencrypt()戻り値: 先頭(length-16)バイトが暗号文、末尾16バイトがauthTag。
 *
 * @param plaintext - 暗号化するプレーンテキスト
 * @param keyString - キー文字列（PBKDF2で導出）
 * @returns { iv, data, tag } すべてBase64エンコード済み
 */
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

/**
 * AES-256-GCMでデータを復号（PBKDF2キー導出）
 *
 * @param iv - 初期化ベクトル（Base64）
 * @param data - 暗号文（Base64）
 * @param tag - 認証タグ（Base64）
 * @param keyString - キー文字列（PBKDF2で導出）
 * @returns 復号された文字列
 */
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
        { name: 'AES-GCM', iv: ivBytes.buffer as ArrayBuffer, tagLength: 128 },
        key,
        ciphertextWithTag.buffer as ArrayBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
};
