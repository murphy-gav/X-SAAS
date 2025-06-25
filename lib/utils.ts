/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod";

import * as ccxt from 'ccxt';
import { getExchangeConnections } from '@/lib/actions/user.actions'
import { CcxtCacheEntry, ExchangePortfolio, Order, Position, WrappedResult } from '@/types'
import { SUPPORTED_EXCHANGES, SupportedExchange } from '@/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    year: "numeric", // numeric year (e.g., '2023')
    month: "2-digit", // abbreviated month name (e.g., 'Oct')
    day: "2-digit", // numeric day of the month (e.g., '25')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    "en-US",
    dateDayOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function formatAmount(amount: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));

export const removeSpecialCharacters = (value: string) => {
  return value.replace(/[^\w\s]/gi, "");
};


export function extractCustomerIdFromUrl(url: string) {
  // Split the URL string by '/'
  const parts = url.split("/");

  // Extract the last part, which represents the customer ID
  const customerId = parts[parts.length - 1];

  return customerId;
}

export function encryptId(id: string) {
  return btoa(id);
}

export function decryptId(id: string) {
  return atob(id);
}

export const getTransactionStatus = (date: Date) => {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  return date > twoDaysAgo ? "Processing" : "Success";
};

export const signUpSchema = z
  .object({
    firstName: z.string().min(3, "First Name must be at least 3 characters"),
    lastName: z.string().min(3, "Last Name must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

//
// 2) Sign‐In Schema + Type
//
export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

//
// 3) OTP Schema + Type (for “verify-otp”)
//
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
  email: z.string().email("Enter a valid email address"),
});

export type OtpFormData = z.infer<typeof otpSchema>;

//
// Helper: pick a Zod schema by “AuthType”
// (you can import this if you want dynamic schema selection elsewhere)
//
export type AuthType = "sign-in" | "sign-up" | "verify-otp";

export const getAuthSchema = (type: AuthType) => {
  switch (type) {
    case "sign-up":
      return signUpSchema;
    case "verify-otp":
      return otpSchema;
    case "sign-in":
    default:
      return signInSchema;
  }
};

const exchangeInstances: Record<string, CcxtCacheEntry> = {};

/**
 * Gets or creates a CCXT instance for a user's exchange connection
 */
// Clean up stale instances every minute (5-minute expiry)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(exchangeInstances).forEach((key) => {
      if (now - exchangeInstances[key].lastUsed > 300_000) {
        delete exchangeInstances[key];
      }
    });
  }, 60_000);
}

export async function getCcxtInstance(
  userId: string,
  exchangeName: SupportedExchange,
  options?: {
    apiKey?: string;
    secret?: string;
    isTestnet?: boolean;
  }
): Promise<ccxt.Exchange> {
  const isTestnet = options?.isTestnet ?? false;
  const cacheKey = `${userId}-${exchangeName}-${isTestnet ? 'testnet' : 'mainnet'}`;

  // Return cached instance if available
  if (exchangeInstances[cacheKey]) {
    exchangeInstances[cacheKey].lastUsed = Date.now();
    return exchangeInstances[cacheKey].instance;
  }

  // Fetch credentials (from options or DB)
  const { apiKey, secret } = options?.apiKey && options?.secret
    ? { apiKey: options.apiKey, secret: options.secret }
    : await (async () => {
        const connections = await getExchangeConnections(userId);
        const connection = connections.find((conn) => conn.exchange === exchangeName);
        if (!connection) throw new Error(`No ${exchangeName} connection found for user ${userId}`);
        return { apiKey: connection.apiKey, secret: connection.secret };
      })();

  // Initialize CCXT instance with proper typing
  const ExchangeClass = ccxt[exchangeName] as new (config: ccxt.Exchange['options']) => ccxt.Exchange;
  const config: ccxt.Exchange['options'] = {
    apiKey,
    secret,
    enableRateLimit: true,
    timeout: 15000,
    retryOnRateLimit: true,
    numRetries: 3,
    dDoSProtection: true,
  };

  // Handle testnet URLs (exchange-specific)
  if (isTestnet) {
    switch (exchangeName) {
      case 'binance':
        config.urls = { api: 'https://testnet.binance.vision' };
        break;
      case 'bybit':
        config.urls = { api: 'https://api-testnet.bybit.com' };
        break;
      case 'okx':
        config.urls = { api: 'https://www.okx.com' };
        break;
      case 'kucoin':
        config.urls = { api: 'https://openapi-sandbox.kucoin.com' };
        break;
      case 'bitget':
        config.urls = { api: 'https://api.demo.bitget.com' };
        break;
      default:
        console.warn(`${exchangeName} testnet not supported`);
    }
  }

  const instance = new ExchangeClass(config);
  exchangeInstances[cacheKey] = { instance, lastUsed: Date.now() };

  return instance;
}

