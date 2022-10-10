const commission = 100e3;
const len = {
    N_s: 10,
    N:   15,
    min: 40,
    M:   40,
    max: 100
};

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

function init(ns: NS) {
    sfh.trading.spent = 0;
    sfh.trading.sell = 0;
    sfh.trading.list.splice(0);

    for (const symbol in stock_data) {
        const data  = stock_data[symbol];
        const stock = sfh.trading.stocks[symbol] ?? {};
        sfh.trading.stocks[symbol] ??= stock;

        stock.symbol = symbol;
        stock.org    = data.org;
        stock.server = (data.node ? sfh.network[data.node] : null);
        if (stock.server != null) { stock.server.symbol = symbol; }

        stock.ask_price = ns.stock.getAskPrice(symbol);
        stock.bid_price = ns.stock.getBidPrice(symbol);
        stock.spread    = (stock.ask_price - stock.bid_price) / (stock.ask_price + stock.bid_price);
        stock.max       = ns.stock.getMaxShares(stock.symbol);

        stock.vol      = 0;
        stock.prob     = 0.5;
        stock.mult     = 1;
        stock.ticks    = 1000;

        if (Array.isArray(stock.history)) { stock.history.splice(0); } else { stock.history = []; }
        stock.length   = 0;
        stock.forecast = 0.5;
        stock.flip     = 1;

        updateOwned(ns, stock);
        sfh.trading.list.push(stock);
    }

    sfh.trading.init = true;
    sfh.trading.time = sfh.time.now;
    sfh.trading.total_spent = sfh.trading.spent;
}

function updateOwned(ns: NS, stock: Stock) {
    const pos = ns.stock.getPosition(stock.symbol);
    if (pos[0] > 0 && pos[2] > 0) {
        sfh.print("ERROR: Have both long ({}) and short ({}) positions on {}; selling both",
            pos[0], pos[2], stock.symbol);

        ns.stock.sellStock(stock.symbol, pos[0]);
        ns.stock.sellShort(stock.symbol, pos[2]);
        pos[0] = pos[2] = 0;
    }

    if (pos[0] > 0) {
        stock.short = false;
        stock.owned = pos[0];
        stock.spent = pos[0] * pos[1] + commission;
        stock.sell  = pos[0] * ns.stock.getBidPrice(stock.symbol) - commission;
    } else if (pos[2] > 0) {
        stock.short = true;
        stock.owned = pos[2];
        stock.spent = pos[2] * pos[3] + commission;
        stock.sell  = pos[2] * (2 * pos[3] - ns.stock.getAskPrice(stock.symbol)) - commission;
    } else {
        stock.owned = stock.spent = stock.sell = 0;
    }
}

function liquidate(ns: NS) {
    for (const symbol in stock_data) {
        const pos = ns.stock.getPosition(symbol);
        ns.stock.sellStock(symbol, pos[0]);
        ns.stock.sellShort(symbol, pos[2]);
    }
}

function testFlip(stock: Stock, N: number, len: number) {
    // Collect N most recent samples, and M further samples past that.
    // We use the M samples to measure the distribution of successes.
    // Using the Wilson interval to bound the binomial distribution probability:
    //
    //  p = (m + z*z/2) / (M + z) +/- z / (M + z*z) * sqrt[m * (M - m) / M + z*z/4]
    //
    // z is the number of standard deviations to bound p from on either size; we take z = 1.
    // Then, we ask which was more likely to have been drawn from that binomial distribution:
    //
    //  1.     n successes from N trials
    //  2. N - n successes from N trials
    //
    // These probabilities are averaged uniformly over the success probability in the Wilson range above.
    // We return how many times more likely a flip is versus no flip.

    const M = len - N;
    let m = 0, n = 0;
    for (let i = 0; i < N;     ++i) { n += stock.history[i]; }
    for (let i = N; i < M + N; ++i) { m += stock.history[i]; }

    const wilson = 1 / (M + 1) * Math.sqrt(m * (M - m) / M + 0.25);
    const p_lo = (m + 0.5) / (M + 1) - wilson;
    const p_hi = (m + 0.5) / (M + 1) + wilson;

    let NCn = 1;
    for (let i = 2; i <= N;       ++i) { NCn *= i; }
    for (let i = 2; i <= n;       ++i) { NCn /= i; }
    for (let i = 2; i <= (N - n); ++i) { NCn /= i; }

    let prob_0 = 0;
    let prob_1 = 0;

    const count = 10;
    for (let i = 0; i < count; ++i) {
        const p = p_lo + ((i + 0.5) / count) * (p_hi - p_lo);
        prob_0 += NCn * p ** n * (1 - p) ** (N - n);
        prob_1 += NCn * p ** (N - n) * (1 - p) ** n;
    }

    return prob_1 / prob_0;
}

