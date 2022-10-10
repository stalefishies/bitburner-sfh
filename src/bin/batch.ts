export async function main(ns: NS) {
    ns.disableLog("ALL");

    const target = sfh.network[String(ns.args[0])];
    if (target == null) { throw new Error(`Trying to batch invalid target ${ns.args[0]}`); }

    type Params = SFH["hacking"]["params"][""]["batch"] & { proc: Required<Proc> };
    const params = sfh.hacking.params[target.name]?.batch as Params;

    if (params == null) {
        throw new Error(`Could not get batch params for ${target.name}`);
    } else if (params.proc == null) {
        throw new Error(`Tried to run /bin/batch.js on ${target.name} without proc attached`);
    }

    const { t0, period, kW, kG, kH, threads, proc, delay, running } = params;
    let   hac    = 0;
    const hac_lo = params.hac[0];
    const hac_hi = params.hac[1];

    const k       = [kH, kW, kG, kW];
    const scripts = ["/bin/hack.js", "/bin/weak.js", "/bin/grow.js", "/bin/weak.js"];

    function getScript(i: number, offset = 0) {
        return running[i][(params.batch + offset) % k[i]];
    }

    function killScript(i: number, offset = 0) {
        const script = getScript(i, offset);

        if (script.pid > 0) {
            ns.kill(script.pid);
            proc.pids!.delete(script.pid);
            ++params.pools[i][script.host].free;
        }

        script.host = "";
        script.pid  = 0;
    }

    const killAllScripts = function() {
        for (let i = 0; i < 4; ++i) {
            for (let index = 0; index < running[i].length; ++index) {
                const script = running[i][index];

                if (script.pid > 0) {
                    ns.kill(script.pid);
                    ++params.pools[i][script.host].free;
                }

                script.host = "";
                script.pid  = 0;
            }
        }

        proc.pids!.clear();
    }

    function scriptRun(i: number, index: [number, number, number, number]) {
        let host = "";
        for (const [this_host, { free }] of Object.entries(params.pools[i])) {
            if (free > 0) { host = this_host; break; }
        }

        if (host != "") {
            --params.pools[i][host].free;
            return host;
        }
    }

    //const log = function(...args: any[]) {
    //    ns.print("\x1B[37m" + params.batch.toFixed(0).padStart(5) + "\x1B[0m " + sfh.sprint(...args));
    //}

    const time_epoch = performance.now();
    ns.print(`Script starting at ${new Date(Date.now()).toLocaleTimeString()}`);
    ns.print(`First batch due at ${new Date(Date.now()
        + kW * period - 4 * t0).toLocaleTimeString()}`);

    for (params.batch = 0;; ++params.batch) {
        const batch = params.batch;

        const time_begin = time_epoch + batch * period;
        await ns.sleep(time_begin - performance.now());
        const time_delay = performance.now() - time_begin;

        params.log.push({
            batch, hac: sfh.player.hac, quit: false,
            loop: time_delay, money: 1, level: 0,
            killed:   [false, false, false, false],
            late:     [false, false, false, false],
            dispatch: [false, false, false, false],
        });
        const log = params.log[params.log.length - 1];
        
        let dispatch = (time_delay < t0);

        for (let i = 0; i < 4; ++i) {
            const pid = getScript(i).pid;
            if (pid == 0) {
                log.killed[i] = true;
            } else if (ns.isRunning(pid)) {
                log.late[i] = true;
            }

            killScript(i);
        }

        if (params.quit) {
            log.quit = true;
            killAllScripts();
            break;
        }

        if (sfh.player.hac != hac) {
            hac = sfh.player.hac;

            const hack_time = ns.formulas.hacking.hackTime(target.server, sfh.player.player);
            const grow_time = 3.2 * hack_time;
            const weak_time = 4.0 * hack_time;

            delay[0] = kH * period - 4 * t0 - hack_time,
            delay[1] = kW * period - 3 * t0 - weak_time,
            delay[2] = kG * period - 2 * t0 - grow_time,
            delay[3] = kW * period - 1 * t0 - weak_time
        }

        if (hac < hac_lo || hac > hac_hi) {
            log.quit = true;
            killAllScripts();
            break;
        }

        target.cur_money = ns.getServerMoneyAvailable(target.name);
        target.cur_level = ns.getServerSecurityLevel(target.name);

        if (target.cur_level > target.level) {
            log.level = target.cur_level - target.level;

            // Kill the hack and grow about to land
            killScript(0, 1);
            killScript(2, 1);

            // Skip the upcoming dispatch since the security is raised
            dispatch = false;
        } else if (target.cur_money < target.money) {
            log.money = target.cur_money / target.money;

            // Kill the hack about to land
            killScript(0, 1);
        } else {
            let have_hwgw = false;
            for (let i = 0; i < kH; ++i) {
                if (getScript(0, i).pid > 0 && getScript(1, i).pid > 0
                    && getScript(2, i).pid > 0 &&getScript(3, i).pid > 0)
                { have_hwgw = true; break; }

                killScript(0, i); killScript(1, i); killScript(2, i); killScript(3, i);
            }

            if (!have_hwgw) {
                for (let i = kH; i < kG; ++i) {
                    if (getScript(1, i).pid > 0 && getScript(2, i).pid > 0
                        && getScript(3, i).pid > 0) { break; }

                    killScript(1, i); killScript(2, i); killScript(3, i);
                }
            }
        }

        if (dispatch) {
            for (let i = 0; i < 4; ++i) {
                let host = "";
                for (const [this_host, { free }] of Object.entries(params.pools[i])) {
                    if (free > 0) { host = this_host; break; }
                }
                if (!host) { continue; }

                if (i == 0) {
                    if (getScript(1, kH).pid <= 0 || getScript(2, kH).pid <= 0
                        || getScript(3, kH).pid <= 0) { continue; }
                } else if (i == 2) {
                    if (getScript(3, kG).pid <= 0) { continue; }
                }

                const pid = ns.exec(scripts[i], host, threads[i],
                    target.name, time_begin + delay[i]);

                if (pid > 0) {
                    log.dispatch[i] = true;
                    const script = getScript(i);

                    script.pid  = pid;
                    script.host = host;

                    --params.pools[i][host].free;
                    proc.pids.add(pid);
                }
            }

            if (getScript(1).pid > 0 && getScript(3).pid <= 0) {
                killScript(1);
                log.dispatch[1] = false;
            }
        }
    }
}
