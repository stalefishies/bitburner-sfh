import { NS } from "netscript";
import * as S from "sfh";
import { fmtp, fmtt, fmtm, fmtr } from "/sfh/lib.js";

let min_dps = 0;
let scripts = 0;
const max_scripts = 10000;

function updateMinDPS(dps: number) {
    if (dps >= 100e6) { min_dps = Math.max(min_dps, dps / 20); }
}

function updateParams(params: S.HackParams, t0 = 80) {
    if (params.target?.name == null) {
        throw new Error(`Tried to update hack params for invalid target ${params.target}`);
    } else if (params.job != null) {
        throw new Error(`Tried to update hack params for ${params.target.name} with job in progress`);
    } else if (params.target.tH < t0) {
        t0 = params.target.tH;
    }

    params.job = null;
    params.skill = sfh.player.skill;
    const mult = sfh.player.bitnode.hack_profit;
    const calc = sfh.calc(params.target).setup();
    const frac = calc.hackFrac();

    params.single ??= {} as any;
    params.single.threads = Math.floor(Math.min(sfh.procs.max_ram / 3.4, (frac == 0 ? 0 : 0.95 / frac)));
    let single = calc.runHack(params.single.threads);
    params.single.prob  = single.prob;
    params.single.money = single.profit / single.prob;

    let single_threads = calc.solveWeak().threads;
    single_threads    += calc.solveGrow().threads;
    single_threads    += calc.solveWeak().threads;
    params.single.prep_time = Math.ceil(single_threads * 1.75 * 4 / sfh.procs.total_ram) * params.target.tW;
    params.single.dps = single.profit * 1000 / (params.target.tH + params.single.prep_time);

    const schedule = calc.batchSchedule(t0);
    params.batch ??= {} as any;
    params.batch.t0     = t0;
    params.batch.depth  = schedule.depth;
    params.batch.period = schedule.period;

    let threads: [number, number, number, number] = [0, 0, 0, 0];
    let max_frac  = 0.95;
    let max_depth = 0;

    // calculate batch params at one hacking level up to avoid overhacking on the cooldown
    ++calc.skill;
    while (max_depth <= 0) {
        calc.setup();
        const hmain = calc.solveHack(max_frac, calc.level);
        if (hmain.threads == 0) { break; }
        const hweak = calc.solveWeak(calc.level, calc.level);
        const gmain = calc.solveGrow(calc.money, calc.level);
        const gweak = calc.solveWeak(calc.level, calc.level);

        threads[0] = hmain.threads;
        threads[1] = hweak.threads;
        threads[2] = gmain.threads;
        threads[3] = gweak.threads;

        const total_ram = 1.7 * threads[0] + 1.75 * (threads[1] * threads[2] * threads[3]);
        const waste_ram = sfh.procs.pools.length * total_ram / 8;
        max_depth = Math.floor((sfh.procs.total_ram - waste_ram) / total_ram);
        max_frac  = (max_frac > 0.5 ? 0.5 : max_frac / 2);
    }

    if (max_depth <= 0) {
        params.batch.threads = [0, 0, 0, 0];
        params.batch.dps = 0;
    } else {
        const money = threads[0] * Math.floor(frac * params.target.money) * mult;
        params.batch.threads = threads;
        params.batch.dps = single.prob * money * 1000 / schedule.period;
    }

    return params;
}

