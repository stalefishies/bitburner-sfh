import { NS } from "netscript";
import * as S from "sfh";
import { fmtm, fmtr } from "/sfh/lib.js";

const cluster_name = (i: number): string => `sfh-${i.toFixed(0).padStart(2, "0")}`;
const script_cache: { [key: string]: string } = {};
const backdoor_names = new Set<string>();

export async function sfhMain(ns: NS) {
    for (let i = 0; i < 25; ++i) {
        const name = cluster_name(i);
        if (sfh.network[name] == null) {
            try {
                const server = ns.getServer(name);
                sfh.netAdd(server, ["home"], 1);
                sfh.network.home.edges.add(name);
            } catch {}
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
        sfh.procs.set.add(sfh.procs.home);
    }
    
    for (const node of sfh.nodes()) {
        const server   = ns.getServer(node.name);
        node.ip        = server.ip;
        node.money     = server.moneyMax;
        node.level     = server.minDifficulty;
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

            if (node.root && (node.owned || node.ram >= 2) && !node.hnet
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
