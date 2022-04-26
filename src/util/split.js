import { fmtm } from "/sfh/lib.js";

/** @param {NS} ns **/
export async function main(ns) {
    let sfh = globalThis.sfh;
    let node = sfh[ns.args[0]];
    let calc = sfh.calc(node);

    calc.setup(0, calc.level);
    let threads = calc.solveGrow().threads;
    ns.tprintf("%9s %.3f", fmtm(calc.cur_money), calc.cur_level);

    calc.setup(0, calc.level);
    calc.runGrow(threads / 2);
    calc.runGrow(threads / 2);
    ns.tprintf("%9s %.3f", fmtm(calc.cur_money), calc.cur_level);

    calc.setup(0, calc.level);
    calc.runGrow(threads / 4);
    calc.runGrow(threads / 4);
    calc.runGrow(threads / 4);
    calc.runGrow(threads / 4);
    ns.tprintf("%9s %.3f", fmtm(calc.cur_money), calc.cur_level);

    calc.setup(0, calc.level);
    calc.runGrow(threads / 2);
    calc.runGrow(threads / 4);
    calc.runGrow(threads / 4);
    ns.tprintf("%9s %.3f", fmtm(calc.cur_money), calc.cur_level);

    calc.setup(0, calc.level);
    calc.runGrow(threads / 4);
    calc.runGrow(threads / 4);
    calc.runGrow(threads / 2);
    ns.tprintf("%9s %.3f", fmtm(calc.cur_money), calc.cur_level);
}