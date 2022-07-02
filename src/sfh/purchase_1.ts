import { NS } from "netscript";
import * as S from "sfh";

export async function main(ns: NS) {
    if (!sfh.can.purchase) { return; }
    const money = (() => ns.getServerMoneyAvailable("home"));

    if (sfh.goal.type !== null && money() > sfh.goal.money_next) {
        const cities = new Set(["Sector-12", "Aevum" , "Volhaven" , "Chongqing", "New Tokyo", "Ishima"]);
        const init_money = money();

        if (sfh.goal.type === "program" && sfh.goal.desc === "TOR") {
            ns.singularity.purchaseTor();
        } else if (sfh.goal.type === "program") {
            ns.singularity.purchaseProgram(sfh.goal.desc);
        } else if (sfh.goal.type === "faction" && sfh.goal.desc === "Tian Di Hui" && !sfh.state.goto) {
            if (sfh.state.city === "Chongqing" || sfh.state.city === "New Tokyo" || sfh.state.city === "Ishima") {
                sfh.state.goto = { city: sfh.state.city, desc: "faction" };
            } else if (money() > (data.factions["Tian Di Hui"].reqs.money ?? 0) + 200e3) {
                sfh.state.goto = { city: "Chongqing", desc: "faction" };
            }
        } else if (sfh.goal.type === "faction" && (sfh.goal.desc === "Sector-12" || sfh.goal.desc === "Aevum"
            || sfh.goal.desc === "Volhaven" || sfh.goal.desc === "Chongqing"
            || sfh.goal.desc === "New Tokyo" || sfh.goal.desc === "Ishima") && !sfh.state.goto)
        {
            if (sfh.state.city === sfh.goal.desc) {
                sfh.state.goto = { city: sfh.goal.desc, desc: "faction" };
            } else if (money() > (data.factions[sfh.goal.desc].reqs.money ?? 0) + 200e3) {
                sfh.state.goto = { city: sfh.goal.desc, desc: "faction" };
            }
        } else if (sfh.goal.type === "augmentation" && sfh.goal.augs.length > 0) {
            const aug = sfh.goal.augs[0];

            if (aug.org.favour > 150 * sfh.player.bitnode.faction_favour) {
                const rep = data.augs[aug.name].rep * sfh.player.bitnode.aug_rep;
                const donation = (rep - aug.org.rep) / sfh.player.faction_rep_mult * 1e6;
                if (donation > 0) { ns.singularity.donateToFaction(aug.org.name, donation); }
            }

            ns.singularity.purchaseAugmentation(aug.org.name, aug.name);
        } else if (sfh.goal.type === "work" && sfh.goal.work.length > 0) {
            const work = sfh.goal.work[0];

            if (work.org.favour > 150 * sfh.player.bitnode.faction_favour) {
                const donation = (work.rep - work.org.rep) / sfh.player.faction_rep_mult * 1e6;
                if (donation > 0) { ns.singularity.donateToFaction(work.org.name, donation); }
            }
        }

        sfh.money.curr = money();
        if (sfh.money.curr < init_money) { sfh.money.spent.goal += init_money - sfh.money.curr; }
    }

    sfh.purchase("goal", money, 200e3, function() {
        if (sfh.state.goto && sfh.state.goto.city !== sfh.state.city) {
            ns.singularity.travelToCity(sfh.state.goto.city);
        }
    });

    for (;;) {
        let home_ram_frac = undefined;
        if (sfh.goal.type === "corp" && ns.getServerMaxRam("home") < 2048) {
           home_ram_frac = Number.POSITIVE_INFINITY;
        }

        if (!sfh.purchase("home", money, () => ns.singularity.getUpgradeHomeRamCost(),
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
