const backdoor_names = new Set<string>();

type Params = typeof sfh.hacking.list[0];

function solveGrow(base: number, money_lo: number, money_hi: number) {
    if (money_lo >= money_hi) { return 0; }

    let threads = 1000;
    let prev = threads;
    for (let i = 0; i < 30; ++i) {
        let factor = money_hi / Math.min(money_lo + threads, money_hi - 1);
        threads = Math.log(factor) / Math.log(base);
        if (Math.ceil(threads) == Math.ceil(prev)) { break; }
        prev = threads;
    }

    return Math.ceil(Math.max(threads, prev, 0));
}

function updateParams(ns: NS, params: Params, t0 = 100) {
    if (params.target?.name == null) {
        throw new Error(`Tried to update params for invalid target ${params.target?.name ?? "null"}`);
    }

    const target = params.target;
    const recalc = !params.calc_time || params.calc_hac != sfh.player.hac;

    params.prep ??= {
        procs:     new Set(),
        end_time:  0,
        end_money: 0,
        end_level: 0,
        time:      0
    };

    const prep = params.prep;
    if (prep.procs.size == 0) {
        prep.end_time  = sfh.time.now;
        prep.end_money = (params.batch?.proc ? target.money : target.cur_money);
        prep.end_level = (params.batch?.proc ? target.level : target.cur_level);
    }

    const max_threads = Math.floor(sfh.procs.total_ram / 1.75);
    const max_time    = 1000 * 60 * 60 * 24;
    if (max_threads < 1) {
        prep.time = max_time;
    } else if (recalc || prep.procs.size > 0) {
        const server = Object.assign({}, target.server);
        server.moneyAvailable = prep.end_money;
        server.hackDifficulty = prep.end_level;

        let prev_time    = 0;
        let cur_threads  = 0;
        let cur_duration = 0;

        while (server.moneyAvailable < target.money || server.hackDifficulty > target.level) {
            const weak = server.hackDifficulty > 1.02 * target.level
                || (server.moneyAvailable >= target.money && server.hackDifficulty > target.level);

            let threads  = 0;
            let duration = 0;
            if (weak) {
                threads  = Math.ceil((server.hackDifficulty - target.level) / 0.05);
                duration = ns.formulas.hacking.weakenTime(server, sfh.player.player);
            } else {
                const base = ns.formulas.hacking.growPercent(server, 1, sfh.player.player, 1);
                threads  = solveGrow(base, server.moneyAvailable, target.money);
                duration = ns.formulas.hacking.growTime(server, sfh.player.player);
            }

            threads      = Math.min(threads, max_threads - cur_threads);
            cur_threads += threads;
            cur_duration = Math.max(cur_duration, duration);

            if (weak) {
                server.hackDifficulty = Math.max(target.level, server.hackDifficulty - 0.05 * threads);
            } else {
                const factor = ns.formulas.hacking.growPercent(server, threads, sfh.player.player, 1);
                server.moneyAvailable = Math.min(target.money, (server.moneyAvailable + threads) * factor);
                server.hackDifficulty = Math.min(100, server.hackDifficulty + threads * 0.004);
            }

            if (cur_threads >= max_threads) {
                prev_time   += cur_duration;
                cur_threads  = 0;
                cur_duration = 0;
            }

            if (prev_time > max_time) { break; }
        }

        prep.time = Math.min((prep.end_time - sfh.time.now) + prev_time + cur_duration, max_time);
    }

    params.batch ??= {
        hac:     [0, 0],
        t0:      0,

        period:  0,
        kW:      0,
        kG:      0,
        kH:      0,

        money:   0,
        prob:    0,
        max_dps: 0,
        threads: [0, 0, 0, 0],

        proc:    null,
    };

    const batch = params.batch;
    if (batch.proc) { return; }

    if (recalc) {
        const player = JSON.parse(JSON.stringify(sfh.player.player));
        const server = Object.assign({}, target.server);
        server.moneyAvailable = target.money;
        server.hackDifficulty = target.level;

        const ram_max = 0.9 * sfh.procs.total_ram;
        const new_exp = sfh.player.hac_exp + (ns.formulas.hacking.hackExp(server, player)
            * (1000 * 60 * 60) / ns.formulas.hacking.weakenTime(server, player) * ram_max / 1.75);
        batch.hac[0] = sfh.player.hac;
        batch.hac[1] = Math.round(sfh.player.mults.hac * (32 * Math.log(new_exp + 534.5) - 200));
        batch.hac[1] = Math.min(Math.max(batch.hac[1], batch.hac[0]), batch.hac[0] + 24);

        player.skills.hacking = batch.hac[0];
        const hack_time_hi = ns.formulas.hacking.hackTime(server, player);
        const grow_time_hi = 3.2 * hack_time_hi;
        const weak_time_hi = 4.0 * hack_time_hi;

        player.skills.hacking = batch.hac[1];
        const hack_time_lo = ns.formulas.hacking.hackTime(server, player);
        const grow_time_lo = 3.2 * hack_time_lo;
        const weak_time_lo = 4.0 * hack_time_lo;

        const hack_frac = ns.formulas.hacking.hackPercent(server, player);
        const hack_prob = ns.formulas.hacking.hackChance(server, player);
        const grow_base = ns.formulas.hacking.growPercent(server, 1, player, 1);

        t0 = Math.min(hack_time_lo, t0);
        batch.t0      = t0;
        batch.prob    = hack_prob;
        batch.max_dps = 0;

        const max_hack_threads = Math.min(1000, Math.ceil(1 / hack_frac));
        const batch_data = Array.from({ length: max_hack_threads + 1 }, () =>
            ({ threads: [0, 0, 0, 0] as [number, number, number, number], money: 0 }));

        for (let hack_threads = 1; hack_threads <= max_hack_threads; ++hack_threads) {
            const money_taken  = Math.min(Math.max(hack_threads * hack_frac, 0), 1) * server.moneyMax;
            const grow_threads = solveGrow(grow_base, server.moneyMax - money_taken, server.moneyMax);

            const weak_threads_hack = Math.ceil(hack_threads * 0.04);
            const weak_threads_grow = Math.ceil(grow_threads * 0.08);

            const data = batch_data[hack_threads];
            data.threads[0] = hack_threads;
            data.threads[1] = weak_threads_hack;
            data.threads[2] = grow_threads;
            data.threads[3] = weak_threads_grow;
            data.money      = money_taken * sfh.player.mults.hack_profit;
        }

        const kW_max = Math.floor(1 + (weak_time_lo - 4 * t0) / (8 * t0));
        schedule: for (let kW = kW_max; kW >= 1; --kW) {
            const kG_lo = Math.ceil(Math.max((kW - 1) * 0.8, 1));
            const kG_hi = Math.floor(1 + kW * 0.8);

            for (let kG = kG_hi; kG >= kG_lo; --kG) {
                const kH_lo = Math.ceil(Math.max((kW - 1) * 0.25, (kG - 1) * 0.3125, 1));
                const kH_hi = Math.floor(Math.min(1 + kW * 0.25, 1 + kG * 0.3125));

                for (let kH = kH_hi; kH >= kH_lo; --kH) {
                    let period_lo_H = (hack_time_hi + 5 * t0) / kH;
                    let period_hi_H = (hack_time_lo - 1 * t0) / (kH - 1);
                    let period_lo_G = (grow_time_hi + 3 * t0) / kG
                    let period_hi_G = (grow_time_lo - 3 * t0) / (kG - 1);
                    let period_lo_W = (weak_time_hi + 4 * t0) / kW;
                    let period_hi_W = (weak_time_lo - 4 * t0) / (kW - 1);

                    let period_lo = Math.max(period_lo_H, period_lo_G, period_lo_W);
                    let period_hi = Math.min(period_hi_H, period_hi_G, period_hi_W);
                    if (period_lo <= period_hi) {
                        let data = null;

                        for (let ht_lo = 1, ht_hi = max_hack_threads; ht_hi >= ht_lo;) {
                            const ht = Math.round((ht_lo + ht_hi) / 2);
                            const this_data = batch_data[ht];

                            const ram_used = kH * 1.70 * this_data.threads[0]
                                + kW * 1.75 * this_data.threads[1]
                                + kG * 1.75 * this_data.threads[2]
                                + kW * 1.75 * this_data.threads[3];

                            if (ram_used <= ram_max) {
                                data = this_data;
                                ht_lo = ht + 1;
                            } else {
                                ht_hi = ht - 1;
                            }
                        }

                        if (data) {
                            batch.period  = period_lo;
                            batch.kW      = kW;
                            batch.kG      = kG;
                            batch.kH      = kH;
                            batch.money   = data.money;
                            batch.max_dps = 1000 * data.money * hack_prob / period_lo;
                            batch.threads = data.threads;

                            break schedule;
                        }
                    }
                }
            }
        }
    }
}

