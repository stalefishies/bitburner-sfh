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

    const reserve_ram = 64 + (sfh.corp.reserve ? 1024 : 0);
    if (sfh.procs.home == null || sfh.procs.home.ram < reserve_ram) {
        const max_ram = sfh.network.home.ram = ns.getServer("home").maxRam;

        if (reserve_ram > max_ram) {
            throw new Error(`Cannot not reserve ${reserve_ram}GB on home (max ${max_ram}GB)`);
        }

        if (sfh.procs.home) {
            sfh.network.home.used_ram -= sfh.procs.home.ram;
            sfh.procs.home.alive = false;
            sfh.procs.set.delete(sfh.procs.home);
            sfh.procs.home = null;
        }

        const used_ram = Math.min(reserve_ram, max_ram - sfh.network.home.used_ram);
        sfh.network.home.used_ram += used_ram;
        sfh.procs.home = {
            pid:     -1,
            alive:   true,
            time:    sfh.time.now,
            script:  "/sfh/main.js",
            host:    "home",
            ram:     used_ram,
            threads: 1
        };
        sfh.procs.set.add(sfh.procs.home);
    }
    sfh.corp.ready = sfh.corp.reserve && sfh.procs.home.ram >= reserve_ram;

    const pool_ram_cutoff = Math.max(sfh.network.home.ram / 64, 4);
    for (const server of sfh.servers()) {
        const s = server.server = ns.getServer(server.name);

        if (!server.root) {
            server.cur_ports = 0;
            try { ns.brutessh (server.name); ++server.cur_ports; } catch {}
            try { ns.ftpcrack (server.name); ++server.cur_ports; } catch {}
            try { ns.relaysmtp(server.name); ++server.cur_ports; } catch {}
            try { ns.httpworm (server.name); ++server.cur_ports; } catch {}
            try { ns.sqlinject(server.name); ++server.cur_ports; } catch {}
            try { ns.nuke     (server.name); server.root = true; } catch {}
        }

        server.backdoor  = s.backdoorInstalled; 
        server.target    = !server.owned && server.money > 0 && server.root && sfh.player.hac >= server.skill;

        server.ram       = s.maxRam;
        server.cores     = s.cpuCores;
        server.pool      = !server.hnet && (server.owned
            || (server.cur_ports >= server.ports && server.ram > pool_ram_cutoff));

        server.money     = s.moneyMax;
        server.level     = s.minDifficulty;
        server.cur_money = s.moneyAvailable;
        server.cur_level = s.hackDifficulty;
        server.prepped   = server.cur_level == server.level && server.cur_money == server.money;

        server.tH = 5000 * (2.5 * server.skill * server.level + 500)
            / ((sfh.player.hac + 50) * sfh.player.mults.hack_time * sfh.intMult(1));
        server.tG = 3.2 * server.tH;
        server.tW = 4.0 * server.tH;

        server.ip  = s.ip;
        server.cct = ns.ls(server.name, ".cct");
    }

    sfh.procs.pools = Array.from(sfh.servers(s => s.pool));

    if (sfh.netstat.ready) {
        const home_scripts = new Set(ns.ls("home", "/bin/"));
        const changed_scripts = [];
        for (const script of home_scripts) {
            const script_data = ns.read(script) as string;
            if (script_data != "" && (script_cache[script] == null || script_cache[script] != script_data)) {
                script_cache[script] = script_data;
                changed_scripts.push(script);
            }
        }

        for (const pool of sfh.servers(s => s.ram > 0 && !s.hnet)) {
            if (pool.name === "home") { continue; }
            const pool_scripts = new Set(ns.ls(pool.name, "/bin/"));

            for (const script of pool_scripts) {
                if (!home_scripts.has(script)) { ns.rm(script, pool.name); }
            }

            const copy_scripts = new Set(changed_scripts); 
            for (const script of home_scripts) {
                if (!pool_scripts.has(script)) { copy_scripts.add(script); }
            }

            if (copy_scripts.size > 0) {
                sfh.netstat.ready = false;
                sfh.netstat.scp_args.push([Array.from(copy_scripts), pool.name]);
            }
        }
    }

    const scp_t0 = performance.now();
    for (;;) {
        const args = sfh.netstat.scp_args.pop();
        if (!args) { break; }

        await ns.scp(...args, "home");
        if (performance.now() - scp_t0 > 100) { break; }
    }
    sfh.netstat.ready = (sfh.netstat.scp_args.length === 0);

    sfh.netGC(ns.isRunning.bind(ns));
    sfh.netSort();

    if (!sfh.netstat.ready) { sfh.print("    {} copy operations remain", sfh.netstat.scp_args.length); }
}

export async function main(ns: NS) {
    if (ns.args.length == 1 && ns.args[0] == "sfh") { await sfhMain(ns); return; }

    switch (ns.args[0]) {
        case undefined: {
            const dfs = function(server: Server) {
                if (server.owned && server.name !== "home") { return; }
                ns.tprintf("%s[%4d %s%s%s] %s", "| ".repeat(server.depth), server.skill,
                    (server.root ? "R" : "_"), (server.target ? "T" : "_"), (server.backdoor ? "B" : "_"), server.name);
                for (let edge of server.edges) {
                    if (sfh.network[edge].depth > server.depth) { dfs(sfh.network[edge]); }
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
                line_2.push(sfh.format("{0,r}", node.ram));
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
                sfh.print("{0,r} {0,m}", ram, ns.getPurchasedServerCost(ram));
            }
        } break;
    }
}
