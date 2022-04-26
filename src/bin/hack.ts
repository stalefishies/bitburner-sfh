import { NS, BasicHGWOptions } from "netscript";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    try {
        let target = ns.args[0] as string;
        let begin  = ns.args[1] as number;

        while (begin > performance.now()) {
            await ns.asleep(begin - performance.now());
        }
        
        const opts: BasicHGWOptions = {};
        const symbol = globalThis.sfh?.network?.[target]?.symbol;
        if (symbol != null) { opts.stock = sfh.trading.stocks[symbol].forecast < 0.5; }

        await ns.hack(target, opts);
    } catch (error: any) { ns.print(error.toString()); }
}