function runPrep(ns: NS, params: S.HackParams) {
    if (params == null || (params.job && params.job.type !== "adhoc") || !sfh.can.scripts) { return; }
    const job: S.HackJob = params.job ? params.job : {
        type: "adhoc", procs: new Set(), time: sfh.time.now, end_time: 0, scripts: 0, dps: 0,
        money: params.target.cur_money, level: params.target.cur_level
    };

    if (job.money == params.target.money && job.level == params.target.level) { return; }

    const calc = sfh.calc(params.target);
    calc.cur_money = job.money;
    calc.cur_level = job.level;

    const hack_time = calc.hackTime(calc.cur_level);
    const grow_time = 3.2 * hack_time;
    const weak_time = 4.0 * hack_time;

    let time = Math.max(sfh.time.now, job.end_time);
    let net_sort = false;
    
    const max_ram = sfh.procs.total_ram / 2;
    let cur_ram = 0;
    if (params.job != null) {
        for (const proc of params.job.procs) { cur_ram += proc.ram; }
    }

    while (scripts < max_scripts && (calc.cur_level != calc.level || calc.cur_money != calc.money)) {
        const args: [number, number, number, boolean] =
            [calc.cur_level, calc.cur_money, calc.cur_level, false];

        let script, duration, prep, ram = 1.75;
        if (calc.cur_level > 100) {
            script   = "/bin/hack.js";
            duration = hack_time;
            prep     = calc.runHack(1, ...args);
            ram      = 1.7;
        } else if (calc.cur_level != calc.level) {
            script   = "/bin/weak.js";
            duration = weak_time;
            prep     = calc.solveWeak(calc.level, ...args)
        } else {
            script   = "/bin/grow.js";
            duration = grow_time;
            prep     = calc.solveGrow(calc.money, ...args)
        }

        const max_threads = Math.min(prep.threads, (max_ram - cur_ram) / ram);
        if (max_threads < 1) { break; }

        const host = sfh.netHost(ram, 1, prep.threads);
        if (host == null) { break; }

        const begin_time = Math.max(time - duration, sfh.time.now);
        const event_time = begin_time - sfh.time.now + performance.now();
        if (!sfh.netProc(job.procs, ns.exec.bind(ns), script, host, params.target.name, event_time)) { break; }

        ++scripts;
        ++job.scripts;
        cur_ram += ram * host.threads;

        if (script == "/bin/hack.js") {
            calc.runHack(host.threads, calc.cur_level);
        } else if (script == "/bin/grow.js") {
            calc.runGrow(host.threads, calc.cur_level);
        } else {
            calc.runWeak(host.threads, calc.cur_level);
        }

        time = begin_time + duration + 100;
        job.end_time = Math.max(job.end_time, time);
        job.money = calc.cur_money;
        job.level = calc.cur_level;

        params.job = job;
        net_sort = true;
    }

    if (net_sort) { sfh.netSort(); }
}

function runHack(ns: NS, params: S.HackParams) {
    if (params == null || params.job != null || !params.target.prepped || !sfh.can.scripts
        || params.single.dps < min_dps || scripts >= max_scripts) { return; }

    const host = sfh.netHost(1.7, 1, params.single.threads);

    if (host) {
        const dps = params.single.dps * host.threads / params.single.threads;

        if (dps >= min_dps) {
            const calc = sfh.calc(params.target);
            calc.runHack(host.threads);

            const time = sfh.time.now + calc.hackTime();
            const job: S.HackJob = { type: "adhoc", procs: new Set(), time: sfh.time.now, end_time: time,
                scripts: 1, dps, money: calc.cur_money, level: calc.cur_level };
            
            if (sfh.netProc(job.procs, ns.exec.bind(ns), "/bin/hack.js", host, params.target.name)) {
                job.end_time = time;
                ++scripts;
                updateMinDPS(job.dps);
                params.job = job;
            }
        }
    }
}

