const equipment = {
    "Weapon": ["Baseball Bat", "Katana", "Glock 18C", "P90C", "Steyr AUG",
        "AK-47", "M15A10 Assault Rifle", "AWM Sniper Rifle"],
    "Armor": ["Bulletproof Vest", "Full Body Armor", "Liquid Body Armor", "Graphene Plating Armor"],
    "Vehicle": ["Ford Flex V20", "ATX1070 Superbike", "Mercedes-Benz S9001", "White Ferrari"],
    "Rootkit": ["NUKE Rootkit", "Soulstealer Rootkit", "Hmap Node", "Demon Rootkit", "Jack the Ripper"],
    "Augmentation": ["BitWire", "DataJack", "Bionic Arms", "Bionic Legs",
        "Neuralstimulator", "Nanofiber Weave", "Bionic Spine", "Synfibril Muscle",
        "BrachiBlades", "Synthetic Heart", "Graphene Bone Lacings"]
};

const augs = ["Bionic Arms", "Bionic Legs", "Bionic Spine", "BrachiBlades",
    "Nanofiber Weave", "Synthetic Heart", "Synfibril Muscle", "BitWire",
    "Neuralstimulator", "DataJack", "Graphene Bone Lacings"];

const train_time = 1000 * 60;

function optimiseTasks(ns: NS, info: ReturnType<NS["gang"]["getGangInformation"]>,
    func: NS["formulas"]["gang"]["respectGain"])
{
    let rate = 0;
    let list: [number, string, number, number, number][]
        = Array.from({ length: sfh.gang.size }, (_, i) => [0, sfh.gang.members[i].task, 0, 0, 0]);

    for (const name of ns.gang.getTaskNames()) {
        const this_list: typeof list = [];

        const task = ns.gang.getTaskStats(name);
        const vigj = ns.gang.getTaskStats("Vigilante Justice");

        for (let i = 0; i < sfh.gang.size; ++i) {
            if (sfh.gang.members[i].ready) {
                const member = ns.gang.getMemberInformation(i.toFixed(0));
                this_list.push([i, "Vigilante Justice",
                    ns.formulas.gang.wantedLevelGain(info, member, task),
                    ns.formulas.gang.wantedLevelGain(info, member, vigj),
                    func(info, member, task)]);
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
                list[i][1] = (info.isHacking ? "Train Hacking" : "Train Combat");
            }
        }
    }

    const tasks: (string | undefined)[] = [];
    for (let i = 0; i < list.length; ++i) { tasks[list[i][0]] = list[i][1]; }
    return { rate: 5 * rate, tasks };
}

