export async function main(ns: NS) {
    if (!sfh.can.purchase) { return; }
    const money = (() => ns.getServerMoneyAvailable("home"));

    if (sfh.can.install && sfh.time.reset < 120 * 1000) {
        for (const faction of Object.values(sfh.state.factions)) {
            if (!faction.joined) { continue; }

            for (const aug_name of faction.augs) {
                if (aug_name === "NeuroFlux Governor") {
                    if (sfh.time.reset >= 30 * 1000) { continue; }
                } else {
                    if (sfh.state.augs.has(aug_name) || sfh.state.augs.queued.has(aug_name)) { continue; }
                }

                do {
                    const [aug_rep, aug_cost] = ns.singularity.getAugmentationCost(aug_name);

                    let donation = 0;
                    if (aug_rep > faction.rep) {
                        if (!ns.singularity.donateToFaction(faction.name, Number.MIN_VALUE)) { break; }
                        donation = (aug_rep - faction.rep) / sfh.player.mult.faction_rep * 1e6;
                    }

                    if (money() < aug_cost + donation
                        || (donation > 0 && !ns.singularity.donateToFaction(faction.name, donation))
                        || !ns.singularity.purchaseAugmentation(faction.name, aug_name))
                    { break; }

                    sfh.install = true;
                    faction.rep = Math.max(faction.rep, aug_rep);
                } while (aug_name === "NeuroFlux Governor");
            }
        }
    }

    if (sfh.goal.type !== null && money() > sfh.goal.money_next) {
        const cities = new Set(["Sector-12", "Aevum" , "Volhaven" , "Chongqing", "New Tokyo", "Ishima"]);
        const init_money = money();

        if (sfh.goal.type === "program" && sfh.goal.desc === "TOR") {
            sfh.purchase("goal", money, 200e3, () => ns.singularity.purchaseTor());
        } else if (sfh.goal.type === "program") {
            sfh.purchase("goal", money, sfh.goal.money, () => ns.singularity.purchaseProgram(sfh.goal.desc));
        } else if (sfh.goal.type === "faction" && sfh.goal.desc === "Tian Di Hui" && !sfh.state.goto) {
            if (sfh.state.city === "Chongqing" || sfh.state.city === "New Tokyo" || sfh.state.city === "Ishima") {
                sfh.state.goto = { city: sfh.state.city, type: "faction", desc: "Tian Di Hui" };
            } else if (money() > (data.factions["Tian Di Hui"].reqs.money ?? 0) + 200e3) {
                sfh.state.goto = { city: "Chongqing", type: "faction", desc: "Tian Di Hui" };
            }
        } else if (sfh.goal.type === "faction" && (sfh.goal.desc === "Sector-12" || sfh.goal.desc === "Aevum"
            || sfh.goal.desc === "Volhaven" || sfh.goal.desc === "Chongqing"
            || sfh.goal.desc === "New Tokyo" || sfh.goal.desc === "Ishima") && !sfh.state.goto)
        {
            if (sfh.state.city === sfh.goal.desc) {
                sfh.state.goto = { city: sfh.goal.desc, type: "faction", desc: sfh.goal.desc };
            } else if (money() > (data.factions[sfh.goal.desc].reqs.money ?? 0) + 200e3) {
                sfh.state.goto = { city: sfh.goal.desc, type: "faction", desc: sfh.goal.desc };
            }
        } else if (sfh.goal.type === "augmentation" && sfh.goal.augs.length > 0) {
            const queue_pow = (1.9 * [1, 0.96, 0.94, 0.93][sfh.bitnode.sf[11]]);
            const mult = sfh.state.augs.queued.size ** queue_pow;
            const aug  = sfh.goal.augs[0];
            const cost = data.augs[aug.name].cost * sfh.player.mult.aug_cost * mult;
            const rep  = data.augs[aug.name].rep  * sfh.player.mult.aug_rep;

            let faction  = null;
            let donation = Number.POSITIVE_INFINITY;

            for (const f of Object.values(sfh.state.factions)) {
                if (!f.joined || !f.augs.has(aug.name)) { continue; }

                let d = 0;
                if (f.rep < rep) {
                    if (!ns.singularity.donateToFaction(f.name, Number.MIN_VALUE)) { continue; }
                    d = (rep - f.rep) / sfh.player.mult.faction_rep * 1e6;
                }
                if (d < donation && sfh.purchase("goal", money, d + cost, null)) {
                    faction  = f;
                    donation = d;
                    if (donation === 0) { break; }
                }
            }

            if (faction) {
                const name = faction.name;
                sfh.purchase("goal", money, donation,
                    () => ns.singularity.donateToFaction(name, donation));
                sfh.purchase("goal", money, cost,
                    () => ns.singularity.purchaseAugmentation(name, aug.name));
            }
        } else if (sfh.goal.type === "work" && sfh.goal.work.length > 0) {
            const work = sfh.goal.work[0];

            if (work.org.favour > sfh.bitnode.donation) {
                const donation = (work.rep - work.org.rep) / sfh.player.mult.faction_rep * 1e6;
                if (donation > 0) {
                    sfh.purchase("goal", money, donation,
                        () => ns.singularity.donateToFaction(work.org.name, donation));
                }
            }
        }

        sfh.money.curr = money();
        if (sfh.money.curr < init_money) { sfh.money.spent.goal += init_money - sfh.money.curr; }
    }

    sfh.purchase("goal", money, 200e3, function() {
        if (sfh.state.goto && sfh.state.goto.city !== sfh.state.city) {
            const city = sfh.state.goto.city;
            sfh.purchase("goal", money, 200e3, () => ns.singularity.travelToCity(city));
        }
    });

    for (;;) {
        let home_ram_frac = undefined;
        if (sfh.goal.type === "corp" && ns.getServerMaxRam("home") < 2048) {
           home_ram_frac = Number.POSITIVE_INFINITY;
        }

        if (!sfh.purchase("upgrade", money, () => ns.singularity.getUpgradeHomeRamCost(),
            () => ns.singularity.upgradeHomeRam(), home_ram_frac)) { break; }
    }

    sfh.purchase("goal",    money, 200e3, () => ns.singularity.purchaseTor());
    sfh.purchase("goal",    money, 500e3, () => ns.singularity.purchaseProgram("BruteSSH.exe"));
    sfh.purchase("goal",    money, 1.5e6, () => ns.singularity.purchaseProgram("FTPCrack.exe"));
    sfh.purchase("goal",    money,   5e6, () => ns.singularity.purchaseProgram("relaySMTP.exe"));
    sfh.purchase("goal",    money,  30e6, () => ns.singularity.purchaseProgram("HTTPWorm.exe"));
    sfh.purchase("goal",    money, 250e6, () => ns.singularity.purchaseProgram("SQLInject.exe"));
    sfh.purchase("program", money, 500e3, () => ns.singularity.purchaseProgram("DeepscanV1.exe"));
    sfh.purchase("program", money,  25e6, () => ns.singularity.purchaseProgram("DeepscanV2.exe"));
    sfh.purchase("program", money,   1e6, () => ns.singularity.purchaseProgram("AutoLink.exe"));
    sfh.purchase("program", money, 500e3, () => ns.singularity.purchaseProgram("ServerProfiler.exe"));
}
