import { NS } from "netscript";
import * as S from "sfh";
import { fmtm, fmtt, fmtp, fmtr } from "/sfh/lib.js";

async function runModule(ns: NS, module: string, ...args: string[]) {
    const pid = ns.run(`/sfh/${module}.js`, 1, "sfh", ...args);
    if (pid == 0) { ns.tprintf(`ERROR: Could not run /sfh/${module}.js`); ns.exit(); }
    while (ns.isRunning(pid)) { await ns.asleep(0); }
}

async function sfhMain(ns: NS) {
    await runModule(ns, "data");
    await runModule(ns, "init");

    sfh.uiInject(ns);
    ns.atExit(() => { globalThis.sfh.uiRemove(); });

    const period = 2000;
    main: for (;;) {
        const date_begin = Date.now();
        const time = period * Math.ceil(Date.now() / period);
        const sleep_until = performance.now() + time - Date.now();
        while (performance.now() < sleep_until) {
            if (sfh.reset) {
                sfh.uiRemove();
                ns.tprintf("INFO: Resetting SFH...");
                await runModule(ns, "data");
                await runModule(ns, "init", "reset");
                sfh.uiInject(ns);
            } else if (sfh.reload) {
                sfh.uiRemove();
                ns.tprintf("INFO: Reloading SFH...");
                await runModule(ns, "data");
                await runModule(ns, "init");
                sfh.uiInject(ns);
            }

            if (!sfh.loop) {
                ns.tprintf("INFO: Exiting sfh...");
                sfh.loop = true;
                break main;
            }

            await ns.asleep(0);
        }

        sfh.time.now = time;

        const perf = [];
        const perf_begin = performance.now();
        await runModule(ns, "update");
        perf.push(performance.now() - perf_begin);
        await runModule(ns, "network");
        perf.push(performance.now() - perf_begin);
        await runModule(ns, "working");
        perf.push(performance.now() - perf_begin);
        await runModule(ns, "sleeves");
        perf.push(performance.now() - perf_begin);
        await runModule(ns, "purchase_1");
        await runModule(ns, "purchase_2");
        perf.push(performance.now() - perf_begin);
        await runModule(ns, "scripts");
        perf.push(performance.now() - perf_begin);
        await runModule(ns, "trading");
        perf.push(performance.now() - perf_begin);
        await runModule(ns, "gang");
        let perf_end = performance.now();
        perf.push(perf_end - perf_begin);

        if (perf_end - perf_begin > 800) {
            ns.tprintf("ERROR: SFH main loop took %.1fms", perf_end - perf_begin);
            ns.tprintf("ERROR: All timings: %s", perf.join(" "));
        }

        try {
            if (sfh.can.install && sfh.install) { await runModule(ns, "install"); }
        } catch {}

        eval("window").requestAnimationFrame(sfh.uiUpdate.bind(sfh));
    }
}

