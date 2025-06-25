/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import * as ccxt from 'ccxt';
import { revalidatePath } from 'next/cache';
import { SupportedExchange } from '@/constants'
import { CcxtConfig, DecryptedExchangeConnection, ExchangeConnection, ExchangeCredentials, SupportedExchangeConstructors } from '@/types';
import { encrypt, decrypt } from '@/lib/crypto';
import { isSupportedExchange } from '../utils';

type AuthResult = 
  | { error: string }
  | { success: true }
  | { needsEmailVerification: true, email: string }; 

export const signIn = async (formData: { email: string; password: string }) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    // Check if error is due to unverified email
    if (error.message.toLowerCase().includes('email not confirmed') || 
        error.message.toLowerCase().includes('verify your email')) {
      return { 
        error: 'Please verify your email first', 
        needsVerification: true,
        email: formData.email 
      };
    }
    return { error: error.message };
  }

  // Just return the user data, let the client/router handle redirection
  return { user: data.user };
};

export const signUp = async (formData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResult> => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && !data.session) {
    return { 
      needsEmailVerification: true,
      email: formData.email 
    };
  }

  if (data.user && data.session) {
    const email = data.user.email;
    if (!email) {
      return { error: 'User email is missing' };
    }
    await createUserProfile(supabase, data.user.id, email, formData);
    return { success: true };
  }

  return { error: 'Signup failed' };
};

export async function createUserProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string,
  formData: { firstName: string; lastName: string }
) {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      onboarded: false,
    });

  if (error) {
    throw error;
  }
}

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/sign-in');
};