async function sfhMain(ns: NS) {
    if (!sfh.state.has_gang || !sfh.state.has_formulas) { return; }
    while (ns.gang.recruitMember(ns.gang.getMemberNames().length.toFixed(0))) { sfh.gang.prev_times.rspct = 0; }

    const info    = ns.gang.getGangInformation();
    sfh.gang.size = ns.gang.getMemberNames().length;
    sfh.gang.name = info.faction;
    const faction = sfh.state.factions[sfh.gang.name];
    info.wantedLevel = 0; // ignore wanted penalty for calculating times

    if (sfh.gang.can_ascend) {
        for (let i = 0; i < sfh.gang.size; ++i) {
            const name   = i.toFixed(0);
            const member = ns.gang.getMemberInformation(name) as any;
            const ascend = ns.gang.getAscensionResult(name)   as any;
            if (ascend == null) { continue; }

            let criterion = 0;
            for (const stat of ["hack", "str", "def", "dex", "agi", "cha"]) {
                criterion += member[stat + "_asc_mult"] * (ascend[stat] - 1.1);
            }

            if (criterion >= 3 && ns.gang.ascendMember(name)) {
                sfh.gang.members[i].ready    = false;
                sfh.gang.members[i].task     = "Train Combat";
                sfh.gang.members[i].com_time = 0;
                sfh.gang.members[i].hac_time = 0;
                sfh.gang.members[i].cha_time = 0;
            }
        }
    }

    const min_com_time = (info.isHacking ?   0 : 120) * 1000;
    const min_hac_time = (info.isHacking ? 150 :  30) * 1000;
    const min_cha_time = 0;
    for (let i = 0; i < sfh.gang.size; ++i) {
        sfh.gang.members[i].ready = false;
        if (sfh.gang.members[i].com_time < min_com_time) {
            sfh.gang.members[i].task = "Train Combat";
        } else if (sfh.gang.members[i].hac_time < min_hac_time) {
            sfh.gang.members[i].task = "Train Hacking";
        } else if (sfh.gang.members[i].cha_time < min_cha_time) {
            sfh.gang.members[i].task = "Train Charisma";
        } else {
            sfh.gang.members[i].ready = true;
        }
    }

    sfh.gang.aug_rep = 0;
    for (const aug_name of faction.augs) {
        sfh.gang.aug_rep = Math.max(sfh.gang.aug_rep, data.augs[aug_name].rep);
    }
    sfh.gang.aug_rep *= sfh.player.mults.aug_rep;
    
    let max_power = 0;
    const other_gangs = ns.gang.getOtherGangInformation();
    for (const name of Object.keys(other_gangs) as (keyof typeof other_gangs)[]) {
        if (name == info.faction || other_gangs[name].territory === 0) { continue; }
        max_power = Math.max(max_power, other_gangs[name].power);
    }
    sfh.gang.clash = info.power / (info.power + max_power);

    if (sfh.gang.train_time <= sfh.time.now) {
        const rspct = { time: Number.POSITIVE_INFINITY, rate: 0, tasks: ([] as (string | undefined)[]) };
        const power = { time: Number.POSITIVE_INFINITY, rate: 0, tasks: ([] as (string | undefined)[]) };
        const money = { time: Number.POSITIVE_INFINITY, rate: 0, tasks: ([] as (string | undefined)[]) };

        const req_rspct = Math.max((sfh.gang.size < 12 ? Math.pow(5, sfh.gang.size - 2) - info.respect
            : (sfh.gang.aug_rep - faction.rep) / sfh.player.mults.faction_rep / (1 + faction.favour / 100) * 75), 0);
        if (req_rspct > 0) {
            const opt   = optimiseTasks(ns, info, ns.formulas.gang.respectGain);
            rspct.time  = 1000 * req_rspct / opt.rate;
            rspct.rate  = opt.rate;
            rspct.tasks = opt.tasks;
        }

        const req_power = 3 * max_power;
        if (info.territoryClashChance === 0 && max_power > 0 && info.power < req_power) {
            for (let i = 0; i < sfh.gang.size; ++i) {
                if (sfh.gang.members[i].ready) { power.tasks[i] = "Territory Warfare"; }

                const member = ns.gang.getMemberInformation(i.toFixed(0)) as any;
                for (const stat of ["hack", "str", "def", "dex", "agi", "cha"]) { power.rate += member[stat]; }
            }
            power.rate *= 0.015 / 95 * Math.max(0.002, info.territory) / 20;
            power.time  = 1000 * (req_power - info.power) / power.rate;
        }

        {
            const opt   = optimiseTasks(ns, info, ns.formulas.gang.moneyGain);
            money.time  = 1000 * ns.getServerMoneyAvailable("home") / opt.rate;
            money.rate  = opt.rate;
            money.tasks = opt.tasks;
        }

        const prev = sfh.gang.prev_times;

        let train = false;
        if (!Number.isFinite(prev.time) || prev.time <= 0) {
            train = true;
        } else {
            let last_time = 0;
            let this_time = 0;
            let tasks = ([] as (string | undefined)[]);

            if (rspct.time < power.time && rspct.time < money.time && rspct.time <= 24 * 60 * 60 * 1000) {
                sfh.gang.state      = "respect";
                sfh.gang.can_ascend = sfh.gang.size === 12 || rspct.time >= 20 * 60 * 1000;

                last_time = prev.rspct;
                this_time = rspct.time;
                tasks     = rspct.tasks;
            } else if (power.time < money.time) {
                sfh.gang.state      = "power";
                sfh.gang.can_ascend = true;

                last_time = prev.power;
                this_time = power.time;
                tasks     = power.tasks;
            } else {
                sfh.gang.state      = "money";
                sfh.gang.can_ascend = true;

                last_time = prev.money;
                this_time = money.time;
                tasks     = money.tasks;
            }

            sfh.gang.time = this_time;
            const diff = sfh.time.now - prev.time;

            train = (
                   !Number.isFinite(last_time) || last_time <= 0
                || !Number.isFinite(this_time) || this_time <= 0
                || !Number.isFinite(diff)      || diff      <= 0
                || (this_time >= 5 * 60 * 1000 &&
                    (this_time > last_time + train_time || (diff > sfh.time.period && this_time < last_time - diff)))
            );

            for (let i = 0; i < sfh.gang.size; ++i) {
                const task = tasks[i];
                if (task != null) { sfh.gang.members[i].task = task; }
            }
        }

        if (train) { sfh.gang.train_time = sfh.time.now + train_time; }

        prev.time  = sfh.time.now;
        prev.rspct = rspct.time;
        prev.power = power.time;
        prev.money = money.time;
    }

    if (sfh.gang.train_time > sfh.time.now) {
        const frac   = (sfh.gang.train_time - sfh.time.now) / train_time;
        const combat = (info.isHacking ? sfh.gang.size === 12 && (sfh.gang.state === "power") : frac > 0.2);

        for (const member of sfh.gang.members) { member.task = (combat ? "Train Combat" : "Train Hacking"); }
        sfh.gang.can_ascend = true;
    }

    let can_warfare = sfh.gang.clash >= 2/3;
    for (let i = 0; can_warfare && i < sfh.gang.size; ++i) {
        if (sfh.gang.members[i].task === "Territory Warfare") { can_warfare = false; }
    }
    ns.gang.setTerritoryWarfare(can_warfare);

    for (let i = 0; i < sfh.gang.size; ++i) {
        const member = sfh.gang.members[i];
        const name   = i.toFixed(0);
        const curr   = ns.gang.getMemberInformation(name).task;
        if (curr !== member.task) { ns.gang.setMemberTask(name, member.task); }

        if (member.task === "Train Combat") {
            member.com_time += sfh.time.period;
        } else if (member.task === "Train Hacking") {
            member.hac_time += sfh.time.period;
        } else if (member.task === "Train Charisma") {
            member.cha_time += sfh.time.period;
        }
    }

    sfh.gainUpdate("gang", { money: 5 * info.moneyGainRate });
    if (!Number.isFinite(sfh.gang.time)) { sfh.gang.time = Number.POSITIVE_INFINITY; }

    if (sfh.can.purchase) {
        const money = (() => ns.getServerMoneyAvailable("home"));
        const order: (keyof typeof equipment)[] = info.isHacking
            ? ["Augmentation", "Weapon", "Armor", "Vehicle", "Rootkit"]
            : ["Augmentation", "Rootkit", "Weapon", "Armor", "Vehicle"];
        const max_cost = sfh.gains.gang.money * 60;

        for (const type of order) {
            for (let n = equipment[type].length - 1; n >= 0; --n) {
                const name = equipment[type][n];
                const cost = 12 * ns.gang.getEquipmentCost(name);
                if (type !== "Augmentation" && cost > max_cost) { continue; }

                sfh.purchase("gang", money, cost, function() {
                    for (let i = 0; i < 12; ++i) {
                        ns.gang.purchaseEquipment(i.toFixed(0), name);
                    }
                });
            }
        }
    }
}

export async function main(ns: NS) {
    if (ns.args.length == 1 && ns.args[0] == "sfh") { await sfhMain(ns); return; }
}
