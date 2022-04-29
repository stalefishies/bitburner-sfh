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
        await runModule(ns, "purchase");
        perf.push(performance.now() - perf_begin);
        await runModule(ns, "work");
        perf.push(performance.now() - perf_begin);
        await runModule(ns, "hacking");
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

        case "goal": {
            if (sfh.state.goal.have_goal) {
                const goal = sfh.state.goal;

                let header = true;
                for (let i = 0; i < goal.work.length; ++i) {
                    if (header) { ns.tprintf("Work:"); header = false; }

                    const work = goal.work[i];
                    sfh.print("    {0,3,3,e} {7} {}",
                        work.rep, work.org.faction ? "Faction" : "Company", work.org.name);
                }

                header = true;
                let augs_installed = sfh.state.augs.queued.size;
                for (let i = 0; i < goal.augs.length; ++i) {
                    if (header) { ns.tprintf("Augs:"); header = false; }

                    const aug  = goal.augs[i].name;
                    const cost = data.augs[aug].cost * sfh.player.bitnode.aug_cost;
                    sfh.print("    {0,3,3,e} {0,m} {0,m} {}",
                        data.augs[aug].rep * sfh.player.bitnode.aug_rep,
                        cost, cost * 1.9 ** augs_installed++, aug);
                }
            } else {
                ns.tprintf("(no goal)");
            }
        } break;

        case "ps":
        case "procs": {
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

            for (const params of Object.values(sfh.hacking)) {
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
                sfh.print("    {10,10} {t} {0,r} {} {}", proc.host, proc.time,
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
            ns.run("/sfh/hacking.js", 1, ...ns.args.slice(1));
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