export async function main(ns: NS) {
    ns.disableLog("ALL");

    if (ns.args.length == 0) {
        if (ns.isRunning("/sfh/main.js", "home", "sfh")) {
            ns.tprintf("ERROR: SFH already running");
        } else {
            ns.tprintf("INFO: Running SFH...");
            ns.run("/sfh/main.js", 1, "sfh");
        }
        return;
    } else if (ns.args[0] == "sfh") {
        await sfhMain(ns);
        return;
    } else if (ns.args[0] == "kill" || ns.args[0] == "exit" || ns.args[0] == "quit") {
        if (!ns.isRunning("/sfh/main.js", "home", "sfh") || globalThis.sfh == null) {
            ns.tprintf("ERROR: No SFH running");
        } else { sfh.loop = false; }
        return;
    } else if (ns.args[0] == "reload" || ns.args[0] == "init") {
        if (ns.isRunning("/sfh/main.js", "home", "sfh")) {
            sfh.reload = true;
        } else {
            await runModule(ns, "data");
            await runModule(ns, "init");
        }
        return;
    } else if (ns.args[0] == "reset") {
        if (await ns.prompt("Delete all cached SFH data?")) {
            if (ns.isRunning("/sfh/main.js", "home", "sfh")) {
                sfh.reset = true;
            } else {
                ns.tprintf("INFO: Resetting SFH...");
                await runModule(ns, "data");
                await runModule(ns, "init", "reset");
            }
        }
        return;
    }

    if (globalThis.sfh == null) {
        ns.tprintf("INFO: Creating SFH context...");
        await runModule(ns, "data");
        await runModule(ns, "init");
    }

    switch (ns.args[0]) {
        case "on":
        case "off": {
            let key: keyof typeof sfh.can;
            for (key in sfh.can) { sfh.can[key] = (ns.args[0] === "on"); }
        } break;

        case "dump":
        case "print": {
            let object: any = sfh;
            for (let i = 1; i < ns.args.length; ++i) {
                if (!(ns.args[i] as string in object)) {
                    ns.tprintf("ERROR: Could not find property '%s'", ns.args[i]);
                    return;
                }
                object = object[ns.args[i] as string];
            }

            const replacer = (k: string, v: any): any => (k === "ui" ? undefined : v);
            ns.tprintf("%s", JSON.stringify(object, replacer, (ns.args[0] == "dump" ? undefined : 4)));
        } break;

        case "bn":
        case "bitnode": {
            const bn    = sfh.player.bitnode;
            const print = function(name: string, value: number, flip = false, base = 1) {
                const inc = (flip ? "r" : "c");
                const neu = "g";
                const dec = (flip ? "c" : "r");

                if (base === 1) {
                    sfh.print("{25}: {c*,4,2,f}", name, (value > 1 ? inc : (value < 1 ? dec : neu)), value);
                } else {
                    sfh.print("{25}: {c*,d}", name, (value > base ? inc : (value < base ? dec : neu)), value);
                }
            }

            sfh.print("{26,cy,!Bitnode:} {cy}", bn.number);
            print("Hacking", bn.skill);
            print("Hacking exp", bn.skill_exp);
            print("Strength", bn.str);
            print("Defense", bn.def);
            print("Dexterity", bn.dex);
            print("Agility", bn.agi);
            print("Charisma", bn.cha);
            print("Hack power", bn.hack_money);
            print("Hack profit", bn.hack_profit);
            print("Manual hack", bn.hack_manual);
            print("Growth power", bn.grow_rate);
            print("Weaken power", bn.weak_rate);
            print("Server max money", bn.node_max_money);
            print("Server initial money", bn.node_init_money);
            print("Server initial level", bn.node_init_level, true);
            print("Augmentation cost", bn.aug_cost, true);
            print("Augmentation rep", bn.aug_rep, true);
            print("Faction rep", bn.faction_rep);
            print("Faction passive rep", bn.faction_passive);
            print("Faction exp", bn.faction_exp);
            print("Donation favour", bn.faction_favour * 150, true, 150);
            print("Company salary", bn.company_money);
            print("Company exp", bn.company_exp);
            print("Crime money", bn.crime_money);
            print("Crime exp", bn.crime_exp);
            print("Infiltration money", bn.infil_money);
            print("Infiltration rep", bn.infil_rep);
            print("Class exp", bn.class_exp);
            print("Hacknet production", bn.hacknet_prod);
            print("Coding contract money", bn.cct_money);
            print("Home RAM cost", bn.home_cost, true);
            print("Cluster RAM cost", bn.cluster_cost, true);
            print("Cluster max count", bn.cluster_count);
            print("Cluster max RAM", bn.cluster_max_ram);
            print("Cluster softcap", bn.cluster_softcap, true);
            print("4S data base cost", bn.stock_data_base);
            print("4S data API cost", bn.stock_data);
            print("Corporation valuation", bn.corp_valuation);
            print("Corporation dividends", bn.corp_dividends);
            print("Gang softcap", bn.gang_softcap);
            print("Bladeburner rank", bn.bb_rank);
            print("Bladeburner cost", bn.bb_cost);
            print("Stanek's gift power", bn.stanek_power);
            print("Stanek's gift size", bn.stanek_size, false, 0);
            print("Daedalus augs", bn.daedalus_augs, true, 30);
            print("World Daemon", bn.world_daemon * 3000, true, 3000);
        } break;

        case "ps":
        case "procs": {
            if (ns.args[1] === "kill") {
                sfh.print("{cy,!Killing all procs...}");

                for (const proc of sfh.procs.set) {
                    ns.kill(proc.pid);
                    if (proc.pids) { for (const pid of proc.pids) { ns.kill(pid); } }
                }

                return;
            }

            let seen_procs = new Set();

            let sets: [string, Set<S.Proc>][] = [["share", sfh.procs.sharing], ["exp", sfh.procs.exp]];
            for (const [type, set] of sets) {
                if (set.size === 0) { continue; }

                let alloc: { [host: string]: number } = {};
                for (let proc of set) {
                    seen_procs.add(proc);
                    if (!proc.alive) { continue; }

                    alloc[proc.host] ??= 0;
                    alloc[proc.host] += proc.ram;
                    for (let host in proc.alloc) {
                        alloc[host] ??= 0;
                        alloc[host] += proc.alloc[host];
                    }
                }

                sfh.print("{}", type);
                for (const host in alloc) { sfh.print("    {10,10} {0,r}", host, alloc[host]); }
            }

            for (const params of sfh.hacking.list) {
                if (params.job) {
                    let threads = [0, 0, 0];
                    let alloc: { [host: string]: number } = {};
                    for (let proc of params.job.procs) {
                        seen_procs.add(proc);
                        if (!proc.alive) { continue; }

                        if      (proc.script === "/bin/hack.js") { threads[0] += proc.threads; }
                        else if (proc.script === "/bin/grow.js") { threads[1] += proc.threads; }
                        else if (proc.script === "/bin/weak.js") { threads[2] += proc.threads; }
                        else if (proc.script !== "/bin/batch.js") {
                            sfh.print("Unknown script on {} params: {}", params.target.name, proc.script);
                        }

                        alloc[proc.host] ??= 0;
                        alloc[proc.host] += proc.ram;
                        for (let host in proc.alloc) {
                            alloc[host] ??= 0;
                            alloc[host] += proc.alloc[host];
                        }
                    }

                    sfh.print("{5} {18} {t} {t} H {5,d} G {5,d} W {5,d}", params.job.type, params.target.name,
                        params.job.time, params.job.end_time, threads[0], threads[1], threads[2]);
                    for (const host in alloc) { sfh.print("    {10,10} {0,r}", host, alloc[host]); }
                }
            }

            let header = false;
            for (const proc of sfh.procs.set) {
                if (seen_procs.has(proc) || !proc.alive) { continue; }
                if (!header) { sfh.print("Other procs:"); header = true; }
                sfh.print("    {6,d} {10,10} {t} {0,r} {} {}", proc.pid, proc.host, proc.time,
                    proc.ram, proc.script, proc.args?.join() ?? "");
            }
        } break;

        case "mem":
        case "memory": {
            sfh.netSort();
            sfh.print("Free space: {p} ({r} of {r})\n\n",
                sfh.procs.free_ram / sfh.procs.total_ram,
                sfh.procs.free_ram, sfh.procs.total_ram);

            for (let pool of sfh.procs.pools) {
                let frac = (pool.ram > 0 ? pool.used_ram / pool.ram : 0);
                let size = Math.round(20 * frac);
                sfh.print("{18} {5,p} [{}{}] {0,r} of {0,r}", pool.name, frac,
                    "#".repeat(size), " ".repeat(20 - size),
                    pool.ram - pool.used_ram, pool.ram);
            }
        } break;

        case "money": {
            for (const income of [
                ["hacking", sfh.hacking.dps       ],
                ["sleeves", sfh.sleeves.money_rate],
                ["hacknet", sfh.hnet.dps          ],
                ["stocks",  sfh.trading.dps       ],
                ["gang",    sfh.gang.dps          ],
                ["corp",    sfh.corp.dividends    ],
            ] as [string, number][]) {
                sfh.print(`{12} {5,p} {0,m}/s {0,m}/h`,
                    income[0], income[1] / sfh.state.money_rate, income[1], income[1] * 3600);
            }

            sfh.print(`{12}       {0,m}/s {0,m}/h`,
                "TOTAL", sfh.state.money_rate, sfh.state.money_rate * 3600);
            sfh.print(" ");

            for (const type of (Object.keys(sfh.money.spent) as S.MoneyType[])) {
                sfh.print(`{12} {5,p} {0,m} {5,p}`, type,
                    sfh.money.spent[type] / sfh.money.total, sfh.money.spent[type],
                    sfh.money.spent[type] / (sfh.money.frac[type] * sfh.money.total));
            }
            sfh.print(`{12} {5,p} {0,m}`, "CURRENT", sfh.money.curr / sfh.money.total, sfh.money.curr);
            sfh.print(`{12}       {0,m}`, "TOTAL", sfh.money.total);
        } break;

        case "goal": {
            const goal = sfh.goal;
            if (ns.args[1] === "clear") {
                sfh.can.install = false;

                sfh.goal.type  = null;
                sfh.goal.desc  = "";
                sfh.goal.money = 0;

                sfh.goal.money_total = 0;
                sfh.goal.augs.splice(0, sfh.goal.augs.length);
                sfh.goal.work.splice(0, sfh.goal.work.length);
                sfh.goal.orgs.clear();

                sfh.goal.corp   = false;
                sfh.goal.skill  = 0;
                sfh.goal.cha    = 0;
                sfh.goal.combat = 0;
                sfh.goal.karma  = 0;
            } else if (ns.args[1] === "faction") {
                const faction = sfh.state.factions[ns.args[2] as string];

                let rep = 0;
                for (const aug of data.factions[faction.name].augs) {
                    if (aug === "NeuroFlux Governor") { continue; }
                    if (data.augs[aug].rep > rep) { rep = data.augs[aug].rep; }
                    goal.augs.push({ org: faction, name: aug });
                }
                goal.work.push({ org: faction, rep });
                goal.orgs.add(faction);
            } else if (ns.args[1] === "corp") {
                goal.corp = !sfh.goal.corp;
            } else if (ns.args[1] === "skill") {
                goal.skill = Number(ns.args[2]);
            } else if (ns.args[1] === "cha") {
                goal.cha = Number(ns.args[2]);
            } else if (ns.args[1] === "combat") {
                goal.combat = Number(ns.args[2]);
            } else if (ns.args[1] === "karma") {
                goal.karma = Number(ns.args[2]);
            }

            sfh.goalSort();

            if (goal.type == null) {
                sfh.print("Current goal: none");
            } else {
                sfh.print("Current goal: {}{} {0,m} {}",
                    goal.type[0].toUpperCase(), goal.type.substring(1), goal.money, goal.desc);
            }

            let header = true;
            for (let i = 0; i < goal.work.length; ++i) {
                if (header) { sfh.print("Work:"); header = false; }

                const work = goal.work[i];
                sfh.print("    {0,3,3,e} {7} {}",
                    work.rep, work.org.faction ? "Faction" : "Company", work.org.name);
            }

            header = true;
            let augs_installed = sfh.state.augs.queued.size;
            for (let i = 0; i < goal.augs.length; ++i) {
                if (header) { sfh.print("Augs:"); header = false; }

                const aug  = goal.augs[i].name;
                const cost = data.augs[aug].cost * sfh.player.bitnode.aug_cost;
                sfh.print("    {0,3,3,e} {0,m} {0,m} {}",
                    data.augs[aug].rep * sfh.player.bitnode.aug_rep,
                    cost, cost * 1.9 ** augs_installed++, aug);
            }

            sfh.print("     Corp {}", goal.corp ? "yes" : "no");
            sfh.print("    Skill {8,d} / {8,d}", sfh.player.skill, goal.skill);
            sfh.print(" Strength {8,d} / {8,d}", sfh.player.str,   goal.combat);
            sfh.print("  Defense {8,d} / {8,d}", sfh.player.str,   goal.combat);
            sfh.print("Dexterity {8,d} / {8,d}", sfh.player.str,   goal.combat);
            sfh.print("  Agility {8,d} / {8,d}", sfh.player.str,   goal.combat);
            sfh.print(" Charisma {8,d} / {8,d}", sfh.player.cha,   goal.cha);
            sfh.print("    Karma {8,d} / {8,d}", sfh.player.karma, goal.karma);
        } break;

        case "servers":
        case "cluster": {
            ns.run("/sfh/servers.js", 1, ...ns.args.slice(1));
        } break;

        case "net":
        case "network": {
            ns.run("/sfh/network.js", 1, ...ns.args.slice(1));
        } break;

        case "batch":
        case "batches":
        case "batching": {
            ns.run("/sfh/scripts.js", 1, ...ns.args.slice(1));
        } break;

        case "stock":
        case "stocks":
        case "trading": {
            ns.run("/sfh/trading.js", 1, ...ns.args.slice(1));
        } break;

        default: {
            ns.tprintf("ERROR: Unknown command '%s'", ns.args[0]);
        } break;
    }
}
