import { describe, expect, it } from 'vitest';
import {
  decodeSalt,
  decrypt,
  deriveKey,
  encodeSalt,
  encrypt,
  generateSalt,
} from './crypto';

describe('crypto utils', () => {
  it('should generate a random salt', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).toHaveLength(16);
    expect(salt2).toHaveLength(16);
    expect(salt1).not.toEqual(salt2);
  });

  it('should encode and decode salt', () => {
    const salt = generateSalt();
    const encoded = encodeSalt(salt);
    const decoded = decodeSalt(encoded);
    expect(decoded).toEqual(salt);
  });

  it('should derive a key from password and salt', async () => {
    const password = 'password123';
    const salt = generateSalt();
    const result = await deriveKey(password, salt);
    expect(result.isOk()).toBe(true);
    const key = result._unsafeUnwrap();
    expect(key.algorithm.name).toBe('AES-GCM');
  });

  it('should encrypt and decrypt data', async () => {
    const password = 'password123';
    const salt = generateSalt();
    const keyResult = await deriveKey(password, salt);
    if (keyResult.isErr()) throw keyResult.error;
    const key = keyResult.value;

    const data = 'Hello, World!';
    const encryptResult = await encrypt(data, key);
    expect(encryptResult.isOk()).toBe(true);
    const encrypted = encryptResult._unsafeUnwrap();

    const decryptResult = await decrypt(encrypted, key);
    expect(decryptResult.isOk()).toBe(true);
    const decrypted = decryptResult._unsafeUnwrap();

    expect(decrypted).toBe(data);
  });

  it('should fail to decrypt with wrong key', async () => {
    const password = 'password123';
    const salt = generateSalt();
    const keyResult = await deriveKey(password, salt);
    if (keyResult.isErr()) throw keyResult.error;
    const key = keyResult.value;

    const data = 'Hello, World!';
    const encryptResult = await encrypt(data, key);
    if (encryptResult.isErr()) throw encryptResult.error;
    const encrypted = encryptResult.value;

    // 別のキーを生成
    const wrongKeyResult = await deriveKey('wrongpassword', salt);
    if (wrongKeyResult.isErr()) throw wrongKeyResult.error;
    const wrongKey = wrongKeyResult.value;

    const decryptResult = await decrypt(encrypted, wrongKey);
    expect(decryptResult.isErr()).toBe(true);
  });
});
