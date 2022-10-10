import { parse } from "/data/parse.js";
import { WorkResult } from "src/types/Data";

function statWeight(work: { [s in keyof Skills as `${s}_weight`]: number }, skills: Skills) {
    return skills.hac * work.hac_weight
        + skills.str * work.str_weight + skills.dex * work.dex_weight
        + skills.def * work.def_weight + skills.agi * work.agi_weight
        + skills.cha * work.cha_weight + skills.int * work.int_weight;
}

function intMult({ int }: { int: number }, weight = 1) {
    return 1 + (weight * Math.pow(int, 0.8)) / 600;
}

function scaleResult(person: Person, work: WorkResult): WorkResult {
    if (person.sleeve) {
        work.money   *= (1 - person.shock) * person.sync;
        work.hac_exp *= (1 - person.shock) * person.sync;
        work.str_exp *= (1 - person.shock) * person.sync;
        work.def_exp *= (1 - person.shock) * person.sync;
        work.dex_exp *= (1 - person.shock) * person.sync;
        work.agi_exp *= (1 - person.shock) * person.sync;
        work.cha_exp *= (1 - person.shock) * person.sync;
        work.int_exp *= (1 - person.shock) * person.sync;
    }
    
    return work;
}

function calcFactionWork(loc: string, desc: string, person: Person = sfh.player, focus = true): WorkResult {
    if (person.sleeve || sfh.state.augs.has("Neuroreceptor Management Implant")) { focus = true; }

    const faction = data.factions[loc];
    if (!faction) { throw new Error("Unknown faction " + loc); }

    const work = data.faction_work[desc];
    if (!work) { throw new Error("Unknown faction work " + desc); }

    const stat_weight = statWeight(work, person)
        + (person.hac * work.hac_weight + person.int * work.int_weight) * (sfh.state.share_mult - 1);
    const favour = 1 + (sfh.state.factions[faction.name]?.favour ?? 0) / 100;
    const f_mult = focus ? 1 : data.constants.BaseFocusBonus;
    const rep = stat_weight * person.mults.faction_rep * f_mult * favour * intMult(person)
        * (person.sleeve ? (1 - person.shock) * sfh.bitnode.mults.faction_rep : 5);

    const hac_exp = 5 * work.hac_exp * person.mults.hac_exp / sfh.bitnode.mults.hac_exp * person.mults.faction_exp;
    const str_exp = 5 * work.str_exp * person.mults.str_exp / sfh.bitnode.mults.str_exp * person.mults.faction_exp;
    const def_exp = 5 * work.def_exp * person.mults.def_exp / sfh.bitnode.mults.def_exp * person.mults.faction_exp;
    const dex_exp = 5 * work.dex_exp * person.mults.dex_exp / sfh.bitnode.mults.dex_exp * person.mults.faction_exp;
    const agi_exp = 5 * work.agi_exp * person.mults.agi_exp / sfh.bitnode.mults.agi_exp * person.mults.faction_exp;
    const cha_exp = 5 * work.cha_exp * person.mults.cha_exp / sfh.bitnode.mults.cha_exp * person.mults.faction_exp;
    const int_exp = 5 * work.int_exp * person.mults.int_exp / sfh.bitnode.mults.int_exp * person.mults.faction_exp;

    return scaleResult(person, {
        desc, name: work.name, time: 200, prob: 1, money: 0, rep, karma: 0,
        hac_exp, str_exp, def_exp, dex_exp, agi_exp, cha_exp, int_exp
    });
}

function calcCompanyWork(loc: string, desc: string, person: Person = sfh.player, focus = true): WorkResult {
    if (person.sleeve || sfh.state.augs.has("Neuroreceptor Management Implant")) { focus = true; }

    const company = data.companies[loc];
    if (!company) { throw new Error("Unknown company " + loc); }

    const work = data.company_work[desc];
    if (!work) { throw new Error("Unknown job " + desc); }

    const favour = 1 + (sfh.state.companies[company.name]?.favour ?? 0) / 100;
    const f_mult = focus ? 1 : data.constants.BaseFocusBonus;
    const rep = statWeight(work, person) * person.mults.company_rep * f_mult * favour;

    const money_favour = (sfh.bitnode.sf[11] > 0 ? favour : 1);
    const money = work.money * company.money_mult * person.mults.company_money * f_mult * money_favour;

    const hac_exp = work.hac_exp * company.exp_mult * person.mults.hac_exp * person.mults.company_exp;
    const str_exp = work.str_exp * company.exp_mult * person.mults.str_exp * person.mults.company_exp;
    const def_exp = work.def_exp * company.exp_mult * person.mults.def_exp * person.mults.company_exp;
    const dex_exp = work.dex_exp * company.exp_mult * person.mults.dex_exp * person.mults.company_exp;
    const agi_exp = work.agi_exp * company.exp_mult * person.mults.agi_exp * person.mults.company_exp;
    const cha_exp = work.cha_exp * company.exp_mult * person.mults.cha_exp * person.mults.company_exp;
    const int_exp = work.int_exp * company.exp_mult * person.mults.int_exp * person.mults.company_exp;

    return scaleResult(person, {
        desc, name: work.name, time: 200, prob: 1, money, rep, karma: 0,
        hac_exp, str_exp, def_exp, dex_exp, agi_exp, cha_exp, int_exp
    });
}

