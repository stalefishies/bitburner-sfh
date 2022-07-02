import { NS } from "netscript";
import * as S from "sfh";

function optimiseTasks(ns: NS, tasks: string[], info: ReturnType<NS["gang"]["getGangInformation"]>) {
    const formula = sfh.gang.state === "respect" ? "respectGain" : "moneyGain";

    let rate = 0;
    let list: [number, string, number, number, number][]
        = Array.from({ length: sfh.gang.size }, () => [0, "Train Combat", 0, 0, 0]);

    for (const name of ns.gang.getTaskNames()) {
        const this_list: typeof list = [];//Array.from({ length: sfh.gang.size }, () => [0, "", 0, 0, 0]);

        const task = ns.gang.getTaskStats(name);
        const vigj = ns.gang.getTaskStats("Vigilante Justice");

        for (let i = 0; i < sfh.gang.size; ++i) {
            if (sfh.gang.training[i][0]) {
                const member = ns.gang.getMemberInformation(i.toFixed(0));
                this_list.push([i, "Vigilante Justice",
                    ns.formulas.gang.wantedLevelGain(info, member, task),
                    ns.formulas.gang.wantedLevelGain(info, member, vigj),
                    ns.formulas.gang[formula](info, member, task)]);
            }
        }

        this_list.sort((p, q) => q[4] - p[4]);
        let wanted    = this_list.reduce((acc, p) => acc + p[3], 0);
        let this_rate = 0;

        for (let i = 0; i < this_list.length; ++i) {
            if (wanted + this_list[i][2] - this_list[i][3] > 0) { break; }

            this_list[i][1] = task.name;
            wanted    += this_list[i][2] - this_list[i][3];
            this_rate += this_list[i][4];
        }

        if (this_rate > rate) {
            list = this_list;
            rate = this_rate;

            for (let i = this_list.length - 1; i >= 0; --i) {
                if (wanted - list[i][3] > 0) { break; }

                wanted -= list[i][3];
                list[i][1] = "Train Combat";
            }
        }
    }

    for (let i = 0; i < list.length; ++i) { tasks[list[i][0]] = list[i][1]; }
    return 5 * rate;
}

