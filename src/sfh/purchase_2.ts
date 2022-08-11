export async function main(ns: NS) {
    if (sfh.can.install && sfh.time.reset < 120 * 1000) { return; }
    const money = (() => ns.getServerMoneyAvailable("home"));

    const hashRate = (l: number, r: number, c: number) =>
        ns.formulas.hacknetServers.hashGainRate(l, 0, r, c, sfh.player.mult.hacknet_prod);

    let hacknet_prod = 0;
    for (let i = 0; i < ns.hacknet.numNodes(); ++i) {
        const stats = ns.hacknet.getNodeStats(i);
        hacknet_prod += hashRate(stats.level, stats.ram, stats.cores);
    }

    if (sfh.can.hnet) {
        const hacknet_upgrades: [() => number, number, string, string?][] = [];

        if (money() < sfh.goal.money && sfh.goal.money > 0) {
            let level_target = "";
            let level_dps    = 0;
            let money_target = "";
            let money_dps    = 0;

            for (const params of sfh.hacking.list) {
                if (params.job && params.job.dps > level_dps && params.target.level >= 10) {
                    level_target = params.target.name;
                    level_dps    = params.job.dps;
                }

                if (params.job && params.job.dps > level_dps && params.target.money <= 1e12) {
                    money_target = params.target.name;
                    money_dps    = params.job.dps;
                }
            }

            if (level_dps > 0) {
                hacknet_upgrades.push([function() {
                    return (sfh.goal.money - money())
                        * (1 / sfh.state.money_rate - 1 / (sfh.state.money_rate + 0.02 * level_dps));
                }, 0, "Reduce Minimum Security", level_target]);
            }

            if (money_dps > 0) {
                const new_time = (sfh.goal.money - money()) / (sfh.state.money_rate + 0.02 * money_dps);
                hacknet_upgrades.push([function() {
                    return (sfh.goal.money - money())
                        * (1 / sfh.state.money_rate - 1 / (sfh.state.money_rate + 0.02 * money_dps));
                }, 0, "Increase Maximum Money", money_target]);
            }

            hacknet_upgrades.push([function() {
                return money() < sfh.goal.money ? 1e6 / sfh.state.money_rate : 0;
            }, 0, "Sell for Money"]);
        }

        if (sfh.state.has_corp && sfh.corp.dividends < 1e30) {
            if (sfh.corp.funds < 0) {
                hacknet_upgrades.push([() => (sfh.corp.funds < 0 ? 1e9 / Math.max(sfh.corp.profit, 1) : 0),
                    0, "Sell for Corporation Funds"]);
            }

            if (sfh.corp.res_rate > 0) {
                hacknet_upgrades.push([() => 1e3 / sfh.corp.res_rate, 0, "Exchange for Corporation Research"]);
            }
        }

        if ((sfh.goal.hac > 0 || sfh.goal.cha > 0) && sfh.state.work?.type === "university") {
            let goal = 0;
            let stat = 0;
            let rate = 0;
            let mult = 1;

            if (sfh.state.work.desc === "taking a Management course"
                || sfh.state.work.desc === "taking a Leadership course")
            {
                goal = sfh.goal.cha;
                stat = sfh.player.cha;
                rate = sfh.state.work.cha_rate;
                mult = sfh.player.mult.cha_exp;
            } else {
                goal = sfh.goal.hac;
                stat = sfh.player.hac;
                rate = sfh.state.work.skill_rate;
                mult = sfh.player.mult.hac_exp;
            }

            if (goal > stat && rate > 0) {
                const stat_exp = mult * (32 * Math.log(stat + 534.5) - 200)
                const goal_exp = mult * (32 * Math.log(goal + 534.5) - 200)
                const old_time = (goal_exp - stat_exp) / rate;
                const new_time = (goal_exp - stat_exp) / (1.2 * rate);
                hacknet_upgrades.push([() => old_time - new_time, 0, "Improve Studying"]);
            }
        }

        if ((sfh.goal.str > 0 || sfh.goal.def > 0 || sfh.goal.dex > 0 || sfh.goal.agi > 0)
            && sfh.state.work?.type === "gym")
        {
            let stat = 0;
            let goal = 0;
            let rate = 0;
            let mult = 1;

            if (sfh.state.work.desc === "training your strength at a gym") {
                stat = sfh.player.str;
                goal = sfh.goal.str;
                rate = sfh.state.work.str_rate;
                mult = sfh.player.mult.str_exp;
            } else if (sfh.state.work.desc === "training your defense at a gym") {
                stat = sfh.player.def;
                goal = sfh.goal.def;
                rate = sfh.state.work.def_rate;
                mult = sfh.player.mult.def_exp;
            } else if (sfh.state.work.desc === "training your dexterity at a gym") {
                stat = sfh.player.dex;
                goal = sfh.goal.dex;
                rate = sfh.state.work.dex_rate;
                mult = sfh.player.mult.dex_exp;
            } else if (sfh.state.work.desc === "training your agility at a gym") {
                stat = sfh.player.agi;
                goal = sfh.goal.agi;
                rate = sfh.state.work.agi_rate;
                mult = sfh.player.mult.agi_exp;
            }

            if (goal > stat && rate > 0) {
                const stat_exp = mult * (32 * Math.log(stat + 534.5) - 200)
                const goal_exp = mult * (32 * Math.log(goal + 534.5) - 200)
                const old_time = (goal_exp - stat_exp) / rate;
                const new_time = (goal_exp - stat_exp) / (1.2 * rate);
                hacknet_upgrades.push([() => old_time - new_time, 0, "Improve Gym Training"]);
            }
        }

        if (hacknet_upgrades.length > 0 && (!sfh.state.has_corp || sfh.corp.public)) {
            for (;;) {
                for (const upgrade of hacknet_upgrades) { upgrade[1] = upgrade[0](); }

                hacknet_upgrades.sort(function(a, b) {
                    return b[1] / ns.hacknet.hashCost(b[2]) - a[1] / ns.hacknet.hashCost(a[2])
                });

                if (hacknet_upgrades[0][1] <= 0
                    || ns.hacknet.numHashes() < ns.hacknet.hashCost(hacknet_upgrades[0][2])
                    || !ns.hacknet.spendHashes(hacknet_upgrades[0][2], hacknet_upgrades[0][3])
                ) { break; }

                if (hacknet_upgrades[0][2] === "Sell for Money") {
                    sfh.money.spent.hacknet = Math.max(sfh.money.spent.hacknet - 1e6, 0);
                }
            }
        }

        const min_money = Math.max((1e6 * hacknet_prod / 4) * 2, 1e6);
        while (money() < min_money) {
            if (!ns.hacknet.spendHashes("Sell for Money")) { break; }
            sfh.money.spent.hacknet = Math.max(sfh.money.spent.hacknet - 1e6, 0);
        }
    }

    if (ns.hacknet.numHashes() + hacknet_prod * 2 > ns.hacknet.hashCapacity()) {
        if (hacknet_prod < 1000) {
            while (ns.hacknet.numHashes() + hacknet_prod * 2 > ns.hacknet.hashCapacity()) {
                if (!ns.hacknet.spendHashes("Sell for Money")) { break; }
                sfh.money.spent.hacknet = Math.max(sfh.money.spent.hacknet - 1e6, 0);
            }
        } else {
            const cap  = ns.hacknet.hashCapacity();
            const prod = hacknet_prod / 5;
            let hashes = ns.hacknet.numHashes();
            let cycles = 10;

            while (cycles > 0 && hashes + prod < cap) {
                hashes += prod;
                --cycles;
            }

            const money_gained = cycles * Math.floor(prod / 4);
            sfh.money.spent.hacknet = Math.max(sfh.money.spent.hacknet - money_gained, 0);
        }
    }

    sfh.purchase("upgrade", money, sfh.bitnode.stock_4S_base, () => ns.stock.purchase4SMarketData(),       0.1);
    sfh.purchase("upgrade", money, sfh.bitnode.stock_4S_api,  () => ns.stock.purchase4SMarketDataTixApi(), 0.1);

    const cluster_name = (i: number): string => `sfh-${i.toFixed(0).padStart(2, "0")}`;
    const cluster_max = ns.getPurchasedServerLimit();
    let min_cluster_ram = Infinity;
    let max_cluster_ram = 8;
    for (let i = 0; i < cluster_max; ++i) {
        if (sfh.network[cluster_name(i)]) {
            min_cluster_ram = Math.min(min_cluster_ram, sfh.network[cluster_name(i)].ram);
            max_cluster_ram = Math.max(max_cluster_ram, sfh.network[cluster_name(i)].ram);
        } else {
            min_cluster_ram = 0;
        }
    }

    if (min_cluster_ram < ns.getPurchasedServerMaxRam()) {
        let index = -1;
        for (let i = 0; i < cluster_max; ++i) {
            let node = sfh.network[cluster_name(i)];
            if (node == null || (node.ram == min_cluster_ram && ns.getServerUsedRam(cluster_name(i)) === 0)) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            const canBuy = function(ram: number) {
                return sfh.purchase("cluster", money, ns.getPurchasedServerCost(ram), null);
            }

            let new_ram = max_cluster_ram * (max_cluster_ram == min_cluster_ram ? 2 : 1);
            while (canBuy(new_ram * 2)) { new_ram *= 2; }

            if (canBuy(new_ram)) {
                sfh.purchase("cluster", money, ns.getPurchasedServerCost(new_ram), function() {
                    ns.deleteServer(cluster_name(index));
                    ns.purchaseServer(cluster_name(index), new_ram);
                });
            }
        }
    }

    let hash_max = 0;
    for (const upgrade of [
        "Sell for Money",
        "Sell for Corporation Funds",
        "Reduce Minimum Security",
        "Increase Maximum Money",
        "Improve Studying",
        "Improve Gym Training",
        "Exchange for Corporation Research",
        "Exchange for Bladeburner Rank",
        "Exchange for Bladeburner SP",
        "Generate Coding Contract"
    ]) {
        hash_max = Math.max(hash_max, ns.hacknet.hashCost(upgrade));
    }

    while (hash_max >= 0.5 * ns.hacknet.hashCapacity()) {
        let index = 0;
        let cpd = 0;

        for (let i = 0; i < ns.hacknet.numNodes(); ++i) {
            const cap  = ns.hacknet.getNodeStats(i).hashCapacity ?? 0;
            const cost = ns.hacknet.getCacheUpgradeCost(i, 1);

            if (Number.isFinite(cost) && sfh.purchase("hacknet", money, cost, null) && cap / cost > cpd) {
                index = i;
                cpd = cap / cost;
            }
        }

        if (cpd <= 0) { break; }
        if (!sfh.purchase("hacknet", money, ns.hacknet.getCacheUpgradeCost(index, 1),
            () => ns.hacknet.upgradeCache(index, 1))) { break; }
    }

    if (sfh.goal.orgs.has(sfh.state.factions["Netburners"])
        && sfh.goal.type !== "faction" && sfh.goal.type !== "program")
    {
        const reqs = { level: 100, ram: 8, cores: 4 };

        for (let i = 0; i < ns.hacknet.numNodes(); ++i) {
            const { level: l, ram: r, cores: c } = ns.hacknet.getNodeStats(i);
            reqs.level = Math.max(reqs.level - l, 0);
            reqs.ram   = Math.max(reqs.ram   - r, 0);
            reqs.cores = Math.max(reqs.cores - c, 0);
        }

        while (ns.hacknet.numNodes() < 3) {
            if (!sfh.purchase("hacknet", money, ns.hacknet.getPurchaseNodeCost(),
                () => ns.hacknet.purchaseNode(), Number.POSITIVE_INFINITY)) { break; }
        }

        for (;;) {
            let buy: (() => unknown) = () => undefined;
            let cost = 0;

            for (let i = 0; i < ns.hacknet.numNodes(); ++i) {
                if (reqs.level > 0) {
                    const this_cost = ns.hacknet.getLevelUpgradeCost(i, 1);
                    if (cost <= 0 || this_cost < cost) {
                        cost = this_cost;
                        buy  = () => (ns.hacknet.upgradeLevel(i, 1) && --reqs.level);
                    }
                }

                if (reqs.ram > 0) {
                    const this_cost = ns.hacknet.getRamUpgradeCost(i, 1);
                    if (cost <= 0 || this_cost < cost) {
                        cost = this_cost;
                        buy  = () => (ns.hacknet.upgradeRam(i, 1) &&
                            (reqs.ram -= ns.hacknet.getNodeStats(i).ram / 2));
                    }
                }

                if (reqs.cores > 0) {
                    const this_cost = ns.hacknet.getCoreUpgradeCost(i, 1);
                    if (cost <= 0 || this_cost < cost) {
                        cost = this_cost;
                        buy  = () => (ns.hacknet.upgradeCore(i, 1) && --reqs.cores);
                    }
                }
            }

            if (cost <= 0) { break; }
            if (!sfh.purchase("hacknet", money, cost, buy, Number.POSITIVE_INFINITY)) { break; }
        }
    } else {
        sfh.purchase("hacknet", money, ns.hacknet.getPurchaseNodeCost(), () => ns.hacknet.purchaseNode());

        for (;;) {
            let buy: (() => unknown) = () => undefined;
            let cost = 0;
            let hpd  = 0;

            const cur_money = money();
            for (let i = 0; i < ns.hacknet.numNodes(); ++i) {
                const { level: l, ram: r, cores: c } = ns.hacknet.getNodeStats(i);
                const prod = hashRate(l, r, c);

                const cost_level = ns.hacknet.getLevelUpgradeCost(i, 1);
                if (cost_level <= cur_money * 2) {
                    const new_hpd = (hashRate(l + 1, r, c) - prod) / cost_level;
                    if (new_hpd > hpd) {
                        hpd  = new_hpd;
                        buy  = () => ns.hacknet.upgradeLevel(i, 1);
                        cost = cost_level;
                    }
                }

                const cost_ram = ns.hacknet.getRamUpgradeCost(i, 1);
                if (cost_ram <= cur_money * 2) {
                    const new_hpd = (hashRate(l, r * 2, c) - prod) / cost_ram;
                    if (new_hpd > hpd) {
                        hpd  = new_hpd;
                        buy  = () => ns.hacknet.upgradeRam(i, 1);
                        cost = cost_ram;
                    }
                }

                const cost_cores = ns.hacknet.getCoreUpgradeCost(i, 1);
                if (cost_cores <= cur_money * 2) {
                    const new_hpd = (hashRate(l, r, c + 1) - prod) / cost_cores;
                    if (new_hpd > hpd) {
                        hpd  = new_hpd;
                        buy  = () => ns.hacknet.upgradeCore(i, 1);
                        cost = cost_cores;
                    }
                }
            }
            
            if (hpd <= 0) { break; }
            if (!sfh.purchase("hacknet", money, cost, buy)) { break; }
        }
    }

    sfh.hnet.prod = 0;
    for (let i = 0; i < ns.hacknet.numNodes(); ++i) {
        const stats = ns.hacknet.getNodeStats(i);
        sfh.hnet.prod += hashRate(stats.level, stats.ram, stats.cores);
    }
    sfh.hnet.hashes   = ns.hacknet.numHashes();
    sfh.hnet.capacity = ns.hacknet.hashCapacity();
    sfh.hnet.dps      = sfh.hnet.prod * 1e6 / 4;

    sfh.player.money = money();
}
