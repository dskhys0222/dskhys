import * as crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export interface EncryptedData {
    iv: Buffer;
    encrypted: Buffer;
    authTag: Buffer;
}

export interface EncryptedDataBase64 {
    iv: string;
    encryptedData: string;
    authTag: string;
}

/**
 * データを AES-256-GCM で暗号化
 * @param plaintext 平文データ
 * @param key 暗号化キー（Buffer, 32バイト）
 * @returns 暗号化データ（Buffer）
 */
export const encrypt = (plaintext: string, key: Buffer): EncryptedData => {
    if (key.length !== 32) {
        throw new Error(
            `暗号化キーは32バイトである必要があります（現在: ${key.length}バイト）`
        );
    }

    // ランダムなIVを生成
    const iv = crypto.randomBytes(IV_LENGTH);

    // 暗号化
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
        authTagLength: TAG_LENGTH,
    });

    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
        iv,
        encrypted,
        authTag,
    };
};

/**
 * 暗号化データをBase64エンコード（API送信用）
 */
export const encryptedToBase64 = (
    encrypted: EncryptedData
): EncryptedDataBase64 => {
    return {
        iv: encrypted.iv.toString('base64'),
        encryptedData: encrypted.encrypted.toString('base64'),
        authTag: encrypted.authTag.toString('base64'),
    };
};

/**
 * AES-256-GCM で暗号化されたデータを復号
 * @param encrypted 暗号化データ（Buffer）
 * @param key 暗号化キー（Buffer, 32バイト）
 * @returns 復号された平文
 */
export const decrypt = (encrypted: EncryptedData, key: Buffer): string => {
    if (key.length !== 32) {
        throw new Error(
            `暗号化キーは32バイトである必要があります（現在: ${key.length}バイト）`
        );
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, encrypted.iv, {
        authTagLength: TAG_LENGTH,
    });
    decipher.setAuthTag(encrypted.authTag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted.encrypted),
        decipher.final(),
    ]);

    return decrypted.toString('utf8');
};
