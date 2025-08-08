// ======== Live Pi Price Update ========
async function fetchPiPrice() {
    try {
        // Example API — Replace with real Pi price API
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const data = await res.json();
        
        // Fake conversion just for demo until Pi is listed
        const piPrice = (data.price / 10000).toFixed(4); 

        document.getElementById("asset-price").textContent = `$${piPrice}`;
    } catch (err) {
        console.error("Error fetching Pi price:", err);
        document.getElementById("asset-price").textContent = "N/A";
    }
}

// Update price every 10 seconds
setInterval(fetchPiPrice, 10000);
fetchPiPrice();


// ======== TradingView Chart ========
function loadTradingViewChart(symbol = "BTCUSDT") {
    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": symbol,
        "interval": "1",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#131722",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "chart"
    });
}

// Load chart on page start
loadTradingViewChart();

// ======== Timeframe Buttons ========
document.querySelectorAll("#timeframes button").forEach(btn => {
    btn.addEventListener("click", () => {
        alert(`Timeframe changed to ${btn.textContent}`);
        // You can reload chart with new timeframe if needed
    });
});

// ======== Login Button ========
document.getElementById("login-btn").addEventListener("click", () => {
    alert("Login feature coming soon in Pi Browser version!");
});
// --- Live Pi Price with CoinGecko ---
async function fetchPiPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&include_24hr_change=true");
    const data = await res.json();
    const piPrice = data["pi-network"].usd.toFixed(4);
    document.getElementById("asset-price").textContent = `$${piPrice}`;
  } catch (err) {
    console.error("Error fetching Pi price:", err);
    document.getElementById("asset-price").textContent = "N/A";
  }
}
setInterval(fetchPiPrice, 10000);
fetchPiPrice();
