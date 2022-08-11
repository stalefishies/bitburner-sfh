let perf: { [module: string]: [number, number] } = {};
let perf_begin = 0;

async function runModule(ns: NS, module: string, ...args: string[]) {
    let t0 = performance.now();

    const pid = ns.run(`/sfh/${module}.js`, 1, "sfh", ...args);
    if (pid == 0) { ns.tprintf(`ERROR: Could not run /sfh/${module}.js`); ns.exit(); }
    while (ns.isRunning(pid)) { await ns.sleep(0); }

    if (perf_begin > 0) {
        const t1 = performance.now();
        perf[module] = [t1 - t0, t1 - perf_begin];
    }
}

async function sfhMain(ns: NS) {
    await runModule(ns, "data");
    await runModule(ns, "init");

    sfh.uiInject(ns);
    ns.atExit(() => { globalThis.sfh.uiRemove(); });

    const start_time = new Date(Date.now()).toLocaleTimeString();

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
                sfh.uiCreate(ns);
                sfh.uiInject(ns);
            }

            if (!sfh.loop) {
                ns.tprintf("INFO: Exiting sfh...");
                sfh.loop = true;
                break main;
            }

            await ns.sleep(0);
        }

        sfh.time.now = time;

        perf = {};
        perf_begin = performance.now();
        await runModule(ns, "update");
        await runModule(ns, "network");
        await runModule(ns, "working");
        await runModule(ns, "sleeves");
        await runModule(ns, "purchase_1");
        await runModule(ns, "purchase_2");
        await runModule(ns, "scripts");
        await runModule(ns, "trading");
        //await runModule(ns, "gang");

        const perf_end = performance.now();
        if (perf_end - perf_begin > 1500) {
            sfh.print("{cr,!SFH main loop took} {cr,7,1}{cr,!ms}", perf_end - perf_begin);

            const timings = Object.entries(perf).sort((a, b) => a[1][1] - b[1][1]);
            for (const timing of timings) {
                sfh.print("    {cr,10}{cr,!:} {cr,7,1}{cr,!ms} {cr,7,1}{cr,!ms}",
                    timing[0], timing[1][0], timing[1][1]);
            }
        }
        perf_begin = 0;

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
            const bn = sfh.bitnode;

            let sf_str = "";
            for (let n = 1; n <= 13; ++n) {
                sf_str += ("SF-" + String(n)).padStart(5, " ");
                if (n !== 13) { sf_str += " "; }
            }
            sfh.print(sf_str);

            let lvl_fmt = "";
            let lvl_args: any[] = [];
            for (let n = 1; n <= 13; ++n) {
                const lvl = bn.sf[n];

                lvl_fmt += "{c*,5,d} ";
                if (n === 12) {
                    lvl_args.push(lvl <= 0 ? "r" : "y");
                } else {
                    lvl_args.push(lvl <= 0 ? "r" : (lvl >= 3 ? "g" : "y"));
                }

                lvl_args.push(lvl);
            }
            sfh.print(lvl_fmt, ...lvl_args);

            sfh.print(" ");
            sfh.print("{cy,!Current BitNode:} {cy}", bn.number);
            const mults: [string, number, boolean?, number?][] = [
                ["Hacking skill", bn.mult.hac],
                ["Hacking experience", bn.mult.hac_exp],
                ["Strength", bn.mult.str],
                ["Defense", bn.mult.def],
                ["Dexterity", bn.mult.dex],
                ["Agility", bn.mult.agi],
                ["Charisma", bn.mult.cha],
                ["Hack power", bn.mult.hack_money],
                ["Hack profit", bn.mult.hack_profit],
                ["Manual hack", bn.mult.hack_manual],
                ["Growth power", bn.mult.grow_rate],
                ["Weaken power", bn.mult.weak_rate],
                ["Server maximum money", bn.mult.max_money],
                ["Server initial money", bn.mult.init_money],
                ["Server initial level", bn.mult.init_level, true],
                ["Augmentation cost", bn.mult.aug_cost, true],
                ["Augmentation rep", bn.mult.aug_rep, true],
                ["Faction reputation", bn.mult.faction_rep],
                ["Passive reputation", bn.mult.faction_passive],
                ["Faction experience", bn.mult.faction_exp],
                ["Donation favour", bn.donation, true, 150],
                ["Company salary", bn.mult.company_money],
                ["Company experience", bn.mult.company_exp],
                ["Crime money", bn.mult.crime_money],
                ["Crime experience", bn.mult.crime_exp],
                ["Infiltration money", bn.mult.infil_money],
                ["Infiltration reputation", bn.mult.infil_rep],
                ["Class experience", bn.mult.class_exp],
                ["Hacknet production", bn.mult.hacknet_prod],
                ["Coding contract money", bn.mult.contract_money],
                ["Home RAM cost", bn.mult.home_cost, true],
                ["Cluster RAM cost", bn.mult.cluster_cost, true],
                ["Cluster RAM cost growth", bn.mult.cluster_softcap, true],
                ["Cluster max count", bn.mult.cluster_count],
                ["Cluster max RAM", bn.mult.cluster_max_ram],
                ["4S data base cost", bn.stock_4S_base, true],
                ["4S data API cost", bn.stock_4S_api, true],
                ["Corporation valuation", bn.mult.corp_valuation],
                ["Corporation dividends", bn.mult.corp_dividends],
                ["Gang money/respect", bn.mult.gang_softcap],
                ["Bladeburner rank", bn.mult.bb_rank],
                ["Bladeburner cost", bn.mult.bb_cost, true],
                ["Stanek's gift power", bn.mult.stanek_power],
                ["Stanek's gift size", bn.stanek_size, false, 0],
                ["Daedalus augmentations", bn.daedalus_augs, true, 30],
                ["World Daemon requirement", bn.world_daemon * 3000, true, 3000]
            ];

            for (let i = 0; i < mults.length + 3; i += 4) {
                let fmt = "";
                let args: any[] = [];

                for (let n = i; n <= i + 3; ++n) {
                    const mult = mults[n];
                    if (!mult) { break; }

                    const inc = ((mult[2] ?? false) ? "r" : "c");
                    const neu = "g";
                    const dec = ((mult[2] ?? false) ? "c" : "r");

                    const x = mult[1];
                    if (mult[3] == null || mult[3] === 1) {
                        fmt += "{25}: {c*,5,2,f} ";
                        args.push(mult[0]);
                        args.push(x > 1 ? inc : (x < 1 ? dec : neu));
                        args.push(x);
                    } else {
                        fmt += "{25}: {c*,5,d} ";
                        args.push(mult[0]);
                        args.push(x > mult[3] ? inc : (x < mult[3] ? dec : neu));
                        args.push(x);
                    }
                }

                sfh.print(fmt, ...args);
            }
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

            let sets: [string, Set<Proc>][] =
                [["exp", sfh.procs.exp], ["share", sfh.procs.sharing], ["stanek", sfh.procs.stanek]];
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

            for (const type of (Object.keys(sfh.money.spent) as (keyof typeof sfh.money.spent)[])) {
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

                sfh.goal.corp = false;
                sfh.goal.hac  = 0;
                sfh.goal.str  = 0;
                sfh.goal.def  = 0;
                sfh.goal.dex  = 0;
                sfh.goal.agi  = 0;
                sfh.goal.cha  = 0;
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
            } else if (ns.args[1] === "hac") {
                goal.hac = Number(ns.args[2]);
            } else if (ns.args[1] === "cha") {
                goal.cha = Number(ns.args[2]);
            } else if (ns.args[1] === "combat") {
                goal.str = Number(ns.args[2]);
                goal.def = Number(ns.args[2]);
                goal.dex = Number(ns.args[2]);
                goal.agi = Number(ns.args[2]);
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
                const cost = data.augs[aug].cost * sfh.player.mult.aug_cost;
                sfh.print("    {0,3,3,e} {0,m} {0,m} {}",
                    data.augs[aug].rep * sfh.player.mult.aug_rep,
                    cost, cost * 1.9 ** augs_installed++, aug);
            }

            sfh.print("     Corp {}", goal.corp ? "yes" : "no");
            sfh.print("  Hacking {8,d} / {8,d}", sfh.player.hac, goal.hac);
            sfh.print(" Strength {8,d} / {8,d}", sfh.player.str, goal.str);
            sfh.print("  Defense {8,d} / {8,d}", sfh.player.def, goal.def);
            sfh.print("Dexterity {8,d} / {8,d}", sfh.player.dex, goal.dex);
            sfh.print("  Agility {8,d} / {8,d}", sfh.player.agi, goal.agi);
            sfh.print(" Charisma {8,d} / {8,d}", sfh.player.cha, goal.cha);
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