let can_prep = true;
function runPrep(ns: NS, params: Params) {
    if (!can_prep || !sfh.can.scripts || params == null
        || params.batch.proc || params.target.prepped) { return false; }
    const target = params.target;
    const prep   = params.prep;

    const server = Object.assign({}, target.server);
    const hack_time = ns.formulas.hacking.hackTime(server, sfh.player.player);
    const grow_time = 3.2 * hack_time;
    const weak_time = 4.0 * hack_time;

    server.moneyAvailable = prep.end_money;
    server.hackDifficulty = prep.end_level;

    const ram_max = 0.5 * sfh.procs.total_ram;
    let  ram_used = 0;
    for (const proc of prep.procs) { ram_used += proc.ram; }

    let ret  = false;
    let time = Math.max(sfh.time.now, prep.end_time);
    while ((server.moneyAvailable < target.money || server.hackDifficulty > target.level)
        && sfh.hacking.scripts < sfh.hacking.max_scripts)
    {
        //sfh.print("    Prep loop: {p} {6,3} {} {}",
        //    server.moneyAvailable / target.money,
        //    server.hackDifficulty - target.level,
        //    sfh.hacking.scripts, sfh.hacking.max_scripts);

        let script = "/bin/hack.js", threads = 1, duration = hack_time, ram = 1.7;
        if (server.hackDifficulty <= 100) {
            if (server.hackDifficulty > 1.02 * target.level
                || (server.moneyAvailable >= target.money && server.hackDifficulty > target.level))
            {
                script   = "/bin/weak.js";
                threads  = Math.ceil((server.hackDifficulty - target.level) / 0.05);
                duration = weak_time;
                ram      = 1.75;
            } else {
                const base = ns.formulas.hacking.growPercent(server, 1, sfh.player.player, 1);
                script   = "/bin/grow.js";
                threads  = solveGrow(base, server.moneyAvailable, target.money);
                duration = grow_time;
                ram      = 1.75;
            }
        }

        //sfh.print("    {} {} {0,2}ms {}GB", script, threads, duration, ram);

        const host = sfh.netHost(ram, 1, threads);
        //sfh.print("    host {j}", host);
        if (host == null) { can_prep = false; break; }
        threads = host.threads;

        const begin_time = Math.max(time - duration, sfh.time.now);
        const event_time = begin_time - sfh.time.now + performance.now();
        const proc = sfh.netProc(prep.procs, ns.exec.bind(ns), script, host, params.target.name, event_time);
        //sfh.print("proc {j}", proc);
        //sfh.print("=====");
        if (!proc) { can_prep = false; break; }

        ++sfh.hacking.scripts;
        ram_used += ram * threads;
        if (params.init_time == 0) { params.init_time = sfh.time.now; }

        if (script == "/bin/hack.js") {
            const factor = ns.formulas.hacking.hackPercent(server, sfh.player.player);
            server.moneyAvailable = Math.max(0, server.moneyAvailable - factor * server.moneyMax);
            server.hackDifficulty = Math.min(100, server.hackDifficulty + threads * 0.002);
        } else if (script == "/bin/grow.js") {
            const factor = ns.formulas.hacking.growPercent(server, threads, sfh.player.player, 1);
            server.moneyAvailable = Math.min(target.money, (server.moneyAvailable + threads) * factor);
            server.hackDifficulty = Math.min(100, server.hackDifficulty + threads * 0.004);
        } else {
            server.hackDifficulty = Math.max(target.level, server.hackDifficulty - threads * 0.05);
        }

        time = begin_time + duration + 1000;
        proc.end_time  = time;
        prep.end_time  = Math.max(prep.end_time, time);
        prep.end_money = server.moneyAvailable;
        prep.end_level = server.hackDifficulty;

        ret = true;
    }

    return ret;
}

