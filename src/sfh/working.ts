import { NS } from "netscript";
import * as S from "sfh";

function canWork(org: S.Org) {
    if (org.faction) {
        return org.joined;
    } else {
        const company = data.companies[org.name];
        for (const jobs of Object.values(company.fields)) {
            const job = jobs[0];

            if (sfh.player.skill  >= job.requiredHacking
                && sfh.player.str >= job.requiredStrength
                && sfh.player.def >= job.requiredDefense
                && sfh.player.dex >= job.requiredDexterity
                && sfh.player.agi >= job.requiredAgility
                && sfh.player.cha >= job.requiredCharisma
                && org.rep        >= job.requiredReputation)
            {
                return true;
            }
        }
    }

    return false;
}

function companyCanWorkJob(org: S.Org, job: any) {
    return sfh.player.skill >= job.requiredHacking
        && sfh.player.str   >= job.requiredStrength
        && sfh.player.def   >= job.requiredDefense
        && sfh.player.dex   >= job.requiredDexterity
        && sfh.player.agi   >= job.requiredAgility
        && sfh.player.cha   >= job.requiredCharisma
        && org.rep          >= job.requiredReputation;
}

function bestWork(org: S.Org) {
    let ret = null;
    let rep = 0;

    if (org.faction && org.joined) {
        for (const [name, work] of Object.entries(data.factions[org.name].work)) {
            const this_rep =
                work.rep_skill_mult * sfh.player.skill
                + work.rep_str_mult * sfh.player.str
                + work.rep_def_mult * sfh.player.def
                + work.rep_dex_mult * sfh.player.dex
                + work.rep_agi_mult * sfh.player.agi
                + work.rep_cha_mult * sfh.player.cha
                + work.rep_int_mult * sfh.player.int;
            
            if (this_rep > rep) { ret = name; rep = this_rep; }
        }
    } else if (!org.faction) {
        for (const [name, jobs] of Object.entries(data.companies[org.name].fields)) {
            let job = null;
            for (let i = 0; i < jobs.length; ++i) {
                if (!companyCanWorkJob(org, jobs[i])) { break; }
                job = jobs[i];
            }

            if (job != null) {
                const this_rep =
                    job.hackingEffectiveness     * sfh.player.skill
                    + job.strengthEffectiveness  * sfh.player.str
                    + job.defenseEffectiveness   * sfh.player.def
                    + job.dexterityEffectiveness * sfh.player.dex
                    + job.agilityEffectiveness   * sfh.player.agi
                    + job.charismaEffectiveness  * sfh.player.cha;

                if (this_rep > rep) { ret = name; rep = this_rep; }
            }
        }
    }

    return ret;
}

export async function main(ns: NS) {
    if (!sfh.can.working) { return; }
    let work = null;

    if (!sfh.state.has_brutessh && sfh.player.skill + sfh.player.int / 2 >= 50) {
        work = { type: "program", org: null, desc: "BruteSSH.exe", goal: true }
    }
    
    if (!work) {
        for (const goal of sfh.state.goal.work) {
            if (sfh.state.work?.org?.name === goal.org.name
                && goal.org.rep >= goal.rep && goal.org.base_rep < goal.rep)
            {
                ns.stopAction();
                goal.org.base_rep = goal.org.rep;
                sfh.state.work = null;
            }

            if (goal.org.base_rep >= goal.rep) { continue; }

            let desc = bestWork(goal.org);
            if (desc != null) {
                const type = (goal.org.faction ? "faction" : "company");
                work = { type, desc, org: goal.org, goal: true };
                break;
            }
        }
    }

    if (!work) {
        let org  = null;
        let desc = null;

        for (const faction of Object.values(sfh.state.factions)) {
            if (faction.joined && !faction.finished && (org == null || faction.favour < org.favour)) {
                let this_desc = bestWork(faction);
                if (this_desc != null) {
                    org  = faction;
                    desc = this_desc;
                }
            }
        }

        if (org) { work = { type: "faction", desc, org }; }
    }

    if (!work) {
        let org  = null;
        let desc = null;

        for (const company of Object.values(sfh.state.companies)) {
            if (!company.finished) {
                let this_desc = bestWork(company);
                if (this_desc != null) {
                    org  = company;
                    desc = this_desc;
                }
            }
        }

        if (org) { work = { type: "company", desc, org }; }
    }

    if (work) {
        const focus = (work.goal ?? false) && sfh.can.automate
            && !sfh.state.augs.has("Neuroreceptor Management Implant");

        if (work.type != sfh.state.work?.type
            || (work.desc != sfh.state.work.desc)
            || (work.org  != sfh.state.work.org)
            || focus != sfh.state.work.focus)
        {
            const name = work.org?.name ?? "";
            const desc = work.desc ?? "";

            ns.stopAction();
            if (work.type === "faction") {
                ns.workForFaction(name, desc, focus);
            } else if (work.type === "company") {
                while (ns.applyToCompany(name, desc));
                ns.workForCompany(name, focus);
            } else if (work.type === "program") {
                ns.createProgram(desc, focus);
            }
        }
    }

    sfh.workUpdate(ns.getPlayer.bind(ns), ns.isFocused.bind(ns));
}
