// ===== TradingPiView Pro Dashboard JS =====

// ----------- CONFIG -----------

const CMC_API_KEY = "YOUR_CMC_API_KEY"; // Replace with real if you want CoinMarketCap data
const CMC_BASE_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";

const LANGUAGES = {
  en: {
    assets_list: "Assets",
    order_book: "Order Book",
    recent_trades: "Recent Trades",
    timeframe: "Timeframe",
    set_alerts: "Set Alerts",
    alerts_set: "Alerts set successfully!",
    tp_placeholder: "Take Profit ($)",
    sl_placeholder: "Stop Loss ($)",
    logout: "Log Out",
    settings: "Settings",
    help: "Help",
    login_soon: "Login feature coming soon",
    signup_soon: "Sign up coming soon",
  },
  fr: {
    assets_list: "Actifs",
    order_book: "Carnet d'ordres",
    recent_trades: "Trades récents",
    timeframe: "Intervalle",
    set_alerts: "Définir alertes",
    alerts_set: "Alertes définies avec succès !",
    tp_placeholder: "Prendre profit ($)",
    sl_placeholder: "Stop loss ($)",
    logout: "Déconnexion",
    settings: "Paramètres",
    help: "Aide",
    login_soon: "Connexion bientôt disponible",
    signup_soon: "Inscription bientôt disponible",
  },
  ar: {
    assets_list: "الأصول",
    order_book: "دفتر الأوامر",
    recent_trades: "التداولات الأخيرة",
    timeframe: "الإطار الزمني",
    set_alerts: "تعيين التنبيهات",
    alerts_set: "تم تعيين التنبيهات بنجاح!",
    tp_placeholder: "جني الأرباح ($)",
    sl_placeholder: "وقف الخسارة ($)",
    logout: "تسجيل خروج",
    settings: "الإعدادات",
    help: "مساعدة",
    login_soon: "ميزة تسجيل الدخول قادمة",
    signup_soon: "ميزة التسجيل قادمة",
  },
};

const ASSETS = [
  { id: "piusdt", symbol: "PI/USDT", cmcId: "pi-network" },
  { id: "iceusdt", symbol: "ICE/USDT", cmcId: "ice-token" },
  { id: "xrpusdt", symbol: "XRP/USDT", cmcId: "ripple" },
  { id: "solusdt", symbol: "SOL/USDT", cmcId: "solana" },
  { id: "adausdt", symbol: "ADA/USDT", cmcId: "cardano" },
  { id: "dogeusdt", symbol: "DOGE/USDT", cmcId: "dogecoin" },
  { id: "btcusdt", symbol: "BTC/USDT", cmcId: "bitcoin" },
  { id: "ethusdt", symbol: "ETH/USDT", cmcId: "ethereum" },
  { id: "bnbusdt", symbol: "BNB/USDT", cmcId: "binancecoin" },
];

// ----------- STATE -----------

let selectedAsset = ASSETS[0];
let selectedTimeframe = "5"; // default 5m
let tradingViewWidget = null;
let alerts = { tp: null, sl: null };
let currentLang = "en";

// ----------- DOM -----------

const assetsUl = document.getElementById("assets-ul");
const assetNameH2 = document.getElementById("asset-name");
const livePriceEl = document.getElementById("live-price");
const priceChangeEl = document.getElementById("price-change");
const timeframeSelect = document.getElementById("timeframe-select");
const tpInput = document.getElementById("tp-input");
const slInput = document.getElementById("sl-input");
const setAlertsBtn = document.getElementById("set-alerts-btn");

const orderBookBids = document.getElementById("order-book-bids");
const orderBookAsks = document.getElementById("order-book-asks");
const tradesList = document.getElementById("trades-list");

const piMarketcap = document.getElementById("pi-marketcap");
const piCirculating = document.getElementById("pi-circulating");
const piTotal = document.getElementById("pi-total");
const piRank = document.getElementById("pi-rank");

const langSelect = document.getElementById("lang-select");
const profileBtn = document.getElementById("profile-btn");
const profileMenu = document.getElementById("profile-menu");
const logoutBtn = document.getElementById("logout-btn");
const settingsBtn = document.getElementById("settings-btn");
const helpBtn = document.getElementById("help-btn");

// ----------- FUNCTIONS -----------

// --- Translate page elements ---
function translatePage(lang) {
  currentLang = lang;
  const texts = LANGUAGES[lang] || LANGUAGES["en"];

  document.querySelector("section.assets-list > h2").textContent = texts.assets_list;
  document.querySelector(".order-book > h3").textContent = texts.order_book;
  document.querySelector(".recent-trades > h3").textContent = texts.recent_trades;
  document.querySelector(".chart-controls label").textContent = texts.timeframe;
  setAlertsBtn.textContent = texts.set_alerts;
  tpInput.placeholder = texts.tp_placeholder;
  slInput.placeholder = texts.sl_placeholder;
  logoutBtn.textContent = texts.logout;
  settingsBtn.textContent = texts.settings;
  helpBtn.textContent = texts.help;
}