let batch_time = 0;
function runBatch(ns: NS, params: S.HackParams) {
    if (params == null || params.job != null || !params.target.prepped || !sfh.can.scripts || !sfh.can.batching
        || params.batch.dps < min_dps || 4 * params.batch.depth >= max_scripts) { return; }

    const job: S.HackJob = { type: "batch", procs: new Set(), time: sfh.time.now, end_time: 0,
        scripts: 0, dps: 0, quit: false, skill: params.skill, t0: params.batch.t0,
        depth: params.batch.depth, period: params.batch.period,
        threads: params.batch.threads, hosts: [Array(4)] as any
    };

    const host_ram = ns.getScriptRam("/bin/batch.js");
    const host = sfh.netHost(host_ram, 1);
    if (!host) { return; }

    host.alloc = {};
    let max_depth = 0;
    let ram = [1.7, 1.75, 1.75, 1.75];
    let i = 0;

    allocate: for (const pool of sfh.pools()) {
        let free = pool.ram - pool.used_ram;
        while (free >= params.batch.threads[i] * ram[i]) {
            free -= params.batch.threads[i] * ram[i];
            job.hosts[max_depth][i] = pool.name;

            host.alloc[pool.name] ??= 0;
            host.alloc[pool.name] += params.batch.threads[i] * ram[i];

            if (++i == 4) {
                if (++max_depth >= params.batch.depth) { break allocate; }
                job.hosts.push(Array(4) as any);
                i = 0;
            }
        }
    }

    if (max_depth <= 0) { return; }

    if (job.depth != max_depth) {
        const schedule = sfh.calc(params.target).batchSchedule(job.t0, max_depth);
        job.depth   = schedule.depth
        job.period  = schedule.period;
        job.scripts = 4 * job.depth + 1;
    }

    job.dps = params.batch.dps * params.batch.period / job.period;
    if (job.dps < min_dps) { return; }

    const rem_hosts = job.hosts.splice(job.depth);
    for (const host_set of rem_hosts) {
        for (let i = 0; i < 4; ++i) {
            if (host_set[i]) { host.alloc[host_set[i]] -= params.batch.threads[i] * ram[i]; }
        }
    }

    const start_time = Math.max(batch_time - job.depth * job.period, sfh.time.now + 2000);
    batch_time = start_time + job.depth * job.period;

    if (sfh.netProc(job.procs, ns.exec.bind(ns), "/bin/batch.js", host, params.target.name)) {
        params.job = job;

        scripts += job.scripts;
        updateMinDPS(job.dps);
    }
}

