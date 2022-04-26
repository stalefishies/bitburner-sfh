import { NS } from "netscript";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    let until = ns.args[0] as number | undefined;
    while (until == null || until > performance.now() + 10000) {
        await ns.share();
    }
}
