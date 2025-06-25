/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";
import { getCcxtInstance } from '@/lib/utils';
import { SupportedExchange } from '@/constants';
import { ccxtCall } from '@/lib/utils';
import {
  PortfolioResponse,
  AssetBalance,
  ExchangePortfolio
} from '@/types';
import * as ccxt from 'ccxt';

// Helper function to calculate USD values
async function calculateAssetValues(balances: AssetBalance[]): Promise<AssetBalance[]> {
  // Implement your pricing logic here
  // This could use CCXT's fetchTicker or an external price API
  return Promise.all(balances.map(async (asset) => {
    try {
      const instance = new ccxt.binance(); // Default pricing exchange
      const ticker = await instance.fetchTicker(`${asset.currency}/USDT`);
      const price = ticker.last;
      return {
        ...asset,
        value: asset.amount * (price || 0)
      };
    } catch (error) {
      console.error(`Failed to get price for ${asset.currency}:`, error);
      return asset; // Return unchanged if price fetch fails
    }
  }));
}

// Core Portfolio Functions
export async function getExchangeBalances(
  userId: string,
  exchange: SupportedExchange
): Promise<PortfolioResponse> {
  const instance = await getCcxtInstance(userId, exchange);
  const result = await ccxtCall(
    () => instance.fetchBalance(),
    `fetching ${exchange} balances`
  );

  if (!result.success || !result.data) {
    return { 
      success: false, 
      error: result.error || 'No balance data received' 
    };
  }

  // Format raw balances
  const rawBalances = Object.entries(result.data.total || {})
    .filter(([_, amount]) => Number(amount) > 0)
    .map(([currency, amount]) => ({
      currency,
      amount: Number(amount),
      value: 0 // Will be calculated below
    }));

  // Calculate USD values
  const balancesWithValues = await calculateAssetValues(rawBalances);

  return { 
    success: true, 
    data: [{
      exchange,
      balances: balancesWithValues,
      connectedAt: new Date().toISOString(),
      totalValueUSD: balancesWithValues.reduce((sum, asset) => sum + (asset.value || 0), 0)
    }] 
  };
}

export async function getCompletePortfolio(
  userId: string,
  exchanges: readonly SupportedExchange[]
): Promise<PortfolioResponse> {
  const results = await Promise.all(
    exchanges.map(exchange => 
      getExchangeBalances(userId, exchange)
        .catch(error => ({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: undefined
        }))
    )
  );

  // Combine successful results
  const successfulResults = results.filter(r => r.success) as {
    success: true;
    data: ExchangePortfolio[];
  }[];

  const allPortfolios = successfulResults.flatMap(r => r.data);
  const totalValueUSD = allPortfolios.reduce(
    (sum, portfolio) => sum + (portfolio.totalValueUSD || 0), 
    0
  );

  return {
    success: true,
    data: allPortfolios,
    metadata: {
      totalValueUSD,
      exchangeCount: allPortfolios.length,
      assetCount: allPortfolios.flatMap(p => p.balances).length
    }
  };
}

// Utility function to get all holdings of a specific asset
export async function getAssetHoldings(
  userId: string,
  exchanges: SupportedExchange[],
  currency: string
): Promise<{
  totalAmount: number;
  totalValueUSD: number;
  holdings: Array<{
    exchange: string;
    amount: number;
    valueUSD: number;
  }>
}> {
  const { data: portfolios } = await getCompletePortfolio(userId, exchanges);
  const holdings = portfolios?.flatMap(portfolio => 
    portfolio.balances
      .filter(b => b.currency === currency)
      .map(balance => ({
        exchange: portfolio.exchange,
        amount: balance.amount,
        valueUSD: balance.value || 0
      }))
  ) || [];

  return {
    totalAmount: holdings.reduce((sum, h) => sum + h.amount, 0),
    totalValueUSD: holdings.reduce((sum, h) => sum + h.valueUSD, 0),
    holdings
  };
}