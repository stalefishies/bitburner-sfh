export async function main(ns: NS) {
    sfh.workUpdate(ns.singularity.getCurrentWork(), ns.singularity.isFocused());
    if (sfh.state.work?.type === "graft") { return; }

    // Stop goal work when we're done
    if (sfh.can.working && sfh.state.work?.goal
        && (sfh.state.work.type === "faction" || sfh.state.work.type === "company"))
    {
        const org = (sfh.state.work.type === "faction"
            ? sfh.state.factions[sfh.state.work.loc]
            : sfh.state.companies[sfh.state.work.loc]);

        if (org) {
            let goal_rep = 0;
            for (const goal of sfh.goal.work) {
                if (org.name === goal.org.name) {
                    goal_rep = goal.rep;
                    break;
                }
            }

            if (org.rep >= goal_rep) {
                ns.singularity.stopAction();
                sfh.state.work = null;
            }
        }
    }
    
    // Update faction work to best current option
    if (sfh.can.automate && sfh.state.work?.type === "faction") {
        const org = sfh.state.factions[sfh.state.work.loc];
        const focus = ns.singularity.isFocused();

        if (org.faction) {
            const desc = data.bestFactionWork(org.name);
            if (desc && desc !== sfh.state.work.desc) {
                ns.singularity.stopAction();
                ns.singularity.workForFaction(org.name, desc, focus);
            }
        }
    }

    // Stop work that costs money if money gets too low
    if (sfh.can.automate && !sfh.money.can_class
        && (sfh.state.work?.type === "university" || sfh.state.work?.type === "gym"))
    { ns.singularity.stopAction(); }

    if (sfh.can.working && !sfh.state.work?.goal) {
        let work: { type: Work["type"], loc?: string, desc?: string, goal?: boolean } | null = null;

        // Create programs
        if (!work) {
            if (!sfh.state.has_brutessh && sfh.player.hac + sfh.player.int / 2 >= 50) {
                work = { type: "program", desc: "BruteSSH.exe", goal: true }
            }
        }

        // Raise stats
        if (!work && sfh.money.can_class) {
            if (sfh.goal.hac > sfh.player.hac || sfh.goal.cha > sfh.player.cha) {
                if (sfh.state.city === "Volhaven") {
                    let desc = "Leadership";
                    if (sfh.goal.hac > sfh.player.hac) { desc = "Algorithms"; }

                    work = { type: "university", desc, goal: true }
                    if (sfh.state.goto?.desc === "work") { sfh.state.goto = null; }
                } else if (!sfh.state.goto) {
                    sfh.state.goto = { city: "Volhaven", type: "work", desc: "university" };
                }
            } else if (sfh.goal.str > sfh.player.str || sfh.goal.def > sfh.player.def
                || sfh.goal.dex > sfh.player.dex || sfh.goal.agi > sfh.player.agi)
            {
                if (sfh.state.city === "Sector-12") {
                    let desc = "Agility";
                    if      (sfh.goal.str > sfh.player.str) { desc = "Strength";  }
                    else if (sfh.goal.def > sfh.player.def) { desc = "Defense";   }
                    else if (sfh.goal.dex > sfh.player.dex) { desc = "Dexterity"; }

                    work = { type: "gym", desc, goal: true }
                    if (sfh.state.goto?.desc === "work") { sfh.state.goto = null; }
                } else if (!sfh.state.goto) {
                    sfh.state.goto = { city: "Sector-12", type: "work", desc: "gym" };
                }
            }
        }

        // Goal work
        if (!work) {
            for (const goal of sfh.goal.work) {
                if (!goal.org.joined) { continue; }

                if (goal.org.faction) {
                    const desc = data.bestFactionWork(goal.org.name);
                    if (desc) {
                        work = { type: "faction", desc, loc: goal.org.name, goal: true };
                        break;
                    }
                } else {
                    work = { type: "company", loc: goal.org.name, goal: true };
                    break;
                }
            }
        }

        // Companies without faction unlocked and largest favour
        if (!work) {
            for (const company of Object.values(sfh.state.companies)) {
                if (company.name == "Fulcrum Technologies" && !sfh.network.fulcrumassets.backdoor) { continue; }
                if (company.title == null || company.dual == null) { continue; }

                if (!company.finished && company.rep < (data.factions[company.dual].reqs.company ?? 0)
                    && (work?.loc == null || company.favour > (sfh.state.companies[work.loc]?.favour ?? 0)))
                {
                    work = { type: "company", loc: company.name };
                }
            }
        }

        // Faction with augs still to purchase and largest favour
        if (!work) {
            for (const faction of Object.values(sfh.state.factions)) {
                if (faction.joined && !faction.finished
                    && (work?.loc == null || faction.favour > (sfh.state.factions[work.loc]?.favour ?? 0)))
                {
                    const desc = data.bestFactionWork(faction.name);
                    if (desc) {
                        work = { type: "faction", loc: faction.name, desc };
                    }
                }
            }
        }

        if (work) {
            if (sfh.state.work == null
                || work.type != sfh.state.work.type
                || (work.loc  && work.loc  != sfh.state.work.loc)
                || (work.desc && work.desc != sfh.state.work.desc))
            {
                const loc   = work.loc  ?? "";
                const desc  = work.desc ?? "";
                const focus = ((work.goal ?? false) || ns.singularity.isFocused())
                    && !sfh.state.augs.has("Neuroreceptor Management Implant");

                ns.singularity.stopAction();
                if (work.type === "faction") {
                    ns.singularity.workForFaction(loc, desc, focus);
                } else if (work.type === "company") {
                    ns.singularity.workForCompany(loc, focus);
                } else if (work.type === "program") {
                    ns.singularity.createProgram(desc, focus);
                } else if (work.type === "university") {
                    ns.singularity.universityCourse("ZB Institute of Technology", desc, focus);
                } else if (work.type === "gym") {
                    ns.singularity.gymWorkout("Powerhouse Gym", desc, focus);
                }
            }
        } else { ns.singularity.stopAction(); }
    }

    const final_work = ns.singularity.getCurrentWork();
    sfh.workUpdate(final_work, ns.singularity.isFocused());
    sfh.gainUpdate("work", data.calcWork(final_work, sfh.player, ns.singularity.isFocused()));

    if (sfh.state.goto?.type === "work" && sfh.state.city === sfh.state.goto.city) { sfh.state.goto = null; }
}
