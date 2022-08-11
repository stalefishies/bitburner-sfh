export async function main(ns: NS) {
    ns.disableLog("ALL");
    try {
        let target = ns.args[0] as string;
        let begin  = ns.args[1] as number;

        let forever = false;
        if (begin === Number.POSITIVE_INFINITY) {
            forever = true;
        } else {
            while (begin > performance.now()) {
                await ns.sleep(begin - performance.now());
            }
        }
        
        const opts: Parameters<NS["grow"]>[1] = {};
        const symbol   = sfh?.network?.[target]?.symbol;
        const forecast = symbol ? sfh.trading.stocks[symbol]?.forecast : null;
        if (symbol != null && forecast != null) { opts.stock = (forecast >= 0.5); }
        
        do { await ns.grow(target, opts); } while (forever);
    } catch (error: any) { ns.print(error.toString()); }
}
