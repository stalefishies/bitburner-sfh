import { NS } from "netscript";
import * as S from "sfh";
import { fmtm, fmtp } from "/sfh/lib.js";

const stock_data: { [symbol: string]: { node: string | null, org: string }} = {
     AERO: { node:         "aerocorp", org:               "AeroCorp" },
     APHE: { node:        "alpha-ent", org:      "Alpha Enterprises" },
      BLD: { node:            "blade", org:       "Blade Industries" },
     CLRK: { node:         "clarkinc", org:    "Clarke Incorporated" },
      CTK: { node:          "comptek", org:               "CompuTek" },
     CTYS: { node:         "catalyst", org:      "Catalyst Ventures" },
    DCOMM: { node:          "defcomm", org:                "DefComm" },
      ECP: { node:            "ecorp", org:                  "ECorp" },
     FLCM: { node:      "fulcrumtech", org:   "Fulcrum Technologies" },
      FNS: { node:       "foodnstuff", org:             "FoodNStuff" },
     FSIG: { node:           "4sigma", org:             "Four Sigma" },
      GPH: { node:     "global-pharm", org: "Global Pharmaceuticals" },
      HLS: { node:           "helios", org:            "Helios Labs" },
     ICRS: { node:           "icarus", org:    "Icarus Microsystems" },
      JGN: { node:         "joesguns", org:             "Joe's Guns" },
      KGI: { node:        "kuai-gong", org: "KuaiGong International" },
      LXO: { node:        "lexo-corp", org:               "LexoCorp" },
     MDYN: { node:        "microdyne", org: "Microdyne Technologies" },
     MGCP: { node:         "megacorp", org:               "MegaCorp" },
     NTLK: { node:          "netlink", org:   "NetLink Technologies" },
     NVMD: { node:         "nova-med", org:           "Nova Medical" },
     OMGA: { node:        "omega-net", org:         "Omega Software" },
      OMN: { node:            "omnia", org:     "Omnia Cybersystems" },
     OMTK: { node:          "omnitek", org:   "OmniTek Incorporated" },
     RHOC: { node: "rho-construction", org:       "Rho Construction" },
      SGC: { node:  "sigma-cosmetics", org:        "Sigma Cosmetics" },
     SLRS: { node:          "solaris", org:  "Solaris Space Systems" },
      STM: { node:        "stormtech", org:     "Storm Technologies" },
     SYSC: { node:          "syscore", org:     "SysCore Securities" },
     TITN: { node:       "titan-labs", org:     "Titan Laboratories" },
      UNV: { node:      "univ-energy", org:       "Universal Energy" },
     VITA: { node:         "vitalife", org:               "VitaLife" },
      WDS: { node:               null, org:      "Watchdog Security" }
};

async function sfhMain(ns: NS) {
    if (!sfh.state.has_trading) { return; }
    const trading = sfh.trading;
    const stocks  = trading.stocks;
    const list    = trading.list;

    if (sfh.time.now > sfh.trading.time + 10000) { sfh.trading.init = false; }
    if (!trading.init) {
        // if we have stocks, sell them all

        for (let symbol in stock_data) {
            const data  = stock_data[symbol];
            const stock = stocks[symbol] ?? {};
            stocks[symbol] ??= stock;

            stock.symbol = symbol;
            stock.org    = data.org;
            stock.node   = (data.node ? sfh.network[data.node] : null);
            if (stock.node != null) { stock.node.symbol = symbol; }

            const price_ask = ns.stock.getAskPrice(symbol);
            const price_bid = ns.stock.getBidPrice(symbol);
            stock.price  = (price_ask + price_bid) / 2;
            stock.spread = (price_ask - price_bid) / (price_ask + price_bid);

            if (Array.isArray(stock.history)) { stock.history.splice(0); } else { stock.history = []; }

            stock.forecast   = 0.5;
            stock.volatility = 0;
            stock.sell_ticks = 0;

            list.push(stock);
        }
        
        trading.init  = true;
        trading.ready = false;
        trading.time  = sfh.time.now;
        return;
    }

    let tick = false;
    for (const symbol in trading.stocks) {
        const stock = trading.stocks[symbol];
        const price = ns.stock.getAskPrice(symbol) * (1 - stock.spread);
        if (price != stock.price) { tick = true; break; }
    }
    if (!tick) { return; }

    for (const symbol in trading.stocks) {
        const stock = trading.stocks[symbol];
        const price = ns.stock.getAskPrice(symbol) * (1 - stock.spread);
        const inc   = price > stock.price;

        const av = (inc ? price / stock.price : stock.price / price) - 1;
        stock.volatility = Math.max(stock.volatility, Math.ceil(av * 10000) / 10000);
        stock.price = price;

        const value = (inc ? 1 : 0);
        stock.history.unshift(value);
        while (stock.history.length > 100) { stock.history.pop(); }
        stock.forecast = stock.history.reduce((acc, x) => acc + x) / stock.history.length;

        const N = 50;
        const M = 15;
        if (stock.history.length >= M + N) {
            let m = 0, n = 0;
            for (let i = 0; i < M;     ++i) { m += stock.history[i]; }
            for (let i = M; i < M + N; ++i) { n += stock.history[i]; }

            let pre_n = 1;
            for (let i = 1; i <= N + 1;   ++i) { pre_n *= i; }
            for (let i = 1; i <= n;       ++i) { pre_n /= i; }
            for (let i = 1; i <= (N - n); ++i) { pre_n /= i; }

            let int_0 = 0;
            let int_1 = 0;
            let lo    = Math.max((m - 1) / M, 0);
            let hi    = Math.min((m + 1) / M, 1);
            let count = 10;
            for (let i = 0; i < count; ++i) {
                let p = lo + ((i + 0.5) / count) * (hi - lo);
                int_0 += pre_n * p ** n * (1 - p) ** (N - n);
                int_1 += pre_n * (1 - p) ** n * p ** (N - n);
            }
            int_0 /= count;
            int_1 /= count;

            if (int_0 < 0.2 && int_1 > 0.5) {
                stock.sell_ticks = 50;
            } else {
                stock.sell_ticks = Math.max(stock.sell_ticks - 1, 0);
            }
        }
    }

    trading.list.sort((s, t) => t.forecast - s.forecast);
    trading.time  = sfh.time.now;
    trading.ready = list[0].history.length >= 100;
    if (!sfh.can.trading || !trading.ready) { return; }

    // Buy/sell stocks here
}

export async function main(ns: NS) {
    if (ns.args.length == 1 && ns.args[0] == "sfh") { await sfhMain(ns); return; }

    if (!sfh.trading.init) {
        ns.tprintf("ERROR: Trading not initialised");
        return;
    }

    ns.tprintf("%6s%5s %2s %3s %6s %6s %5s %2s %s", "",
        "STOCK", "ST", "LEN", "$ ASK", "$ BID", "VOLAT", "FC", ">TICKER");
    for (const stock of sfh.trading.list) {
        const prefix = (stock.forecast > 0.6 ? "INFO  " : (stock.forecast < 0.4 ? "ERROR " : ""));

        ns.tprintf("%6s%5s %2d %3d %6.0f %6.0f %5s %2.0f >%s|", prefix,
            stock.symbol, stock.sell_ticks, stock.history.length,
            stock.price * (1 + stock.spread), stock.price / (1 + stock.spread),
            fmtp(stock.volatility), stock.forecast * 100,
            stock.history.map((x: number) => (x == 1 ? '#' : ' ')).join(""));
    }
}
