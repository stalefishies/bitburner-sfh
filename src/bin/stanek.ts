export async function main(ns: NS) {
    ns.disableLog("ALL");
    const size = 10;

    for (;;) {
        for (let i = 0; i < size; ++i)
        for (let j = 0; j < size; ++j) {
            try { await ns.stanek.chargeFragment(j, i); } catch { await ns.sleep(0); }
        }
    }
}