async function sfhMain(ns: NS) {
    if (!sfh.state.has_stocks) { return; }
    const trading = sfh.trading;
    const stocks  = trading.stocks;
    const list    = trading.list;

    if (sfh.time.now > sfh.trading.time + 10000) { sfh.trading.init = false; }
    if (!trading.init) {
        liquidate(ns);
        init(ns);
        return;
    }

    let tick = false;
    for (const stock of list) {
        updateOwned(ns, stock);
        const ask_price = ns.stock.getAskPrice(stock.symbol);
        if (ask_price != stock.ask_price) { tick = true; break; }
    }
    if (!tick) { return; }

    for (const stock of list) {
        const prev_ask  = stock.ask_price;
        stock.ask_price = ns.stock.getAskPrice(stock.symbol);
        stock.bid_price = ns.stock.getBidPrice(stock.symbol);

        const inc = stock.ask_price > prev_ask;
        const av  = (inc ? stock.ask_price / prev_ask : prev_ask / stock.ask_price) - 1;
        stock.vol = Math.max(stock.vol, Math.ceil(av * 10000) / 10000);

        const value = (inc ? 1 : 0);
        stock.history.unshift(value);

        while (stock.history.length > len.max) { stock.history.pop(); }
        stock.length = Math.min(stock.length + 1, stock.history.length, len.max);

        stock.forecast = 0;
        for (let i = 0; i < stock.length; ++i) { stock.forecast += stock.history[i]; }
        stock.forecast /= stock.length;

        stock.prob = (sfh.state.has_4S ? ns.stock.getForecast(stock.symbol) : stock.forecast);

        stock.flip = stock.flip_s = 1;
        if (stock.length >= len.min) {
            stock.flip_s = testFlip(stock, len.N_s, Math.min(stock.length, len.M + len.N_s));
            stock.flip   = testFlip(stock, len.N,   Math.min(stock.length, len.M + len.N  ));
            if (stock.flip > 2) { stock.length = len.N; }
        }

        // project price to multiply by this value each tick
        stock.mult = 1;
        if (stock.vol > 0) {
            // v chosen uniformly in [0, vol]
            //      p: price <- price * (1 + v)
            //          1/vol * int_0^vol (P * (1 + v)) dv = P / vol * (vol + vol^2 / 2)
            //          expected price change: price *= (1 + vol / 2)
            //  1 - p: price <- price / (1 + v)
            //          1/vol * int_0^vol (P / (1 + v)) dv = P / vol * ln (1 + vol)
            //          expected price change: price *= ln(1 + vol) / vol

            stock.mult = stock.prob * (1 + stock.vol / 2) + (1 - stock.prob) * Math.log(1 + stock.vol) / stock.vol;
        }

        // expected ticks to break even
        if (stock.mult > 1) {
            stock.ticks = Math.log((1 + stock.spread) / (1 - stock.spread)) / Math.log(stock.mult);
        } else if (stock.mult < 1) {
            stock.ticks = Math.log((1 - stock.spread) / (1 + stock.spread)) / Math.log(stock.mult);
        } else { stock.ticks = 999; }
        stock.ticks = Math.min(stock.ticks, 999);
    }

    trading.list.sort(sfh.state.has_4S
        ? ((s, t) => Math.abs(t.mult - 1) - Math.abs(s.mult - 1))
        : ((s, t) => s.ticks - t.ticks));
    trading.time = sfh.time.now;

    trading.spent = 0;
    trading.sell = 0;
    for (const stock of list) {
        trading.spent += stock.spent;
        trading.sell  += stock.sell;
    }

    if ((sfh.can.install && sfh.install) || !sfh.can.trading) { liquidate(ns); return; }
    if (sfh.goal.money_next > 0 && sfh.money.curr < sfh.goal.money_next
        && sfh.money.curr + trading.sell >= sfh.goal.money_next) { liquidate(ns); }

    for (const stock of list) {
        const must_sell = (!sfh.state.has_4S && (stock.flip > 2 || stock.length < len.min))
            || (stock.short && stock.prob > 0.45) || (!stock.short && stock.prob < 0.55);
        if (stock.owned > 0 && must_sell) {
            ns.stock[stock.short ? "sellShort" : "sellStock"](stock.symbol, stock.owned);
            trading.total_sold += stock.sell;

            sfh.money.spent.stocks = Math.max(sfh.money.spent.stocks - stock.sell, 0);
            stock.owned = 0;
            stock.spent = 0;
            stock.sell  = 0;
            continue;
        }

        const can_buy = (sfh.state.has_4S ||
                (stock.ticks < 5 && stock.length >= len.min && stock.flip < 0.25 && stock.flip_s < 0.25))
            && (stock.prob <= 0.4 || stock.prob >= 0.6) && stock.spent <= trading.spent / 3;
        if ((!sfh.can.purchase && sfh.bitnode.number !== 8) || !can_buy) { continue; }

        let max_spend = Math.min(0.2 * sfh.money.frac.stocks * sfh.money.total,
            sfh.money.frac.stocks * sfh.money.total - sfh.money.spent.stocks) - commission;
        const prev_max = max_spend;
        if (sfh.goal.money_next > 0 && sfh.money.curr >= sfh.goal.money_next) {
            max_spend = Math.min(max_spend, sfh.money.curr - sfh.goal.money_next);
        }
        if (max_spend < 10e6) { continue; }

        if (stock.prob >= 0.6) {
            const max = Math.min(Math.floor(max_spend / stock.ask_price), 0.8 * stock.max - stock.owned);
            if (!sfh.purchase("stocks", () => ns.getServerMoneyAvailable("home"), max * stock.ask_price + commission,
                () => ns.stock.buyStock(stock.symbol, max))) { continue; }

            trading.total_spent += max * stock.ask_price + commission;
            trading.spent       += max * stock.ask_price + commission;

            updateOwned(ns, stock);
        } else if (stock.prob <= 0.4) {
            const max = Math.min(Math.floor(max_spend / stock.ask_price), 0.8 * stock.max - stock.owned);
            if (!sfh.purchase("stocks", () => ns.getServerMoneyAvailable("home"), max * stock.bid_price + commission,
                () => ns.stock.buyShort(stock.symbol, max))) { continue; }

            trading.total_spent += max * stock.bid_price + commission;
            trading.spent       += max * stock.bid_price + commission;

            updateOwned(ns, stock);
        }
    }
}

