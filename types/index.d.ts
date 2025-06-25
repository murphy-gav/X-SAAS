/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import type { MouseEvent } from 'react';
import * as ccxt from 'ccxt';
import { SupportedExchange } from "@/constants";
import type { Ticker as CcxtTicker, Position as CcxtPosition } from 'ccxt';

export interface NavLinkProps {
  title: string;
  href: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export interface ButtonProps {
  icon?: string;
  children: ReactNode;
  href?: string;
  containerClassName?: string;
  onClick?: () => void;
  markerFill?: string;
}

export interface MarkerProps {
  fill?: string;
}

export interface CCXTProps {
   
  user: any;
  variant: string;
}

export type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignInFormData = {
  email: string;
  password: string;
};

export type User = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  // No need to include password here
};

export type OtpFormData = {
  otp: string;
  email: string;
};

export interface CustomInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  type?: string;
}

export type CcxtConfig = {
  apiKey: string;
  secret: string;
  enableRateLimit?: boolean;
  timeout?: number;
  urls?: {
    api?: {
      public?: string;
      private?: string;
    };
    // Add Binance-specific endpoints
    sapi?: string;
    fapi?: string;
    dapi?: string;
    eapi?: string;
    [key: string]: any; // For any additional endpoints
  };
  options?: {
    adjustForTimeDifference?: boolean;
    defaultType?: string;
    testnet?: boolean;
    enableMargin?: boolean;
    enableFutures?: boolean;
    enableSwap?: boolean;
    [key: string]: any;
  };
};

// Type for CCXT exchange constructors
export type CcxtExchangeConstructor = new (config: CcxtConfig) => ccxt.Exchange;

// Type mapping our supported exchanges to their constructors
export type SupportedExchangeConstructors = {
  [K in SupportedExchange]: CcxtExchangeConstructor;
};

// Base response type with generic data type
export interface BaseResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}


export type MarketResponse = BaseResponse<Market[]>;
export type TickerResponse = BaseResponse<Ticker>;
export type OrderResponse = BaseResponse<Order>;
export type PositionResponse = BaseResponse<Position[]>;

interface Market extends ccxt.MarketInterface {
  id: string;
  symbol: string;
  base: string;
  quote: string;
  active: boolean;
  precision: {
    amount: number;
    price: number;
  };
  limits: {
    amount: { min: number; max: number };
    price: { min: number; max: number };
    cost: { min: number; max: number };
  };
  takerFee?: number;
  makerFee?: number;
  type: 'spot' | 'future' | 'margin' | 'swap';
  spot: boolean;
  futures?: boolean;
  margin: boolean;
  info: any;
}

export function convertCcxtMarket(market: unknown): Market {
  return market as Market;
}

export function convertCcxtTicker(ticker: unknown): Ticker {
  return ticker as Ticker;
}

interface Ticker extends Omit<CcxtTicker, 'timestamp'> {
  symbol: string;
  timestamp: number;
  datetime: string;
  last: number;
  bid: number;
  ask: number;
  high: number;  // Made required to match CCXT
  low: number;   // Made required to match CCXT
  open: number;
  close: number;
  baseVolume: number;
  quoteVolume: number;
  change: number;
  percentage: number;
  average: number;
  vwap: number;
  previousClose: number;
  change24h?: number;
  info: any;
}

// In your types file (e.g., types/index.ts)
export interface Order extends Omit<ccxt.Order, 'type' | 'side'> {
  id: string;
  symbol: string;
  type: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  status: string;
  filled: number;
  remaining: number;
  cost: number;
  timestamp: number;  // Required to match CCXT
  datetime: string;   // Required to match CCXT
  fee: {              // Required to match CCXT
    currency: string;
    cost: number;
    rate?: number;    // Only rate is optional
  };
}

export interface Position extends Omit<CcxtPosition, 'side'> {
  symbol: string;
  side: 'long' | 'short';  // Your stricter type
  amount: number;          // Your required field
  contracts?: number;      // CCXT's field for derivatives
  entryPrice: number;
  leverage?: number;
  liquidationPrice?: number;
  // Include other CCXT fields you need
  timestamp?: number;
  datetime?: string;
  notional?: number;
  initialMargin?: number;
  maintenanceMargin?: number;
}

// You might also want to add these types based on the helper functions
export interface ExchangeConnection {
  userId: string;
  exchange: string;
  apiKey: string;
  secret: string;
  connectedAt: Date | string;
  isTestnet?: boolean;
}

export interface Balance {
  total: Record<string, number>;
  free?: Record<string, number>;
  used?: Record<string, number>;
}

export interface DecryptedExchangeConnection {
  id: string;
  exchange: SupportedExchange; // Changed from string
  connectedAt: string;
  apiKey: string;
  secret: string;
}

export interface ExchangeConnection {
  id: string;
  exchange_name: string;
  connected_at: string;
  decrypted_api_key: string;
  decrypted_secret_key: string;
}

export type ExchangeCredentials = {
  apiKey: string | Uint8Array;
  secret: string | Uint8Array;
};

export type ExchangeConnectionFormData = {
  exchange: SupportedExchange;
  userId: string;
  isTestnet?: boolean;
} & ExchangeCredentials;

export type CcxtCacheEntry = {
  instance: ccxt.Exchange;
  lastUsed: number;
};

export type WrappedResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// In your types file:
export interface ExchangePortfolio {
  exchange: SupportedExchange;
  balances: AssetBalance[];
  connectedAt: string;
  totalValueUSD: number;
  error?: string;
}

export interface AssetBalance {
  currency: string;
  amount: number;
  value?: number; // USD value
}

export type PortfolioResponse = BaseResponse<ExchangePortfolio[]> & {
  metadata?: {
    totalValueUSD: number;
    exchangeCount: number;
    assetCount: number;
  };
};

declare interface SiderbarProps {
  user: User;
}

declare interface MobileNavProps {
  user: User;
}

declare interface FooterProps {
  user: User;
  type?: 'mobile' | 'desktop'
}