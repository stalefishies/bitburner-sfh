import { fmtm } from "/sfh/lib.js";

function augIsHacking(name, aug) {
    if (name === "NeuroFlux Governor") { return false; }
    if (name === "Neuroreceptor Management Implant") { return true; }
    if (name === "CashRoot Starter Kit") { return true; }
    if (name === "The Red Pill") { return true; }

    return aug.mults.hacking_mult
        || aug.mults.hacking_exp_mult
        || aug.mults.hacking_chance_mult
        || aug.mults.hacking_speed_mult
        || aug.mults.hacking_money_mult
        || aug.mults.hacking_grow_mult
        || aug.mults.company_rep_mult
        || aug.mults.faction_rep_mult;
}

function augHeader(ns) {
    ns.tprintf("%54s %1s %2s %11s %8s | %4s %4s | %4s %4s %4s %4s | %4s %4s", "NAME", "H", "#F", "COST", "REP", "HACK", "EXP", "TIME", "MONE", "PROB", "GROW", "FREP", "CREP", "CHAR");
}

function augPrint(ns, name, aug) {
    ns.tprintf("%54s %1s %2d %11s %8s | %4.2f %4.2f | %4.2f %4.2f %4.2f %4.2f | %4.2f %4.2f | %4.2f", name,
    (sfh.state.augs.has(name) ? "#" : (sfh.state.augs.queued.has(name) ? "-" : " ")),
    aug.factions.length, fmtm(aug.cost),
    (aug.rep >= 1e6 ? (aug.rep / 1e6).toFixed(3) + "m" : (aug.rep / 1e3).toFixed(3) + "k"),
    aug.mults.hacking_mult ?? 0, aug.mults.hacking_exp_mult ?? 0,
    aug.mults.hacking_speed_mult ?? 0, aug.mults.hacking_money_mult ?? 0, aug.mults.hacking_chance_mult ?? 0, aug.mults.hacking_grow_mult ?? 0,
    aug.mults.faction_rep_mult ?? 0, aug.mults.company_rep_mult ?? 0, aug.mults.charisma_mult ?? 0);
}

/** @param {NS} ns **/
export async function main(ns) {
    let all_augs = false;
    if (ns.args[0] === "all") {
        all_augs = true;
        ns.args.shift();
    }

    const augInclude = (all_augs ? () => true : augIsHacking);

    const faction = ns.args.join(" ");
    if (faction === "list") {
        augHeader(ns);
        for (const name in data.augs) {
            const aug = data.augs[name];
            if (augInclude(name, aug)) { augPrint(ns, name, aug); }
        }
    } else if (faction in data.factions) {
        augHeader(ns);
        for (const name of data.factions[faction].augs) {
            const aug = data.augs[name];
            if (augInclude(name, aug)) {
                augPrint(ns, name, aug);
            }
        }
    } else {
        augHeader(ns);
        for (const faction in data.factions) {
            const reqs = data.factions[faction].reqs;
            //if (faction !== "Daedalus" && "karma" in reqs || ("combat" in reqs && faction !== "Daedalus") || "special" in reqs) { continue; }

            const augs = [];
            for (const name of data.factions[faction].augs) {
                const aug = data.augs[name];
                if (augInclude(name, aug)) { augs.push([name, aug]); }
            }
            augs.sort((a, b) => a[1].cost - b[1].cost);

            if (augs.length > 0) { ns.tprintf("%s:", faction); }
            for (const aug of augs) { augPrint(ns, aug[0], aug[1]); }
        }
    }
}