function calcCrimeWork(desc: string, person: Person = sfh.player, focus = true): WorkResult {
    if (person.sleeve || sfh.state.augs.has("Neuroreceptor Management Implant")) { focus = true; }

    const work = data.crime_work[desc];
    if (!work) { throw new Error("Unknown crime " + desc); }
    const t = work.time / 1000;

    const prob = Math.min(Math.max(statWeight(work, person) * person.mults.crime_prob * intMult(person), 0), 1);
    const p_mult = (1 - 3 * prob) / 4;
    const f_mult = focus ? 1 : data.constants.BaseFocusBonus;

    const money = work.money * (person.sleeve ? sfh.bitnode.mults.crime_money : person.mults.crime_money)
        * prob / t;
    const karma = work.karma * (person.sleeve ? prob * person.sync : p_mult) * f_mult / t;

    const hac_exp = work.hac_exp * person.mults.crime_exp
        * (person.sleeve ? 1 : 2 * person.mults.hac_exp / sfh.bitnode.mults.hac_exp) * p_mult * f_mult / t;
    const str_exp = work.str_exp * person.mults.crime_exp
        * (person.sleeve ? 1 : 2 * person.mults.str_exp / sfh.bitnode.mults.str_exp) * p_mult * f_mult / t;
    const def_exp = work.def_exp * person.mults.crime_exp
        * (person.sleeve ? 1 : 2 * person.mults.def_exp / sfh.bitnode.mults.def_exp) * p_mult * f_mult / t;
    const dex_exp = work.dex_exp * person.mults.crime_exp
        * (person.sleeve ? 1 : 2 * person.mults.dex_exp / sfh.bitnode.mults.dex_exp) * p_mult * f_mult / t;
    const agi_exp = work.agi_exp * person.mults.crime_exp
        * (person.sleeve ? 1 : 2 * person.mults.agi_exp / sfh.bitnode.mults.agi_exp) * p_mult * f_mult / t;
    const cha_exp = work.cha_exp * person.mults.crime_exp
        * (person.sleeve ? 1 : 2 * person.mults.cha_exp / sfh.bitnode.mults.cha_exp) * p_mult * f_mult / t;
    const int_exp = work.int_exp * person.mults.crime_exp
        * (person.sleeve ? 1 : 2 * person.mults.int_exp / sfh.bitnode.mults.int_exp) * prob * f_mult / t;

    return scaleResult(person, {
        desc, name: work.name, time: work.time, prob, money, rep: 0, karma,
        hac_exp, str_exp, def_exp, dex_exp, agi_exp, cha_exp, int_exp
    });
}

// TODO: discount from backdooring the server: this needs a location -> server mapping
function calcClassWork(person: Person, location: typeof data.locations[""], work: typeof data.class_work[""]) {
    const hnet  = (work.gym ? sfh.hnet.train_mult : sfh.hnet.study_mult);
    const money = 5 * work.money * location.cost_mult;

    const hac_exp = 5 * work.hac_exp * location.exp_mult * hnet * person.mults.hac_exp / sfh.bitnode.mults.hac_exp
        * sfh.bitnode.mults.class_exp * (person.sleeve ? (1 - person.shock) : 1);
    const str_exp = 5 * work.str_exp * location.exp_mult * hnet * person.mults.str_exp / sfh.bitnode.mults.str_exp
        * sfh.bitnode.mults.class_exp * (person.sleeve ? (1 - person.shock) : 1);
    const def_exp = 5 * work.def_exp * location.exp_mult * hnet * person.mults.def_exp / sfh.bitnode.mults.def_exp
        * sfh.bitnode.mults.class_exp * (person.sleeve ? (1 - person.shock) : 1);
    const dex_exp = 5 * work.dex_exp * location.exp_mult * hnet * person.mults.dex_exp / sfh.bitnode.mults.dex_exp
        * sfh.bitnode.mults.class_exp * (person.sleeve ? (1 - person.shock) : 1);
    const agi_exp = 5 * work.agi_exp * location.exp_mult * hnet * person.mults.agi_exp / sfh.bitnode.mults.agi_exp
        * sfh.bitnode.mults.class_exp * (person.sleeve ? (1 - person.shock) : 1);
    const cha_exp = 5 * work.cha_exp * location.exp_mult * hnet * person.mults.cha_exp / sfh.bitnode.mults.cha_exp
        * sfh.bitnode.mults.class_exp * (person.sleeve ? (1 - person.shock) : 1);

    return {
        desc: work.desc, name: work.name, time: 200, prob: 1, money, rep: 0, karma: 0,
        hac_exp, str_exp, def_exp, dex_exp, agi_exp, cha_exp, int_exp: 0
    };
}

