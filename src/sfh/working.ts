import { NS } from "netscript";
import * as S from "sfh";

function bestFactionWork(org: S.Org): string | null {
    if (!org.faction || !org.joined || org.name === sfh.gang.name) { return null; }

    let desc  = null;
    let value = [0, 0, 0];

    for (const [name, work] of Object.entries(data.factions[org.name].work)) {
        const rep =
            work.skill_mult * sfh.player.skill
            + work.str_mult * sfh.player.str
            + work.def_mult * sfh.player.def
            + work.dex_mult * sfh.player.dex
            + work.agi_mult * sfh.player.agi
            + work.cha_mult * sfh.player.cha
            + work.int_mult * sfh.player.int;
        const exp = 10 * work.skill_rate + work.str_rate + work.def_rate
            + work.dex_rate + work.agi_rate + work.cha_rate;
        
        if (rep > value[0] || rep == value[0] && exp > value[1]) {
            desc  = name;
            value = [rep, exp, 0];
        }
    }

    return desc;
}

function bestCompanyWork(org: S.Org): [string, string] | null {
    if (org.faction) { return null; }
    const offset = data.companies[org.name].stat_offset;

    let field = "";
    let job   = "";
    let value = [0, 0, 0];

    for (const [this_field, jobs] of Object.entries(data.companies[org.name].fields)) {
        let this_job = null;
        for (let i = 0; i < jobs.length; ++i) {
            if (   (jobs[i].skill_req > 0 && sfh.player.skill < jobs[i].skill_req + offset)
                || (jobs[i].str_req   > 0 && sfh.player.str   < jobs[i].str_req   + offset)
                || (jobs[i].def_req   > 0 && sfh.player.def   < jobs[i].def_req   + offset)
                || (jobs[i].dex_req   > 0 && sfh.player.dex   < jobs[i].dex_req   + offset)
                || (jobs[i].agi_req   > 0 && sfh.player.agi   < jobs[i].agi_req   + offset)
                || (jobs[i].cha_req   > 0 && sfh.player.cha   < jobs[i].cha_req   + offset)
                || org.rep < jobs[i].rep_req) { break; }
            this_job = jobs[i];
        }

        if (this_job != null) {
            const rep =
                this_job.skill_mult * sfh.player.skill
                + this_job.str_mult * sfh.player.str
                + this_job.def_mult * sfh.player.def
                + this_job.dex_mult * sfh.player.dex
                + this_job.agi_mult * sfh.player.agi
                + this_job.cha_mult * sfh.player.cha;
            const exp = (10 * this_job.skill_rate + this_job.str_rate + this_job.def_rate   
                + this_job.dex_rate + this_job.agi_rate + this_job.cha_rate)
                * data.companies[org.name].exp_mult;
            const pay = this_job.salary * data.companies[org.name].money_mult;

            if (rep > value[0] || rep == value[0] &&
                (exp > value[1] || exp == value[1] && pay > value[2]))
            {
                job   = this_job.name;
                field = this_field;
                value = [rep, exp, pay];
            }
        }
    }

    return field !== "" ? [field, job] : null;
}