async function sfhMain(ns: NS) {
    const hacking = sfh.hacking;

    scripts = 0;
    min_dps = 1;

    /*
    TODO: weighting prep by existing prep jobs doesn't work since the job is removed before we sort params_prep

    TODO: what is the best choice of server to prep/hack based on timescale
    timescales:
        money goal / max dps and/or rep time
        exp grinding time - time taken until exp grind will stop? time taken until some fixed exp amount?
    
    strategy:
        for each prep target:
            create a calc
            if level > 100 runHack(1)
            calculate max threads: total_ram / 1.75
            running max_threads threads at a time, calculate time taken to prep to min
                (use weak_time for each max_threads block, even if it's all grow - in reality it'll fragment)
            using DPS, calculate time taken to money goal
        sort by shortest time
        
        if we don't have a money goal, just go for shortest time to weaken

        ALSO: prep targets don't have to have node.prepped be false to run prep if we're currently running a hack
   */

    for (const target of sfh.nodes(n => n.target)) {
        const params = hacking[target.name];
        if (params) {
            if (params.job) {
                for (const proc of params.job.procs) {
                    if (proc.alive) { break; }
                    params.job.procs.delete(proc);
                }

                if (params.job.procs.size === 0) { params.job = null; }
            }

            if (params.job) {
                scripts += params.job.scripts;
                updateMinDPS(params.job.dps);
            } else if (params.skill != sfh.player.skill) {
                updateParams(params);
            }
        } else {
            hacking[target.name] = { target } as S.HackParams;
            updateParams(hacking[target.name]);
        } 
    }

    if (!sfh.can.scripts) { return; }

    for (const params of Object.values(hacking)) {
        params.prep_time = 0;
        if (!params.target.prepped) {
            const max_threads = Math.floor(sfh.procs.total_ram / 1.75);
            if (max_threads < 1) {
                params.prep_time = Number.POSITIVE_INFINITY;
            } else {
                const calc = sfh.calc(params.target);
                if (calc.cur_level > 100) { calc.cur_level = 100; }

                let cur_threads = 0;
                let cur_time = calc.weakTime(calc.cur_level);

                while (calc.cur_money != params.target.money && calc.cur_level != params.target.level) {
                    const args: [number, number, number, boolean] =
                        [calc.cur_level, calc.cur_money, calc.cur_level, false];

                    let prep, grow = false;
                    if (calc.cur_level != calc.level) {
                        prep = calc.solveWeak(calc.level, ...args);
                    } else {
                        prep = calc.solveGrow(calc.money, ...args);
                        grow = true;
                    }

                    let threads = Math.min(prep.threads, max_threads - cur_threads);

                    if (threads < 1) {
                        params.prep_time += cur_time;
                        cur_time = calc.weakTime(calc.cur_level);
                        cur_threads = 0;
                        threads = Math.min(prep.threads, max_threads);
                    }

                    if (grow) {
                        calc.runGrow(threads, calc.cur_level);
                    } else {
                        calc.runWeak(threads, calc.cur_level);
                    }

                    cur_threads += threads;
                }

                params.prep_time += cur_time;
            }
        }

        params.hack_time = sfh.state.goal.money / Math.max(params.single.dps, params.batch.dps) * 1000;
    }

    const all_params = Object.values(hacking).filter(p => p.target.name !== "joesguns");
    const sort_func = (p: S.HackParams, q: S.HackParams) => {
        let p_time = p.prep_time + p.hack_time;
        let p_dps  = Math.max(p.single.dps, p.batch.dps)
        let q_time = q.prep_time + q.hack_time;
        let q_dps  = Math.max(q.single.dps, q.batch.dps)

        if (sfh.state.goal.money < 1e6) {
            return q_dps * (3.6e6 - q.prep_time) - p_dps * (3.6e6 - p.prep_time);
        } else if (p_time === q_time) {
            return q_dps - p_dps;
        } else {
            return p_time - q_time;
        }
    }

    const params_prep = all_params.filter(p => !p.target.prepped).sort(sort_func);
    const params_hack = all_params.filter(p =>  p.target.prepped).sort(sort_func);

    for (const proc of sfh.procs.exp) { if (!proc.alive) { sfh.procs.exp.delete(proc); } }

    let exp_grind = false;
    if (sfh.network.joesguns.prepped) {
        const calc = sfh.calc("joesguns");
        const rate = calc.exp(1) / calc.growTime() / 1.75;
        const exp  = calc.expAt(sfh.player.skill + 1) - calc.expAt(sfh.player.skill);

        exp_grind = exp / (rate * sfh.procs.total_ram) < 15000;
    }

    if (exp_grind) {
        if (params_prep.length > 0) { runPrep(ns, params_prep[0]); }
        if (params_hack.length > 0) { runHack(ns, params_hack[0]); }
        if (params_prep.length > 1) { runPrep(ns, params_prep[1]); }
        if (params_hack.length > 1) { runHack(ns, params_hack[1]); }
        if (params_prep.length > 2) { runPrep(ns, params_prep[2]); }

        for (const pool of sfh.pools()) {
            const threads = Math.floor((pool.ram - pool.used_ram) / 1.75);
            if (threads < 1) { continue; }

            const host = { name: pool.name, ram: 1.75 * threads, threads };
            const proc = sfh.netProc(sfh.procs.exp, ns.exec.bind(ns), "/bin/grow.js", host, "joesguns", 0);
            if (!proc) { break; }
        }

        sfh.netSort();
    } else {
        runPrep(ns, hacking.joesguns);

        batch_time = 0;
        for (let i = 0; i < params_prep.length || i < params_hack.length; ++i) {
            if (i < params_prep.length) {
                runPrep(ns, params_prep[i]);
                scripts += params_prep[i].job?.scripts ?? 0;
            }

            if (i < params_hack.length) {
                runBatch(ns, params_hack[i]);
                runHack(ns, params_hack[i]);
                scripts += params_hack[i].job?.scripts ?? 0;
            }
            
            if (sfh.procs.free_ram < sfh.procs.total_ram / 32) { break; }
        }
    }
}

