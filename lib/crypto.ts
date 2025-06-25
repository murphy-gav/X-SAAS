// lib/crypto/utils.ts
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Runtime validation of ENV variables
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY is not defined. Please add it to your environment variables.'
    );
  }
  return key;
};

const ALGORITHM = 'aes-256-cbc';

// Create key only when needed to ensure ENV is loaded
const getKey = () => {
  return scryptSync(getEncryptionKey(), 'salt', 32);
};

export const encrypt = (text: string): string => {
  try {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const decrypt = (encryptedText: string): string => {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};