/*
function runHack(ns: NS, params: Params) {
    if (params == null || params.job != null || !params.target.prepped || !sfh.can.scripts || !sfh.can.hacking
        || params.single.dps < sfh.hacking.min_dps || sfh.hacking.scripts >= max_scripts) { return; }

    const host = sfh.netHost(1.7, 1, params.single.threads);
    if (!host) { return; }

    const dps = params.single.dps * host.threads / params.single.threads;
    //if (dps < min_dps || dps * 5 < params.single.dps) { return; }
    if (dps < sfh.hacking.min_dps) { return; }

    const calc = sfh.calc(params.target);
    calc.runHack(host.threads);

    const end_time = sfh.time.now + calc.hackTime();
    const job: Job = { type: "adhoc", procs: new Set(), time: sfh.time.now, end_time: end_time,
        scripts: 1, dps, end_money: calc.cur_money, end_level: calc.cur_level };
    const proc = sfh.netProc(job.procs, ns.exec.bind(ns), "/bin/hack.js", host, params.target.name);

    if (proc) {
        ++sfh.hacking.scripts;
        updateMinDPS(job.dps);
        proc.end_time = end_time;
        params.job    = job;
    }
}
*/

let can_batch = true;
function runBatch(ns: NS, params: Params) {
    if (!can_batch || !sfh.can.scripts || !sfh.can.hacking || !sfh.can.batching || params == null
        || params.prep.procs.size > 0 || params.batch.proc || !params.target.prepped
        || sfh.hacking.scripts >= sfh.hacking.max_scripts) { return false; }
    can_batch = false;

    const host_ram = ns.getScriptRam("/bin/batch.js");
    const host = sfh.netHost(host_ram, 1);
    if (!host) { return; }

    const proc = sfh.netProc(null, ns.exec.bind(ns), "/bin/batch.js", host, params.target.name);
    if (proc) {
        proc.pids  = new Set();
        proc.alloc = {};

        Object.assign(params.batch, {
            proc, log: [], quit: false, scripts: 1, batch: -1, depth: 0, dps: 0,
            delay: [0, 0, 0, 0], pools: [{}, {}, {}, {}],
            running: [
                Array.from({ length: params.batch.kH }, () => ({ host: "", pid: 0 })),
                Array.from({ length: params.batch.kW }, () => ({ host: "", pid: 0 })),
                Array.from({ length: params.batch.kG }, () => ({ host: "", pid: 0 })),
                Array.from({ length: params.batch.kW }, () => ({ host: "", pid: 0 })),
            ]
        });

        ++sfh.hacking.scripts;
        params.init_time = sfh.time.now;
        can_prep = false;
    }

    return !!proc;
}