// --- Auto detect language ---
function detectLanguage() {
  let lang = navigator.language || navigator.userLanguage;
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("ar")) return "ar";
  return "en";
}

// --- Populate assets list ---
function populateAssets() {
  assetsUl.innerHTML = "";
  ASSETS.forEach((asset, idx) => {
    const li = document.createElement("li");
    li.setAttribute("role", "listitem");
    li.classList.toggle("active", asset.id === selectedAsset.id);
    li.tabIndex = 0;
    li.innerHTML = `<span class="symbol">${asset.symbol}</span><span class="price">--</span>`;
    li.onclick = () => selectAsset(asset.id);
    li.onkeypress = (e) => {
      if (e.key === "Enter" || e.key === " ") selectAsset(asset.id);
    };
    assetsUl.appendChild(li);
  });
}

// --- Select asset ---
function selectAsset(assetId) {
  if (assetId === selectedAsset.id) return;
  selectedAsset = ASSETS.find(a => a.id === assetId) || ASSETS[0];
  updateUIForSelectedAsset();
  updateTradingView();
}

// --- Update UI for selected asset ---
function updateUIForSelectedAsset() {
  assetNameH2.textContent = selectedAsset.symbol;
  document.querySelectorAll("#assets-ul li").forEach(li => {
    li.classList.toggle("active", li.querySelector(".symbol").textContent === selectedAsset.symbol);
  });
  tpInput.value = "";
  slInput.value = "";
  alerts = { tp: null, sl: null };
}