export async function main(ns: NS) {
    if (ns.args.length == 1 && ns.args[0] == "sfh") { await sfhMain(ns); return; }

    if (!sfh.trading.init) { init(ns); }

    sfh.print("{4,!SYMB} {1,!} {11,!$LIQUID} {6,!PROFIT} | "
        + "{4,!SPRD} {5,!TICKS} {6,!MULT} {5,!PROB} | "
        + "{5,!FOREC} {7,!FLIP} {3,!LEN} TICKER", "");

    for (const stock of sfh.trading.list) {
        const mult = sfh.sprint("{5,2,f}", (stock.mult - 1) * 100) + "%";

        sfh.print("{4,4} {1} {11,m} {6,p} | {4,p} {5,1,f} {c*,6} {c*,5,p} | {c*,5,p} {c*,7,3,f} {c*,3,d} {cy}{}{cr}",
            stock.symbol, stock.owned === 0 ? "" : (stock.short ? "S" : "L"),
            stock.sell, stock.owned === 0 ? 0 : stock.sell / stock.spent,

            stock.spread, stock.ticks,
            (stock.mult >= 1.001 ? "c" : (stock.mult <= 0.999 ? "r" : "")), mult,
            (stock.prob >= 0.6   ? "c" : (stock.prob <= 0.4   ? "r" : "")), stock.prob,

            (stock.forecast >= 0.6 ? "c" : (stock.forecast <= 0.4 ? "r" : "")), stock.forecast,
            (stock.flip > 2 ? "r" : ""), Math.log2(stock.flip),
            stock.length < len.min ? "r" : "", stock.length,
            stock.history.slice(0,            len.N).map((x: number) => (x == 1 ? '┸' : '─')).join(""),
            stock.history.slice(len.N, stock.length).map((x: number) => (x == 1 ? '┸' : '─')).join(""),
            stock.history.slice(stock.length       ).map((x: number) => (x == 1 ? '┸' : '─')).join(""));
    }
}
