import { NS } from "netscript";
import * as S from "sfh";
import { fmtp, fmtt, fmtm, fmtr } from "/sfh/lib.js";

let min_dps = 0;
let scripts = 0;

const max_scripts = 10000;
const backdoor_names = new Set<string>();

function updateMinDPS(dps: number) {
    if (dps >= 100e6) { min_dps = Math.max(min_dps, dps / 20); }
}

function updateParamsPrep(params: S.HackingParams) {
    if (params.target?.name == null) {
        throw new Error(`Tried to update prep params for invalid target ${params.target}`);
    }

    params.prep ??= {} as any;
    if (params.target.prepped || params.job?.type === "batch") {
        params.prep.time  = 0;
        params.prep.money = params.target.money;
        params.prep.level = params.target.level;
        return;
    }

    const init_money = params.job?.end_money ?? params.target.cur_money;
    const init_level = params.job?.end_level ?? params.target.cur_level;
    if (params.prep?.money === init_money && params.prep?.level === init_level
        && params.skill === sfh.player.skill) { return; }

    params.prep.time  = Math.max(0, (params.job?.end_time ?? 0) - sfh.time.now);
    params.prep.money = init_money;
    params.prep.level = init_level;

    const max_threads = Math.floor(sfh.procs.total_ram / 1.75);
    if (max_threads < 1) {
        params.prep.time = Number.POSITIVE_INFINITY;
    } else {
        const calc = sfh.calc(params.target);
        calc.cur_money = init_money;
        calc.cur_level = init_level;

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
                params.prep.time += cur_time;
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

        params.prep.time += cur_time;
    }
}

function updateParamsHack(params: S.HackingParams, t0 = 80) {
    if (params.target?.name == null) {
        throw new Error(`Tried to update hack params for invalid target ${params.target}`);
    } else if (params?.skill === sfh.player.skill || params.job?.type === "batch") {
        return;
    } else if (params.target.tH < t0) {
        t0 = params.target.tH;
    }

    params.job ??= null;
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
    const prep_time    = Math.ceil(single_threads * 1.75 * 4 / sfh.procs.total_ram) * params.target.tW;
    params.single.dps  = single.profit * 1000 / (prep_time + params.target.tH);

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

    params.dps = Math.max(params.single.dps, params.batch.dps);
    return params;
}

function runPrep(ns: NS, params: S.HackingParams) {
    if (params == null || (params.job && params.job.type !== "adhoc") || !sfh.can.scripts) { return; }

    const job: S.HackingJob = params.job ?? {
        type: "adhoc", procs: new Set(), time: sfh.time.now, end_time: 0, scripts: 0, dps: 0,
        end_money: params.target.cur_money, end_level: params.target.cur_level
    };

    if (job.end_money == params.target.money && job.end_level == params.target.level) { return; }

    const calc = sfh.calc(params.target);
    calc.cur_money = job.end_money;
    calc.cur_level = job.end_level;

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
        job.end_money = calc.cur_money;
        job.end_level = calc.cur_level;

        params.job = job;
        net_sort = true;
    }

    if (net_sort) { sfh.netSort(); }
}

function runHack(ns: NS, params: S.HackingParams) {
    if (params == null || params.job != null || !params.target.prepped || !sfh.can.scripts
        || params.single.dps < min_dps || scripts >= max_scripts) { return; }

    const host = sfh.netHost(1.7, 1, params.single.threads);
    if (!host) { return; }

    const dps = params.single.dps * host.threads / params.single.threads;
    if (dps < min_dps || dps * 5 < params.single.dps) { return; }

    const calc = sfh.calc(params.target);
    calc.runHack(host.threads);

    const time = sfh.time.now + calc.hackTime();
    const job: S.HackingJob = { type: "adhoc", procs: new Set(), time: sfh.time.now, end_time: time,
        scripts: 1, dps, end_money: calc.cur_money, end_level: calc.cur_level };
    
    if (sfh.netProc(job.procs, ns.exec.bind(ns), "/bin/hack.js", host, params.target.name)) {
        job.end_time = time;
        ++scripts;
        updateMinDPS(job.dps);
        params.job = job;
    }
}