async function sfhMain(ns: NS) {
    const hacking = sfh.hacking;

    sfh.hacking.scripts = 0;
    sfh.hacking.min_dps = 1;
    const gain = { money: 0, hac_exp: 0 };

    if (backdoor_names.size == 0) {
        for (const name of [
            "w0r1d_d43m0n", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z",
            "ecorp", "megacorp", "b-and-a", "blade", "nwo", "clarkinc",
            "omnitek", "4sigma", "kwaigong", "fulcrumtech", "fulcrumassets"
        ]) { backdoor_names.add(name); }
        for (const server of sfh.servers(s => !s.owned)) { backdoor_names.add(server.name); }
    }

    if (!sfh.procs.backdoor?.alive) { sfh.procs.backdoor = null; }
    if (sfh.can.scripts && !sfh.procs.backdoor) {
        let target = null;
        for (const name of backdoor_names) {
            const node = sfh.network[name];
            if (!node || (!(sfh.can.bitnode && sfh.can.automate) && node.name === "w0r1d_d43m0n")) { continue; }

            if (!node.backdoor && node.root && sfh.player.hac >= node.skill) {
                target = node;
                break;
            }
        }

        if (target) {
            const host = sfh.netHost(ns.getScriptRam("/bin/backdoor.js"), 1);
            sfh.procs.backdoor = sfh.netProc(null, ns.exec.bind(ns),
                "/bin/backdoor.js", host, target.name);

            if (sfh.procs.backdoor && target.name === "w0r1d_d43m0n") {
                sfh.can.install = false;
                sfh.can.bitnode = false;
            }
        }
    }
    if (sfh.procs.backdoor?.alive) { ++sfh.hacking.scripts; }

    let script_fill = "stanek";
    //if (sfh.goal.type !== "program" && sfh.goal.type !== "faction") {
        // TODO: when to do stanek vs exp vs share?
        //if (sfh.state.augs.has("Stanek's Gift - Genesis")) {
        //    script_fill = "stanek";
        //} else if (sfh.network.joesguns.prepped && sfh.player.hac < sfh.goal.hac) {
        //    script_fill = "exp";
        //} else if ((sfh.state.work?.goal && sfh.state.work?.org?.faction) ?? false) {
        //    script_fill = "share";
        //}
    //}

    if (!sfh.can.scripts || script_fill !== "exp") {
        for (const proc of sfh.procs.exp) { ns.kill(proc.pid); }
    }

    if (!sfh.can.scripts || script_fill !== "share") {
        for (const proc of sfh.procs.sharing) { ns.kill(proc.pid); }
    }

    if (!sfh.can.scripts || script_fill !== "stanek") {
        for (const proc of sfh.procs.stanek) { ns.kill(proc.pid); }
    }

    sfh.netGC(ns.isRunning.bind(ns));
    for (const set of [sfh.procs.exp, sfh.procs.sharing, sfh.procs.stanek]) {
        for (const proc of set) { if (!proc.alive) { set.delete(proc); } }
    }

    // TODO: run exp on best prepped server, not just joesguns
    if (sfh.can.scripts && sfh.netstat.ready && script_fill != null) {
        let script = "/bin/stanek.js";
        let set    = sfh.procs.stanek;
        let args: (string | number)[] = [];
        if (script_fill === "exp") {
            script = "/bin/grow.js";
            set    = sfh.procs.exp;
            args   = ["joesguns", Number.POSITIVE_INFINITY];
        } else if (script_fill === "share") {
            script = "/bin/share.js";
            set    = sfh.procs.sharing;
        }

        const max_ram = Math.max(sfh.network.home.ram / 64, 4);
        const script_ram = ns.getScriptRam(script);

        const servers = sfh.servers(s =>
            !s.owned && s.root && s.ram >= script_ram && s.ram <= max_ram && s.used_ram == 0);
        for (const server of servers) {
            const host = { name: server.name, ram: server.ram, threads: Math.floor(server.ram / script_ram) };
            const proc = sfh.netProc(set, ns.exec.bind(ns), script, host, ...args);
        }
    }

    sfh.hacking.scripts += sfh.procs.exp.size + sfh.procs.sharing.size + sfh.procs.stanek.size;

    if (sfh.procs.exp.size > 0) {
        const calc = sfh.calc("joesguns");
        const rate = calc.exp() / calc.growTime();
        for (const proc of sfh.procs.exp) { gain.hac_exp += rate * proc.threads; }
    }

    can_prep  = true;
    can_batch = true;
    let batches = 0;
    let min_dps = 0;

    for (const target of sfh.servers(s => s.target)) {
        let params = hacking.params[target.name];
        if (params) {
            if (params.prep.procs.size > 0) {
                for (const proc of params.prep.procs) {
                    if (!proc.alive) { params.prep.procs.delete(proc); }
                }
            }

            if (!params.batch.proc?.alive) { params.batch.proc = null; }
            if (params.prep.procs.size == 0 && params.batch.proc == null) { params.init_time = 0; }

            sfh.hacking.scripts += params.prep.procs.size;
            sfh.hacking.scripts += params.batch.proc ? params.batch.scripts : 0;

            min_dps = Math.max(min_dps, 0.5 * params.batch.max_dps);
            if (params.batch.proc) {
                ++batches;
                if (params.batch.batch < 0) {
                    can_prep = can_batch = false;
                } else if (params.batch.depth < params.batch.kW) {
                    can_batch = false;
                }
            }

            /*
            // cull redundant procs
            if (params.job) {
                if (params.job.type === "adhoc") {
                    const procs = [...params.job.procs];
                    const def_t = params.job.end_time;
                    procs.sort((p, q) => (p.end_time ?? def_t) - (q.end_time ?? def_t));

                    const calc = sfh.calc(params.target);
                    for (const proc of procs) {
                        if (proc.script === "/bin/hack.js") {
                            calc.runHack(proc.threads);
                        } else if (proc.script === "/bin/grow.js") {
                            if (calc.cur_money === params.target.money) {
                                ns.kill(proc.pid);
                            } else {
                                calc.runGrow(proc.threads);
                            }
                        } else if (proc.script === "/bin/weak.js") {
                            if (calc.cur_level === params.target.level) {
                                ns.kill(proc.pid);
                            } else {
                                calc.runWeak(proc.threads);
                            }
                        }
                    }
                }
            }
           */
        } else {
            params = hacking.params[target.name] = { target } as Params;
            hacking.list.push(params);
        }

        updateParams(ns, params);
    }

    hacking.list.sort((p: Params, q: Params) => q.batch.max_dps - p.batch.max_dps);

    if (sfh.can.scripts && sfh.netstat.ready) {
        if (can_batch) {
            for (const params of hacking.list) {
                if (params.batch.max_dps < min_dps) { break; }
                runBatch(ns, params);
                if (!can_batch) { break; }
            }
        }

        for (const params of hacking.list) {
            const batch = params.batch;
            if (!batch.proc) { continue; }

            if (!batch.proc.alloc) {
                throw new Error(`Batch of ${params.target.name} has a proc without an alloc`);
            }

            const total = [0, 0, 0, 0];
            for (let i = 0; i < 4; ++i) {
                total[i] = Object.values(batch.pools[i]).reduce((a, p) => a += p.count, 0);
            }

            const k = [batch.kH, batch.kW, batch.kG, batch.kW];
            for (let index = 0;; index = (index + 1) % 4) {
                if ((total[0] == k[0] && total[1] == k[1] && total[2] == k[2] && total[3] == k[3])
                    || sfh.hacking.scripts == sfh.hacking.max_scripts)
                { break; }

                if (total[index] == k[index] || total[index] > total[3]) { continue; }

                const host = sfh.netHost((index == 0 ? 1.7 : 1.75), batch.threads[index]);
                if (!host) { break; }

                batch.pools[index][host.name] ??= { count: 0, free: 0 };
                ++batch.pools[index][host.name].count;
                ++batch.pools[index][host.name].free;
                ++total[index];

                batch.proc.alloc[host.name] ??= 0;
                batch.proc.alloc[host.name] += host.ram;

                ++sfh.hacking.scripts;
                sfh.network[host.name].used_ram += host.ram;
                if (sfh.network[host.name].used_ram > sfh.network[host.name].ram - 1e-3) {
                    sfh.network[host.name].used_ram = sfh.network[host.name].ram;
                }
            }

            batch.depth = Math.max(total[0], total[1], total[2], total[3]);
            batch.dps   = batch.max_dps * batch.depth / batch.kW;
        }

        let req_money = sfh.goal.money - sfh.money.curr;
        if (req_money <= 0) { req_money = sfh.goal.money_total - sfh.money.curr; }
        if (req_money <= 0) { req_money = sfh.money.curr; }

        const prep_max = 2 + 2 * batches;
        let prep_count = 0;

        const prep_list = Array.from(hacking.list)
            .filter(p => !p.target.prepped && (p.target.name == "joesguns" || p.batch.max_dps >= min_dps))
            .sort((p, q) => {
                const p_time = p.prep.time + req_money / p.batch.max_dps * 1000;
                const q_time = q.prep.time + req_money / q.batch.max_dps * 1000;
                return p_time - q_time;
            })
            .slice(0, prep_max);

        for (const params of prep_list) {
            if (can_prep) { runPrep(ns, params); }

            if (params.prep.procs.size > 0) {
                ++prep_count;

                if (prep_count > prep_max) {
                    for (const proc of params.prep.procs) {
                        ns.kill(proc.pid);
                        if (proc.pids) { for (const pid of proc.pids) { ns.kill(pid); } }
                    }

                    params.prep.procs.clear();
                    can_prep = false;
                }
            }
        }
    }

    for (const params of hacking.list) {
        if (params.batch.proc) {
            if (params.batch.max_dps < min_dps) {
                params.batch.quit = true;
            } else {
                gain.money += params.batch.dps;
            }
        }
    }

    sfh.gainUpdate("scripts", gain);

    /*
    if (sfh.can.scripts) {
        runPrep(ns, hacking.params.joesguns);

        let rem_targets = Math.max(5, Math.round(hacking.list.length / 5));
        let rem_prepped = 2;

        sfh.hacking.batch_time = 0;
        for (const params of hacking.list) {
            if ((rem_targets <= 0 && !params.target.prepped) || params.target.name === "joesguns") { continue; }

            runPrep(ns, params);
            runBatch(ns, params);
            runHack(ns, params);

            --rem_targets;
            if (params.target.prepped) { --rem_prepped; }
            if (rem_targets <= 0 && rem_prepped <= 0) { break; }
        }
    }
   */
}

