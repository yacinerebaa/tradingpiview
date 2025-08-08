// Elements
const symbolSelect = document.getElementById("symbol-select");
const timeframeSelect = document.getElementById("timeframe-select");
const priceEl = document.getElementById("live-price");
const priceChangeEl = document.getElementById("price-change");
const alertMsgEl = document.getElementById("alert-msg");
const takeProfitInput = document.getElementById("take-profit");
const stopLossInput = document.getElementById("stop-loss");
const setAlertsBtn = document.getElementById("set-alerts-btn");
const bidsEl = document.getElementById("bids");
const asksEl = document.getElementById("asks");
const tradesListEl = document.getElementById("trades-list");
const symbolDisplay = document.getElementById("symbol");

let currentSymbol = symbolSelect.value;
let currentTimeframe = timeframeSelect.value;

let currentPrice = 0;
let lastPrice = 0;
let takeProfit = null;
let stopLoss = null;

let wsTicker, wsDepth, wsTrades;
let tradingViewWidget = null;

// WebSocket setup and management
function initWebSockets(symbol) {
  // Close old sockets if any
  if (wsTicker) wsTicker.close();
  if (wsDepth) wsDepth.close();
  if (wsTrades) wsTrades.close();

  wsTicker = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);
  wsDepth = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@depth20@100ms`);
  wsTrades = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);

  wsTicker.onmessage = event => {
    const data = JSON.parse(event.data);
    lastPrice = currentPrice;
    currentPrice = parseFloat(data.c); // Last price

    priceEl.textContent = `$${currentPrice.toFixed(2)}`;

    const changePercent = parseFloat(data.P); // Price change %
    if (changePercent > 0) {
      priceChangeEl.textContent = `+${changePercent.toFixed(2)}%`;
      priceChangeEl.className = "positive";
    } else if (changePercent < 0) {
      priceChangeEl.textContent = `${changePercent.toFixed(2)}%`;
      priceChangeEl.className = "negative";
    } else {
      priceChangeEl.textContent = "+0.00%";
      priceChangeEl.className = "neutral";
    }

    checkAlerts();
  };

  wsDepth.onmessage = event => {
    const data = JSON.parse(event.data);
    updateOrderBook(data);
  };

  wsTrades.onmessage = event => {
    const data = JSON.parse(event.data);
    updateTrades(data);
  };
}

// Update order book UI
function updateOrderBook(data) {
  // bids and asks arrays: [price, qty]
  const bids = data.bids.slice(0, 10);
  const asks = data.asks.slice(0, 10);

  bidsEl.innerHTML = "";
  asksEl.innerHTML = "";

  bids.forEach(([price, qty]) => {
    const el = document.createElement("div");
    el.innerHTML = `<span class="price">${parseFloat(price).toFixed(2)}</span> | ${parseFloat(qty).toFixed(4)}`;
    bidsEl.appendChild(el);
  });

  asks.forEach(([price, qty]) => {
    const el = document.createElement("div");
    el.innerHTML = `<span class="price">${parseFloat(price).toFixed(2)}</span> | ${parseFloat(qty).toFixed(4)}`;
    asksEl.appendChild(el);
  });
}

// Update recent trades UI
function updateTrades(data) {
  const el = document.createElement("li");
  el.textContent = `${parseFloat(data.p).toFixed(2)} | ${parseFloat(data.q).toFixed(4)}`;
  el.className = data.m ? "trade-sell" : "trade-buy";

  tradesListEl.prepend(el);

  // Keep max 50 trades
  if (tradesListEl.children.length > 50) {
    tradesListEl.removeChild(tradesListEl.lastChild);
  }
}

// Alert checks for TP/SL
function checkAlerts() {
  if (takeProfit && currentPrice >= takeProfit) {
    alertMsgEl.textContent = `🚨 Take Profit hit! Current price is $${currentPrice.toFixed(2)}`;
    alertMsgEl.style.color = "#2ea043";
  } else if (stopLoss && currentPrice <= stopLoss) {
    alertMsgEl.textContent = `🚨 Stop Loss hit! Current price is $${currentPrice.toFixed(2)}`;
    alertMsgEl.style.color = "#f85149";
  } else {
    alertMsgEl.textContent = "";
  }
}

// Set alerts event
setAlertsBtn.addEventListener("click", () => {
  takeProfit = parseFloat(takeProfitInput.value) || null;
  stopLoss = parseFloat(stopLossInput.value) || null;
  alertMsgEl.textContent = "";

  checkAlerts();
});

// TradingView chart loader
function loadTradingViewChart(symbol, interval) {
  if (tradingViewWidget) {
    tradingViewWidget.remove();
    tradingViewWidget = null;
  }
  tradingViewWidget = new TradingView.widget({
    width: "100%",
    height: 400,
    symbol: symbol.toUpperCase(),
    interval: interval,
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#131722",
    enable_publishing: false,
    allow_symbol_change: false,
    container_id: "chart",
  });
}

// Symbol or timeframe change handlers
symbolSelect.addEventListener("change", () => {
  currentSymbol = symbolSelect.value;
  symbolDisplay.textContent = currentSymbol.toUpperCase().replace("USDT", "/USDT");
  initWebSockets(currentSymbol);
  loadTradingViewChart(currentSymbol, currentTimeframe);
});

timeframeSelect.addEventListener("change", () => {
  currentTimeframe = timeframeSelect.value;
  loadTradingViewChart(currentSymbol, currentTimeframe);
});

// Wallet connect placeholder
document.getElementById("wallet-connect-btn").addEventListener("click", () => {
  alert("Wallet connect coming soon! (MetaMask, WalletConnect, Pi Wallet, etc.)");
});

// Initialize on load
window.addEventListener("load", () => {
  symbolDisplay.textContent = currentSymbol.toUpperCase().replace("USDT", "/USDT");
  initWebSockets(currentSymbol);
  loadTradingViewChart(currentSymbol, currentTimeframe);
});