export const getSession = async () => {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// lib/actions/user.actions.ts

export const getUser = async () => {
  const supabase = await createClient();

  // 1. Fetch auth user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  // 2. Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name, onboarded')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return null;

  // 3. Return combined user + profile data
  return {
    id: user.id,
    email: user.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    onboarded: profile.onboarded,
  };
};


export const resendOtpLink = async (email: string) => {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?type=signup`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
  
  return { success: true };
};


export async function validateExchangeCredentials(
  exchangeName: SupportedExchange,
  credentials: ExchangeCredentials,
    isTestnet: boolean = true
  ): Promise<boolean> {
    const supabase = await createClient();
    let apiKey: string;
    let secret: string;

    // Handle encrypted credentials
    if (typeof credentials.apiKey !== 'string' || typeof credentials.secret !== 'string') {
    try {
      const { data, error } = await supabase.rpc('decrypt_keys', {
        p_api_key_enc: credentials.apiKey,
        p_secret_key_enc: credentials.secret,
        p_passphrase: process.env.DB_PASSPHRASE
      });
      
      if (error) throw error;
      if (!data) throw new Error('Decryption returned no data');
      
      apiKey = data.api_key;
      secret = data.secret_key;
    } catch (error) {
      console.error('Failed to decrypt credentials:', error);
      throw new Error('Failed to decrypt exchange credentials');
    }
  } else {
    apiKey = credentials.apiKey;
    secret = credentials.secret;
  }

  try {
    const ExchangeClass = (ccxt as unknown as SupportedExchangeConstructors)[exchangeName];
    
    if (!ExchangeClass) {
      throw new Error(`CCXT does not support exchange: ${exchangeName}`);
    }

    const config: CcxtConfig = {
      apiKey: apiKey.trim(),
      secret: secret.trim(),
      enableRateLimit: true,
      timeout: 20000,
      options: {
        adjustForTimeDifference: true
      }
    };

    if (isTestnet && exchangeName === 'binance') {
      config.urls = {
        api: {
          public: 'https://testnet.binance.vision/api',
          private: 'https://testnet.binance.vision/api'
        }
      };
      
      config.options = {
        ...config.options,
        defaultType: 'spot',
        testnet: true,
        enableMargin: false,
        enableFutures: false,
        enableSwap: false,
        createMarketBuyOrderRequiresPrice: true,
        fetchMarkets: ['spot']
      };
    }

    const exchange = new ExchangeClass(config);

    // Verify configuration
    console.log('Exchange configured with:', {
      urls: exchange.urls,
      options: exchange.options,
      apiKey: config.apiKey.slice(0, 5) + '...' + config.apiKey.slice(-3)
    });

    // Test connection with simple endpoint
    console.log('Testing connection...');
    await exchange.fetchTime();
    
    // Fetch spot balance only
    console.log('Fetching balance...');
    const balance = await exchange.fetchBalance({ type: 'spot' });
    console.log('Connection successful! Balance:', Object.keys(balance.total));

    return true;
  } catch (error) {
    const err = error as any;
    console.error('Connection failed:', {
      message: err.message,
      url: err.url,
      request: err.request,
      response: err.response
    });

    if (err.message.includes('testnet/sandbox URL')) {
      throw new Error(
        'Binance testnet only supports spot trading. ' +
        'Please generate new testnet keys with only spot trading permissions.'
      );
    }

    throw new Error(`Failed to connect to ${exchangeName}: ${err.message}`);
  }
}

/**
 * Enhanced version of connectExchange with better validation and error handling
 */
export const connectExchange = async (formData: {
  exchange: SupportedExchange;
  apiKey: string;
  secret: string;
  userId: string;
  isTestnet?: boolean;
}) => {
  const supabase = await createClient();

  try {
    // 1. Validate credentials
    await validateExchangeCredentials(
      formData.exchange,
      {
        apiKey: formData.apiKey,
        secret: formData.secret
      },
      formData.isTestnet
    );

    // 2. Encrypted upsert
    const { error } = await supabase.rpc('upsert_encrypted_connection', {
      p_user_id: formData.userId,
      p_exchange_name: formData.exchange,
      p_api_key: formData.apiKey,
      p_secret_key: formData.secret,
      p_passphrase: process.env.DB_PASSPHRASE
    });

    if (error) throw error;

    // 3. Update user profile
    await supabase.from('profiles')
      .update({ onboarded: true })
      .eq('id', formData.userId);

    revalidatePath('/d');
    revalidatePath('/onboarding');
    return { success: true };
  } catch (err) {
    console.error('Exchange connection failed:', err);
    return { error: err instanceof Error ? err.message : 'Connection failed' };
  }
};

/**
 * Returns a list of all of this user’s exchange_connections.
 * Because we store `api_key`/`secret_key` as bytea (PGP-encrypted),
 * we use pgp_sym_decrypt(...) in our SELECT so that client code
 * receives plaintext strings again.
 */
export const getExchangeConnections = async (
  userId: string
): Promise<DecryptedExchangeConnection[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_decrypted_connections', {
    p_user_id: userId,
    p_passphrase: process.env.DB_PASSPHRASE
  });

  if (error) throw error;

  return data.map((row: { exchange_name: string; id: any; connected_at: any; decrypted_api_key: any; decrypted_secret_key: any; }) => {
    if (!isSupportedExchange(row.exchange_name)) {
      throw new Error(`Unsupported exchange: ${row.exchange_name}`);
    }
    return {
      id: row.id,
      exchange: row.exchange_name,
      connectedAt: row.connected_at,
      apiKey: row.decrypted_api_key,
      secret: row.decrypted_secret_key
    };
  });
};
export const storeExchangeConnection = async (
  userId: string,
  exchange: string,
  apiKey: string,
  secret: string
) => {
  const supabase = await createClient();

  // Encrypt credentials before storing
  const encryptedApiKey = await encrypt(apiKey);
  const encryptedSecret = await encrypt(secret);

  const { data, error } = await supabase
    .from('exchange_connections')
    .insert({
      user_id: userId,
      exchange_name: exchange,
      api_key: encryptedApiKey,
      secret_key: encryptedSecret
    })
    .select();

  if (error) {
    console.error('Error storing exchange connection:', error.message);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true, data };
};