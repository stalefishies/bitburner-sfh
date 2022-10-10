const faction_continent: { [city in City]: Continent } = {
    "Sector-12": "America",
    "Aevum":     "America",
    "Volhaven":  "Europe",
    "Chongqing": "Asia",
    "New Tokyo": "Asia",
    "Ishima":    "Asia"
}

export async function main(ns: NS) {
    for (const faction of Object.values(data.factions)) {
        const continent = faction_continent[faction.name as City];
        if (continent != null) {
            if (sfh.state.continent === continent || sfh.state.continent == null) {
                ns.singularity.joinFaction(faction.name);
            }
        } else if (!faction.enemies || faction.enemies.size == 0) {
            ns.singularity.joinFaction(faction.name);
        }
    }

    for (const company of Object.values(data.companies)) {
        if (company.name === "Central Intelligence Agency"
            || company.name === "National Security Agency") { continue; }
        ns.singularity.applyToCompany(company.name, data.bestCompanyWork(company.name));
    }

    const player = ns.getPlayer();
    if (player.hp.current < player.hp.max) {
        const cost = (player.hp.max - player.hp.current) * 100e3;
        if (100 * cost < player.money) { sfh.x.player.hospitalize(); }
        ns.singularity.hospitalize;
    }

    sfh.playerUpdate(ns, player);
    sfh.workUpdate(ns.singularity.getCurrentWork(), ns.singularity.isFocused());
    sfh.state.share_mult = ns.getSharePower();

    let total_spent = 0;
    for (const type of Object.keys(sfh.money.spent) as (keyof typeof sfh.money.spent)[]) {
        total_spent += sfh.money.spent[type];
    }
    sfh.money.curr  = player.money;
    sfh.money.total = player.money + total_spent;

    sfh.state.has_brutessh  = true;
    sfh.state.has_ftpcrack  = true;
    sfh.state.has_relaysmtp = true;
    sfh.state.has_httpworm  = true;
    sfh.state.has_sqlinject = true;
    sfh.state.has_formulas  = true;

    try { ns.brutessh ("n00dles");               } catch { sfh.state.has_brutessh  = false; }
    try { ns.ftpcrack ("n00dles");               } catch { sfh.state.has_ftpcrack  = false; }
    try { ns.relaysmtp("n00dles");               } catch { sfh.state.has_relaysmtp = false; }
    try { ns.httpworm ("n00dles");               } catch { sfh.state.has_httpworm  = false; }
    try { ns.sqlinject("n00dles");               } catch { sfh.state.has_sqlinject = false; }
    try { ns.formulas.skills.calculateExp(1, 1); } catch { sfh.state.has_formulas  = false; }

    sfh.state.has_tor             = player.tor;
    sfh.state.has_stocks          = ns.stock.hasWSEAccount() && ns.stock.hasTIXAPIAccess();
    sfh.state.has_4S              = ns.stock.has4SData() && ns.stock.has4SDataTIXAPI();
    sfh.state.has_gang            = ns.gang.inGang();
    sfh.state.has_corp            = player.hasCorporation;
    sfh.state.has_bladeburners    = player.inBladeburner;

    ns.stanek.acceptGift();
    for (const name of ns.singularity.getOwnedAugmentations(false)) { sfh.state.augs.add(name); }
    for (const name of ns.singularity.getOwnedAugmentations(true)) {
        if (!sfh.state.augs.has(name)) { sfh.state.augs.queued.add(name); }
    }

    for (const name of player.factions) {
        const faction = sfh.state.factions[name];
        if (!faction) { continue; }

        faction.joined = true;
        sfh.goal.orgs.delete(faction);

        const continent = faction_continent[name as City];
        if (continent) { sfh.state.continent = continent; }

        if (sfh.state.goto?.type === "faction" && name === sfh.state.goto.desc) { sfh.state.goto = null; }
    }

    for (const faction of Object.values(sfh.state.factions)) {
        faction.rep = ns.singularity.getFactionRep(faction.name);

        let can_work = false;
        if (faction.name !== "Slum Snakes" || !sfh.state.has_gang) {
            for (const bool of Object.values(data.factions[faction.name].work)) {
                if (bool) { can_work = true; break; }
            }
        }

        faction.augs.clear();
        faction.augs.all.clear();
        faction.finished = true;

        for (const aug_name of ns.singularity.getAugmentationsFromFaction(faction.name)) {
            faction.augs.all.add(aug_name);

            if (aug_name === "NeuroFlux Governor") {
                faction.augs.add(aug_name);
            } else if (!sfh.state.augs.has(aug_name) && !sfh.state.augs.queued.has(aug_name)) {
                faction.augs.add(aug_name);

                if (can_work && faction.rep < data.augs[aug_name].rep * sfh.player.mults.aug_rep) {
                    faction.finished = false;
                }
            }
        }
    }

    for (const [name, company] of Object.entries(sfh.state.companies)) {
        company.joined = name in player.jobs;
        if (company.joined) { sfh.goal.orgs.delete(company); }

        company.finished = sfh.state.factions[company.dual ?? ""]?.joined ?? true;
        company.title    = player.jobs[name] ?? null;
        company.favour   = ns.singularity.getCompanyFavor(name);
        company.rep      = ns.singularity.getCompanyRep(name);
    }

    if (!sfh.state.has_gang && sfh.player.karma <= -54000 && sfh.state.factions["Slum Snakes"].joined) {
        sfh.state.has_gang = ns.gang.createGang("Slum Snakes");
        sfh.state.factions["Slum Snakes"].finished = true;
    }

    sfh.state.has_basics = sfh.state.has_tor && sfh.state.has_brutessh && sfh.state.has_ftpcrack
        && sfh.state.has_relaysmtp && sfh.state.has_httpworm && sfh.state.has_sqlinject;

    sfh.state.location = player.location;
    if (sfh.state.city != player.city) {
        sfh.state.city = player.city as any;
    }

    for (let i = sfh.goal.augs.length - 1; i >= 0; --i) {
        const aug = sfh.goal.augs[i];
        if (sfh.state.augs.has(aug.name) || sfh.state.augs.queued.has(aug.name)) {
            sfh.goal.augs.splice(i, 1);
        } else if (!aug.org.joined) {
            sfh.goal.orgs.add(aug.org);
        }
    }

    for (let i = sfh.goal.work.length - 1; i >= 0; --i) {
        const work = sfh.goal.work[i];
        if (work.org.rep >= work.rep) {
            sfh.goal.work.splice(i, 1);
        } else if (!work.org.joined) {
            sfh.goal.orgs.add(work.org);
        }
    }

    sfh.goal.type  = null;
    sfh.goal.desc  = "";

    sfh.goal.money       = 0;
    sfh.goal.money_next  = 0;
    sfh.goal.money_total = 0;

    const aug_multiplier = 1.9 * [1, 0.96, 0.94, 0.93][sfh.bitnode.sf[11]];

    if (!sfh.state.has_tor) {
        sfh.goal.type = "program";
        sfh.goal.desc = "TOR";
        sfh.goal.money_next = 200e3;
    } else if (!sfh.state.has_brutessh) {
        sfh.goal.type = "program";
        sfh.goal.desc = "BruteSSH.exe";
        sfh.goal.money_next = 500e3;
    } else if (!sfh.state.factions["Tian Di Hui"].joined && !sfh.state.factions["Tian Di Hui"].finished) {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Tian Di Hui";
        sfh.goal.money_next = data.factions["Tian Di Hui"].reqs.money ?? 0;

        if (sfh.money.curr >= sfh.goal.money_next && !sfh.state.goto) {
            if (sfh.state.city === "Chongqing" || sfh.state.city === "New Tokyo" || sfh.state.city === "Ishima") {
                sfh.state.goto = { city: sfh.state.city, type: "faction", desc: "Tian Di Hui" };
            } else {
                sfh.state.goto = { city: "Chongqing", type: "faction", desc: "Tian Di Hui" };
                sfh.goal.money_next += 200e3;
            }
        }
    } else if (!sfh.state.has_ftpcrack) {
        sfh.goal.type = "program";
        sfh.goal.desc = "FTPCrack.exe";
        sfh.goal.money_next = 1.5e6;
    } else if (!sfh.state.has_relaysmtp) {
        sfh.goal.type = "program";
        sfh.goal.desc = "RelaySMTP.exe";
        sfh.goal.money_next = 5e6;
    } else if (sfh.state.continent === "America" && !sfh.state.factions["Sector-12"].joined
        && !sfh.state.factions["Sector-12"].finished)
    {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Sector-12";
        sfh.goal.money_next  = data.factions["Sector-12"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "Sector-12" ? 0 : 200e3);
    } else if (sfh.state.continent === "Asia" && !sfh.state.factions["Chongqing"].joined
        && !sfh.state.factions["Chongqing"].finished)
    {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Chongqing";
        sfh.goal.money_next  = data.factions["Chongqing"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "Chongqing" ? 0 : 200e3);
    } else if (sfh.state.continent === "Asia" && !sfh.state.factions["New Tokyo"].joined
        && !sfh.state.factions["New Tokyo"].finished)
    {
        sfh.goal.type = "faction";
        sfh.goal.desc = "New Tokyo";
        sfh.goal.money_next  = data.factions["New Tokyo"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "New Tokyo" ? 0 : 200e3);
    } else if (sfh.state.continent === "Asia" && !sfh.state.factions["Ishima"].joined
        && !sfh.state.factions["Ishima"].finished)
    {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Ishima";
        sfh.goal.money_next  = data.factions["Ishima"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "Ishima" ? 0 : 200e3);
    } else if (sfh.player.karma <= -18 && Math.min(sfh.player.str, sfh.player.def, sfh.player.dex, sfh.player.agi) >= 75
        && !sfh.state.factions["Tetrads"].joined && !sfh.state.factions["Tetrads"].finished)
    {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Tetrads";
        if (sfh.money.curr >= sfh.goal.money_next && !sfh.state.goto) {
            if (sfh.state.city === "Chongqing" || sfh.state.city === "New Tokyo" || sfh.state.city === "Ishima") {
                sfh.state.goto = { city: sfh.state.city, type: "faction", desc: "Tetrads" };
            } else {
                sfh.state.goto = { city: "Chongqing", type: "faction", desc: "Tetrads" };
                sfh.goal.money_next = 200e3;
            }
        }
    } else if (sfh.state.continent === "America" && !sfh.state.factions["Aevum"].joined
        && !sfh.state.factions["Aevum"].finished)
    {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Aevum";
        sfh.goal.money_next  = data.factions["Aevum"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "Aevum" ? 0 : 200e3);
    } else if (sfh.state.continent === "Europe" && !sfh.state.factions["Volhaven"].joined
        && !sfh.state.factions["Volhaven"].finished)
    {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Volhaven";
        sfh.goal.money_next  = data.factions["Volhaven"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "Volhaven" ? 0 : 200e3);
    } else if (!sfh.state.has_httpworm) {
        sfh.goal.type = "program";
        sfh.goal.desc = "HTTPWorm.exe";
        sfh.goal.money_next = 30e6;
    } else if (!sfh.state.has_sqlinject) {
        sfh.goal.type = "program";
        sfh.goal.desc = "SQLInject.exe";
        sfh.goal.money_next = 250e6;
    } else if (sfh.goal.corp) {
        sfh.goal.type = "corp";
        sfh.goal.desc = "--";
        sfh.goal.money_next = 150e9;
    } else if (sfh.goal.augs.length > 0) {
        const aug = sfh.goal.augs[0];

        sfh.goal.type  = "augmentation";
        sfh.goal.desc  = aug.name;
        sfh.goal.money_next = data.augs[aug.name].cost
            * sfh.player.mults.aug_cost * aug_multiplier ** sfh.state.augs.queued.size;

        if (aug.org.favour > sfh.bitnode.donation) {
            const rep = data.augs[aug.name].rep * sfh.player.mults.aug_rep;
            const donation = (rep - aug.org.rep) / sfh.player.mults.faction_rep * 1e6;
            if (donation > 0) { sfh.goal.money_next += donation; }
        }
    } else if (sfh.goal.work.length > 0) {
        const work = sfh.goal.work[0];

        sfh.goal.type = "work";
        sfh.goal.desc = work.org.name;

        if (work.org.favour > sfh.bitnode.donation) {
            const donation = (work.rep - work.org.rep) / sfh.player.mults.faction_rep * 1e6;
            if (donation > 0) { sfh.goal.money_next = donation; }
        }
    }

    if (sfh.goal.money_next > 0 && sfh.goal.money_next <= 50e6) {
        sfh.money.can_class = false;
    } else if (sfh.money.curr >= 50e6) {
        sfh.money.can_class = true;
    } else if (sfh.money.curr < 10e6) {
        sfh.money.can_class = false;
    }

    sfh.goal.money_total += sfh.state.has_tor       ? 0 : 200e3;
    sfh.goal.money_total += sfh.state.has_brutessh  ? 0 : 500e3;
    sfh.goal.money_total += sfh.state.has_ftpcrack  ? 0 : 1.5e6;
    sfh.goal.money_total += sfh.state.has_relaysmtp ? 0 :   5e6;
    sfh.goal.money_total += sfh.state.has_httpworm  ? 0 :  30e6;
    sfh.goal.money_total += sfh.state.has_sqlinject ? 0 : 250e6;
    sfh.goal.money_total += sfh.goal.corp ? 150e9 : 0;

    let queued_augs = sfh.state.augs.queued.size;
    for (const aug of sfh.goal.augs) {
        sfh.goal.money_total += data.augs[aug.name].cost * sfh.player.mults.aug_cost
            * aug_multiplier ** queued_augs++;
    }

    for (const work of sfh.goal.work) {
        if (work.org.favour > sfh.bitnode.donation) {
            const donation = (work.rep - work.org.rep) / sfh.player.mults.faction_rep * 1e6;
            if (donation > 0) { sfh.goal.money_total += donation; }
        }
    }

    for (const key of (Object.keys(sfh.gains.total) as (keyof typeof sfh.gains.total)[])) {
        sfh.gains.total[key] = 0;

        for (const type of (Object.keys(sfh.gains) as (keyof typeof sfh.gains)[])) {
            if (type === "total") { continue; }
            sfh.gains.total[key] += sfh.gains[type][key];
        }
    }

    sfh.goal.money = (sfh.money.curr > sfh.goal.money_next ? sfh.goal.money_total : sfh.goal.money_next);

    for (const key of (Object.keys(sfh.goal.times) as (keyof typeof sfh.goal.times)[])) {
        sfh.goal.times[key] = 0;
    }
    
    if (sfh.goal.money > sfh.money.curr) {
        sfh.goal.times.money = (sfh.goal.money - sfh.money.curr) / sfh.gains.total.money * 1000;
    }

    if (sfh.state.work?.type === "faction" || sfh.state.work?.type === "company") {
        let cur_rep  = 0;
        let goal_rep = 0;

        for (const work of sfh.goal.work) {
            if (work.org.name === sfh.state.work.loc) {
                cur_rep  = work.org.rep;
                goal_rep = work.rep;
            }
        }

    }

    if (sfh.player.karma > -54000) {
        sfh.goal.times.karma = (54000 + sfh.player.karma) / sfh.gains.total.karma * 1000;
    }

    for (const stat of ["hac", "str", "def", "dex", "agi", "cha", "int"] as (keyof Skills)[]) {
        const stat_exp = (stat + "_exp") as (keyof SkillExp);
        if (sfh.goal[stat] > sfh.player[stat]) {
            const mult = sfh.player.mults[stat];
            const goal_exp = Math.max(Math.exp((Math.floor(sfh.goal[stat]) / mult + 200) / 32) - 534.5, 0);
            sfh.goal.times[stat] = (goal_exp - sfh.player[stat_exp]) / sfh.gains.total[stat_exp] * 1000;
        }
    }

    sfh.goal.time = 0;
    for (const key of (Object.keys(sfh.goal.times) as (keyof typeof sfh.goal.times)[])) {
        sfh.goal.time = Math.max(sfh.goal.time, sfh.goal.times[key]);
    }

    if (sfh.player.mults.corp_dividends <= 0.15) { sfh.can.corp = false; }

    if (!sfh.can.corp) {
        sfh.goal.corp = false;
    } else if (sfh.state.has_corp) {
        sfh.goal.corp = false; sfh.corp.reserve = true;
    } else if (sfh.can.automate && !sfh.corp.reserve && sfh.network.home.ram >= 2048) {
        if ((sfh.can.purchase && sfh.money.total >= 150e9) || sfh.bitnode.number == 3) {
            sfh.corp.reserve = true;
        } else if (!sfh.goal.corp) {
            const corp_lerp = Math.min(Math.max(sfh.money.total, sfh.goal.money_total / 2, 0) / 150e9, 1);
            if ((150e9 - sfh.money.curr) / sfh.gains.total.money <= (30 + corp_lerp * 60) * 60) {
                ++sfh.goal.corp_ticks;
                if (sfh.goal.corp_ticks > 10) {
                    sfh.goal.corp = true;
                    sfh.goal.type = "corp";
                    sfh.goal.corp_ticks = 0;
                }
            } else {
                sfh.goal.corp_ticks = Math.max(sfh.goal.corp_ticks - 2, 0);
            }
        }
    } else {
        sfh.goal.corp_ticks = 0;
    }

    if (sfh.can.install && sfh.can.automate
        && sfh.state.have_goal && sfh.goal.type == null
        && sfh.goal.corp_ticks == 0)
    {
        sfh.install = true;
    }
}
