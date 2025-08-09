// TradingPiView Pro Dashboard JS

// ========== CONFIG ==========

const CMC_API_KEY = 'YOUR_CMC_API_KEY'; // <-- Replace with your CoinMarketCap API key or remove CMC features
const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';

const ASSETS = [
  { id: "piusdt", display: "PI / USDT", cmcId: "pi-network", exchanges: ["bitget", "gateio", "okx"] },
  { id: "iceusdt", display: "ICE / USDT", cmcId: "ice-token", exchanges: ["binance"] },
  { id: "xrpusdt", display: "XRP / USDT", cmcId: "ripple", exchanges: ["binance"] },
  { id: "solusdt", display: "SOL / USDT", cmcId: "solana", exchanges: ["binance"] },
  { id: "adausdt", display: "ADA / USDT", cmcId: "cardano", exchanges: ["binance"] },
  { id: "dogeusdt", display: "DOGE / USDT", cmcId: "dogecoin", exchanges: ["binance"] },
  { id: "btcusdt", display: "BTC / USDT", cmcId: "bitcoin", exchanges: ["binance"] },
  { id: "ethusdt", display: "ETH / USDT", cmcId: "ethereum", exchanges: ["binance"] },
  { id: "bnbusdt", display: "BNB / USDT", cmcId: "binancecoin", exchanges: ["binance"] },
];

// === Global state ===
let selectedAsset = ASSETS[0]; // default: PI
let selectedTimeframe = "5"; // 5m
let tradingViewWidget = null;
let alerts = { tp: null, sl: null };

// === DOM references ===
const assetsUl = document.getElementById("assets-ul