let batch_time = 0;
function runBatch(ns: NS, params: S.HackingParams) {
    if (params == null || params.job != null || !params.target.prepped
        || !sfh.can.scripts || !sfh.can.batching || sfh.procs.exp.size > 0
        || params.batch.dps < min_dps || 4 * params.batch.depth >= max_scripts) { return; }

    const job: S.HackingJob = { type: "batch", procs: new Set(), time: sfh.time.now, end_time: 0,
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
    if (job.dps < min_dps || job.dps * 25 < params.single.dps || job.dps * 10 < params.batch.dps) { return; }

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

    if (backdoor_names.size == 0) {
        for (const name of [
            "w0r1d_d43m0n", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z",
            "ecorp", "megacorp", "b-and-a", "blade", "nwo", "clarkinc",
            "omnitek", "4sigma", "kwaigong", "fulcrumtech", "fulcrumassets"
        ]) { backdoor_names.add(name); }
        for (const node of sfh.nodes(n => !n.owned)) { backdoor_names.add(node.name); }
    }

    if (!sfh.procs.corp?.alive) { sfh.procs.corp = null; }
    if (sfh.can.scripts && sfh.can.corp && !sfh.procs.corp) {
        const home = sfh.network.home;
        const ram  = ns.getScriptRam("/sfh/corp.js");
        if (home.ram - home.used_ram >= ram) {
            const host = { name: "home", ram, threads: 1 };
            sfh.procs.corp = sfh.netProc(null, ns.exec.bind(ns), "/sfh/corp.js", host);
            if (sfh.procs.corp?.alive) { sfh.netSort(); }
        }
    }
    if (sfh.procs.corp?.alive) { ++scripts; }

    if (!sfh.procs.backdoor?.alive) { sfh.procs.backdoor = null; }
    if (sfh.can.scripts && !sfh.procs.backdoor) {
        let target = null;
        for (const name of backdoor_names) {
            const node = sfh.network[name];
            if (!node || (!(sfh.can.bitnode && sfh.can.automate) && node.name === "w0r1d_d43m0n")) { continue; }

            if (!node.backdoor && node.root && sfh.player.skill >= node.skill) {
                target = node;
                break;
            }
        }

        if (target) {
            const host = sfh.netHost(ns.getScriptRam("/bin/backdoor.js"), 1);
            sfh.procs.backdoor = sfh.netProc(null, ns.exec.bind(ns),
                "/bin/backdoor.js", host, target.name);
            if (sfh.procs.backdoor?.alive) { sfh.netSort(); }
        }
    }
    if (sfh.procs.backdoor?.alive) { ++scripts; }

    if (!sfh.procs.contract?.alive) { sfh.procs.contract = null; }
    if (sfh.can.scripts && sfh.can.contracts && !sfh.procs.contract) {
        for (const node of sfh.nodes()) {
            const files = ns.ls(node.name, ".cct");
            if (files.length == 0) { continue; }

            const host = sfh.netHost(ns.getScriptRam("/bin/cct.js"), 1);
            sfh.procs.contract = sfh.netProc(null, ns.exec.bind(ns),
                "/bin/cct.js", host, node.name, files[0])
            if (sfh.procs.contract?.alive) { sfh.netSort(); break; }
        }
    }
    if (sfh.procs.contract?.alive) { ++scripts; }

    sfh.state.exp_skill = 0;
    sfh.state.exp_time  = 0;
    if (sfh.state.has_basics && sfh.network.joesguns.prepped) {
        const jg  = sfh.network.joesguns;
        const plr = sfh.player;
        const bn  = sfh.player.bitnode;
        const skill_k = 1 / (32 * plr.skill_mult * bn.skill);

        // divide this by (skill + 50) and thread count to get ms per exp
        const exp_time = 16000 * (2.5 * jg.skill * jg.level + 500)
            / (3 + 0.3 * jg.base_level)
            / (plr.time_mult * plr.int_mult(1) * plr.skill_exp_mult * bn.skill_exp)

        // time for (skill -> skill + 1) = exp_const / threads / (skill + 50) * exp(skill / skill_mult)
        const exp_const = exp_time * Math.exp(6.25) * (Math.exp(skill_k) - 1);
        const T = (sfh.procs.total_ram - sfh.network.home.ram) / 1.75 - (sfh.procs.pools.length - 1) / 2;

        let total_time  = 0;
        const max_time  = 10 * 60 * 1000;
        const max_skill = 400 * plr.skill_mult * bn.skill;
        for (sfh.state.exp_skill = 1; sfh.state.exp_skill < max_skill; ++sfh.state.exp_skill) {
            const level_time = exp_const / T / (sfh.state.exp_skill + 50)
                * Math.exp(skill_k * sfh.state.exp_skill);
            if (total_time + level_time > max_time) { break; }

            total_time += level_time;
            if (sfh.state.exp_skill > sfh.player.skill) { sfh.state.exp_time += level_time; }
        }

        const rem_exp = Math.exp(skill_k * (sfh.player.skill + 1) + 6.25) - 534.5 - sfh.player.skill_exp;
        sfh.state.exp_time += exp_time * rem_exp / (sfh.player.skill + 50) / T;
    }

    const run_share = sfh.state.work?.goal && sfh.state.work?.org?.faction;
    const run_exp   = sfh.player.skill < sfh.state.exp_skill;

    for (const proc of sfh.procs.sharing) { if (!proc.alive) { sfh.procs.sharing.delete(proc); } }
    if (sfh.can.scripts && run_share) {
        for (const proc of sfh.procs.exp) {
            if (!sfh.network[proc.host].owned) {
                ns.kill(proc.pid);
                sfh.procs.exp.delete(proc);
            }
        }

        const share_ram = Math.max(sfh.network.home.ram / 64, 4);
        const nodes = sfh.nodes(n => !n.owned && n.root && n.ram >= 4 && n.ram <= share_ram && n.used_ram == 0);
        for (const node of nodes) {
            const host = { name: node.name, ram: node.ram, threads: Math.floor(node.ram / 4) };
            sfh.netProc(sfh.procs.sharing, ns.exec.bind(ns), "/bin/share.js", host);
        }
        sfh.netSort();
    } else {
        for (const proc of sfh.procs.sharing) {
            ns.kill(proc.pid);
            sfh.procs.sharing.delete(proc);
        }
    }
    scripts += sfh.procs.sharing.size;

    for (const proc of sfh.procs.exp) { if (!proc.alive) { sfh.procs.exp.delete(proc); } }
    const raw_skill_exp = sfh.player.skill_exp / sfh.player.skill_exp_mult / sfh.player.bitnode.skill_exp;
    if (sfh.can.scripts && run_exp) {
        const nodes = sfh.nodes(n => n.name !== "home" && n.root && n.ram >= 2 && n.used_ram == 0);
        for (const node of nodes) {
            if (run_share && !node.owned) { continue; }
            const host = { name: node.name, ram: node.ram, threads: Math.floor(node.ram / 1.75) };
            sfh.netProc(sfh.procs.exp, ns.exec.bind(ns), "/bin/grow.js", host, "joesguns", Number.POSITIVE_INFINITY);
        }
        sfh.netSort();
    } else {
        for (const proc of sfh.procs.exp) {
            ns.kill(proc.pid);
            sfh.procs.exp.delete(proc);
        }
    }
    scripts += sfh.procs.exp.size;

    for (const target of sfh.nodes(n => n.target)) {
        let params = hacking[target.name];
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
            }
        } else {
            params = hacking[target.name] = { target } as S.HackingParams;
        } 

        updateParamsPrep(params);
        updateParamsHack(params);
    }

    if (sfh.can.scripts) {
        runPrep(ns, hacking.joesguns);

        const all_params = Object.values(hacking).filter(p => p.target.name !== "joesguns");
        let req_profit = sfh.state.goal.money - sfh.player.money;
        if (req_profit <= 0) { req_profit = sfh.player.money; }

        all_params.sort((p: S.HackingParams, q: S.HackingParams) => {
            const p_time = p.prep.time + req_profit / p.dps * 1000;
            const q_time = q.prep.time + req_profit / q.dps * 1000;
            return p_time - q_time;
        });

        batch_time = 0;
        for (const params of all_params) {
            runPrep(ns, params);
            runBatch(ns, params);
            runHack(ns, params);

            if (sfh.procs.free_ram < sfh.procs.total_ram / 32) { break; }
        }
    }
}

