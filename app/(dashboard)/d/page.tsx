import { getUser } from '@/lib/actions/user.actions'
import { getCompletePortfolio } from '@/lib/actions/exchange.actions';
import { redirect } from 'next/navigation'
import { SUPPORTED_EXCHANGES, EXCHANGE_DISPLAY_NAMES, SupportedExchange } from '@/constants'
import type { PortfolioResponse } from '@/types'

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) return redirect('/sign-in');
  if (!user.onboarded) return redirect('/onboarding');

  // Get portfolio for all supported exchanges
  const portfolioResponse: PortfolioResponse = await getCompletePortfolio(
    user.id,
    SUPPORTED_EXCHANGES // Use all supported exchanges
  );

  if (!portfolioResponse.success) {
    throw new Error(portfolioResponse.error || 'Failed to load portfolio');
  }

  const exchanges = portfolioResponse.data ?? [];
  const totalValueUSD = portfolioResponse.metadata?.totalValueUSD ?? 0;
  const connectedExchangeCount = exchanges.length;

  // Exchanges with testnet support
  const TESTNET_SUPPORTED_EXCHANGES = ['binance', 'kucoin', 'okx', 'bybit', 'bitget'];

  return (
    <section className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.firstName}</h1>
          <p className="text-gray-400">Your crypto portfolio overview</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
            Refresh Data
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
            Add Exchange
          </button>
        </div>
      </div>
      
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Total Value</h2>
          <p className="text-3xl font-bold">
            ${totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Connected Exchanges</h2>
          <p className="text-3xl font-bold">{connectedExchangeCount}</p>
          <p className="text-sm text-gray-400 mt-1">
            of {SUPPORTED_EXCHANGES.length} supported
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Assets Held</h2>
          <p className="text-3xl font-bold">{portfolioResponse.metadata?.assetCount || 0}</p>
        </div>
      </div>

      {/* Exchange Connections Status */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Exchange Connections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SUPPORTED_EXCHANGES.map((exchange) => {
            const isConnected = exchanges.some(e => e.exchange === exchange);
            const supportsTestnet = TESTNET_SUPPORTED_EXCHANGES.includes(exchange);
            
            return (
              <div 
                key={exchange} 
                className={`p-3 rounded-lg border ${isConnected ? 'border-green-500 bg-gray-800' : 'border-gray-700 bg-gray-900'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  <h3 className="font-medium">{EXCHANGE_DISPLAY_NAMES[exchange]}</h3>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{isConnected ? 'Connected' : 'Not Connected'}</span>
                  {supportsTestnet && (
                    <span className="text-blue-400">Testnet Available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exchange Holdings */}
      <h2 className="text-xl font-bold mb-4">Your Holdings</h2>
      {exchanges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exchanges.map((exchange) => (
            <div key={exchange.exchange} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">
                  {EXCHANGE_DISPLAY_NAMES[exchange.exchange as SupportedExchange]}
                </h3>
                <span className="font-medium">
                  ${exchange.totalValueUSD?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="space-y-3">
                {exchange.balances.map((asset) => (
                  <div key={asset.currency} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{asset.currency}</span>
                      {asset.value && (
                        <div className="text-sm text-gray-400">
                          ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div>{asset.amount.toFixed(8)}</div>
                      {asset.value && asset.amount > 0 && (
                        <div className="text-sm text-gray-400">
                          ${(asset.value / asset.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} each
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium mb-2">No exchanges connected</h3>
          <p className="text-gray-400 mb-4">Connect your first exchange to view your portfolio</p>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            Connect Exchange
          </button>
        </div>
      )}
    </section>
  )
}