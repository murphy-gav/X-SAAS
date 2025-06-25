// List of exchanges we officially support in the UI
// You can expand this list as needed
export const SUPPORTED_EXCHANGES = [
  'binance',
  'coinbase', //testnet not supported
  'kraken',  //testnet not supported
  'kucoin',
  'okx',
  'bybit',
  'bitget',
  'huobi', //testnet not suppoted
] as const

export type SupportedExchange = typeof SUPPORTED_EXCHANGES[number]

// Exchange display names for UI
export const EXCHANGE_DISPLAY_NAMES: Record<SupportedExchange, string> = {
  binance: 'Binance',
  coinbase: 'Coinbase Pro',
  kraken: 'Kraken',
  kucoin: 'KuCoin',
  okx: 'OKX',
  bybit: 'Bybit',
  bitget: 'Bitget',
  huobi: 'Huobi',
}

export const sidebarLinks = [
  {
    imgURL: "/assets/icon/home.svg",
    route: "/",
    label: "Dashboard",
  },
  {
    imgURL: "/assets/icon/dollar-circle.svg",
    route: "/d",
    label: "My Porfolio",
  },
  {
    imgURL: "/assets/icon/transaction.svg",
    route: "/d",
    label: "Trading",
  },
  {
    imgURL: "/assets/icon/money-send.svg",
    route: "/d",
    label: "Other",
  },
];