export async function main(ns: NS) {
    if (ns.args.length == 1 && ns.args[0] == "sfh") { await sfhMain(ns); return; }

    switch (ns.args[0]) {
        /*
        case undefined: {
            const adhoc_params = sfh.hacking.list
                .filter(p => p.job?.type === "adhoc")
                .sort((p, q) => (p.job?.end_time ?? 0) - (q.job?.end_time ?? 0));
            for (const params of adhoc_params) {
                const job   = params.job as Job & { type: "adhoc" };
                const procs = [...job.procs];
                procs.sort((p, q) => (p.end_time ?? 0) - (q.end_time ?? 0));
                
                sfh.print("{10,10} {4,d} {5,p,c*} {6,3,c*} -> {5,p,c*} {6,3,c*}",
                    params.target.name, params.target.skill,
                    (params.target.cur_money == params.target.money ? "" : "R"),
                    params.target.cur_money / params.target.money,
                    (params.target.cur_level == params.target.level ? "" : "R"),
                    Math.min(params.target.cur_level - params.target.level, 99.999),
                    (job.end_money == params.target.money ? "" : "R"),
                    job.end_money / params.target.money,
                    (job.end_level == params.target.level ? "" : "R"),
                    Math.min(job.end_level - params.target.level, 99.999));

                const calc = sfh.calc(params.target);
                for (const proc of procs) {
                    let scr = "?";
                    let ret = { profit: 0, prob: 0 };
                    if (proc.script === "/bin/hack.js") {
                        scr = "H";
                        ret = calc.runHack(proc.threads);
                    } else if (proc.script === "/bin/grow.js") {
                        scr = "G";
                        calc.runGrow(proc.threads);
                    } else if (proc.script === "/bin/weak.js") {
                        scr = "W";
                        calc.runWeak(proc.threads);
                    }

                    sfh.print("    {6} {10,10} {11,r} {8,t} -> {8,t} {5}{} {5,p,c*} {6,3,c*}{}",
                        proc.pid, proc.host, proc.ram, proc.time, proc.end_time ?? -1,
                        proc.threads, scr,
                        (calc.cur_money == calc.money ? "" : "R"),
                        calc.cur_money / calc.money,
                        (calc.cur_level == calc.level ? "" : "R"),
                        Math.min(calc.cur_level - calc.level, 99.999),
                        (scr === "H" ? sfh.sprint(" {11,m} {5,p}", ret.profit, ret.prob) : ""));
                }

                sfh.print(" ");
            }

            const batch_params = sfh.hacking.list
                .filter(p => p.job?.type === "batch")
                .sort((p, q) => (q.job?.dps ?? 0) - (p.job?.dps ?? 0));
            for (const params of batch_params) {
                const job = params.job as Job & { type: "batch" };
                sfh.print("{10,10} {4,d} {8,t} {11,m} {5,p} {} {5,d} {11,m}/s of {5,d} {11,m}/s {5,p}",
                    params.target.name, params.target.skill, job.time, job.money, job.prob,
                    (job.period < 60000 ? sfh.sprint("{6,d}ms", job.period) : sfh.sprint("{8,t}", job.period)),
                    job.depth, job.dps, params.batch.depth, params.batch.dps, job.depth / params.batch.depth);
            }
        } break;

        case "params":
        case "list": {
            sfh.print("{10,!TARGET} {4,!HACK} {5,!MONEY} {6,!LEVEL} {8,!PREP} "
                + "{11,!HACK $/s} {5,!DEPTH} {11,!BATCH $/s}");

            let scripts = 0;
            let dps     = 0;

            for (const params of sfh.hacking.list) {
                if (!params.batch) {
                    sfh.print("{10,10} (not yet calculated)", params.target.name);
                    continue;
                }

                let suffix = "";
                if (params.job?.type) {
                    const job = params.job;

                    scripts += job.scripts; 
                    dps     += job.dps;

                    suffix += sfh.sprint(" | {t} -> {t} ", job.time, job.end_time);

                    if (job.type === "adhoc") {
                        let hack_count = 0, grow_count = 0, weak_count = 0;
                        for (let proc of job.procs) {
                            hack_count += (proc.script === "/bin/hack.js" ? proc.threads : 0);
                            grow_count += (proc.script === "/bin/grow.js" ? proc.threads : 0);
                            weak_count += (proc.script === "/bin/weak.js" ? proc.threads : 0);
                        }

                        suffix += sfh.sprint("ADHOC {5,d}H {5,d}G {5,d}W -> {5,p,c*} {6,3,c*}",
                            hack_count, grow_count, weak_count,
                            (job.end_money == params.target.money ? "" : "R"),
                            job.end_money / params.target.money,
                            (job.end_level == params.target.level ? "" : "R"),
                            Math.min(job.end_level - params.target.level, 99.999));
                    } else if (job.type === "batch") {
                        suffix += sfh.sprint("BATCH {11,m}/s {d}", job.dps, (job as any).depth);
                    }
                }

                sfh.print("{10,10} {4,d} {5,p,c*} {6,3,c*} {8,t} {11,m} {5,d} {11,m}{}",
                    params.target.name, params.target.skill,
                    (params.target.cur_money == params.target.money ? "" : "R"),
                    params.target.cur_money / params.target.money,
                    (params.target.cur_level == params.target.level ? "" : "R"),
                    Math.min(params.target.cur_level - params.target.level, 99.999),
                    params.prep.time, params.single.dps, params.batch.depth, params.batch.dps,
                    suffix);
            }

            sfh.print("\nPROFIT: {m}/s {m}/hr   SCRIPTS: {d}/{d}",
                dps, dps * 60 * 60, scripts, max_scripts);
        } break;
       */

        case "quit":
        case "kill":
        case "exit": {
            for (const params of sfh.hacking.list) {
                if (params.batch.proc) { params.batch.quit = true; }
            }
        } break;

        case "tail": {
            for (const params of sfh.hacking.list) {
                if (params.batch.proc) { ns.tail(params.batch.proc.pid); }
            }
        } break;

        case "exp": {
            if (sfh.network.joesguns.prepped) {
                const calc = sfh.calc("joesguns");
                const rate = calc.exp(1) / calc.growTime() * 1000 * sfh.procs.total_ram / 1.75;
                const exp  = calc.expAt(sfh.player.hac + 1) - calc.expAt(sfh.player.hac);
                sfh.print("{0,e} exp   {0,e} exp/s   {t}", exp, rate, exp / rate * 1000);
            } else {
                sfh.print("joesguns not prepped ({0,p} {6,3})",
                    sfh.network.joesguns.cur_money / sfh.network.joesguns.money,
                    sfh.network.joesguns.cur_level - sfh.network.joesguns.level);
            }
        }
    }
}
