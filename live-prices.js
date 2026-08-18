// Polls the free Cloudflare Worker proxy (ClaudeRepo/cloudflare-worker) for
// live NASDAQ/ASX prices and patches [data-live-symbol] elements in place --
// see render_index_card_body / the ticker-strip loop / build_ticker_page in
// ClaudeRepo/scripts/render_dashboard.py for where those elements come from.
//
// Entirely best-effort: if the Worker below isn't reachable (not deployed
// yet, network hiccup, transient upstream failure) this just no-ops and the
// page keeps showing whatever render_dashboard.py last rendered statically.
// Nothing here can break the page.
//
var LIVE_PRICE_API = "https://barnyard-live-prices.nathanbarnard29.workers.dev";

(function () {
  var POLL_INTERVAL_MS = 15000;

  function fmtIndexLevel(n) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmtIndexChange(pct) {
    var arrow = pct >= 0 ? "\u25B2" : "\u25BC";
    return arrow + " " + (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%";
  }
  function fmtTickerPrice(n) {
    return "$" + n.toFixed(2);
  }
  function fmtPctSigned(pct) {
    return (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%";
  }
  function fmtDollarSigned(change) {
    return "$" + (change >= 0 ? "+" : "") + change.toFixed(2);
  }
  function fmtTickerChange(pct, change) {
    return fmtPctSigned(pct) + " (" + fmtDollarSigned(change) + ")";
  }

  function cssAttrEscape(value) {
    return value.replace(/["\\]/g, "\\$&");
  }

  function applyQuote(symbol, market, quote) {
    var selector =
      '[data-live-symbol="' + cssAttrEscape(symbol) + '"][data-live-market="' + cssAttrEscape(market) + '"]';
    document.querySelectorAll(selector).forEach(function (el) {
      var field = el.getAttribute("data-live-field");
      var isIndex = el.hasAttribute("data-live-index");
      if (field === "price") {
        el.textContent = isIndex ? fmtIndexLevel(quote.price) : fmtTickerPrice(quote.price);
      } else if (field === "change") {
        el.textContent = isIndex
          ? fmtIndexChange(quote.changePercent)
          : fmtTickerChange(quote.changePercent, quote.change);
        el.classList.remove("up", "down");
        el.classList.add(quote.changePercent >= 0 ? "up" : "down");
      } else if (field === "change_pct") {
        // Notable Movers rows split % and $ onto two lines (see
        // .mover-move-abs in template.html) instead of the combined
        // "pct% ($dollar)" format ticker pages use -- color stays on the
        // row's static daily direction (.mover-move-cell), not re-colored
        // live, matching that table's existing design.
        el.textContent = fmtPctSigned(quote.changePercent);
      } else if (field === "change_abs") {
        el.textContent = "(" + fmtDollarSigned(quote.change) + ")";
      } else if (field === "dot") {
        el.classList.add("live-ok");
        el.title = "Live \u2014 updated " + new Date().toLocaleTimeString();
      }
    });
  }

  function pollAll() {
    var seen = {};
    document.querySelectorAll("[data-live-symbol][data-live-market]").forEach(function (el) {
      var symbol = el.getAttribute("data-live-symbol");
      var market = el.getAttribute("data-live-market");
      var key = market + ":" + symbol;
      if (seen[key]) return;
      seen[key] = true;

      var url = LIVE_PRICE_API + "/price?symbol=" + encodeURIComponent(symbol) + "&market=" + encodeURIComponent(market);
      fetch(url)
        .then(function (r) {
          if (!r.ok) throw new Error("bad response");
          return r.json();
        })
        .then(function (data) {
          if (data && typeof data.price === "number") applyQuote(symbol, market, data);
        })
        .catch(function () {
          // Silent no-op by design -- see file header.
        });
    });
  }

  if (document.querySelector("[data-live-symbol]")) {
    pollAll();
    setInterval(pollAll, POLL_INTERVAL_MS);
  }
})();
