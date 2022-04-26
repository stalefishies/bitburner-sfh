import { NS } from "netscript";
import * as S from "sfh";
import { fmtm, fmtr } from "/sfh/lib.js";

const cluster_name = (i: number): string => `sfh-${i.toFixed(0).padStart(2, "0")}`;
const script_cache: { [key: string]: string } = {};

export async function sfhMain(ns: NS) {
    if (sfh.can.purchase) {
        const cluster_max = ns.getPurchasedServerLimit();
        let min_cluster_ram = Infinity;
        let max_cluster_ram = 8;
        for (let i = 0; i < cluster_max; ++i) {
            if (sfh.network[cluster_name(i)]) {
                min_cluster_ram = Math.min(min_cluster_ram, sfh.network[cluster_name(i)].ram);
                max_cluster_ram = Math.max(max_cluster_ram, sfh.network[cluster_name(i)].ram);
            } else {
                min_cluster_ram = 0;
            }
        }

        if (min_cluster_ram < ns.getPurchasedServerMaxRam()) {
            let index = -1;
            for (let i = 0; i < cluster_max; ++i) {
                let node = sfh.network[cluster_name(i)];
                if (node == null || (node.ram == min_cluster_ram && ns.getServerUsedRam(cluster_name(i)) === 0)) {
                    index = i;
                    break;
                }
            }

            if (index >= 0) {
                let new_ram = max_cluster_ram * (max_cluster_ram == min_cluster_ram ? 2 : 1);
                let cost = ns.getPurchasedServerCost(new_ram);

                if (cost <= sfh.player.money / 5) {
                    while (ns.getPurchasedServerCost(new_ram * 2) <= sfh.player.money / 10) {
                        new_ram *= 2;
                        cost = ns.getPurchasedServerCost(new_ram);
                    }

                    ns.deleteServer(cluster_name(index));
                    ns.purchaseServer(cluster_name(index), new_ram);
                    sfh.player.money = ns.getServerMoneyAvailable("home");

                    try {
                        const server = ns.getServer(cluster_name(index));
                        if (sfh.network[cluster_name(index)] == null) {
                            sfh.netAdd(ns.getServer(cluster_name(index)), ["home"], 1);
                        } else {
                            sfh.network[cluster_name(index)].ram = new_ram;
                        }
                    } catch {}
                }
            }
        }
    }

    if (sfh.state.has_tor && !("darkweb" in sfh)) {
        sfh.netAdd(ns.getServer("darkweb"), ["home"], 1);
        sfh.network.home.edges.add("darkweb");
    }

    if (sfh.network.home.ram != ns.getServer("home").maxRam && sfh.procs.home != null) {
        sfh.network.home.used_ram -= sfh.procs.home.ram;
        sfh.procs.set.delete(sfh.procs.home);
        sfh.procs.home.alive = false;
        sfh.procs.home = null;
    }

    if (sfh.procs.home == null) {
        const ram = sfh.network.home.ram = ns.getServer("home").maxRam;
        const reserve = Math.min(64, ram);
        
        if (sfh.network.home.used_ram + reserve > ram) { 
            throw new Error(`Could not reserve RAM on home (${sfh.network.home.used_ram} + ${reserve} > ${ram})`);
        }

        sfh.network.home.used_ram += reserve;
        sfh.procs.home = {
            pid:     -1,
            alive:   true,
            time:    sfh.time.now,
            script:  "/sfh/main.js",
            host:    "home",
            ram:     reserve,
            threads: 1
        };
    }
    
    for (const node of sfh.nodes()) {
        const server   = ns.getServer(node.name);
        node.ip        = server.ip;
        node.cur_money = server.moneyAvailable;
        node.cur_level = server.hackDifficulty;
        node.prepped   = node.cur_level == node.level && node.cur_money == node.money;
        node.backdoor  = server.backdoorInstalled; 
        node.ram       = server.maxRam;
        node.cores     = server.cpuCores;

        node.tH = 5000 * (2.5 * node.skill * node.level + 500)
            / ((sfh.player.skill + 50) * sfh.player.time_mult * sfh.player.int_mult(1));
        node.tG = 3.2 * node.tH;
        node.tW = 4.0 * node.tH;
    }

    for (const node of sfh.nodes()) {
        if (!node.root) {
            node.cur_ports = 0;
            try { ns.brutessh (node.name); ++node.cur_ports; } catch {}
            try { ns.ftpcrack (node.name); ++node.cur_ports; } catch {}
            try { ns.relaysmtp(node.name); ++node.cur_ports; } catch {}
            try { ns.httpworm (node.name); ++node.cur_ports; } catch {}
            try { ns.sqlinject(node.name); ++node.cur_ports; } catch {}
            try { ns.nuke     (node.name); node.root = true; } catch {}

            if (node.root && (node.owned || node.ram >= 2)
                && sfh.procs.pools.find(n => n.name == node.name) == null)
            {
                sfh.procs.pools.push(node);
            }
        }

        if (!node.target) {
            node.target = !node.owned && node.money > 0 && node.root && sfh.player.skill >= node.skill;
        }
    }

    const home_scripts = new Set(ns.ls("home", "/bin/"));
    const changed_scripts = [];
    for (const script of home_scripts) {
        const script_data = ns.read(script);
        if (script_data != "" && (script_cache[script] == null || script_cache[script] != script_data)) {
            script_cache[script] = script_data;
            changed_scripts.push(script);
        }
    }

    for (const pool of sfh.pools()) {
        if (pool.name === "home") { continue; }
        const pool_scripts = new Set(ns.ls(pool.name, "/bin/"));

        for (const script of pool_scripts) {
            if (!home_scripts.has(script)) { ns.rm(script, pool.name); }
        }

        const copy_scripts = Array.from(changed_scripts); 
        for (const script of home_scripts) {
            if (!pool_scripts.has(script)) { copy_scripts.push(script); }
        }

        if (copy_scripts.length > 0) { await ns.scp(copy_scripts, "home", pool.name); }
    }

    sfh.netGC(ns.isRunning.bind(ns));
    sfh.netSort();

    if (sfh.can.scripts) {
        const share_ram = Math.max(sfh.network.home.ram / 64, 4);
        for (const proc of sfh.procs.share) { if (!proc.alive) { sfh.procs.share.delete(proc); } }
        for (const node of sfh.nodes(n => !n.owned && n.root && n.ram >= 4 && n.ram <= share_ram)) {
            if (node.used_ram == 0) {
                const host = { name: node.name, ram: node.ram, threads: node.ram / 4 };
                sfh.netProc(sfh.procs.share, ns.exec.bind(ns), "/bin/share.js", host);
            }
        }
        sfh.netSort();

        if (!sfh.procs.contract?.alive) { sfh.procs.contract = null; }
        if (sfh.can.contracts && !sfh.procs.contract) {
            for (const node of sfh.nodes()) {
                const files = ns.ls(node.name, ".cct");
                if (files.length == 0) { continue; }

                const host = sfh.netHost(ns.getScriptRam("/bin/cct.js"), 1);
                sfh.procs.contract = sfh.netProc(null, ns.exec.bind(ns),
                    "/bin/cct.js", host, node.name, files[0])

                if (sfh.procs.contract?.alive) {
                    ns.toast(`Solving contract ${files[0]} on ${node.name}`, "info", 60000);
                    sfh.netSort();
                    break;
                }
            }
        }

        if (!sfh.procs.backdoor?.alive) { sfh.procs.backdoor = null; }
        if (sfh.can.automate && !sfh.procs.backdoor) {
            let target = null;
            for (const name in [
                "w0r1d_d43m0n", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z",
                "ecorp", "megacorp", "b-and-a", "blade", "nwo", "clarkinc",
                "omnitek", "4sigma", "kwaigong", "fulcrumtech", "fulcrumassets"
            ]) {
                const node = sfh.network[name];
                if (!node || (!sfh.can.bitnode && node.name === "w0r1d_d43m0n")) { continue; }

                if (!node.backdoor && node.root && sfh.player.skill >= node.skill) {
                    target = node;
                    break;
                }
            }

            if (!target) {
                for (const node of sfh.nodes()) {
                    if (!node.backdoor && !node.owned && node.root && sfh.player.skill >= node.skill) {
                        target = node;
                        break;
                    }
                }
            }

            if (target) {
                const host = sfh.netHost(ns.getScriptRam("/bin/backdoor.js"), 1);
                sfh.procs.backdoor = sfh.netProc(null, ns.exec.bind(ns),
                    "/bin/backdoor.js", host, target.name);

                if (sfh.procs.backdoor?.alive) {
                    ns.toast(`Installing backdoor on ${target.name}`, "info", 1000);
                    sfh.netSort();
                }
            }
        }
    }
}