export async function main(ns: NS) {
    if (ns.args.length == 1 && ns.args[0] == "sfh") { await sfhMain(ns); return; }

    switch (ns.args[0]) {
        case undefined: {
            sfh.print("{10,!TARGET} {4,!HACK} {5,!MONEY} {6,!LEVEL} {8,!PREP T} {8,!HACK T} "
                + "{11,!HACK $/s} {5,!DEPTH} {11,!BATCH $/s}");
            let params_list = Object.values(sfh.hacking).sort((p, q) =>
                Math.max(q.single?.dps ?? 0, q.batch?.dps ?? 0) - Math.max(p.single?.dps ?? 0, p.batch?.dps ?? 0));

            let scripts = 0;
            let dps     = 0;

            for (const params of params_list) {
                if (!params.batch) {
                    sfh.print("{10,10} (not yet calculated)", params.target.name);
                    continue;
                }

                let suffix = [];
                if (params.job?.type) {
                    const job = params.job;

                    scripts += job.scripts; 
                    dps     += job.dps;

                    suffix.push(...sfh.format(" | {t} -> {t} ", job.time, job.end_time));

                    if (job.type === "adhoc") {
                        let hack_count = 0, grow_count = 0, weak_count = 0;
                        for (let proc of job.procs) {
                            hack_count += (proc.script === "/bin/hack.js" ? proc.threads : 0);
                            grow_count += (proc.script === "/bin/grow.js" ? proc.threads : 0);
                            weak_count += (proc.script === "/bin/weak.js" ? proc.threads : 0);
                        }

                        suffix.push(sfh.format("ADHOC W {5,d} G {5,d} H {5,d} -> {5,p,c*} {6,3,c*}",
                            weak_count, grow_count, hack_count,
                            (job.money == params.target.money ? "" : "R"),
                            job.money / params.target.money,
                            (job.level == params.target.level ? "" : "R"),
                            Math.min(job.level - params.target.level, 99.999)));
                    } else if (job.type === "batch") {
                        suffix.push(...sfh.format("BATCH {11,m}/s {d}", job.dps, (job as any).depth));
                    }
                }

                sfh.print("{10,10} {4,d} {5,p,c*} {6,3,c*} {8,t} {8,t} {11,m} {5,d} {11,m}{a}",
                    params.target.name, params.target.skill,
                    (params.target.cur_money == params.target.money ? "" : "R"),
                    params.target.cur_money / params.target.money,
                    (params.target.cur_level == params.target.level ? "" : "R"),
                    Math.min(params.target.cur_level - params.target.level, 99.999),
                    params.prep_time, params.hack_time,
                    params.single.dps, params.batch.depth, params.batch.dps,
                    suffix);
            }

            sfh.print("\nPROFIT: {m}/s {m}/hr   SCRIPTS: {d}/{d}",
                dps, dps * 60 * 60, scripts, max_scripts);
        } break;

        case "quit":
        case "kill":
        case "exit": {
            for (const params of Object.values(sfh.hacking)) {
                if (params.job?.type === "batch") { params.job.quit = true; }
            }
        } break;

        case "tail": {
            for (const params of Object.values(sfh.hacking)) {
                if (params.job?.type === "batch") {
                    const [proc] = params.job.procs;
                    ns.tail(proc.pid);
                }
            }
        } break;

        case "params": {
            for (const params of Object.values(sfh.hacking)) {
                if (params.job != null) {
                    ns.tprintf("%s\n", JSON.stringify(params.job, ["alive", "time",
                        "scripts", "dps", "quit", "skill", "t0", "depth", "period", "threads"], 4));
                }
            }
        } break;
    }
}
