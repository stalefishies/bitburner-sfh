import { NS } from "netscript";
import * as S from "sfh";

export async function main(ns: NS) {
    if (!sfh.can.purchase) { return; }
    const money = (() => ns.getServerMoneyAvailable("home"));
    
    sfh.state.has_tor = ns.purchaseTor();
    ns.purchaseProgram("BruteSSH.exe");

    let req_money = 0;

    if (!sfh.state.factions["Tian Di Hui"].joined) {
        req_money = 1e6;
        if (sfh.can.automate && sfh.state.city !== "Chongqing" && money() > req_money + 200e3) {
            if (ns.travelToCity("Chongqing")) { sfh.state.city = "Chongqing"; }
        }
    }
    
    if (money() > req_money + 1.5e6) { ns.purchaseProgram("FTPCrack.exe");  }
    if (money() > req_money + 5.0e6) { ns.purchaseProgram("relaySMTP.exe"); }

    while (ns.getUpgradeHomeRamCost() < 5e6 && money() > req_money + ns.getUpgradeHomeRamCost()) {
        ns.upgradeHomeRam();
    }

    const city_factions: { [c: string]: (typeof sfh["state"]["city"])[] } = {
        America: ["Sector-12", "Aevum"],
        Europe:  ["Volhaven"],
        Asia:    ["Chongqing", "New Tokyo", "Ishima"]
    }

    for (const city of city_factions[sfh.state.continent]) {
        if (!sfh.state.factions[city].joined) {
            req_money = Math.max(req_money, data.factions[city].reqs.money ?? 0);
            if (sfh.can.automate && sfh.state.city != city && money() > req_money + 200e3) {
                if (ns.travelToCity(city)) { sfh.state.city = city; }
            }
        }
    }

    if (money() > req_money +  30e6) { ns.purchaseProgram("HTTPWorm.exe");  }
    if (money() > req_money + 250e6) { ns.purchaseProgram("SQLInject.exe"); }

    while (ns.getUpgradeHomeRamCost() < sfh.state.goal.money / 10
           && money() > req_money + ns.getUpgradeHomeRamCost())
    {
        ns.upgradeHomeRam();
    }
    while (money() > req_money + sfh.state.goal.money + ns.getUpgradeHomeRamCost()) { ns.upgradeHomeRam(); }

    const donate_favour = 150 * sfh.player.bitnode.faction_favour;
    for (const work of sfh.state.goal.work) {
        if (work.org.favour >= donate_favour && work.org.base_rep - work.rep) {
            const donation = (work.rep - work.org.rep) / sfh.player.faction_rep_mult * 1e6;
            if (donation > 0 && money() + req_money > donation) { ns.donateToFaction(work.org.name, donation); }
        }
    }

    while (sfh.state.goal.augs.length > 0) {
        const aug  = sfh.state.goal.augs[0];
        const cost = data.augs[aug.name].cost;

        if (money() + req_money > cost) {
            const success = ns.purchaseAugmentation(aug.org.name, aug.name);
            if (success) { sfh.state.goal.augs.shift(); } else { break; }
        }
    }

    sfh.player.money = money();
}