async function sfhMain(ns: NS) {
    if (!sfh.state.has_gang || !sfh.state.has_formulas) { return; }
    while (ns.gang.recruitMember(ns.gang.getMemberNames().length.toFixed(0)));

    const info = ns.gang.getGangInformation();
    sfh.gang.size = ns.gang.getMemberNames().length;
    sfh.gang.name = info.faction;
    info.wantedLevel = 0; // ignore wanted penalty for calculating times

    const train_ticks = 30;
    const grind_time  = (sfh.gang.size === 12 ? 120 : 4 * (sfh.gang.size - 2)) * 60 * 1000;
    const tasks = Array(sfh.gang.size).fill("Train Combat");
    while (sfh.gang.training.length < sfh.gang.size) { sfh.gang.training.push([false, 0, 0, 0]); }

    if (sfh.gang.state !== "respect" && sfh.gang.state !== "power") {
        for (let i = 0; i < sfh.gang.size; ++i) {
            const name   = i.toFixed(0);
            const member = ns.gang.getMemberInformation(name) as any;
            const ascend = ns.gang.getAscensionResult(name)   as any;
            if (ascend == null) { continue; }

            let criterion = 0;
            for (const stat of ["hack", "str", "def", "dex", "agi", "cha"]) {
                criterion += member[stat + "_asc_mult"] * (ascend[stat] - 1.1);
            }

            if (criterion >= 3 && ns.gang.ascendMember(name)) { sfh.gang.training[i] = [false, 0, 0, 0]; }
        }
    }
    
    if (sfh.gang.state != "train" && sfh.gang.time > grind_time) { sfh.gang.train = train_ticks; }

    let max_power = 0;
    const other = ns.gang.getOtherGangInformation();
    for (const name of Object.keys(other) as (keyof typeof other)[]) {
        if (name == info.faction || other[name].territory === 0) { continue; }
        max_power = Math.max(max_power, other[name].power);
    }

    sfh.gang.clash = info.power / (info.power + max_power);
    const power_lo = 2 * max_power;
    const power_hi = 4 * max_power;
    const grind_power = power_hi > 0 && info.power < power_hi;

    const train_combat = (info.isHacking ?   0 : 120);
    const train_hack   = (info.isHacking ? 150 :  30);
    const train_cha    = 0;
    for (let i = 0; i < sfh.gang.size; ++i) {
        if (sfh.gang.training[i][1] < train_combat) {
            tasks[i] = "Train Combat";
        } else if (sfh.gang.training[i][2] < train_hack) {
            tasks[i] = "Train Hacking";
        } else if (sfh.gang.training[i][3] < train_cha) {
            tasks[i] = "Train Charisma";
        } else {
            sfh.gang.training[i][0] = true;
        }
    }

    if (sfh.gang.train > 0) {
        sfh.gang.state = "train";

        let combat = (info.isHacking ? sfh.gang.size === 12 && grind_power : sfh.gang.train / train_ticks > 0.2);
        tasks.fill(combat ? "Train Combat" : "Train Hacking");

        --sfh.gang.train;
    } else {
        let respect = true;
        if (sfh.gang.size === 12) {
            respect = false;

            if (info.territoryClashChance === 0 && grind_power) {
                sfh.gang.state = "power";
                ns.gang.setTerritoryWarfare(false);

                let rate = 0;
                for (let i = 0; i < sfh.gang.size; ++i) {
                    if (sfh.gang.training[i][0]) { tasks[i] = "Territory Warfare"; }

                    const member = ns.gang.getMemberInformation(i.toFixed(0)) as any;
                    for (const stat of ["hack", "str", "def", "dex", "agi", "cha"]) { rate += member[stat]; }
                }
                rate *= 0.015 / 95 * Math.max(0.002, info.territory) / 20;

                sfh.gang.time = Math.max(1000 * (power_hi - info.power) / rate, 0);
            } else if (!sfh.state.has_corp || sfh.state.factions[info.faction].rep >= sfh.gang.rep) {
                sfh.gang.state = "money";
                ns.gang.setTerritoryWarfare(info.power > power_lo);
                const rate = optimiseTasks(ns, tasks, info);

                sfh.gang.time = 200 * sfh.money.curr / rate;
            } else {
                respect = true;
            }
        }

        if (respect) {
            sfh.gang.state = "respect";
            const rate = optimiseTasks(ns, tasks, info);

            if (sfh.gang.size < 12) {
                sfh.gang.time = 1000 * Math.max(Math.pow(5, sfh.gang.size - 2) - info.respect, 0) / rate;
            } else {
                // time to get to max rep
                sfh.gang.time = 60;
            }
        }
    }

    for (let i = 0; i < sfh.gang.size; ++i) {
        const name = i.toFixed(0);
        const curr = ns.gang.getMemberInformation(name).task;
        if (tasks[i] !== curr) { ns.gang.setMemberTask(name, tasks[i]); }

        if (tasks[i] === "Train Combat") {
            ++sfh.gang.training[i][1];
        } else if (tasks[i] === "Train Hacking") {
            ++sfh.gang.training[i][2];
        } else if (tasks[i] === "Train Charisma") {
            ++sfh.gang.training[i][3];
        }
    }

    sfh.gang.dps = 5 * info.moneyGainRate;
    if (!Number.isFinite(sfh.gang.time)) { sfh.gang.time = Number.POSITIVE_INFINITY; }

    if (sfh.gang.rep <= 0) {
        sfh.gang.rep = 0;
        for (const name of ns.singularity.getAugmentationsFromFaction(sfh.gang.name)) {
            sfh.gang.rep = Math.max(sfh.gang.rep, data.augs[name].rep);
        }
        sfh.gang.rep *= sfh.player.bitnode.aug_rep;
    }
}

export async function main(ns: NS) {
    if (ns.args.length == 1 && ns.args[0] == "sfh") { await sfhMain(ns); return; }
}