/**
 * Clears a specific CCXT instance from cache
 */
export function clearCcxtInstance(userId: string, exchangeName: string): void {
  const cacheKey = `${userId}-${exchangeName}`
  delete exchangeInstances[cacheKey]
}

/**
 * Clears all CCXT instances for a user
 */
export function clearUserCcxtInstances(userId: string): void {
  Object.keys(exchangeInstances).forEach((key) => {
    if (key.startsWith(`${userId}-`)) {
      delete exchangeInstances[key]
    }
  })
}

export function isSupportedExchange(
  exchange: string
): exchange is SupportedExchange {
  return SUPPORTED_EXCHANGES.some((supported) => supported === exchange);
}

export async function fetchExchangeBalances(conn: any): Promise<ExchangePortfolio> {
  try {
    const exchange = await getCcxtInstance(conn.userId, conn.exchange);
    const balance = await exchange.fetchBalance();
    return formatBalances(conn, balance);
  } catch (error) {
    console.error(`Failed to fetch ${conn.exchange} balance:`, error);
    return {
      exchange: conn.exchange,
      connectedAt: conn.connectedAt,
      totalValueUSD: 0,
      error: error instanceof Error ? error.message : 'Exchange error',
      balances: []
    };
  }
}

export function formatBalances(
  conn: { exchange: SupportedExchange; connectedAt: string },
  balance: ccxt.Balances
): ExchangePortfolio {
  const balances = Object.entries(balance.total || {})
    .filter(([_, amount]) => Number(amount) > 0)
    .map(([currency, amount]) => ({
      currency,
      amount: Number(amount),
      value: 0
    }));

  return {
    exchange: conn.exchange, // Now properly typed
    connectedAt: conn.connectedAt,
    balances,
    totalValueUSD: 0
  };
}

type CcxtError = ccxt.DDoSProtection | ccxt.RequestTimeout | ccxt.ExchangeError | ccxt.AuthenticationError;

const DEFAULT_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// lib/utils/ccxtWrapper.ts
export async function ccxtCall<T>(
  fn: () => Promise<T>,
  description: string,
  retries = DEFAULT_RETRIES
): Promise<WrappedResult<T>> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const data = await fn();
      return { success: true, data };
    } catch (err: unknown) {
      lastError = err;
      
      if (err instanceof ccxt.AuthenticationError) {
        return { success: false, error: 'Invalid API key or secret.' };
      }
      if (err instanceof ccxt.DDoSProtection) {
        if (attempt < retries) {
          await delay(RETRY_DELAY_MS);
          continue;
        }
        return { success: false, error: 'Rate limit exceeded, please try again.' };
      }
      if (err instanceof ccxt.RequestTimeout) {
        if (attempt < retries) {
          await delay(RETRY_DELAY_MS);
          continue;
        }
        return { success: false, error: 'Network timeout, please check your connection.' };
      }
      if (err instanceof ccxt.ExchangeError) {
        return { success: false, error: `Exchange error: ${err.message}` };
      }
      return { success: false, error: (err as Error)?.message || `Unknown error in ${description}` };
    }
  }

  return { success: false, error: `Failed ${description}: ${(lastError as Error)?.message}` };
}

