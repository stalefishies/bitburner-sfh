export async function main(ns: NS) {
    if (ns.args.length !== 1 || ns.args[0] !== "sfh") { return; }

    const num = 8; // ns.sleeve.getNumSleeves();
    for (let i = 0; i < num; ++i) {
        sfh.sleeveUpdate(i, ns.sleeve.getInformation(i), ns.sleeve.getSleeveStats(i));
    }

    const sleeves = Array.from(sfh.sleeves).sort((s, t) => (
          (1 - t.shock * t.shock) * (t.hac + t.str + t.def + t.dex + t.agi)
        - (1 - s.shock * s.shock) * (s.hac + s.str + s.def + s.dex + s.agi)
    ));

    const factions  = new Set<string>();
    const companies = new Set<string>();
    const bb = {
        "Tracking":      false,
        "Bounty Hunter": false,
        "Retirement":    false
    };

    const sleeve_work: [string, string][] = [];
    for (const sleeve of sleeves) {
        let work: typeof sleeve_work[0] | null = null;

        // Stats
        if (!work && sleeve.shock <= 0.5 && sfh.money.can_class) {
            if      (sfh.player.hac < Math.max(sfh.goal.hac, 150)) { work = ["uni", "hac"]; }
            else if (sfh.player.str < Math.max(sfh.goal.str, 100)) { work = ["gym", "str"]; }
            else if (sfh.player.def < Math.max(sfh.goal.def, 100)) { work = ["gym", "def"]; }
            else if (sfh.player.dex < Math.max(sfh.goal.dex, 100)) { work = ["gym", "dex"]; }
            else if (sfh.player.agi < Math.max(sfh.goal.agi, 100)) { work = ["gym", "agi"]; }
            else if (sfh.player.cha < Math.max(sfh.goal.cha, 100)) { work = ["uni", "cha"]; }
            else if (sleeve.hac < sleeve.mults.hac * 150) { work = ["uni", "hac"]; }
            else if (sleeve.str < sleeve.mults.str * 100) { work = ["gym", "str"]; }
            else if (sleeve.def < sleeve.mults.def * 100) { work = ["gym", "def"]; }
            else if (sleeve.dex < sleeve.mults.dex * 100) { work = ["gym", "dex"]; }
            else if (sleeve.agi < sleeve.mults.agi * 100) { work = ["gym", "agi"]; }
            else if (sleeve.cha < sleeve.mults.cha * 100) { work = ["uni", "cha"]; }
        }

        // Player work
        if (!work && sleeve.shock <= 0.9 && sfh.state.work) {
            if (sfh.state.work.type === "faction" && !factions.has(sfh.state.work.loc)) {
                work = ["faction", sfh.state.work.loc];
            } else if (sfh.state.work.type === "company" && !companies.has(sfh.state.work.loc)) {
                work = ["company", sfh.state.work.loc];
            }
        }

        // Goal work
        if (!work && sleeve.shock <= 0.8) {
            for (const { org } of sfh.goal.work) {
                if (org.faction && !factions.has(org.name)) {
                    work = ["faction", org.name];
                } else if (!org.faction && !companies.has(org.name)) {
                    work = ["company", org.name];
                }
            }
        }

        // Crime
        if (!work && sleeve.shock <= 0.8) {
            if      (sfh.player.karma > -54000) { work = ["crime", "karma"]; }
            else if (sfh.money.curr   <    1e9) { work = ["crime", "money"]; }
        }

        // Bladeburner contracts
        //if (!work && sleeve.shock <= 50) {
        //    for (const contract of ["Tracking", "Bounty Hunter", "Retirement"] as (keyof typeof bb)[]) {
        //        if (!bb[contract]) {
        //            work = ["bladeburner", contract];
        //            bb[contract] = true;
        //            break;
        //        }
        //    }
        //}

        // Companies without faction unlocked and highest favour
        if (!work && sleeve.shock <= 0.5) {
            for (const company of Object.values(sfh.state.companies)) {
                if (company.name == "Fulcrum Technologies" && !sfh.network.fulcrumassets.backdoor) { continue; }
                if (company.title == null || company.dual == null || companies.has(company.name)) { continue; }

                if (!company.finished && company.rep < (data.factions[company.dual].reqs.company ?? 0)
                    && (work == null || company.favour > (sfh.state.companies[work[1]]?.favour ?? 0)))
                {
                    work = ["company", company.name];
                }
            }
        }

        // Factions with augs left to purchase and highest favour
        if (!work && sleeve.shock <= 0.5) {
            for (const faction of Object.values(sfh.state.factions)) {
                if (factions.has(faction.name) || (sfh.state.has_gang && faction.name === "Slum Snakes")) { continue; }

                if (faction.joined && !faction.finished
                    && (work == null || faction.favour > (sfh.state.factions[work[1]]?.favour ?? 0)))
                {
                    work = ["faction", faction.name];
                }
            }
        }

        if (!work && sleeve.shock <= 0.2) { work = ["crime", "money"]; }
        sleeve_work[sleeve.index] = work ?? ["shock", ""];

        if (work?.[0] === "faction") { factions.add(work[1]); }
        if (work?.[0] === "company") { companies.add(work[1]); }
    }

    //sfh.print("{j}", sleeve_work);

    // Stop faction/company work that's ending
    for (const sleeve of sleeves) {
        const work = sleeve_work[sleeve.index];
        const task = ns.sleeve.getTask(sleeve.index);

        if (task?.type === "FACTION") {
            if (work[0] !== "faction" || work[1] !== task.factionName) {
                ns.sleeve.setToShockRecovery(sleeve.index);
            }
        } else if (task?.type === "COMPANY") {
            if (work[0] !== "company" || work[1] !== task.companyName) {
                ns.sleeve.setToShockRecovery(sleeve.index);
            }
        } else if (task?.actionType === "Contracts") {
            if (work[0] !== "bladeburner" || work[1] !== task.actionName) {
                ns.sleeve.setToShockRecovery(sleeve.index);
            }
        }
    }

    // Apply work
    for (const sleeve of sleeves) {
        const index = sleeve.index;
        const task  = ns.sleeve.getTask(index);
        let   work  = sleeve_work[index];

        //sfh.print("Set sleeve {} to {}", index, work);
        //sfh.print("{j}", task);

        if (work[0] === "uni") {
            if (sleeve.city !== "Volhaven" && sfh.can.purchase) {
                sfh.purchase("goal", null, 200e3, () => ns.sleeve.travel(index, "Volhaven"));
                sleeve.city = ns.sleeve.getInformation(index).city;
            }

            if (sleeve.city === "Volhaven") {
                if (task?.type !== "CLASS"
                    || (work[1] === "hac" && task.classType !== "ALGORITHMS")
                    || (work[1] === "cha" && task.classType !== "LEADERSHIP")
                ) {
                    const name = (work[1] === "cha" ? "Leadership" : "Algorithms");
                    ns.sleeve.setToUniversityCourse(index, "ZB Institute of Technology", name);
                }
            } else {
                work = sleeve_work[index] = (sleeve.shock <= 20 ? ["crime", "money"] : ["shock", ""]);
            }
        }
        
        if (work[0] === "gym") {
            if (sleeve.city !== "Sector-12" && sfh.can.purchase) {
                sfh.purchase("goal", null, 200e3, () => ns.sleeve.travel(index, "Sector-12"));
                sleeve.city = ns.sleeve.getInformation(index).city;
            }

            if (sleeve.city === "Sector-12") {
                if (task?.type !== "CLASS"
                    || (work[1] === "str" && task.classType !== "GYMSTRENGTH")
                    || (work[1] === "def" && task.classType !== "GYMDEFENSE")
                    || (work[1] === "dex" && task.classType !== "GYMDEXTERITY")
                    || (work[1] === "agi" && task.classType !== "GYMAGILITY")
                ) {
                         if (work[1] === "def") { ns.sleeve.setToGymWorkout(index, "Powerhouse Gym", "def"); }
                    else if (work[1] === "dex") { ns.sleeve.setToGymWorkout(index, "Powerhouse Gym", "dex"); }
                    else if (work[1] === "agi") { ns.sleeve.setToGymWorkout(index, "Powerhouse Gym", "agi"); }
                    else                        { ns.sleeve.setToGymWorkout(index, "Powerhouse Gym", "str"); }
                }
            } else {
                work = sleeve_work[index] = (sleeve.shock <= 20 ? ["crime", "money"] : ["shock", ""]);
            }
        }

        if (work[0] === "faction") {
            const loc  = work[1];
            const desc = data.bestFactionWork(loc, sleeve, "rep");

            if (sfh.state.factions[loc]?.joined) {
                if (task?.type !== "FACTION" || task.factionName !== loc || task.factionWorkType !== desc) {
                    ns.sleeve.setToFactionWork(index, loc, desc);
                }
            } else {
                work = sleeve_work[index] = (sleeve.shock <= 20 ? ["crime", "null"] : ["shock", ""]);
            }
        }

        if (work[0] === "company") {
            const loc = work[1];

            if (sfh.state.companies[loc]?.title) {
                if (task?.type !== "COMPANY" || task.companyName !== loc) {
                    ns.sleeve.setToCompanyWork(index, loc);
                }
            } else {
                work = sleeve_work[index] = (sleeve.shock <= 20 ? ["crime", "null"] : ["shock", ""]);
            }
        }

        if (work[0] === "bladeburner") {
            let type = work[1];
            if (work[1] === "Tracking" || work[1] === "Bounty Hunter" || work[1] === "Retirement") {
                if (!task || task.actionType !== "Contracts" || task.actionName !== work[1]) {
                    ns.sleeve.setToBladeburnerAction(index, "Take on contracts", work[1]);
                }
            } else {
                if (!task || task.actionType !== "General" || task.actionName !== work[1]) {
                    ns.sleeve.setToBladeburnerAction(index, work[1]);
                }
            }
        }

        if (work[0] === "shock") {
            if (sleeve.shock === 0) {
                work[0] = "crime";
                work[1] = "money";
            } else if (task?.type !== "RECOVERY") {
                ns.sleeve.setToShockRecovery(index);
            }
        }

        if (work[0] === "crime" || ns.sleeve.getTask(index) == null) {
            if (work[1] !== "karma" && work[1] !== "money") {
                work[1] = sfh.player.karma > -54000 ? "karma" : "money";
            }

            const desc = data.bestCrimeWork(sleeve, (work[1] as "karma" | "money"));
            if (task?.type !== "CRIME" || task.crimeType !== desc) {
                ns.sleeve.setToCommitCrime(index, desc);
            }
        }
    }

    const gain = { money: 0, karma: 0, rep: 0,
        hac_exp: 0, str_exp: 0, def_exp: 0, dex_exp: 0, agi_exp: 0, cha_exp: 0, int_exp: 0 };
    for (let i = 0; i < 8; ++i) {
        const task = ns.sleeve.getTask(i);
        const this_gain = data.calcWork(task, sfh.sleeves[i]);

        //sfh.print("Sleeve {}: {}", i, task.type);
        //sfh.print("{j}", this_gain);

        gain.money   += this_gain.money;
        gain.karma   += this_gain.karma;
        gain.hac_exp += this_gain.hac_exp;
        gain.str_exp += this_gain.str_exp;
        gain.def_exp += this_gain.def_exp;
        gain.dex_exp += this_gain.dex_exp;
        gain.agi_exp += this_gain.agi_exp;
        gain.cha_exp += this_gain.cha_exp;
        gain.int_exp += this_gain.int_exp;

        if ((task.type === "FACTION" && sfh.state.work?.type === "faction"
                && task.factionName === sfh.state.work.loc)
            || (task.type === "COMPANY" && sfh.state.work?.type === "company"
                && task.companyName === sfh.state.work.loc))
        { gain.rep += this_gain.rep; }
    }
    sfh.gainUpdate("sleeves", gain);
}
