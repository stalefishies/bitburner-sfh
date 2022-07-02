import { NS } from "netscript";
import * as S from "sfh";

type Stats = {
    skill: number, str: number, def: number, dex: number, agi: number, cha: number, int: number;
}

function makeCrime(name: string, time: number, money: number, difficulty: number, karma: number,
    stats: Partial<Stats>, exp: Partial<Stats>)
{
    return { name, time, money, difficulty, karma,
        stats: {
            skill: stats.skill ?? 0,
            str:   stats.str   ?? 0,
            def:   stats.def   ?? 0,
            dex:   stats.dex   ?? 0,
            agi:   stats.agi   ?? 0,
            cha:   stats.cha   ?? 0,
            int:   0
        }, exp: {
            skill: exp.skill ?? 0,
            str:   exp.str   ?? 0,
            def:   exp.def   ?? 0,
            dex:   exp.dex   ?? 0,
            agi:   exp.agi   ?? 0,
            cha:   exp.cha   ?? 0,
            int:   exp.int   ?? 0
        }
    };
}

const crimes: {
    name:       string;
    time:       number;
    money:      number;
    difficulty: number;
    karma:      number;
    stats:      Stats;
    exp:        Stats;
}[] = [
    makeCrime("Shoplift",           2e3,  15e3, 1/20,  0.10, { dex: 2, agi: 2 },
        { dex: 2, agi: 2 }),
    makeCrime("Rob Store",         60e3, 400e3,  1/5,  0.50, { skill: 0.5, dex: 2, agi: 1 },
        { skill: 30, dex: 45, agi: 45, int: 0.375 }),
    makeCrime("Mug",                4e3,  36e3,  1/5,  0.25, { str: 1.5, def: 0.5, dex: 1.5, agi: 0.5 },
        { str: 3, def: 3, dex: 3, agi: 3 }),
    makeCrime("Larceny",           90e3, 800e3,  1/3,  1.50, { skill: 0.5, dex: 1, agi: 1 },
        { skill: 45, dex: 60, agi: 60, int: 0.75 }),
    makeCrime("Deal Drugs",        10e3, 120e3,    1,  0.50, { cha: 3, dex: 2, agi: 1 },
        { dex: 5, agi: 5, cha: 10 }),
    makeCrime("Bond Forgery",     300e3, 4.5e6,  1/2,  0.10, { skill: 0.05, dex: 1.25 },
        { skill: 100, dex: 150, cha: 15, int: 3 }),
    makeCrime("Traffick Arms",     40e3,  40e3,    2,  1.00, { cha: 1, str: 1, def: 1, dex: 1, agi: 1 },
        { cha: 1, str: 1, def: 1, dex: 1, agi: 1 }),
    makeCrime("Homicide",           3e3,  45e3,    1,  3.00, { str: 2, def: 2, dex: 0.5, agi: 0.5 },
        { str: 2, def: 2, dex: 2, agi: 2 }),
    makeCrime("Grand Theft Auto",  80e3, 1.6e6,    8,  5.00, { skill: 1, str: 1, dex: 4, agi: 2, cha: 2 },
        { str: 20, def: 20, dex: 20, agi: 80, cha: 40, int: 0.8 }),
    makeCrime("Kidnap",           120e3, 3.6e6,    5,  6.00, { cha: 1, str: 1, dex: 1, agi: 1 },
        { str: 80, def: 80, dex: 80, agi: 80, cha: 80, int: 1.3 }),
    makeCrime("Assassination",    300e3,  12e6,    8, 10.00, { str: 1, dex: 2, agi: 1 },
        { str: 300, def: 300, dex: 300, agi: 300, int: 3.25 }),
    makeCrime("Heist",            600e3, 120e6,   18, 15.00, { skill: 1, str: 1, def: 1, dex: 1, agi: 1, cha: 1 },
        { skill: 450, str: 450, def: 450, dex: 450, agi: 450, cha: 450, int: 6.5 }),
];

/* player stats:
 *  skill  250
 *  combat 100
 *  cha    250
 * sleeve stats:
 *  skill  150
 *  combat 150
 *  cha    150
 */

/*
    1. shock to 20
    2. player goal stats
    3. sleeve stats
    4. karma to -54000
    5. factions
    6. crime for money
*/

