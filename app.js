// ======== Live Pi Price Update ========
async function fetchPiPrice() {
    try {
        // Example API — Replace with real Pi price API when listed
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const data = await res.json();
        
        // Fake conversion just for demo
        const piPrice = (data.price / 10000).toFixed(4); 
        document.getElementById("asset-price").textContent = `$${piPrice}`;
    } catch (err) {
        console.error("Error fetching Pi price:", err);
        document.getElementById("asset-price").textContent = "N/A";
    }
}

// Auto-refresh every 2 seconds
setInterval(fetchPiPrice, 2000);
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
loadTradingViewChart();

// ======== Timeframe Buttons ========
document.querySelectorAll(".timeframes button").forEach(btn => {
    btn.addEventListener("click", () => {
        alert(`Timeframe changed to ${btn.textContent}`);
    });
});

// ======== Auth Buttons ========
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