function calcGymWork(loc: string, desc: string, person: Person = sfh.player, focus = true): WorkResult {
    const location = data.locations[loc];
    if (!location) { throw new Error("Unknown location " + loc); }
    if (!location.types.has("gym")) { throw new Error("Location " + loc + " is not a gym"); }

    const work = data.class_work[desc];
    if (!work || !work.gym) { throw new Error("Unknown gym work " + desc); }

    return scaleResult(person, calcClassWork(person, location, work));
}

function calcStudyWork(loc: string, desc: string, person: Person = sfh.player, focus = true): WorkResult {
    const location = data.locations[loc];
    if (!location) { throw new Error("Unknown location " + loc); }
    if (!location.types.has("university")) { throw new Error("Location " + loc + " is not a university"); }

    const work = data.class_work[desc];
    if (!work || work.gym) { throw new Error("Unknown university work " + desc); }

    return scaleResult(person, calcClassWork(person, location, work));
}

function calcWork(work: CurrentWork | null, person: Person = sfh.player, focus = true): WorkResult {
    let result: WorkResult | null = null;

    if (work) {
        if (work.type === "FACTION") {
            result = data.calcFactionWork(work.factionName, work.factionWorkType, person, focus);
        } else if (work.type === "COMPANY") {
            const job = sfh?.state?.companies?.[work.companyName]?.title;
            if (job) {
                result = data.calcCompanyWork(work.companyName, job, person, focus);
            }
        } else if (work.type === "CRIME") {
            result = data.calcCrimeWork(work.crimeType, person, focus);
        } else if (work.type === "CLASS") {
            if (work.classType.startsWith("GYM")) {
                result = data.calcGymWork(work.location, work.classType, person, focus);
            } else {
                result = data.calcStudyWork(work.location, work.classType, person, focus);
            }
        }
    }

    return result ?? {
        desc: "null", name: "Not working", time: 0, prob: 0, money: 0, rep: 0, karma: 0,
        hac_exp: 0, str_exp: 0, def_exp: 0, dex_exp: 0, agi_exp: 0, cha_exp: 0, int_exp: 0
    };
}

function bestFactionWork(loc: string, person: Person = sfh.player, key: keyof WorkResult = "rep"): string {
    let desc = "";
    let best = 0;

    for (const work of Object.values(data.faction_work)) {
        if (!data.factions[loc]?.work?.[work.desc]) { continue; }
        const value = calcFactionWork(loc, work.desc, person, true)[key] as number;
        if (value > best) { desc = work.desc; best = value; }
    }

    return desc;
}

function bestCompanyWork(loc: string, person: Person = sfh.player, key: keyof WorkResult = "rep"): string {
    let desc = "";
    let best = 0;

    for (const [field, entry] of Object.entries(data.field_entry)) {
        if (!data.companies[loc].fields.has(field)) { continue; }

        let this_desc: string | null = entry;
        while (this_desc) {
            const job: typeof data.company_work[""] = data.company_work[this_desc];

            if ((sfh.state.companies[loc]?.rep ?? 0) < job.rep_req
                || person.hac < job.hac_req
                || person.str < job.str_req
                || person.def < job.def_req
                || person.dex < job.dex_req
                || person.agi < job.agi_req
                || person.cha < job.cha_req
                || person.int < job.int_req)
            { break; }

            const value = calcCompanyWork(loc, job.desc, person, true)[key] as number;
            if (value > best) { desc = field; best = value; }

            this_desc = job.next;
        }
    }

    return desc;
}

function bestCrimeWork(person: Person = sfh.player, key: keyof WorkResult = "karma"): string {
    let desc = "";
    let best = 0;

    for (const work of Object.values(data.crime_work)) {
        const value = calcCrimeWork(work.desc, person, true)[key] as number;
        if (value > best) { desc = work.desc; best = value; }
    }

    return desc;
}

export async function main(ns: NS) {
    globalThis.data = {
        ...(await parse(ns)),

        calcWork,
        calcFactionWork,
        calcCompanyWork,
        calcCrimeWork,
        calcGymWork,
        calcStudyWork,

        bestFactionWork,
        bestCompanyWork,
        bestCrimeWork,
    };
}
