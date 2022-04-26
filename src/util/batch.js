/** @param {NS} ns **/

import { SFH } from "/lib/sfh.js";

export function autocomplete(data, args) { if (args.length <= 1) { return data.servers; } }

export async function main(ns) {
    if (ns.args.length < 2 || ns.args.length > 3) {
        ns.tprint("Usage: simbatch.js target skill [depth]");
        return;
    }

    const sfh    = SFH.ctx();
    const target = ns.args[0];
    const t0     = 50;
    
    sfh.net[target].cur_money = sfh.net[target].money;
    sfh.net[target].cur_level = sfh.net[target].level;

    sfh.player.skill = ns.args[1];
    const params = sfh.batchSchedule(target, (ns.args[2] == null ? Infinity : ns.args[2]), t0, 0);
    if (params == null) { ns.tprintf("ERROR: No batch"); return; }

    const calc = sfh.calc(target);
    const TH_hi = calc.hackTime();
    const TG_hi = 3.2 * TH_hi;
    const TW_hi = 4.0 * TH_hi;

    ns.tprint(params);

    const kH = Math.ceil(TH_hi / params.period);
    const kG = Math.ceil(TG_hi / params.period);
    const kW = Math.ceil(TW_hi / params.period);

    //ns.tprintf("Skill %d   Period %f - %f  k %d %d %d", sfh.net[target].skill, params.period, params.max_period, kH, kG, kW);
    //ns.tprintf("%f %f %f", TH_hi, TG_hi, TW_hi);

    ns.tprintf("Hack time: %f", TH_hi);
    ns.tprintf("Grow time: %f", TG_hi);
    ns.tprintf("Weak time: %f", TW_hi);
    ns.tprintf("Buffer time: %f", t0);
    ns.tprintf("Period: %f", params.period);
    ns.tprintf("\n");
    ns.tprintf("Safe window from %f to %f", t0, params.period - 5 * t0);
    ns.tprintf("Hack   begins at %f", params.period - (TH_hi - (kH - 1) * params.period + 4 * t0));
    ns.tprintf("Weak 1 begins at %f", params.period - (TW_hi - (kW - 1) * params.period + 3 * t0));
    ns.tprintf("Grow   begins at %f", params.period - (TG_hi - (kG - 1) * params.period + 2 * t0));
    ns.tprintf("Weak 2 begins at %f", params.period - (TW_hi - (kW - 1) * params.period + 1 * t0));

}