// --- Fetch live price (mock, replace with real API calls) ---
async function fetchLivePrice(assetId) {
  try {
    // For demo, use Binance API for BTC/ETH/BNB/XRP/SOL/DOGE
    // For PI, ICE, fallback to mock price

    let price = null;
    let changePercent = null;

    if (["btcusdt", "ethusdt", "bnbusdt", "xrpusdt", "solusdt", "dogeusdt"].includes(assetId)) {
      const symbolBinance = assetId.replace("usdt", "USDT").toUpperCase();
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbolBinance}`);
      if (!res.ok) throw new Error("Binance API error");
      const data = await res.json();
      price = parseFloat(data.lastPrice);
      changePercent = parseFloat(data.priceChangePercent);
    } else {
      // Mock price for PI and ICE
      price = Math.random() * 1.5 + 0.5;
      changePercent = (Math.random() * 10 - 5).toFixed(2);
    }

    return { price, changePercent };
  } catch (err) {
    console.error("Error fetching price:", err);
    return { price: null, changePercent: null };
  }
}

// --- Update prices in assets list ---
async function updateAssetsListPrices() {
  const lis = assetsUl.querySelectorAll("li");
  for (let i = 0; i < ASSETS.length; i++) {
    const asset = ASSETS[i];
    const li = lis[i];
    const priceSpan = li.querySelector(".price");

    const { price } = await fetchLivePrice(asset.id);
    if (price !== null) {
      priceSpan.textContent = `$${price.toFixed(4)}`;
      // If currently selected, update main price too
      if (asset.id === selectedAsset.id) {
        updateMainPrice(price);
      }
    } else {
      priceSpan.textContent = "--";
    }
  }
}

// --- Update main live price and % change ---
function updateMainPrice(price) {
  livePriceEl.textContent = `$${price.toFixed(4)}`;
}

// --- Update price change color ---
function updatePriceChange(changePercent) {
  priceChangeEl.textContent = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;
  priceChangeEl.classList.remove("positive", "negative", "neutral");
  if (changePercent > 0) priceChangeEl.classList.add("positive");
  else if (changePercent < 0) priceChangeEl.classList.add("negative");
  else priceChangeEl.classList.add("neutral");
}

// --- Initialize TradingView chart ---
function updateTradingView() {
  if (tradingViewWidget) {
    tradingViewWidget.remove();
    tradingViewWidget = null;
  }
  tradingViewWidget = new TradingView.widget({
    symbol: selectedAsset.symbol.replace("/", ""),
    interval: selectedTimeframe,
    container_id: "chart",
    width: "100%",
    height: 400,
    locale: currentLang,
    theme: "dark",
    toolbar_bg: "#131722",
    enable_publishing: false,
    allow_symbol_change: false,
    style: "1",
    timezone: "Etc/UTC",
  });
}

// --- Update order book and trades (mock data) ---
function updateOrderBookAndTrades() {
  // Mock bids and asks
  orderBookBids.innerHTML = "";
  orderBookAsks.innerHTML = "";
  tradesList.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    const bidPrice = (100 - i * 0.5).toFixed(2);
    const bidQty = (Math.random() * 5).toFixed(3);
    const askPrice = (100 + i * 0.5).toFixed(2);
    const askQty = (Math.random() * 4).toFixed(3);

    const bidDiv = document.createElement("div");
    bidDiv.textContent = `${bidQty} @ $${bidPrice}`;
    orderBookBids.appendChild(bidDiv);

    const askDiv = document.createElement("div");
    askDiv.textContent = `${askQty} @ $${askPrice}`;
    orderBookAsks.appendChild(askDiv);
  }

  // Mock recent trades
  for (let i = 0; i < 12; i++) {
    const tradeLi = document.createElement("li");
    const price = (100 + (Math.random() - 0.5) * 2).toFixed(2);
    const qty = (Math.random() * 3).toFixed(2);
    const isBuy = Math.random() > 0.5;
    tradeLi.textContent = `${qty} @ $${price}`;
    tradeLi.classList.add(isBuy ? "trade-buy" : "trade-sell");
    tradesList.appendChild(tradeLi);
  }
}

// --- Fetch Pi Network info from CoinMarketCap ---
async function fetchPiInfo() {
  if (!CMC_API_KEY) {
    piMarketcap.textContent = "API key needed";
    piCirculating.textContent = "API key needed";
    piTotal.textContent = "API key needed";
    piRank.textContent = "API key needed";
    return;
  }

  try {
    const res = await fetch(`${CMC_BASE_URL}?slug=pi-network`, {
      headers: {
        "X-CMC_PRO_API_KEY": CMC_API_KEY,
      },
    });
    if (!res.ok) throw new Error("CMC API error");
    const json = await res.json();
    const cmcData = json.data["pi-network"];
    piMarketcap.textContent = `$${Number(cmcData.quote.USD.market_cap).toLocaleString()}`;
    piCirculating.textContent = Number(cmcData.circulating_supply).toLocaleString();
    piTotal.textContent = Number(cmcData.total_supply).toLocaleString();
    piRank.textContent = cmcData.cmc_rank;
  } catch (err) {
    console.error("Error fetching Pi info:", err);
    piMarketcap.textContent = "Error";
    piCirculating.textContent = "Error";
    piTotal.textContent = "Error";
    piRank.textContent = "Error";
  }
}

// --- Setup event listeners ---
function setupEventListeners() {
  timeframeSelect.addEventListener("change", () => {
    selectedTimeframe = timeframeSelect.value;
    updateTradingView();
  });

  setAlertsBtn.addEventListener("click", () => {
    const tp = parseFloat(tpInput.value);
    const sl = parseFloat(slInput.value);
    if (tp && sl) {
      alerts.tp = tp;
      alerts.sl = sl;
      alert(LANGUAGES[currentLang].alerts_set);
    } else {
      alert("Please enter valid TP and SL values");
    }
  });

  langSelect.addEventListener("change", () => {
    const val = langSelect.value;
    if (val === "auto") {
      currentLang = detectLanguage();
    } else {
      currentLang = val;
    }
    translatePage(currentLang);
    updateTradingView();
  });

  profileBtn.addEventListener("click", () => {
    profileMenu.classList.toggle("hidden");
  });

  logoutBtn.addEventListener("click", () => {
    alert(LANGUAGES[currentLang].logout);
    profileMenu.classList.add("hidden");
  });

  settingsBtn.addEventListener("click", () => {
    alert(LANGUAGES[currentLang].settings);
    profileMenu.classList.add("hidden");
  });

  helpBtn.addEventListener("click", () => {
    alert(LANGUAGES[currentLang].help);
    profileMenu.classList.add("hidden");
  });

  // Close profile menu if clicking outside
  document.addEventListener("click", (e) => {
    if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
      profileMenu.classList.add("hidden");
    }
  });
}

// --- Periodic updates ---
async function periodicUpdate() {
  // Update asset list prices
  await updateAssetsListPrices();

  // Update selected asset price & change
  const { price, changePercent } = await fetchLivePrice(selectedAsset.id);
  if (price !== null) {
    updateMainPrice(price);
    updatePriceChange(changePercent);
  }

  // Update order book and trades
  updateOrderBookAndTrades();

  // Refresh Pi info every 60 seconds
  const now = Date.now();
  if (!periodicUpdate.lastPiFetch || now - periodicUpdate.lastPiFetch > 60000) {
    fetchPiInfo();
    periodicUpdate.lastPiFetch = now;
  }
}

// ----------- INIT -----------

function init() {
  // Detect and set language
  currentLang = detectLanguage();
  translatePage(currentLang);
  langSelect.value = "auto";

  populateAssets();
  updateUIForSelectedAsset();
  updateTradingView();

  setupEventListeners();

  // Start periodic refresh every 2 seconds
  periodicUpdate();
  setInterval(periodicUpdate, 2000);
}

// Run init on DOM ready
document.addEventListener("DOMContentLoaded", init);
