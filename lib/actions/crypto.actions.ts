// lib/crypto/server.ts (server actions file)
'use server';

import { createClient } from '@/lib/supabase/server';
// import { encrypt, decrypt } from '@/lib/crypto';

export const encryptInDB = async (data: string): Promise<string> => {
  const supabase = await createClient();
  const { data: result, error } = await supabase.rpc('pgp_sym_encrypt', {
    data,
    passphrase: process.env.DB_PASSPHRASE!
  });
  
  if (error) throw error;
  return result;
};

export const decryptFromDB = async (cipher: string): Promise<string> => {
  const supabase = await createClient();
  const { data: result, error } = await supabase.rpc('pgp_sym_decrypt', {
    cipher,
    passphrase: process.env.DB_PASSPHRASE!
  });
  
  if (error) throw error;
  return result;
};