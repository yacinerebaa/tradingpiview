const COINGECKO_API = "https://api.coingecko.com/api/v3/coins/pi-network?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";
const GATEIO_ORDERBOOK_API = "https://api.gate.io/api2/1/orderBook/pi_usdt";
const GATEIO_TRADES_API = "https://api.gate.io/api2/1/tradeHistory/pi_usdt";

const priceElem = document.getElementById("pi-price");
const marketCapElem = document.getElementById("market-cap");
const volumeElem = document.getElementById("volume");
const circSupplyElem = document.getElementById("circ-supply");
const totalSupplyElem = document.getElementById("total-supply");

const bidsTableBody = document.querySelector("#bids-table tbody");
const asksTableBody = document.querySelector("#asks-table tbody");
const tradesList = document.getElementById("trades-list");
const heatmapBar = document.getElementById("heatmap-bar");

let lastPrice = 0;

async function fetchPiMarketData() {
  try {
    const res = await fetch(COINGECKO_API);
    const data = await res.json();

    const price = data.market_data.current_price.usd;
    const marketCap = data.market_data.market_cap.usd;
    const volume = data.market_data.total_volume.usd;
    const circSupply = data.market_data.circulating_supply;
    const totalSupply = data.market_data.total_supply;

    animatePriceChange(price);
    marketCapElem.textContent = formatNumber(marketCap);
    volumeElem.textContent = formatNumber(volume);
    circSupplyElem.textContent = formatNumber(circSupply);
    totalSupplyElem.textContent = formatNumber(totalSupply);
  } catch (e) {
    console.error("Failed to fetch Pi market data:", e);
  }
}

function animatePriceChange(newPrice) {
  if (lastPrice === 0) {
    priceElem.textContent = `$${newPrice.toFixed(6)}`;
  } else {
    const diff = newPrice - lastPrice;
    priceElem.textContent = `$${newPrice.toFixed(6)}`;
    priceElem.style.transition = "none";
    priceElem.style.color = diff > 0 ? "#4caf50" : diff < 0 ? "#e91e63" : "#b2fab4";

    setTimeout(() => {
      priceElem.style.transition = "color 1s ease";
      priceElem.style.color = "#b2fab4";
    }, 500);
  }
  lastPrice = newPrice;
}

function formatNumber(num) {
  if (!num) return "0";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toFixed(2);
}

async function fetchOrderBook() {
  try {
    const res = await fetch(GATEIO_ORDERBOOK_API);
    const data = await res.json();

    // Clear tables
    bidsTableBody.innerHTML = "";
    asksTableBody.innerHTML = "";

    // Show top 10 bids (highest price)
    const bids = data.bids.slice(0, 10);
    bids.forEach(([price, amount]) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${parseFloat(price).toFixed(6)}</td><td>${parseFloat(amount).toFixed(4)}</td>`;
      bidsTableBody.appendChild(row);
    });

    // Show top 10 asks (lowest price)
    const asks = data.asks.slice(0, 10);
    asks.forEach(([price, amount]) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${parseFloat(price).toFixed(6)}</td><td>${parseFloat(amount).toFixed(4)}</td>`;
      asksTableBody.appendChild(row);
    });

    updateHeatmap(bids, asks);
  } catch (e) {
    console.error("Failed to fetch order book:", e);
  }
}

async function fetchRecentTrades() {
  try {
    const res = await fetch(GATEIO_TRADES_API);
    const trades = await res.json();

    tradesList.innerHTML = "";
    trades.slice(0, 20).forEach((trade) => {
      const li = document.createElement("li");
      li.classList.add(trade.type === "buy" ? "buy" : "sell");
      const time = new Date(trade.time * 1000).toLocaleTimeString();
      li.textContent = `${time} - ${trade.type.toUpperCase()} ${parseFloat(trade.amount).toFixed(4)} PI @ $${parseFloat(trade.price).toFixed(6)}`;
      tradesList.appendChild(li);
    });
  } catch (e) {
    console.error("Failed to fetch recent trades:", e);
  }
}

function updateHeatmap(bids, asks) {
  // Calculate total bid and ask volume
  const totalBid = bids.reduce((acc, bid) => acc + parseFloat(bid[1]), 0);
  const totalAsk = asks.reduce((acc
