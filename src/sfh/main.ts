let perf: { [module: string]: [number, number] } = {};
let perf_begin = 0;

async function sfhInit(ns: NS, reset = false) {
    if (globalThis.data) { globalThis.data.init = false; }
    let pid = ns.run(`/data/data.js`, 1, "sfh");
    if (pid == 0) { ns.tprintf(`ERROR: Could not run /sfh/data/data.js`); ns.exit(); }
    while (ns.isRunning(pid)) { await ns.sleep(0); }
    if (!globalThis.data?.init) { ns.tprintf("ERROR: Could not initialise data"); ns.exit(); }

    if (reset) { ns.tprintf("INFO: Resetting SFH..."); }
    pid = ns.run(`/sfh/init.js`, 1, "sfh", reset);
    if (pid == 0) { ns.tprintf(`ERROR: Could not run /sfh/data/data.js`); ns.exit(); }
    while (ns.isRunning(pid)) { await ns.sleep(0); }
}

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
    await sfhInit(ns);
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
                await sfhInit(ns, true);
                sfh.uiInject(ns);
            } else if (sfh.reload) {
                sfh.uiRemove();
                ns.tprintf("INFO: Reloading SFH...");
                await sfhInit(ns);
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

        sfh.time.now    = time;
        sfh.time.period = period;

        perf = {};
        perf_begin = performance.now();
        await runModule(ns, "update");
        await runModule(ns, "purchase_1");
        await runModule(ns, "purchase_2");
        await runModule(ns, "working");
        await runModule(ns, "sleeves");
        await runModule(ns, "network");
        await runModule(ns, "scripts");
        await runModule(ns, "trading");
        await runModule(ns, "cct");
        await runModule(ns, "gang");
        if (sfh.corp.ready) { await runModule(ns, "corp"); }

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
            await sfhInit(ns);
        }
        return;
    } else if (ns.args[0] == "reset") {
        if (await ns.prompt("Delete all cached SFH data?")) {
            if (ns.isRunning("/sfh/main.js", "home", "sfh")) {
                sfh.reset = true;
            } else {
                await sfhInit(ns, true);
            }
        }
        return;
    }

    if (globalThis.sfh == null) {
        ns.tprintf("INFO: Creating SFH context...");
        await sfhInit(ns);
    }

    const query = String(ns.args[0]);
    const args  = ns.args.slice(1);

    switch (query) {
        case "on":
        case "off": {
            let key: keyof typeof sfh.can;
            for (key in sfh.can) { sfh.can[key] = (query === "on"); }
        } break;

        case "data":
        case "dump":
        case "print": {
            let object: any = (query === "data" ? data : sfh);
            for (let i = 0; i < args.length; ++i) {
                if (!(args[i] as string in object)) {
                    sfh.print("ERROR: Could not find property '{}'", args[i]);
                    return;
                }
                object = object[String(args[i])];
            }

            const replacer = (k: string, v: any): any => (k === "ui" ? undefined : v);
            sfh.print("{}", JSON.stringify(object, replacer, (query == "dump" ? undefined : 4)));
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
                ["Hacking skill", bn.mults.hac],
                ["Hacking experience", bn.mults.hac_exp],
                ["Strength", bn.mults.str],
                ["Defense", bn.mults.def],
                ["Dexterity", bn.mults.dex],
                ["Agility", bn.mults.agi],
                ["Charisma", bn.mults.cha],
                ["Hack power", bn.mults.hack_money],
                ["Hack profit", bn.mults.hack_profit],
                ["Manual hack", bn.mults.hack_manual],
                ["Growth power", bn.mults.grow_rate],
                ["Weaken power", bn.mults.weak_rate],
                ["Server maximum money", bn.mults.max_money],
                ["Server initial money", bn.mults.init_money],
                ["Server initial level", bn.mults.init_level, true],
                ["Augmentation cost", bn.mults.aug_cost, true],
                ["Augmentation rep", bn.mults.aug_rep, true],
                ["Faction reputation", bn.mults.faction_rep],
                ["Passive reputation", bn.mults.faction_passive],
                ["Faction experience", bn.mults.faction_exp],
                ["Donation favour", bn.donation, true, 150],
                ["Company salary", bn.mults.company_money],
                ["Company experience", bn.mults.company_exp],
                ["Crime money", bn.mults.crime_money],
                ["Crime experience", bn.mults.crime_exp],
                ["Infiltration money", bn.mults.infil_money],
                ["Infiltration reputation", bn.mults.infil_rep],
                ["Class experience", bn.mults.class_exp],
                ["Hacknet production", bn.mults.hacknet_prod],
                ["Coding contract money", bn.mults.contract_money],
                ["Home RAM cost", bn.mults.home_cost, true],
                ["Cluster RAM cost", bn.mults.cluster_cost, true],
                ["Cluster RAM cost growth", bn.mults.cluster_softcap, true],
                ["Cluster max count", bn.mults.cluster_count],
                ["Cluster max RAM", bn.mults.cluster_max_ram],
                ["4S data base cost", bn.stock_4S_base / 1e9, true],
                ["4S data API cost", bn.stock_4S_api / 25e9, true],
                ["Corporation valuation", bn.mults.corp_valuation],
                ["Corporation dividends", bn.mults.corp_dividends],
                ["Gang money/respect", bn.mults.gang_softcap],
                ["Bladeburner rank", bn.mults.bb_rank],
                ["Bladeburner cost", bn.mults.bb_cost, true],
                ["Stanek's gift power", bn.mults.stanek_power],
                ["Stanek's gift size", bn.stanek_size, false, 0],
                ["Daedalus augmentations", bn.daedalus_augs, true, 30],
                ["World Daemon requirement", bn.world_daemon, true, 3000]
            ];

            for (let i = 0; i < mults.length + 3; i += 4) {
                let fmt = "";
                let print_args: any[] = [];

                for (let n = i; n <= i + 3; ++n) {
                    const mult = mults[n];
                    if (!mult) { break; }

                    const inc = ((mult[2] ?? false) ? "r" : "c");
                    const neu = "g";
                    const dec = ((mult[2] ?? false) ? "c" : "r");

                    const x = mult[1];
                    if (mult[3] == null || mult[3] === 1) {
                        fmt += "{25}: {c*,5,2,f} ";
                        print_args.push(mult[0]);
                        print_args.push(x > 1 ? inc : (x < 1 ? dec : neu));
                        print_args.push(x);
                    } else {
                        fmt += "{25}: {c*,5,d} ";
                        print_args.push(mult[0]);
                        print_args.push(x > mult[3] ? inc : (x < mult[3] ? dec : neu));
                        print_args.push(x);
                    }
                }

                sfh.print(fmt, ...print_args);
            }
        } break;

        case "ps":
        case "procs": {
            if (args[0] === "kill") {
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
                if (params?.prep?.procs?.size > 0) {
                    let threads = [0, 0, 0];
                    let alloc: { [host: string]: number } = {};
                    for (let proc of params.prep.procs) {
                        seen_procs.add(proc);
                        if (!proc.alive) { continue; }

                        if      (proc.script === "/bin/hack.js") { threads[0] += proc.threads; }
                        else if (proc.script === "/bin/grow.js") { threads[1] += proc.threads; }
                        else if (proc.script === "/bin/weak.js") { threads[2] += proc.threads; }
                        else {
                            sfh.print("Unknown script on {} params: {}", params.target.name, proc.script);
                        }

                        alloc[proc.host] ??= 0;
                        alloc[proc.host] += proc.ram;
                        for (let host in proc.alloc) {
                            alloc[host] ??= 0;
                            alloc[host] += proc.alloc[host];
                        }
                    }

                    sfh.print("PREP  {18} {t} {t} H {5,d} G {5,d} W {5,d}", params.target.name,
                        params.init_time, params.prep.end_time, threads[0], threads[1], threads[2]);
                    for (const host in alloc) { sfh.print("    {10,10} {0,r}", host, alloc[host]); }
                }
            }

            for (const params of sfh.hacking.list) {
                const proc = params?.batch?.proc;
                if (!proc) { continue; }
                seen_procs.add(proc);

                let alloc: { [host: string]: number } = {};
                alloc[proc.host] ??= 0;
                alloc[proc.host] += proc.ram;
                for (let host in proc.alloc) {
                    alloc[host] ??= 0;
                    alloc[host] += proc.alloc[host];
                }

                sfh.print("BATCH {18} {t} {5} of {5}", params.target.name,
                    params.init_time, params.batch.depth, params.batch.kW);
                for (const host in alloc) { sfh.print("    {10,10} {0,r}", host, alloc[host]); }
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

        case "pool":
        case "pools": {
            const pools: {[name: string]: { [pid: number]: [string, number, number] }} = {};
            const filter = args[0] ?? null;

            for (let proc of sfh.procs.set) {
                if (!sfh.network[proc.host].pool) { continue; }

                if (!filter || proc.host === filter) {
                    pools[proc.host] ??= {};
                    pools[proc.host][proc.pid] = [proc.script, proc.ram, proc.alloc?.[proc.host] ?? 0];
                }

                if (proc.alloc) for (const [host, ram] of Object.entries(proc.alloc)) {
                    if (host === proc.host || (filter && host !== filter)) { continue; }
                    pools[host] ??= {};
                    pools[host][proc.pid] = [proc.script, 0, ram];
                }
            }

            if (Object.keys(pools).length == 0) {
                sfh.print("No procs running" + (filter ? ` on ${filter}` : ""));
            } else {
                for (const [name, pids] of Object.entries(pools).sort((a, b) => a[0].localeCompare(b[0]))) {
                    const server = sfh.network[name];
                    sfh.print("{18} {p} ({13,2} of {13,2})", name,
                        server.used_ram / server.ram, server.used_ram, server.ram);

                    let total = 0;
                    for (const [pid, data] of Object.entries(pids).sort((a, b) => Number(a[0]) - Number(b[0]))) {
                        total += data[1] + data[2];
                        sfh.print("    {8} {20} {13,2} + {13,2} | {13,2}", pid, data[0], data[1], data[2], total);
                    }
                }
            }
        } break;

        case "money": {
            for (const type of ["scripts", "sleeves", "hacknet", "gang", "corp"] as (keyof SFH["gains"])[]) {
                const money = sfh.gains[type].money;
                sfh.print(`{12} {5,p} {0,m}/s {0,m}/h`,
                    type, money / sfh.gains.total.money, money, money * 3600);
            }

            sfh.print(`{12}       {0,m}/s {0,m}/h`,
                "TOTAL", sfh.gains.total.money, sfh.gains.total.money * 3600);
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
            if (args[0] === "clear") {
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
            } else if (args[0] === "faction") {
                const faction = sfh.state.factions[String(args[1])];

                if (faction) {
                    let rep = 0;
                    for (const aug of data.factions[faction.name].augs) {
                        if (aug === "NeuroFlux Governor") { continue; }
                        if (data.augs[aug].rep > rep) { rep = data.augs[aug].rep; }
                        goal.augs.push({ org: faction, name: aug });
                    }
                    goal.work.push({ org: faction, rep });
                    goal.orgs.add(faction);
                } else {
                    sfh.print("Unknown faction: {}", args[1]);
                }
            } else if (args[0] === "corp") {
                goal.corp = !sfh.goal.corp;
            } else if (args[0] === "hac") {
                goal.hac = Number(args[1]);
            } else if (args[0] === "cha") {
                goal.cha = Number(args[1]);
            } else if (args[0] === "combat") {
                goal.str = Number(args[1]);
                goal.def = Number(args[1]);
                goal.dex = Number(args[1]);
                goal.agi = Number(args[1]);
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
                const cost = data.augs[aug].cost * sfh.player.mults.aug_cost;
                sfh.print("    {0,3,3,e} {0,m} {0,m} {}",
                    data.augs[aug].rep * sfh.player.mults.aug_rep,
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
            ns.run("/sfh/servers.js", 1, ...args);
        } break;

        case "net":
        case "network": {
            if (args[0] === "map") {
                const dfs = function(server: Server) {
                    if (server.owned && server.name !== "home") { return; }
                    ns.tprintf("%s[%4d %s%s%s] %s", "| ".repeat(server.depth), server.skill,
                        (server.root ? "R" : "_"), (server.target ? "T" : "_"),
                        (server.backdoor ? "B" : "_"), server.name);
                    for (let edge of server.edges) {
                        if (sfh.network[edge].depth > server.depth) { dfs(sfh.network[edge]); }
                    }
                }
                dfs(sfh.network.home);
            } else {
                for (const server of Object.values(sfh.network)) {
                    sfh.print("{18} {5} | {0,m} {0,p} | {7,3} {7,3} | {0,r} {0,p}", 
                        server.name, server.skill,
                        server.money, server.cur_money / server.money,
                        server.level, server.cur_level - server.level,
                        server.ram, 1 - server.used_ram / server.ram);
                }
            }
        } break;

        case "hack":
        case "hacks":
        case "hacking": {
            for (const params of sfh.hacking.list) {
                const target = params.target;

                let line = sfh.sprint("{10,10} {4,d} {5,p,c*} {6,3,c*} {0,m}/s",
                    target.name, target.skill,
                    (target.prepped || target.cur_money == target.money ? "" : "R"),
                    target.cur_money / target.money,
                    (target.prepped || target.cur_level == target.level ? "" : "R"),
                    Math.min(target.cur_level - target.level, 99.999),
                    params.batch?.max_dps ?? 0);

                if (params.prep.procs.size > 0) {
                    const prep = params.prep;

                    line += sfh.sprint(" {cw,!P} {t} {t} {5,p,c*} {6,3,c*}",
                        params.init_time, params.prep.end_time,
                        (prep.end_money == target.money ? "" : "R"),
                        prep.end_money / target.money,
                        (prep.end_level == target.level ? "" : "R"),
                        Math.min(prep.end_level - target.level, 99.999));
                } else if (params.batch.proc) {
                    const batch = params.batch;

                    line += sfh.sprint(" {cw,!B} {t} {4,d} {4,d}/{4,d} {0,m}/s",
                        params.init_time, batch.batch,
                        batch.depth, batch.kW, batch.dps);
                } else {
                    line += sfh.sprint(" {t}", params.prep.time);
                }

                sfh.print(line);
            }
        } break;

        case "prep": {
            for (const params of sfh.hacking.list) {
                const prep = params.prep;
                if (prep.procs.size == 0) { continue; }
                const target = params.target;

                sfh.print();
                sfh.print("{t} {18} {5,p,c*} {6,3,c*} to {t} {5,p,c*} {6,3,c*}",
                    params.init_time, target.name,
                    (target.cur_money == target.money ? "" : "R"),
                    target.cur_money / target.money,
                    (target.cur_level == target.level ? "" : "R"),
                    Math.min(target.cur_level - target.level, 99.999),
                    prep.end_time,
                    (prep.end_money == target.money ? "" : "R"),
                    prep.end_money / target.money,
                    (prep.end_level == target.level ? "" : "R"),
                    Math.min(prep.end_level - target.level, 99.999),
                );
                
                const procs = Array.from(prep.procs);
                procs.sort(p => p.end_time ?? 0);

                const server = target.server;
                server.moneyAvailable = target.cur_money;
                server.hackDifficulty = target.cur_level;

                for (const proc of procs) {
                    const script  = proc.script;
                    const threads = proc.threads;

                    if (script == "/bin/hack.js") {
                        const factor = ns.formulas.hacking.hackPercent(server, sfh.player.player);
                        server.moneyAvailable = Math.max(0, server.moneyAvailable - factor * server.moneyMax);
                        server.hackDifficulty = Math.min(100, server.hackDifficulty + threads * 0.002);
                    } else if (script == "/bin/grow.js") {
                        const factor = ns.formulas.hacking.growPercent(server, threads, sfh.player.player, 1);
                        server.moneyAvailable = Math.min(target.money, (server.moneyAvailable + threads) * factor);
                        server.hackDifficulty = Math.min(100, server.hackDifficulty + threads * 0.004);
                    } else if (script == "/bin/weak.js") {
                        server.hackDifficulty = Math.max(target.level, server.hackDifficulty - threads * 0.05);
                    } else {
                        sfh.print("    {18} {} {}", proc.host, proc.script, proc.threads);
                        continue;
                    }

                    sfh.print("    {6} {18} {1} {5} {t} to {t} {5,p,c*} {6,3,c*}",
                        proc.pid, proc.host,
                        (script == "/bin/weak.js" ? "W" : (script == "/bin/hack.js" ? "H" : "G")),
                        proc.threads, proc.time, proc.end_time ?? 0,
                        (server.moneyAvailable == target.money ? "" : "R"),
                        server.moneyAvailable / target.money,
                        (server.hackDifficulty == target.level ? "" : "R"),
                        Math.min(server.hackDifficulty - target.level, 99.999),
                    );
                }
            }
        } break;

        case "batch":
        case "batches":
        case "batching": {
            if (args[0] === "quit" || args[0] === "kill" || args[0] === "exit") {
                for (const params of sfh.hacking.list) {
                    if (params.batch.proc) { params.batch.quit = true; }
                }
            } else if (args[0] === "tail") {
                for (const params of sfh.hacking.list) {
                    if (params.batch.proc) { ns.tail(params.batch.proc.pid); }
                }
            } else {
                let params_list = sfh.hacking.list.filter(p => p.batch?.proc);

                if (sfh.network[String(args[0])]) {
                    const server = String(args[0]);
                    if (sfh.hacking.params[server].batch?.proc) {
                        params_list = [sfh.hacking.params[server]];
                    } else {
                        sfh.print("Server {} has no batch running", server);
                    }
                }

                for (const params of sfh.hacking.list) {
                    const batch = params.batch;
                    if (!batch?.proc) { continue; }

                    sfh.print();
                    sfh.print("{t} {18} {0,m}/s ({4,p} of {0,m}/s) on {}",
                        params.init_time, params.target.name,
                        batch.dps, batch.depth / batch.kW, batch.max_dps,
                        batch.proc.host);

                    sfh.print("{8,1}ms {m} {p}    {t}    hac: {} - {}",
                        batch.period, batch.money, batch.prob, batch.kW * batch.period,
                        batch.hac[0], batch.hac[1]);

                    const free  = [0, 0, 0, 0];
                    const total = [0, 0, 0, 0];
                    for (let i = 0; i < 4; ++i) {
                        free[i]  = Object.values(batch.pools[i]).reduce((a, p) => a += p.free,  0);
                        total[i] = Object.values(batch.pools[i]).reduce((a, p) => a += p.count, 0);
                    }

                    const k = [batch.kH, batch.kW, batch.kG, batch.kW];
                    for (let i = 0; i < 4; ++i) {
                        let line = ""
                        for (let j = batch.batch - 1; j >= batch.batch - k[i]; --j) {
                            line += (j >= 0 && batch.running[i][j % k[i]].pid > 0 ? "#" : "-");
                        }

                        sfh.print("    {1} {3} / {3} / {3}    {}",
                            "HWGW"[i], total[i] - free[i], total[i], k[i], line.padStart(batch.kW, " "));
                    }

                    if (args[0]) { sfh.print(); }

                    if (args[0] === "host" || args[0] === "hosts") {
                        const host_set: Set<string> = new Set();
                        for (let i = 0; i < 4; ++i) {
                            for (const host of Object.keys(batch.pools[i])) { host_set.add(host); }
                        }

                        sfh.print("    {10,!RAM} {12,r} {12,r} {12,r} {12,r}",
                            batch.threads[0] * 1.70, batch.threads[1] * 1.75,
                            batch.threads[2] * 1.75, batch.threads[3] * 1.75);

                        const hosts = Array.from(host_set).sort((s, t) => s.localeCompare(t));
                        for (const host of hosts) {
                            let line = sfh.sprint("    {10,10}", host);

                            for (let i = 0; i < 4; ++i) {
                                let running = 0;
                                for (const script of batch.running[i]) {
                                    if (script.pid > 0 && script.host === host) {
                                        ++running;
                                    }
                                }

                                const free  = batch.pools[i][host]?.free  ?? 0;
                                const count = batch.pools[i][host]?.count ?? 0;

                                line += sfh.sprint("    {3} / {3}", count - free, count);
                            }

                            sfh.print(line);
                        }

                        sfh.print("    {10,!TOTAL}    {3} / {3}    {3} / {3}    {3} / {3}    {3} / {3}",
                            total[0] - free[0], total[0], total[1] - free[1], total[1],
                            total[2] - free[2], total[2], total[3] - free[3], total[3]);
                    } else if (args[0] === "log") {
                        const rows = Number(ns.args[2] ?? batch.kW);
                        sfh.print("    {6,!BATCH} {5,!HAC} {10,!LOOP DELAY} {5,!MONEY} {6,!LEVEL} HWGW HWGW");
                        for (let i = Math.max(batch.log.length - rows, 0); i < batch.log.length; ++i) {
                            const log = batch.log[i];
                            sfh.print("    {6} {5} {8,1,f,c*}{c*,!ms} {5,p,c*} {6,3,c*} "
                                + "{}{}{}{} {}{}{}{}",
                                log.batch, log.hac,
                                log.loop  >= batch.t0 ? "r" : "", log.loop, log.loop >= batch.t0 ? "r" : "",
                                log.money < 1 ? "r" : "", log.money,
                                log.level > 0 ? "r" : "", log.level,
                                log.late[0] ? "L" : (log.killed[0] ? "-" : "R"),
                                log.late[1] ? "L" : (log.killed[1] ? "-" : "R"),
                                log.late[2] ? "L" : (log.killed[2] ? "-" : "R"),
                                log.late[3] ? "L" : (log.killed[3] ? "-" : "R"),
                                log.dispatch[0] ? "D" : "-", log.dispatch[1] ? "D" : "-",
                                log.dispatch[2] ? "D" : "-", log.dispatch[3] ? "D" : "-",
                            );
                        }
                    }
                }
            }
        } break;

        case "stock":
        case "stocks":
        case "trading": {
            ns.run("/sfh/trading.js", 1, ...ns.args.slice(1));
        } break;

        case "cct":
        case "contract":
        case "contracts": {
            ns.run("/sfh/cct.js", 1, ...ns.args.slice(1));
        } break;

        default: {
            ns.tprintf("ERROR: Unknown command '%s'", query);
        } break;
    }
}
