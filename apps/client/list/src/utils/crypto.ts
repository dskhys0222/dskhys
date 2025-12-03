import { err, ok, type Result } from 'neverthrow';

// 暗号化キーの生成（パスワードベース）
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<Result<CryptoKey, Error>> {
  try {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    return ok(key);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error('Failed to derive key')
    );
  }
}

// ランダムなソルトを生成
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// ランダムなIVを生成
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

// データを暗号化
export async function encrypt(
  data: string,
  key: CryptoKey
): Promise<Result<string, Error>> {
  try {
    const encoder = new TextEncoder();
    const iv = generateIV();

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      encoder.encode(data)
    );

    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // バイナリ文字列に変換してからBase64エンコードする
    let binaryString = '';
    combined.forEach((byte) => {
      binaryString += String.fromCharCode(byte);
    });

    return ok(btoa(binaryString));
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error('Failed to encrypt data')
    );
  }
}

// データを復号
export async function decrypt(
  encryptedString: string,
  key: CryptoKey
): Promise<Result<string, Error>> {
  try {
    const binaryString = atob(encryptedString);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }

    // 最初の12バイトがIV
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    return ok(decoder.decode(decryptedData));
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error('Failed to decrypt data')
    );
  }
}

// ソルトをBase64でエンコード/デコード
export function encodeSalt(salt: Uint8Array): string {
  return btoa(String.fromCharCode(...salt));
}

export function decodeSalt(saltString: string): Uint8Array {
  return Uint8Array.from(atob(saltString), (c) => c.charCodeAt(0));
}
