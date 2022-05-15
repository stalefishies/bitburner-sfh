import { NS } from "netscript";
import * as S from "sfh";

export async function main(ns: NS) {
    for (const name in data.factions) {
        const faction = data.factions[name];
        if (!faction.enemies || faction.enemies.length == 0) { ns.joinFaction(name); }
    }

    if (sfh.can.working) {
        if (sfh.state.continent === "Europe") {
            ns.joinFaction("Volhaven");
        } else if (sfh.state.continent === "Asia") {
            ns.joinFaction("Chongqing");
            ns.joinFaction("New Tokyo");
            ns.joinFaction("Ishima");
        } else {
            ns.joinFaction("Sector-12");
            ns.joinFaction("Aevum");
        }
    }

    const player = ns.getPlayer();
    sfh.playerUpdate(ns, player);
    sfh.workUpdate(() => player, ns.isFocused.bind(ns));

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
    sfh.state.has_corp            = player.hasCorporation;
    sfh.state.has_bladeburners    = player.inBladeburner;

    for (const aug of ns.getOwnedAugmentations(false)) { sfh.state.augs.add(aug); }
    for (const aug of ns.getOwnedAugmentations(true)) {
        if (!sfh.state.augs.has(aug)) { sfh.state.augs.queued.add(aug); }
    }

    for (const faction of player.factions) { sfh.state.factions[faction].joined = true; }
    for (const [name, faction] of Object.entries(sfh.state.factions)) {
        faction.base_rep = ns.getFactionRep(name);

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
        company.joined   = name in player.jobs;
        company.finished = company.dual?.joined ?? true;
        company.title    = player.jobs[name] ?? null;
        company.favour   = ns.getCompanyFavor(name);
        company.base_rep = ns.getCompanyRep(name);

        if (sfh.state.work?.type === "company" && sfh.state.work.org?.name === name) {
            const backdoor = company.node?.backdoor ?? false;
            company.rep = company.base_rep + (sfh.state.work.rep ?? 0) * (backdoor ? 0.75 : 0.5);
        } else {
            company.rep = company.base_rep;
        }

    }

    sfh.state.has_basic_factions = sfh.state.factions["Tian Di Hui"]?.joined ?? false;
    if (sfh.state.continent === "Europe") {
        sfh.state.has_basic_factions &&= sfh.state.factions["Volhaven"] ?.joined ?? false;
    } else if (sfh.state.continent === "Asia") {
        sfh.state.has_basic_factions &&= sfh.state.factions["Chongqing"]?.joined ?? false;
        sfh.state.has_basic_factions &&= sfh.state.factions["New Tokyo"]?.joined ?? false;
        sfh.state.has_basic_factions &&= sfh.state.factions["Ishima"]   ?.joined ?? false;
    } else {
        sfh.state.has_basic_factions &&= sfh.state.factions["Sector-12"]?.joined ?? false;
        sfh.state.has_basic_factions &&= sfh.state.factions["Aevum"]    ?.joined ?? false;
    }

    sfh.state.has_basics = sfh.state.has_tor && sfh.state.has_brutessh && sfh.state.has_ftpcrack
        && sfh.state.has_relaysmtp && sfh.state.has_httpworm && sfh.state.has_sqlinject
        && sfh.state.has_basic_factions;

    sfh.state.location = player.location;
    if (sfh.state.city != player.city) {
        if (sfh.state.city != null) { sfh.can.automate = false; }
        sfh.state.city = player.city as any;
    }

    for (let i = sfh.state.goal.augs.length - 1; i >= 0; --i) {
        const name = sfh.state.goal.augs[i].name;
        if (sfh.state.augs.has(name) || sfh.state.augs.queued.has(name)) {
            sfh.state.goal.augs.splice(i, 1);
        }
    }

    for (let i = sfh.state.goal.work.length - 1; i >= 0; --i) {
        const work = sfh.state.goal.work[i];
        if (work.org.base_rep >= work.rep) {
            sfh.state.goal.work.splice(i, 1);
        }
    }

    sfh.state.goal.money = 0;

    let augs_installed = sfh.state.augs.queued.size;
    for (const aug of sfh.state.goal.augs) {
        sfh.state.goal.money += data.augs[aug.name].cost * sfh.player.bitnode.aug_cost * 1.9 ** augs_installed++;
    }

    const donate_favour = 150 * sfh.player.bitnode.faction_favour;
    for (const work of sfh.state.goal.work) {
        if (work.org.favour >= donate_favour) {
            const donation = (work.rep - work.org.rep) / sfh.player.faction_rep_mult * 1e6;
            if (donation > 0) { sfh.state.goal.money += donation; }
        }
    }

    sfh.install = sfh.can.install && sfh.can.automate
        && sfh.state.goal.have_goal
        && sfh.state.goal.augs.length == 0
        && sfh.state.goal.work.length == 0;
}