export async function main(ns: NS) {
    if (ns.args.length == 1 && ns.args[0] == "sfh") { await sfhMain(ns); return; }

    switch (ns.args[0]) {
        case undefined: {
            sfh.print("{10,!TARGET} {4,!HACK} {5,!MONEY} {6,!LEVEL} {8,!PREP} "
                + "{11,!HACK $/s} {5,!DEPTH} {11,!BATCH $/s}");
            let params_list = Object.values(sfh.hacking).sort(function(p, q) {
                const p_time = p.prep.time + sfh.player.money / p.dps * 1000;
                const q_time = q.prep.time + sfh.player.money / q.dps * 1000;
                return p_time - q_time;
            });

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
                            (job.end_money == params.target.money ? "" : "R"),
                            job.end_money / params.target.money,
                            (job.end_level == params.target.level ? "" : "R"),
                            Math.min(job.end_level - params.target.level, 99.999)));
                    } else if (job.type === "batch") {
                        suffix.push(...sfh.format("BATCH {11,m}/s {d}", job.dps, (job as any).depth));
                    }
                }

                sfh.print("{10,10} {4,d} {5,p,c*} {6,3,c*} {8,t} {11,m} {5,d} {11,m}{a}",
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

        case "exp": {
            if (sfh.network.joesguns.prepped) {
                const calc = sfh.calc("joesguns");
                const rate = calc.exp(1) / calc.growTime() * 1000 * sfh.procs.total_ram / 1.75;
                const exp  = calc.expAt(sfh.player.skill + 1) - calc.expAt(sfh.player.skill);
                sfh.print("{0,e} exp   {0,e} exp/s   {t}", exp, rate, exp / rate * 1000);
            } else {
                sfh.print("joesguns not prepped ({0,p} {6,3})",
                    sfh.network.joesguns.cur_money / sfh.network.joesguns.money,
                    sfh.network.joesguns.cur_level - sfh.network.joesguns.level);
            }
        }
    }
}