export function convertCcxtMarket(market: ccxt.Market | undefined): ccxt.Market {
  if (!market) {
    throw new Error('Market data is undefined');
  }

  return {
    ...market,
    id: String(market.id),
    symbol: String(market.symbol),
    base: String(market.base),
    quote: String(market.quote),
    active: Boolean(market.active),
    precision: {
      amount: market.precision?.amount ?? 8,
      price: market.precision?.price ?? 8
    },
    limits: market.limits || {
      amount: { min: undefined, max: undefined },
      price: { min: undefined, max: undefined }
    }
  };
}

export function convertCcxtTicker(ticker: ccxt.Ticker | undefined): ccxt.Ticker {
  if (!ticker) {
    throw new Error('Ticker data is undefined');
  }

  return {
    ...ticker,
    timestamp: Number(ticker.timestamp ?? 0),
    symbol: String(ticker.symbol),
    last: Number(ticker.last ?? 0),
    bid: Number(ticker.bid ?? 0),
    ask: Number(ticker.ask ?? 0),
    high: Number(ticker.high ?? 0),
    low: Number(ticker.low ?? 0)
  };
}

export function convertCcxtOrder(order: ccxt.Order | undefined): Order {
  if (!order) {
    throw new Error('Order data is undefined');
  }

  // Provide safe defaults for required number fields
  const safeNumber = (value: unknown, fallback = 0): number => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  };

  return {
    ...order,
    id: String(order.id),
    symbol: String(order.symbol),
    type: String(order.type),
    side: order.side as 'buy' | 'sell',
    amount: safeNumber(order.amount),
    price: safeNumber(order.price),
    status: order.status ? String(order.status) : 'unknown',
    filled: safeNumber(order.filled),
    remaining: safeNumber(order.remaining),
    cost: safeNumber(order.cost),
    // Optional fields
    timestamp: order.timestamp ? Number(order.timestamp) : Date.now(),
    datetime: order.datetime ? String(order.datetime) : new Date().toISOString(),
    fee: order.fee ? {
      currency: String(order.fee.currency ?? 'USD'),
      cost: Number(order.fee.cost ?? 0),
      rate: order.fee.rate !== undefined ? Number(order.fee.rate) : undefined
    } : { currency: 'USD', cost: 0 }
  };
}

export function convertCcxtPosition(position: ccxt.Position | undefined): Position {
  if (!position) {
    throw new Error('Position data is undefined');
  }

  // Handle amount/contracts conversion safely
  const getAmount = (pos: ccxt.Position): number => {
    if ('amount' in pos && pos.amount !== undefined) {
      return Number(pos.amount);
    }
    if ('contracts' in pos && pos.contracts !== undefined) {
      return Number(pos.contracts);
    }
    return 0; // Fallback
  };

  // Handle side conversion safely
  const getSide = (pos: ccxt.Position): 'long' | 'short' => {
    return String(pos.side).toLowerCase() === 'short' ? 'short' : 'long';
  };

  return {
    ...position,
    symbol: String(position.symbol),
    side: getSide(position),
    amount: getAmount(position),
    contracts: 'contracts' in position ? Number(position.contracts) : undefined,
    entryPrice: Number(position.entryPrice),
    leverage: position.leverage !== undefined ? Number(position.leverage) : undefined,
    liquidationPrice: position.liquidationPrice !== undefined 
      ? Number(position.liquidationPrice) 
      : undefined,
    // Optional CCXT fields
    timestamp: position.timestamp !== undefined ? Number(position.timestamp) : undefined,
    datetime: position.datetime ? String(position.datetime) : undefined,
    notional: position.notional !== undefined ? Number(position.notional) : undefined,
    initialMargin: position.initialMargin !== undefined ? Number(position.initialMargin) : undefined,
    maintenanceMargin: position.maintenanceMargin !== undefined 
      ? Number(position.maintenanceMargin) 
      : undefined
  };
}