export async function main(ns: NS) {
    sfh.workUpdate(ns.getPlayer.bind(ns), ns.singularity.isFocused.bind(ns));

    // Stop goal work when we're done
    if (sfh.can.working && sfh.state.work?.goal && sfh.state.work.org) {
        const org = sfh.state.work.org;

        let goal_rep = 0;
        for (const goal of sfh.goal.work) {
            if (org.name === goal.org.name) {
                goal_rep = goal.rep;
                break;
            }
        }

        if (org.rep >= goal_rep) {
            ns.singularity.stopAction();
            org.base_rep = org.rep;
            sfh.state.work = null;
        }
    }
    
    // Update work to best current option
    if (sfh.can.automate && sfh.state.work?.org) {
        const org   = sfh.state.work.org;
        const focus = ns.singularity.isFocused();

        if (org.faction) {
            const desc = bestFactionWork(org);
            if (desc && desc !== sfh.state.work.desc) {
                ns.singularity.stopAction();
                ns.singularity.workForFaction(org.name, desc, focus);
            }
        } else {
            const best = bestCompanyWork(org);
            if (best && best[1] !== sfh.state.work.desc) {
                ns.singularity.stopAction();
                while (ns.singularity.applyToCompany(org.name, best[0]));
                ns.singularity.workForCompany(org.name, focus);
            }
        }
    }

    // Stop work that costs money if money gets too low
    if (sfh.can.automate && !sfh.money.can_train
        && (sfh.state.work?.type === "university" || sfh.state.work?.type === "gym"))
    { ns.singularity.stopAction(); }

    if (sfh.can.working && !sfh.state.work?.goal) {
        let work = null;

        // Create programs
        if (!work) {
            if (!sfh.state.has_brutessh && sfh.player.skill + sfh.player.int / 2 >= 50) {
                work = { type: "program", org: null, desc: "BruteSSH.exe", goal: true }
            }
        }

        // Raise stats
        if (!work && sfh.money.can_train) {
            if (sfh.goal.skill > sfh.player.skill || sfh.goal.cha > sfh.player.cha) {
                if (sfh.state.city === "Volhaven") {
                    let desc = "Leadership";
                    if (sfh.goal.skill > sfh.player.skill) { desc = "Algorithms"; }

                    work = { type: "university", org: null, desc, goal: true }
                    if (sfh.state.goto?.desc === "work") { sfh.state.goto = null; }
                } else if (!sfh.state.goto) {
                    sfh.state.goto = { city: "Volhaven", desc: "work" };
                }
            } else if (sfh.goal.combat > sfh.player.str || sfh.goal.combat > sfh.player.def
                || sfh.goal.combat > sfh.player.dex || sfh.goal.combat > sfh.player.agi)
            {
                if (sfh.state.city === "Sector-12") {
                    let desc = "Agility";
                    if      (sfh.goal.combat > sfh.player.str) { desc = "Strength";  }
                    else if (sfh.goal.combat > sfh.player.def) { desc = "Defense";   }
                    else if (sfh.goal.combat > sfh.player.dex) { desc = "Dexterity"; }

                    work = { type: "gym", org: null, desc, goal: true }
                    if (sfh.state.goto?.desc === "work") { sfh.state.goto = null; }
                } else if (!sfh.state.goto) {
                    sfh.state.goto = { city: "Sector-12", desc: "work" };
                }
            }
        }

        // Goal work
        if (!work) {
            for (const goal of sfh.goal.work) {
                if (sfh.state.work?.org?.name === goal.org.name
                    && goal.org.rep >= goal.rep && goal.org.base_rep < goal.rep)
                {
                    ns.singularity.stopAction();
                    goal.org.base_rep = goal.org.rep;
                    sfh.state.work = null;
                }

                if (goal.org.base_rep >= goal.rep) { continue; }

                if (goal.org.faction) {
                    let desc = bestFactionWork(goal.org);
                    if (desc) {
                        work = { type: "faction", desc, org: goal.org, goal: true };
                        break;
                    }
                } else {
                    let best = bestCompanyWork(goal.org);
                    if (best) {
                        work = { type: "company", desc: best[0], job: best[1], org: goal.org, goal: true };
                        break;
                    }
                }
            }
        }

        // Companies without faction unlocked and smallest favour
        if (!work) {
            let org   = null;
            let field = null;
            let job   = null;

            for (const company of Object.values(sfh.state.companies)) {
                if (company.name == "Fulcrum Technologies" && !sfh.network.fulcrumassets.backdoor) { continue; }

                if (!company.finished && (org == null || company.favour < org.favour)) {
                    let best = bestCompanyWork(company);
                    if (best) {
                        org   = company;
                        field = best[0];
                        job   = best[1];
                    }
                }
            }

            if (org) { work = { type: "company", desc: field, job, org }; }
        }

        // Faction with augs still to purchase and smallest favour
        if (!work) {
            let org  = null;
            let desc = null;

            for (const faction of Object.values(sfh.state.factions)) {
                if (faction.joined && !faction.finished && (org == null || faction.favour < org.favour)) {
                    let this_desc = bestFactionWork(faction);
                    if (this_desc) {
                        org  = faction;
                        desc = this_desc;
                    }
                }
            }

            if (org) { work = { type: "faction", desc, org }; }
        }

        if (work) {
            const cur_desc = work.type === "company" ? work.job : work.desc;
            if (work.type != sfh.state.work?.type
                || (work.org != sfh.state.work.org)
                || (cur_desc != sfh.state.work.desc))
            {
                const name  = work.org?.name ?? "";
                const desc  = work.desc ?? "";
                const focus = ((work.goal ?? false) || ns.singularity.isFocused())
                    && !sfh.state.augs.has("Neuroreceptor Management Implant");

                ns.singularity.stopAction();
                if (work.type === "faction") {
                    ns.singularity.workForFaction(name, desc, focus);
                } else if (work.type === "company") {
                    while (ns.singularity.applyToCompany(name, desc));
                    ns.singularity.workForCompany(name, focus);
                } else if (work.type === "program") {
                    ns.singularity.createProgram(desc, focus);
                } else if (work.type === "university") {
                    ns.singularity.universityCourse("ZB Institute of Technology", desc, focus);
                } else if (work.type === "gym") {
                    ns.singularity.gymWorkout("Powerhouse Gym", desc, focus);
                }
            }
        }
    }

    if (sfh.state.goto?.desc === "work" && sfh.state.city === sfh.state.goto.city) { sfh.state.goto = null; }
    sfh.workUpdate(ns.getPlayer.bind(ns), ns.singularity.isFocused.bind(ns));
}
