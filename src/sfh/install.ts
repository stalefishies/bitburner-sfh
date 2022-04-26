import { NS } from "netscript";
import * as S from "sfh";

export async function main(ns: NS) {
    ns.stopAction();

    while (ns.upgradeHomeRam());

    //try { (ns.stock as any).purchaseWseAccount(); } catch {}
    //try { (ns.stock as any).purchaseTixApi();     } catch {}
    //try { ns.stock.purchase4SMarketData();        } catch {}
    //try { ns.stock.purchase4SMarketDataTixApi();  } catch {}

    let nfg_faction = null;
    let max_rep = 0;

    for (const name in sfh.state.factions) {
        const faction = sfh.state.factions[name];
        if (faction.joined) {
            for (const aug of data.factions[name].augs) {
                if (!sfh.state.augs.has(aug) && !sfh.state.augs.queued.has(aug)) {
                    ns.purchaseAugmentation(name, aug);
                }
            }

            if (faction.rep > max_rep) {
                nfg_faction = name;
                max_rep = sfh.state.factions[name].rep;
            }
        }
    }

    if (nfg_faction) { while (ns.purchaseAugmentation(nfg_faction, "NeuroFlux Governor")); }
    while (ns.upgradeHomeCores());

    const factions = [];
    for (const faction of Object.values(sfh.state.factions)) {
        const favour = 150 * sfh.player.bitnode.faction_favour;
        if (faction.joined && faction.favour >= favour) { factions.push(faction); }
    }

    if (factions.length > 0) {
        const money = ns.getServerMoneyAvailable("home") / factions.length;
        for (const faction of factions) {
            ns.donateToFaction(faction.name, money);
        } 
    }
    
    ns.installAugmentations("/sfh/main.js");
    ns.softReset("/sfh/main.js");
}
