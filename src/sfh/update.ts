import { NS } from "netscript";
import * as S from "sfh";

export async function main(ns: NS) {
    for (const name in data.factions) {
        const faction = data.factions[name];
        if (!faction.enemies || faction.enemies.length == 0) { ns.singularity.joinFaction(name); }
    }
    ns.singularity.joinFaction("Shadows of Anarchy");

    if (sfh.can.automate) {
        if (sfh.state.continent === "Europe") {
            ns.singularity.joinFaction("Volhaven");
        } else if (sfh.state.continent === "Asia") {
            ns.singularity.joinFaction("Chongqing");
            ns.singularity.joinFaction("New Tokyo");
            ns.singularity.joinFaction("Ishima");
        } else {
            ns.singularity.joinFaction("Sector-12");
            ns.singularity.joinFaction("Aevum");
        }
    }

    const player = ns.getPlayer();
    sfh.playerUpdate(ns, player);
    sfh.workUpdate(() => player, ns.singularity.isFocused.bind(ns));

    let total_spent = 0;
    for (const type of Object.keys(sfh.money.spent)) {
        total_spent += sfh.money.spent[type as S.MoneyType];
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
    sfh.state.has_trading_base    = player.hasWseAccount;
    sfh.state.has_trading         = player.hasTixApiAccess;
    sfh.state.has_stock_data_base = player.has4SData;
    sfh.state.has_stock_data      = player.has4SDataTixApi;
    sfh.state.has_gang            = ns.gang.inGang();
    sfh.state.has_corp            = player.hasCorporation;
    sfh.state.has_bladeburners    = player.inBladeburner;

    if (sfh.state.has_corp) { sfh.goal.corp = false; }

    for (const aug of ns.singularity.getOwnedAugmentations(false)) { sfh.state.augs.add(aug); }
    for (const aug of ns.singularity.getOwnedAugmentations(true)) {
        if (!sfh.state.augs.has(aug)) { sfh.state.augs.queued.add(aug); }
    }

    for (const name of player.factions) {
        const faction = sfh.state.factions[name];
        if (!faction) { continue; }

        faction.joined = true;
        sfh.goal.orgs.delete(faction);

        if (name === sfh.state.goto?.city && sfh.state.goto.desc === "faction") { sfh.state.goto = null; }
    }

    for (const [name, faction] of Object.entries(sfh.state.factions)) {
        faction.base_rep = ns.singularity.getFactionRep(name);

        if (sfh.state.work?.type === "faction" && sfh.state.work.org?.name === name) {
            faction.rep = faction.base_rep + sfh.state.work.rep ?? 0;
        } else {
            faction.rep = faction.base_rep;
        }

        faction.finished = true;
        for (const aug of data.factions[name].augs) {
            if (!sfh.state.augs.has(aug) && !sfh.state.augs.queued.has(aug)
                && faction.rep < data.augs[aug].rep * sfh.player.bitnode.aug_rep)
            {
                faction.finished = false;
                break;
            }
        }
    }

    for (const [name, company] of Object.entries(sfh.state.companies)) {
        company.joined = name in player.jobs;
        if (company.joined) { sfh.goal.orgs.delete(company); }

        company.finished = sfh.state.factions[company.dual ?? ""]?.joined ?? true;
        company.title    = player.jobs[name] ?? null;
        company.favour   = ns.singularity.getCompanyFavor(name);
        company.base_rep = ns.singularity.getCompanyRep(name);

        if (sfh.state.work?.type === "company" && sfh.state.work.org?.name === name) {
            const backdoor = company.node?.backdoor ?? false;
            company.rep = company.base_rep + (sfh.state.work.rep ?? 0) * (backdoor ? 0.75 : 0.5);
        } else {
            company.rep = company.base_rep;
        }
    }

    if (!sfh.state.has_gang && sfh.player.karma <= -54000 && sfh.state.factions["Slum Snakes"].joined) {
        sfh.state.has_gang = ns.gang.createGang("Slum Snakes");
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
        if (work.org.base_rep >= work.rep) {
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

    if (!sfh.state.has_tor) {
        sfh.goal.type = "program";
        sfh.goal.desc = "TOR";
        sfh.goal.money_next = 200e3;
    } else if (!sfh.state.has_brutessh) {
        sfh.goal.type = "program";
        sfh.goal.desc = "BruteSSH.exe";
        sfh.goal.money_next = 500e3;
    } else if (sfh.goal.orgs.has(sfh.state.factions["Tian Di Hui"])) {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Tian Di Hui";
        sfh.goal.money_next  = data.factions["Tian Di Hui"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "Chongqing" || sfh.state.city === "New Tokyo"
            || sfh.state.city === "Ishima" ? 0 : 200e3);
    } else if (!sfh.state.has_ftpcrack) {
        sfh.goal.type = "program";
        sfh.goal.desc = "FTPCrack.exe";
        sfh.goal.money_next = 1.5e6;
    } else if (!sfh.state.has_relaysmtp) {
        sfh.goal.type = "program";
        sfh.goal.desc = "RelaySMTP.exe";
        sfh.goal.money_next = 5e6;
    } else if (sfh.goal.orgs.has(sfh.state.factions["Sector-12"])) {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Sector-12";
        sfh.goal.money_next  = data.factions["Sector-12"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "Sector-12" ? 0 : 200e3);
    } else if (sfh.goal.orgs.has(sfh.state.factions["Chongqing"])) {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Chongqing";
        sfh.goal.money_next  = data.factions["Chongqing"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "Chongqing" ? 0 : 200e3);
    } else if (sfh.goal.orgs.has(sfh.state.factions["New Tokyo"])) {
        sfh.goal.type = "faction";
        sfh.goal.desc = "New Tokyo";
        sfh.goal.money_next  = data.factions["New Tokyo"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "New Tokyo" ? 0 : 200e3);
    } else if (sfh.goal.orgs.has(sfh.state.factions["Ishima"])) {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Ishima";
        sfh.goal.money_next  = data.factions["Ishima"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "Ishima" ? 0 : 200e3);
    } else if (sfh.goal.orgs.has(sfh.state.factions["Aevum"])) {
        sfh.goal.type = "faction";
        sfh.goal.desc = "Aevum";
        sfh.goal.money_next  = data.factions["Aevum"].reqs.money ?? 0;
        sfh.goal.money_next += (sfh.state.city === "Aevum" ? 0 : 200e3);
    } else if (sfh.goal.orgs.has(sfh.state.factions["Volhaven"])) {
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
            * sfh.player.bitnode.aug_cost * 1.9 ** sfh.state.augs.queued.size;

        if (aug.org.favour > 150 * sfh.player.bitnode.faction_favour) {
            const rep = data.augs[aug.name].rep * sfh.player.bitnode.aug_rep;
            const donation = (rep - aug.org.rep) / sfh.player.faction_rep_mult * 1e6;
            if (donation > 0) { sfh.goal.money_next += donation; }
        }
    } else if (sfh.goal.work.length > 0) {
        const work = sfh.goal.work[0];

        sfh.goal.type = "work";
        sfh.goal.desc = work.org.name;

        if (work.org.favour > 150 * sfh.player.bitnode.faction_favour) {
            const donation = (work.rep - work.org.rep) / sfh.player.faction_rep_mult * 1e6;
            if (donation > 0) { sfh.goal.money_next = donation; }
        }
    }

    if (sfh.goal.money_next > 0 && sfh.goal.money_next <= 50e6) {
        sfh.money.can_train = false;
    } else if (sfh.money.curr >= 50e6) {
        sfh.money.can_train = true;
    } else if (sfh.money.curr < 10e6) {
        sfh.money.can_train = false;
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
        sfh.goal.money_total += data.augs[aug.name].cost * sfh.player.bitnode.aug_cost * 1.9 ** queued_augs++;
    }

    for (const work of sfh.goal.work) {
        if (work.org.favour > 150 * sfh.player.bitnode.faction_favour) {
            const donation = (work.rep - work.org.rep) / sfh.player.faction_rep_mult * 1e6;
            if (donation > 0) { sfh.goal.money_total += donation; }
        }
    }

    sfh.goal.money = (sfh.player.money > sfh.goal.money_next ? sfh.goal.money_total : sfh.goal.money_next);

    sfh.state.money_rate = sfh.hacking.dps + sfh.hnet.dps + sfh.trading.dps + sfh.corp.dividends
        + sfh.sleeves.money_rate + sfh.gang.dps;
    if (sfh.state.money_rate < 0) { sfh.state.money_rate = 0; }
    sfh.state.money_time = 0;

    sfh.state.skill_rate = sfh.hacking.exp + (sfh.state.work?.skill_rate ?? 0) + sfh.sleeves.skill_rate;
    sfh.state.skill_time = 0;
    
    if (sfh.goal.money > sfh.player.money) {
        sfh.state.money_time = (sfh.goal.money - sfh.player.money) / sfh.state.money_rate * 1000;
    }

    if (sfh.goal.skill > sfh.player.skill) {
        const skill_mult = sfh.player.skill_mult * sfh.player.bitnode.skill;
        const goal_exp   = Math.max(Math.exp((Math.floor(sfh.goal.skill) / skill_mult + 200) / 32) - 534.5, 0);
        sfh.state.skill_time = (goal_exp - sfh.player.skill_exp) / sfh.state.skill_rate;
    }

    sfh.install = sfh.can.install && sfh.can.automate && sfh.state.have_goal && sfh.goal.type == null;

    const corp_lerp = Math.min(Math.max(sfh.money.total, sfh.goal.money_total / 2, 0) / 150e9, 1);
    if (sfh.player.bitnode.corp_dividends <= 0.15) { sfh.can.corp = false; }
    if (sfh.can.automate && sfh.can.corp && !sfh.state.has_corp
        && (150e9 - sfh.player.money) / sfh.state.money_rate <= (30 + corp_lerp * 60) * 60)
    {
        ++sfh.goal.corp_ticks;
        sfh.install = false;

        if (sfh.goal.corp_ticks > 10) { sfh.goal.corp = true; sfh.goal.corp_ticks = 0; }
    } else {
        sfh.goal.corp_ticks = Math.max(sfh.goal.corp_ticks - 2, 0);
    }
}