async function sfhMain(ns: NS) {
    for (const key in sfh.sleeves) { sfh.sleeves[key as keyof S.SFH["sleeves"]] = 0; }
    const num = 8; // ns.sleeve.getNumSleeves();

    for (let i = 0; i < num; ++i) {
        const stats: (ReturnType<NS["sleeve"]["getSleeveStats"]> & { intelligence: number })
            = ns.sleeve.getSleeveStats(i) as any;
        stats.intelligence ??= 0;

        const task = ns.sleeve.getTask(i);
        const info = ns.sleeve.getInformation(i);
        const stat = info.earningsForTask;

        let work: [string, string] | null = (stats.shock > 20 ? ["shock", ""] : null);

        // Stats
        if (!work && sfh.money.can_train) {
            if      (sfh.player.skill < Math.max(sfh.goal.skill,  250)) { work = ["university", "skill"]; }
            else if (sfh.player.str   < Math.max(sfh.goal.combat, 100)) { work = ["gym",        "str"];   }
            else if (sfh.player.def   < Math.max(sfh.goal.combat, 100)) { work = ["gym",        "def"];   }
            else if (sfh.player.dex   < Math.max(sfh.goal.combat, 100)) { work = ["gym",        "dex"];   }
            else if (sfh.player.agi   < Math.max(sfh.goal.combat, 100)) { work = ["gym",        "agi"];   }
            else if (sfh.player.cha   < Math.max(sfh.goal.cha,    100)) { work = ["university", "cha"];   }
            else if (stats.hacking   < 100) { work = ["university", "skill"]; }
            else if (stats.strength  < 150) { work = ["gym",        "str"];   }
            else if (stats.defense   < 150) { work = ["gym",        "def"];   }
            else if (stats.dexterity < 150) { work = ["gym",        "dex"];   }
            else if (stats.agility   < 150) { work = ["gym",        "agi"];   }
            else if (stats.charisma  < 100) { work = ["university", "cha"];   }
        }

        // Crime
        if (!work) {
            let crime = null;
            let prob  = 0;
            let kps   = 0;
            let dps   = 0;

            for (const this_crime of crimes) {
                let this_prob = (
                    this_crime.stats.skill * stats.hacking
                    + this_crime.stats.str * stats.strength
                    + this_crime.stats.def * stats.defense
                    + this_crime.stats.dex * stats.dexterity
                    + this_crime.stats.agi * stats.agility
                    + this_crime.stats.cha * stats.charisma
                    + 0.025 * stats.intelligence
                ) / 975 / this_crime.difficulty * info.mult.crimeSuccess
                * (1 + Math.pow(stats.intelligence, 0.8) / 600);
                this_prob = Math.max(Math.min(this_prob, 1), 0);
                
                const this_kps = this_prob * this_crime.karma / this_crime.time * 1000;
                const this_dps = this_prob * this_crime.money / this_crime.time * 1000;

                if (sfh.player.karma > -54000) {
                    if (this_kps > kps) { crime = this_crime; prob = this_prob; dps = this_dps; kps = this_kps; }
                } else {
                    if (this_dps > dps) { crime = this_crime; prob = this_prob; dps = this_dps; kps = this_kps; }
                }
            }

            if (crime) {
                work = ["crime", crime.name];

                sfh.sleeves.money_rate += dps * info.mult.crimeMoney * sfh.player.bitnode.crime_money;
                sfh.sleeves.karma_rate += kps;

                const rate = prob * sfh.player.bitnode.crime_exp / crime.time * 1000;
                sfh.sleeves.skill_rate += rate * crime.exp.skill * sfh.player.skill_exp_mult;
                sfh.sleeves.str_rate   += rate * crime.exp.str   * sfh.player.str_exp_mult;
                sfh.sleeves.def_rate   += rate * crime.exp.def   * sfh.player.def_exp_mult;
                sfh.sleeves.dex_rate   += rate * crime.exp.dex   * sfh.player.dex_exp_mult;
                sfh.sleeves.agi_rate   += rate * crime.exp.agi   * sfh.player.agi_exp_mult;
                sfh.sleeves.cha_rate   += rate * crime.exp.cha   * sfh.player.cha_exp_mult;

                sfh.sleeves.int_rate   += prob * crime.exp.int / crime.time;
            }
        }

        if (work?.[0] === "university") {
            if (info.city !== "Volhaven" && sfh.can.purchase) {
                sfh.purchase("goal", null, 200e3, () => ns.sleeve.travel(i, "Volhaven"));
                if (ns.sleeve.getInformation(i).city !== "Volhaven") { continue; }
            }

            if (task.task !== "Class"
                || (work[1] === "skill" && stat.workHackExpGain === 0)
                || (work[1] === "cha"   && stat.workChaExpGain  === 0)
            ) {
                const name = (work[1] === "cha" ? "Leadership" : "Algorithms");
                ns.sleeve.setToUniversityCourse(i, "ZB Institute of Technology", name);
            }
        } else if (work?.[0] === "gym") {
            if (info.city !== "Sector-12" && sfh.can.purchase) {
                sfh.purchase("goal", null, 200e3, () => ns.sleeve.travel(i, "Sector-12"));
                if (ns.sleeve.getInformation(i).city !== "Sector-12") { continue; }
            }

            if (task.task !== "Class"
                || (work[1] === "str" && stat.workStrExpGain === 0)
                || (work[1] === "def" && stat.workDefExpGain === 0)
                || (work[1] === "dex" && stat.workDexExpGain === 0)
                || (work[1] === "agi" && stat.workAgiExpGain === 0)
            ) {
                     if (work[1] === "def") { ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "Defense");   }
                else if (work[1] === "dex") { ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "Dexterity"); }
                else if (work[1] === "agi") { ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "Agility");   }
                else                        { ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "Strength");  }
            }
        } else if (work?.[0] === "crime") {
            if (task.task !== "Crime" || task.crime !== work[1]) {
                ns.sleeve.setToCommitCrime(i, work[1]);
            }
        } else {
            ns.sleeve.setToShockRecovery(i);
        }
    }
}

export async function main(ns: NS) {
    if (ns.args.length == 1 && ns.args[0] == "sfh") { await sfhMain(ns); return; }
}
