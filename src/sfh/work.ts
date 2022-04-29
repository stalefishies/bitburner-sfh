import { NS } from "netscript";
import * as S from "sfh";

export async function main(ns: NS) {
    if (!sfh.can.working) { return; }

    if (sfh.state.work?.type === "company" && sfh.state.work.org != null) {
        ns.applyToCompany(sfh.state.work.org.name, "software");
    } else if (sfh.state.work == null) {
        for (const name in sfh.state.companies) { ns.applyToCompany(name, "software"); }
    }

    let new_work = null;
    if (!sfh.state.has_brutessh && sfh.player.skill + sfh.player.int / 2 >= 50) {
        new_work = { type: "program", desc: "BruteSSH.exe" }
    }
    
    if (!new_work) {
        for (const work of sfh.state.goal.work) {
            if (sfh.state.work?.org?.name === work.org.name && work.org.rep >= work.rep) {
                ns.stopAction();
                sfh.state.work = null;
            }
            
            // TODO: set this as current work even if we haven't joined yet
            if (work.org.joined && work.org.base_rep < work.rep) {
                new_work = { type: work.org.faction ? "faction" : "company", org: work.org };
                break;
            }
        }
    }

    if (!new_work) {
        let org = null;
        for (const name in sfh.state.factions) {
            const faction = sfh.state.factions[name];
            if (faction.joined && (org == null || faction.favour < org.favour)) { org = faction; }
        }

        if (org) { new_work = { type: "faction", org }; }
    }

    if (new_work) {
        const focus = sfh.can.automate && !sfh.state.augs.has("Neuroreceptor Management Implant");

        if (new_work.type != sfh.state.work?.type
            || (new_work.desc && new_work.desc != sfh.state.work.desc)
            || (new_work.org  && new_work.org  != sfh.state.work.org)
            || focus != sfh.state.work.focus)
        {
            let desc = new_work.desc ?? "";
            let name = new_work.org?.name ?? "";

            ns.stopAction();
            if (new_work.type === "faction") {
                ns.workForFaction(name, "Hacking", focus);
            } else if (new_work.type === "company") {
                ns.applyToCompany(name, "Software");
                ns.workForCompany(name, focus);
            } else if (new_work.type === "program") {
                ns.createProgram(desc, focus);
            }
        }
    }

    sfh.workUpdate(ns.getPlayer.bind(ns), ns.isFocused.bind(ns));
}
