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
