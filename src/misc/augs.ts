/*
The value of an augmentation is a weighted sum of the logarithms of the multipliers (taking logs is needed to make the multipliers additive, the log base doesn't matter since it comes out as a final unit scaling)

Weights are determined dynamically from your current stats, to push the player towards increasing stats reduced by the bitnode. They are simply the reciprocal of the current multiplier, multiplied by a stat-dependent weight (e.g. hac = 5x, str = 1x, salary = 0.25x)
*/

const weights: Partial<typeof sfh.player.mults> = {
    hac:           5,
    str:           1,
    def:           1,
    dex:           1,
    agi:           1,
    cha:           1,
    hac_exp:       2,
    str_exp:       0.5,
    def_exp:       0.5,
    dex_exp:       0.5,
    agi_exp:       0.5,
    cha_exp:       0.5,
    hack_money:    2,
    hack_prob:     1,
    hack_time:     4,
    grow_rate:     4,
    faction_rep:   4,
    company_money: 0.25,
    company_rep:   2,
    crime_money:   0.5,
    crime_prob:    1,
    hacknet_prod:  4,
    hacknet_node:  2,
    hacknet_level: 2,
    hacknet_ram:   2,
    hacknet_core:  2,
    bb_sta:        0,
    bb_sta_gain:   0,
    bb_analysis:   0,
    bb_prob:       0,
};

export async function main(ns: NS) {
    const cost_mult = Math.pow(1.9 * [1, 0.96, 0.94, 0.93][sfh.bitnode.sf[11]], sfh.state.augs.queued.size);

    for (const faction of Object.values(sfh.state.factions)) {
        const augs = Array.from(faction.augs.all)
            .filter(s => s !== "NeuroFlux Governor")
            .map(s => data.augs[s])
            .sort((a, b) => b.cost - a.cost);
        if (augs.length == 0) { continue; }

        sfh.print("\n{0,e} {3} {c*}", faction.rep, Math.floor(faction.favour),
            (faction.joined ? "" : "y"), faction.name);

        for (const aug of augs) {
            const cost = aug.cost * sfh.bitnode.mults.aug_cost;
            const rep  = aug.rep  * sfh.bitnode.mults.aug_rep;

            let value = 0;
            for (const name of (Object.keys(aug.mults) as (keyof typeof aug.mults)[])) {
                if (sfh.player.mults[name] > 0) {
                    value += (weights[name] ?? 0) * Math.log2(aug.mults[name]) / sfh.player.mults[name];
                }
            }

            sfh.print("    {54,c*} {0,m} {0,m,c*} {0,e,c*} {}    {7,4,f}",
                sfh.state.augs.has(aug.name) ? "" : (sfh.state.augs.queued.has(aug.name) ? "c" : "y"), aug.name,
                cost, (cost * cost_mult > sfh.money.curr ? "r" : ""), cost * cost_mult,
                (rep > faction.rep ? "r" : ""), rep,
                data.augs[aug.name].custom_stats ? "(*)" : "   ", value);
        }
    }
}
