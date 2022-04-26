import { NS } from "netscript";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    try {
        const path = [];

        let node = sfh.network[ns.args[0].toString()];
        while (node.depth > 0) {
            path.unshift(node.name);

            for (const edge of node.edges) {
                if (sfh.network[edge].depth == node.depth - 1) {
                    node = sfh.network[edge];
                    break;
                }
            }

            if (node.name == path[0]) { throw new Error(`Could not construct path from ${node.name} to home`); }
        }
        
        ns.connect("home");
        for (let name of path) { ns.connect(name); }
        await ns.installBackdoor();
        ns.connect("home");
    } catch (error: any) { ns.print(error.toString()); }
}

