const symbol = "btcusdt"; // lowercase symbol for Binance API & WS
const priceEl = document.getElementById("live-price");
const priceChangeEl = document.getElementById("price-change");
const alertMsgEl = document.getElementById("alert-msg");
const takeProfitInput = document.getElementById("take-profit");
const stopLossInput = document.getElementById("stop-loss");
const setAlertsBtn = document.getElementById("set-alerts-btn");
const bidsEl = document.getElementById("bids");
const asksEl = document.getElementById("asks");
const tradesListEl = document.getElementById("trades-list");

let currentPrice = 0;
let lastPrice = 0;
let takeProfit = null;
let stopLoss = null;

// WebSocket streams for real-time data
const wsTicker = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);
const wsDepth = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@depth20@100ms`);
const wsTrades = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);

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

function updateTrades(data) {
  // data: {p: price, q: quantity, m: isBuyerMaker}
  const el = document.createElement("li");
  el.textContent = `${parseFloat(data.p).toFixed(2)} | ${parseFloat(data.q).toFixed(4)}`;
  el.className = data.m ? "trade-sell" : "trade-buy";

  tradesListEl.prepend(el);

  // Keep max 50 trades
  if (tradesListEl.children.length > 50) {
    tradesListEl.removeChild(tradesListEl.lastChild);
  }
}

setAlertsBtn.addEventListener("click", () => {
  takeProfit = parseFloat(takeProfitInput.value);
  stopLoss = parseFloat(stopLossInput.value);
  alertMsgEl.textContent = "";

  if (takeProfit && currentPrice >= takeProfit) {
    alertMsgEl.textContent = `🚨 Take Profit hit! Current price is $${currentPrice.toFixed(2)}`;
    alertMsgEl.style.color = "#2ea043";
  } else if (stopLoss && currentPrice <= stopLoss) {
    alertMsgEl.textContent = `🚨 Stop Loss hit! Current price is $${currentPrice.toFixed(2)}`;
    alertMsgEl.style.color = "#f85149";
  }
});

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