export async function main(ns: NS) {
    if (ns.args.length == 1 && ns.args[0] == "sfh") { await sfhMain(ns); return; }

    switch (ns.args[0]) {
        case undefined: {
            const dfs = function(node: S.Node) {
                if (node.owned && node.name !== "home") { return; }
                ns.tprintf("%s[%4d %s%s%s] %s", "| ".repeat(node.depth), node.skill,
                    (node.root ? "R" : "_"), (node.target ? "T" : "_"), (node.backdoor ? "B" : "_"), node.name);
                for (let edge of node.edges) {
                    if (sfh.network[edge].depth > node.depth) { dfs(sfh.network[edge]); }
                }
            }
            dfs(sfh.network.home);
        } break;

        case "cluster": {
            const count = ns.getPurchasedServerLimit();
            const cluster = [];
            for (let i = 0; i < count; ++i) {
                if (sfh.network[cluster_name(i)] == null) {
                    cluster.push({ name: cluster_name(i), ram: 0 });
                } else {
                    cluster.push({ name: cluster_name(i), ram: sfh.network[cluster_name(i)].ram });
                }
            }

            cluster.sort((m, n) => n.ram - m.ram);

            let line_1 = [];
            let line_2 = [];
            for (let i = 0; i < count; ++i) {
                const node = cluster[i];
                line_1.push("  " + node.name + "   ");
                line_2.push(ns.sprintf("%11s", fmtr(node.ram)));
                if (i % 5 == 4 || i == count - 1) {
                    ns.tprintf("%s\n%s", line_1.join("   "), line_2.join("   "));
                    line_1 = [];
                    line_2 = [];
                }
            }
        } break;

        case "cost":
        case "price": {
            for (let ram = 1; ram <= ns.getPurchasedServerMaxRam(); ram *= 2) {
                ns.tprintf("%11s %11s", fmtr(ram), fmtm(ns.getPurchasedServerCost(ram)));
            }
        } break;
    }
}
