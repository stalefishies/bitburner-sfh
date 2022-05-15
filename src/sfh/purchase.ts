import { NS } from "netscript";
import * as S from "sfh";

export async function main(ns: NS) {
    if (!sfh.can.purchase) { return; }
    const money = (() => ns.getServerMoneyAvailable("home"));

    const canBuy = function(cost: number, min_money: number, allow_frac = 0) {
        return (allow_frac === 0 || (cost <= allow_frac * sfh.state.goal.money) && cost <= money() - min_money)
            || cost <= money() - min_money - sfh.state.goal.money;
    }
    
    sfh.state.has_tor = ns.purchaseTor();
    ns.purchaseProgram("BruteSSH.exe");

    let faction_money = 0;
    let faction_city  = null;

    if (!sfh.state.factions["Tian Di Hui"].joined) {
        faction_money = 1e6;
        faction_city  = "Chongqing";
        if (sfh.can.working && sfh.state.city !== "Chongqing" && canBuy(200e3, faction_money)) {
            if (ns.travelToCity("Chongqing")) { sfh.state.city = "Chongqing"; }
        }
    }

    if (canBuy(1.5e6, faction_money)) { ns.purchaseProgram("FTPCrack.exe");  }
    if (canBuy(5.0e6, faction_money)) { ns.purchaseProgram("relaySMTP.exe"); }

    while (ns.getUpgradeHomeRamCost() < Math.min(5e6, money() - 1e6)) { if (!ns.upgradeHomeRam()) { break; } }

    const city_factions: { [c: string]: (typeof sfh["state"]["city"])[] } = {
        America: ["Sector-12", "Aevum"],
        Europe:  ["Volhaven"],
        Asia:    ["Chongqing", "New Tokyo", "Ishima"]
    }

    for (const city of city_factions[sfh.state.continent]) {
        if (faction_city == null && !sfh.state.factions[city].joined) {
            faction_money = Math.max(faction_money, data.factions[city].reqs.money ?? 0);
            faction_city  = city;
            if (sfh.can.automate && sfh.state.city != city && canBuy(200e3, faction_money)) {
                if (ns.travelToCity(city)) { sfh.state.city = city; }
            }
        }
    }

    if (canBuy( 30e6, faction_money))       { ns.purchaseProgram("HTTPWorm.exe");       }
    if (canBuy(250e6, faction_money))       { ns.purchaseProgram("SQLInject.exe");      }
    if (canBuy(500e3, faction_money, 0.01)) { ns.purchaseProgram("DeepscanV1.exe");     }
    if (canBuy( 25e6, faction_money, 0.01)) { ns.purchaseProgram("DeepscanV2.exe");     }
    if (canBuy(  1e6, faction_money, 0.01)) { ns.purchaseProgram("AutoLink.exe");       }
    if (canBuy(500e3, faction_money, 0.01)) { ns.purchaseProgram("ServerProfiler.exe"); }

    const donate_favour = 150 * sfh.player.bitnode.faction_favour;
    for (const work of sfh.state.goal.work) {
        if (work.org.favour >= donate_favour && work.org.base_rep - work.rep) {
            const donation = (work.rep - work.org.rep) / sfh.player.faction_rep_mult * 1e6;
            if (donation > 0 && donation <= money() - faction_money) {
                ns.donateToFaction(work.org.name, donation);
            }
        }
    }

    while (sfh.state.goal.augs.length > 0) {
        const aug  = sfh.state.goal.augs[0];
        const cost = data.augs[aug.name].cost * sfh.player.bitnode.aug_cost;

        if (cost <= money() - faction_money) {
            const success = ns.purchaseAugmentation(aug.org.name, aug.name);
            if (success) { sfh.state.goal.augs.shift(); } else { break; }
        } else { break; }
    }

    while (canBuy(ns.getUpgradeHomeRamCost(), faction_money, 0.2)) {
        if (!ns.upgradeHomeRam()) { break; }
    }

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

        let new_ram = max_cluster_ram * (max_cluster_ram == min_cluster_ram ? 2 : 1);
        let cost = ns.getPurchasedServerCost(new_ram);

        if (index >= 0 && canBuy(cost, faction_money, 0.1)) {
            while (canBuy(ns.getPurchasedServerCost(new_ram * 2), faction_money, 0.1)) {
                new_ram *= 2;
                cost = ns.getPurchasedServerCost(new_ram);
            }

            ns.deleteServer(cluster_name(index));
            ns.purchaseServer(cluster_name(index), new_ram);
        }
    }

    sfh.player.money = money();
}
