export async function main(ns: NS) {
    ns.disableLog("ALL");
    try {
        let target = ns.args[0] as string;
        let begin  = ns.args[1] as number;

        let forever = false;
        if (begin === Number.POSITIVE_INFINITY) {
            forever = true;
        } else if (begin > performance.now()) {
            await ns.sleep(begin - performance.now());
        }
        
        do { await ns.weaken(target); } while (forever);
    } catch (error: any) { ns.print(error.toString()); }
}
