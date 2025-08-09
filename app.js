const COINGECKO_API = "https://api.coingecko.com/api/v3/coins/pi-network?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

const GATEIO_ORDERBOOK_API = CORS_PROXY + "https://api.gate.io/api2/1/orderBook/pi_usdt";
const GATEIO_TRADES_API = CORS_PROXY + "https://api.gate.io/api2/1/tradeHistory/pi_usdt";

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
    showLoading(true);
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
    priceElem.textContent = "Error fetching data";
    marketCapElem.textContent = "-";
    volumeElem.textContent = "-";
    circSupplyElem.textContent = "-";
    totalSupplyElem.textContent = "-";
  } finally {
    showLoading(false);
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
    if (!res.ok) throw new Error("Order book fetch failed");
    const data = await res.json();

    bidsTableBody.innerHTML = "";
    asksTableBody.innerHTML = "";

    const bids = data.bids.slice(0, 10);
    bids.forEach(([price, amount]) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${parseFloat(price).toFixed(6)}</td><td>${parseFloat(amount).toFixed(4)}</td>`;
      bidsTableBody.appendChild(row);
    });

    const asks = data.asks.slice(0, 10);
    asks.forEach(([price, amount]) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${parseFloat(price).toFixed(6)}</td><td>${parseFloat(amount).toFixed(4)}</td>`;
      asksTableBody.appendChild(row);
    });

    updateHeatmap(bids, asks);
  } catch (e) {
    console.error("Failed to fetch order book:", e);
    bidsTableBody.innerHTML = "<tr><td colspan='2'>Cannot load bids.</td></tr>";
    asksTableBody.innerHTML = "<tr><td colspan='2'>Cannot load asks.</td></tr>";
  }
}

async function fetchRecentTrades() {
  try {
    const res = await fetch(GATEIO_TRADES_API);
    if (!res.ok) throw new Error("Trades fetch failed");
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
    tradesList.innerHTML = "<li>Cannot load trades due to CORS or network error.</li>";
  }
}

function updateHeatmap(bids, asks) {
  const totalBid = bids.reduce((sum, [price, amount]) => sum + parseFloat(amount), 0);
  const totalAsk = asks.reduce((sum, [price, amount]) => sum + parseFloat(amount), 0);
  const total = totalBid + totalAsk;
  const bidPercent = total > 0 ? (totalBid / total) * 100 : 50;

  heatmapBar.style.background = `linear-gradient(to right, #4caf50 ${bidPercent}%, #e91e63 ${bidPercent}%)`;
}

function showLoading(isLoading) {
  const priceSection = document.querySelector(".price-section");
  if (isLoading) priceSection.classList.add("loading");
  else priceSection.classList.remove("loading");
}

// TradingView Chart Setup
const timeframes = ["1", "5", "15", "60", "240", "D"];
const buttons = document.querySelectorAll(".timeframes button");
let tradingViewWidget;

function loadTradingViewChart(symbol = "PIUSDT", interval = "1") {
  if (tradingViewWidget) {
    tradingViewWidget.remove();
  }
  tradingViewWidget = new TradingView.widget({
    width: "100%",
    height: "100%",
    symbol: symbol,
    interval: interval,
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#131722",
    enable_publishing: false,
    allow_symbol_change: true,
    container_id: "chart",
  });
}

// Initialize chart
loadTradingViewChart();

buttons.forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    loadTradingViewChart("PIUSDT", timeframes[idx]);
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Auth buttons (placeholder)
document.getElementById("login-btn").addEventListener("click", () => {
  alert("Login feature coming soon (Web3 Wallet Connect)");
  document.getElementById("logout-btn").style.display = "inline-block";
  document.getElementById("login-btn").style.display = "none";
  document.getElementById("signup-btn").style.display = "none";
});

document.getElementById("signup-btn").addEventListener("click", () => {
  alert("Sign up coming soon");
});

document.getElementById("logout-btn").addEventListener("click", () => {
  alert("Logged out");
  document.getElementById("logout-btn").style.display = "none";
  document.getElementById("login-btn").style.display = "inline-block";
  document.getElementById("signup-btn").style.display = "inline-block";
});

// Main refresh function
function refreshData() {
  fetchPiMarketData();
  fetchOrderBook();
  fetchRecentTrades();
}

// Initial load + auto-refresh every 2 seconds
refreshData();
setInterval(refreshData, 2000);
