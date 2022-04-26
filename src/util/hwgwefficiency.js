/** @param {NS} ns **/
export async function main(ns) {
    const sfh = globalThis.sfh;

    for (let target of sfh.nodes(t => t.target)) {
        const calc = sfh.calc(target).setup();
        const frac = calc.hackFrac();
        if (frac === 0) { continue; }

        const ht_max = Math.floor(1 / frac);
        const y = [0];

        let x_avg = ht_max / 2;
        let y_avg = 0;
        for (let i = 1; i <= ht_max; ++i) {
            calc.setup();
            const hmain = calc.runHack(i, calc.level);
            const hweak = calc.solveWeak(calc.level, calc.level);
            const gmain = calc.solveGrow(calc.money, calc.level);
            const gweak = calc.solveWeak(calc.level, calc.level);

            let y_i = hmain.threads / (1.7 * hmain.threads + 1.75 * (hweak.threads + gmain.threads + gweak.threads));
            y.push(y_i);
            y_avg += y_i;
        }
        //ns.tprintf("%18s %6.2e %6.2e", target.name, x_avg, y_avg);
        y_avg /= ht_max;


        let var_xx = 0;
        let var_yy = 0;
        let var_xy = 0;
        for (let i = 1; i <= ht_max; ++i) {
            var_xx += (i - x_avg) ** 2;
            var_yy += (y[i] - y_avg) ** 2;
            var_xy += (i - x_avg) * (y[i] - y_avg);
        }

        let m = var_xy / var_xx;
        let c = y_avg - m * x_avg;
        let r = var_xy / Math.sqrt(var_xx * var_yy);

        ns.tprintf("%18s %5.3f RAM = %6.2e * ht %+6.2e", target.name, r, m, c);
    }
}