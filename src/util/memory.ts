import { NS } from "netscript";
import * as S from "sfh";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    sfh.netSort();

    if (ns.args.length > 0) {
        let name = ns.args[0] as string;
        for (let proc of sfh.procs.set) {
            if (proc.host == name) {
                sfh.print("{t} {8,d} HOST {0,r} {5,d} {} {}", proc.time, proc.pid, proc.ram,
                    proc.threads, proc.script, proc.args?.join(" ") ?? "");
            }
               
            if (!proc.alloc || proc.alloc[name] == null ) { continue; }
            sfh.print("{t} {8,d}      {0,r} {5,d} {} {}", proc.time, proc.pid, proc.alloc[name],
                proc.threads, proc.script, proc.args?.join(" ") ?? "");
        }
    } else {
        for (let pool of sfh.procs.pools) {
            let ram   = 0;
            let count = 0;

            for (let proc of sfh.procs.set) {
                if (pool.name === proc.host) {
                    ++count;
                    ram += proc.ram;
                }

                if (!proc.alloc) { continue; }
                if (pool.name in proc.alloc) {
                    ++count;
                    ram += proc.alloc[pool.name];
                }
            }

            let frac = (pool.ram > 0 ? pool.used_ram / pool.ram : 0);
            let size = Math.round(20 * frac);
            sfh.print("{18} {5,d} {5,p} [{}{}] {0,r} | {10,3,f}GB | {10,3,f}GB",
                pool.name, count, frac,
                "#".repeat(size), " ".repeat(20 - size),
                pool.ram - pool.used_ram, ram - pool.used_ram, ns.getServerUsedRam(pool.name) - pool.used_ram);
        }
    }
}
