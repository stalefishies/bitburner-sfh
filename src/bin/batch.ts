import { NS } from "netscript";
import * as S from "sfh";

export async function main(ns: NS) {
    ns.disableLog("ALL");

    const target = sfh.network[ns.args[0] as string];
    if (target == null) { throw new Error(`Trying to batch invalid target ${ns.args[0]}`); }

    const job = sfh.hacking[target.name]?.job;
    if (job == null) {
        throw new Error(`Could not get batch job for ${target.name}`);
    } else if (job.type != "batch") {
        throw new Error(`Tried to run batch with job type ${job.type} for ${target.name}`);
    } else if (job.procs.size != 1) {
        throw new Error(`Tried to run batch with ${job.procs.size} procs attached (expected 1)`);
    }

    const [proc] = job.procs;
    if (proc.pids == null || proc.alloc == null) {
        throw new Error("Tried to run batch with no PID set or alloc table");
    } else if (proc.pids.size !== 0) {
        throw new Error(`Tried to run batch with ${proc.pids.size} PIDs attached to the proc (expected 0)`);
    }

    const pids = Array.from(Array(job.depth), () => Array(4).fill(0));
    const killAllScripts = function() {
        for (let index = 0; index < pids.length; ++index) {
            for (let i = 0; i < 4; ++i) { ns.kill(pids[index][i]); }
        }

        proc.pids!.clear();
    }
    
    const hosts = job.hosts;
    if (hosts.length != job.depth) {
        throw new Error(`Tried to run batch with ${hosts.length} hosts (expected ${job.depth})`);
    }

    const kH = Math.ceil(target.tH / job.period);
    const kG = Math.ceil(target.tG / job.period);

    const delay = [
        job.depth * job.period - 4 * job.t0 - target.tH,
        job.depth * job.period - 3 * job.t0 - target.tW,
        job.depth * job.period - 2 * job.t0 - target.tG,
        job.depth * job.period - 1 * job.t0 - target.tW
    ];

    let error_value = 0;
    const error_max = 100;

    const time_begin = performance.now();
    ns.print(`Script starting at ${new Date(Date.now()).toLocaleTimeString()}`);
    ns.print(`First batch due at ${new Date(Date.now()
        + job.depth * job.period - 4 * job.t0).toLocaleTimeString()}`);

    let ending    = false;
    let max_batch = Infinity;
    for (let batch = 0; batch < max_batch; ++batch) {
        const index = batch % job.depth;

        const batch_begin = time_begin + batch * job.period;
        await ns.asleep(batch_begin - performance.now());
        const batch_lag = performance.now() - batch_begin;
        
        let dispatch = true;
        if (batch_lag >= job.t0) {
            ns.print(ns.sprintf("WARN: %4d loop started %dms late", batch, batch_lag));
            error_value += 3;
            dispatch = false;
        }

        for (let i = 0; i < 4; ++i) {
            if (pids[index][i] != 0) {
                if (ns.isRunning(pids[index][i])) {
                    ns.print(ns.sprintf("WARN: %4d %d finished late", batch, i));
                    ns.kill(pids[index][i]);
                    error_value += 1;
                }

                proc.pids.delete(pids[index][i]);
                pids[index][i] = 0;
            }
        }

        if (job.quit) {
            ns.print(ns.sprintf("ERROR: %4d Received quit message", batch));
            killAllScripts();
            break;
        }

        target.cur_money = ns.getServerMoneyAvailable(target.name);
        target.cur_level = ns.getServerSecurityLevel(target.name);
        const next_index = (index + 1) % job.depth;

        if (target.cur_level > target.level) {
            ns.print(ns.sprintf("WARN: %4d Security level raised by %.3f", batch, target.cur_level - target.level));
            error_value += 5;

            // To recover, kill the hack and grow about to land
            ns.kill(pids[next_index][0]);
            ns.kill(pids[next_index][2]);

            // Kill hacks/grows in batches that would be affected
            ns.kill(pids[(index + kH) % job.depth][0]);
            ns.kill(pids[(index + kG) % job.depth][0]);
            ns.kill(pids[(index + kG) % job.depth][2]);

            // Skip the upcoming dispatch since the weakens would be affected
            dispatch = false;
        } else if (target.cur_money < target.money) {
            ns.print(ns.sprintf("WARN: %4d Money too low, at %.1f%%", batch, 100 * target.cur_money / target.money));
            error_value += 2;
            
            // To recover, kill the hack about to land
            ns.kill(pids[next_index][0]);
        } else {
            // We didn't need to recover, so if there's no hack coming up, kill the next batch about to land
            if (pids[next_index][0] == 0) {
                for (let i = 1; i < 4; ++i) {
                    ns.kill(pids[next_index][i]);
                    pids[next_index][i] = 0;
                }
            }

            error_value = Math.max(error_value - 1, 0);
        }

        // If our hacking skill increases, kill any batch with a sleeping script and set us up to end
        if (ending) {
            job.scripts -= 4;
            dispatch = false;
        } else if (sfh?.player?.skill != job.skill) {
            ns.print(ns.sprintf("ERROR: %4d Hacking skill increased to %d", batch, sfh.player.skill));

            let end_width = 0;
            for (let offset = 0; offset < kH; ++offset) {
                if (pids[(index + offset) % job.depth][0] > 0) { end_width = offset + 1; }
            }

            for (let offset = end_width; offset < job.depth; ++offset) {
                for (let i = 0; i < 4; ++i) { ns.kill(pids[(index + offset) % job.depth][i]); }
            }

            ending       = true;
            max_batch    = batch + end_width;
            job.end_time = time_begin + (max_batch - 1) * job.period + (Date.now() - performance.now());
            job.scripts  = (end_width - 1) * 4 + 1;
            dispatch     = false;

            ns.print(ns.sprintf("WARN:  %4d Finishing %d batches (until %s)",
                batch, end_width, new Date(job.end_time).toLocaleTimeString()));
        }

        if (dispatch) {
            let dispatch_error = false;

            for (let i = 0; i < 4; ++i) {
                const script = ["/bin/hack.js", "/bin/weak.js", "/bin/grow.js", "/bin/weak.js"][i];
                const event_begin = batch_begin + delay[i];
                pids[index][i] = ns.exec(script, hosts[index][i], job.threads[i], target.name, event_begin);

                if (pids[index][i] == 0) {
                    ns.print(ns.sprintf("WARN: %4d Could not run %d on %s", batch, i, hosts[index][i]));
                    error_value += 20;
                    dispatch_error = true;
                    break;
                } else {
                    proc.pids.add(pids[index][i]);
                }
            }

            if (dispatch_error) { for (let i = 0; i < 4; ++i) { ns.kill(pids[index][i]); } }
        }

        if (error_value > error_max) {
            ns.print(ns.sprintf("ERROR: %4d Too many errors, giving up", batch));
            killAllScripts();
            break;
        }
    }
}
