import { NS } from "netscript";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    try {
        let target = ns.args[0] as string;
        let begin  = ns.args[1] as number;

        while (begin > performance.now()) {
            await ns.asleep(begin - performance.now());
        }
        
        await ns.weaken(target);
    } catch (error: any) { ns.print(error.toString()); }
}
