export async function main(ns: NS) {
    if (sfh.time.reset < 60 * 1000) { return; }

    ns.singularity.stopAction();
    while (ns.singularity.upgradeHomeRam());

    try { ns.stock.purchase4SMarketData();        } catch {}
    try { ns.stock.purchase4SMarketDataTixApi();  } catch {}

    for (const faction of Object.values(sfh.state.factions)) {
        if (!faction.joined) { continue; }

        for (const aug of faction.augs) {
            ns.singularity.purchaseAugmentation(faction.name, aug);
        }

        while (ns.singularity.purchaseAugmentation(faction.name, "NeuroFlux Governor"));
    }

    const factions = [];
    for (const faction of Object.values(sfh.state.factions)) {
        if (ns.singularity.donateToFaction(faction.name, Number.MIN_VALUE)) { factions.push(faction); }
    }

    if (factions.length > 0) {
        const money = ns.getServerMoneyAvailable("home") / factions.length;
        for (const faction of factions) { ns.singularity.donateToFaction(faction.name, money); } 
    }
    
    ns.singularity.softReset("/sfh/main.js");
}
