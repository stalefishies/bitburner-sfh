import { Mults } from "src/types/SFH";
import * as Data from "src/types/Data";

const mult_names: { [mult: string]: keyof Mults } = {
    hacking:                    "hac",
    strength:                   "str",
    defense:                    "def",
    dexterity:                  "dex",
    agility:                    "agi",
    charisma:                   "cha",
    hacking_exp:                "hac_exp",
    strength_exp:               "str_exp",
    defense_exp:                "def_exp",
    dexterity_exp:              "dex_exp",
    agility_exp:                "agi_exp",
    charisma_exp:               "cha_exp",
    hacking_chance:             "hack_prob",
    hacking_speed:              "hack_time",
    hacking_money:              "hack_money",
    hacking_grow:               "grow_rate",
    company_rep:                "company_rep",
    faction_rep:                "faction_rep",
    crime_money:                "crime_money",
    crime_success:              "crime_prob",
    work_money:                 "company_money",
    hacknet_node_money:         "hacknet_prod",
    hacknet_node_purchase_cost: "hacknet_node",
    hacknet_node_ram_cost:      "hacknet_ram",
    hacknet_node_core_cost:     "hacknet_core",
    hacknet_node_level_cost:    "hacknet_level",
    bladeburner_max_stamina:    "bb_sta",
    bladeburner_stamina_gain:   "bb_sta_gain",
    bladeburner_analysis:       "bb_analysis",
    bladeburner_success_chance: "bb_prob",
}
type AugMult = (typeof mult_names)[keyof typeof mult_names];

async function parseAll(ns: NS, ref: string, regex: RegExp) {
    const url = "https://raw.githubusercontent.com/danielyxie/bitburner/master/src/" + ref;
    const filename = "/data/" + ref.split(".")[0].split("/").join("_") + ".txt";

    let contents = ns.read(filename);
    if (!contents) {
        const result = await ns.wget(url, filename);
        if (!result) { throw new Error("Could not read " + url); }

        contents = ns.read(filename);
        if (!contents) { throw new Error("Could not read " + filename + " from " + url); }
    }

    const array = Array.from(contents.matchAll(regex));
    if (array.length == 0) { throw new Error("Got no matches for " + url); }

    return array;
}

export async function parse(ns: NS):
    Promise<{ [key in keyof Data.Data as (Data.Data[key] extends Function ? never : key)]: Data.Data[key] }>
{
    const constants      = Object.fromEntries((await parseAll(ns, "Constants.ts", /(\w+): ([0-9.e +\-*/]+)/g)).map(m => [m[1], eval(m[2])]));
    const aug_names      = Object.fromEntries((await parseAll(ns, "Augmentation/data/AugmentationNames.ts", /(\w+) = "(.*)"/g)).map(m => [m[1], m[2]]));
    const faction_names  = Object.fromEntries((await parseAll(ns, "Faction/data/FactionNames.ts",           /(\w+) = "(.*)"/g)).map(m => [m[1], m[2]]));
    const city_names     = Object.fromEntries((await parseAll(ns, "Locations/data/CityNames.ts",            /(\w+) = "(.*)"/g)).map(m => [m[1], m[2]]));
    const location_names = Object.fromEntries((await parseAll(ns, "Locations/data/LocationNames.ts",        /(\w+) = "(.*)"/g)).map(m => [m[1], m[2]]));
    const job_names      = Object.fromEntries((await parseAll(ns, "Company/data/companypositionnames.ts",   /(\w+Positions): string\[\] = (\[.*?\])/gs)).map(m => [m[1], eval(m[2])]));

    const programs: { [name: string]: Data.Program } = {};
    for (const data of (await parseAll(ns, "Programs/data/ProgramsMetadata.ts",
        /key:\s*"([\w+]+)",\s*name:\s*"([\w.]+)",\s*create:\s*{[^}]*level:\s*(\d+),[^}]*time:\s*CONSTANTS\.([\w */]+),/gs)))
    {
        programs[data[1]] = { name: data[2], level: Number(data[3]), time: eval("constants." + data[4]) };
    }

    const locations: Record<string, Data.Location> = {};
    for (const str of (await parseAll(ns, "Locations/data/LocationsMetadata.ts",
        /{\s*city:[^{}]*}|{\s*city:[^}]*{[^}]*}[^}]*}/gs)).map(m => m[0]))
    {
        const name = location_names[str.match(/name:\s*LocationName\.(\w+),/)![1]];
        const city = city_names[str.match(/city:\s*CityName\.(\w+),/)?.[1]!] ?? "";

        const types = Array.from(str.matchAll(/LocationType\.(\w+)/g))
            .map(m => m[1].replace(/([a-z])([A-Z])/, "$1 $2").toLowerCase());

        const  exp_mult = Number(str.match( /expMult: ([\de.]+),/)?.[1] ?? 0);
        const cost_mult = Number(str.match(/costMult: ([\de.]+),/)?.[1] ?? 0);

        const ram_min = Number(str.match(/techVendorMinRam: ([\de.]+),/)?.[1] ?? 0);
        const ram_max = Number(str.match(/techVendorMaxRam: ([\de.]+),/)?.[1] ?? 0);

        const infil_init = Number(str.match(/startingSecurityLevel: ([\de.]+),/)?.[1] ?? 0);
        const infil_max  = Number(str.match(    /maxClearanceLevel: ([\de.]+),/)?.[1] ?? 0);

        locations[name] = {
            name, city, types: new Set(types),
            exp_mult, cost_mult, ram_min, ram_max, infil_init, infil_max
        };
    }

    const servers: Record<string, Data.Server> = {};
    for (const str of (await parseAll(ns, "Server/data/servers.ts",
        /\n *([\w ]*){(?:[^{}]*(?:{[^}]*})?)*}/gs)).filter(m => m[1].length == 0).map(m => m[0]))
    {
        let name = str.match(/hostname:\s*"([\w-.]+)",/)?.[1]; //"
        if (!name) {
            name = (location_names[str.match(/hostname:\s*LocationName.(\w+)/)?.[1]!] ?? "darkweb").toLowerCase();
        }

        let hac_str, hac_min, hac_max;
        if (hac_str = str.match(/requiredHackingSkill:\s*(\d+),/)) {
            hac_min = Number(hac_str[1]);
            hac_max = Number(hac_str[1]);
        } else if (hac_str = str.match(/requiredHackingSkill:\s*{\s*min:\s*(\d+),\s*max:\s*(\d+),\s*}/)) {
            hac_min = Number(hac_str[1]);
            hac_max = Number(hac_str[2]);
        } else if (hac_str = str.match(/requiredHackingSkill:\s*{\s*max:\s*(\d+),\s*min:\s*(\d+),\s*}/)) {
            hac_min = Number(hac_str[2]);
            hac_max = Number(hac_str[1]);
        } else {
            hac_min = 1;
            hac_max = 1;
        }

        let money_str, money_min, money_max;
        if (money_str = str.match(/moneyAvailable:\s*(\d+),/)) {
            money_min = Number(money_str[1]);
            money_max = Number(money_str[1]);
        } else if (money_str = str.match(/moneyAvailable:\s*{\s*min:\s*(\d+),\s*max:\s*(\d+),\s*}/)) {
            money_min = Number(money_str[1]);
            money_max = Number(money_str[2]);
        } else if (money_str = str.match(/moneyAvailable:\s*{\s*max:\s*(\d+),\s*min:\s*(\d+),\s*}/)) {
            money_min = Number(money_str[2]);
            money_max = Number(money_str[1]);
        } else {
            money_min = 0;
            money_max = 0;
        }

        let level_str, level_min, level_max;
        if (level_str = str.match(/hackDifficulty:\s*(\d+),/)) {
            level_min = Number(level_str[1]);
            level_max = Number(level_str[1]);
        } else if (level_str = str.match(/hackDifficulty:\s*{\s*min:\s*(\d+),\s*max:\s*(\d+),\s*}/)) {
            level_min = Number(level_str[1]);
            level_max = Number(level_str[2]);
        } else if (level_str = str.match(/hackDifficulty:\s*{\s*max:\s*(\d+),\s*min:\s*(\d+),\s*}/)) {
            level_min = Number(level_str[2]);
            level_max = Number(level_str[1]);
        } else {
            level_min = 1;
            level_max = 1;
        }

        let grow_str, grow_min, grow_max;
        if (grow_str = str.match(/serverGrowth:\s*(\d+),/)) {
            grow_min = Number(grow_str[1]);
            grow_max = Number(grow_str[1]);
        } else if (grow_str = str.match(/serverGrowth:\s*{\s*min:\s*(\d+),\s*max:\s*(\d+),\s*}/)) {
            grow_min = Number(grow_str[1]);
            grow_max = Number(grow_str[2]);
        } else if (grow_str = str.match(/serverGrowth:\s*{\s*max:\s*(\d+),\s*min:\s*(\d+),\s*}/)) {
            grow_min = Number(grow_str[2]);
            grow_max = Number(grow_str[1]);
        } else {
            grow_min = 1;
            grow_max = 1;
        }

        const layer = Number(str.match(/networkLayer:\s*(\d+),/)?.[1] ?? 1);
        const ports = Number(str.match(/numOpenPortsRequired:\s*(\d+),/)?.[1] ?? 5);

        servers[name] = {
            name, layer, ports, hac_min, hac_max,
            money_min, money_max, level_min, level_max, grow_min, grow_max
        };
    }

    const augs: Record<string, Data.Augmentation> = {};
    for (const str of (await parseAll(ns, "Augmentation/data/AugmentationCreator.tsx",
        /{\s*name:[^{}]*}|{\s*name:[^}]*{[^}]*}[^}]*}/gs)).map(m => m[0]))
    {
        const name    = aug_names[str.match(/name:\s*AugmentationNames\.(\w+)/)![1]];
        const cost    = Number(str.match(/moneyCost:\s*([0-9.e]+)/)?.[1] ?? 0);
        const rep     = Number(str.match(  /repCost:\s*([0-9.e]+)/)?.[1] ?? 0);

        const prereqs = Array.from((str.match(/prereqs: \[(.*)\]/s)?.[1] ?? "").matchAll(/AugmentationNames.(\w+)/g) ?? []).map(m => aug_names[m[1]]);

        const factions = (name === "NeuroFlux Governor"
            ? Object.values(faction_names).filter(s => (s !== "Shadows of Anarchy" && s !== "Bladeburners" && s != "Church of the Machine God"))
            : Array.from((str.match(/factions: \[(.*)\]/s)?.[1] ?? "").matchAll(/FactionNames.(\w+)/g) ?? []).map(m => faction_names[m[1]])
        );
        
        const startingMoney    = Number(str.match(/startingMoney: ([0-9.e]+)/)?.[1] ?? 0);
        const startingPrograms = Array.from((str.match(/programs: \[(.*)\]/s)?.[1] ?? "").matchAll(/Programs.(\w+)/g) ?? []).map(m => programs[m[1]].name);

        let special: Data.Special = null;
        if (str.match(/isSpecial:\s*(\w+)/)?.[1] === "true") {
            if (factions.includes("Bladeburners")) {
                special = "bladeburners";
            } else if (factions.includes("Church of the Machine God")) {
                special = "stanek";
            } else if (factions.includes("Shadows of Anarchy")) {
                special = "infiltration";
            } else if (name === "The Red Pill") {
                special = "daedalus";
            } else if (name === "NeuroFlux Governor" || name === "BigD's Big ... Brain") {
                special = "other";
            } else {
                throw new Error("Unknown special augmentation " + name);
            }
        }

        const custom_stats = (name === "Unstable Circadian Modulator" || (!!str.match(/stats:/) && name !== "NeuroFlux Governor" && name !== "ECorp HVMind Implant"));

        const donationBonus = constants.Donations / 1e6 / 100;

        const mults = Object.fromEntries(Object.values(mult_names).map(s => [s, 1])) as
            Record<AugMult, number>;
        for (const match of str.matchAll(/(\w+):\s*([\w. +\-*/()]+),/g)) {
            if (match[1] in mult_names) { mults[mult_names[match[1]]] = eval(match[2]); }
        }

        augs[name] = {
            name, rep, cost, special,
            prereqs:  new Set(prereqs),
            factions: new Set(factions),
            mults, startingMoney, startingPrograms: new Set(startingPrograms), custom_stats
        };
    }

    const faction_work: Record<string, Data.FactionWork> = {};
    for (const [desc, values] of Object.entries({
        HACKING:  [ 1,    0,    0,    0,    0,    0,    1/3,  15,  0,  0,  0,  0,  0 ],
        SECURITY: [ 1/5,  1/5,  1/5,  1/5,  1/5,  0,    1/5,   5, 15, 15, 15, 15,  0 ],
        FIELD:    [ 9/55, 9/55, 9/55, 9/55, 9/55, 9/55, 9/55, 10, 10, 10, 10, 10, 10 ]
    })) {
        faction_work[desc] = {
            desc,
            name: desc[0] + desc.substring(1).toLowerCase(),

            hac_weight: values[0] / constants.MaxSkillLevel,
            str_weight: values[1] / constants.MaxSkillLevel,
            def_weight: values[2] / constants.MaxSkillLevel,
            dex_weight: values[3] / constants.MaxSkillLevel,
            agi_weight: values[4] / constants.MaxSkillLevel,
            cha_weight: values[5] / constants.MaxSkillLevel,
            int_weight: values[6] / constants.MaxSkillLevel,

            hac_exp: values[ 7] / 5,
            str_exp: values[ 8] / 5,
            def_exp: values[ 9] / 5,
            dex_exp: values[10] / 5,
            agi_exp: values[11] / 5,
            cha_exp: values[12] / 5,
            int_exp: 0,
        };
    }

    const company_work: Record<string, Data.CompanyWork> = {};
    for (const str of (await parseAll(ns, "Company/data/CompanyPositionsMetadata.ts",
        /{\s*name:[^{}]*}/gs)).map(m => m[0]))
    {
        const name_field = str.match(/name:\s*posNames.(\w+)\[(\d+)\],/);
        const name = job_names[name_field![1]][name_field![2]];

        const next_field = str.match(/nextPosition:\s*posNames.(\w+)\[(\d+)\],/);
        const next = next_field ? job_names[next_field[1]][next_field[2]] : null;

        const rep_mult = Number(str.match(/repMultiplier:\s*([\d.]+),/)?.[1] ?? 0);
        company_work[name] = {
            desc: name,
            name,

            next,
            fields: new Set(),
            
            rep_req: Number(str.match(/reqdReputation:\s*([\de.]+),/)?.[1] ?? 0),
            hac_req: Number(str.match(   /reqdHacking:\s*([\de.]+),/)?.[1] ?? 0),
            str_req: Number(str.match(  /reqdStrength:\s*([\de.]+),/)?.[1] ?? 0),
            def_req: Number(str.match(   /reqdDefense:\s*([\de.]+),/)?.[1] ?? 0),
            dex_req: Number(str.match( /reqdDexterity:\s*([\de.]+),/)?.[1] ?? 0),
            agi_req: Number(str.match(   /reqdAgility:\s*([\de.]+),/)?.[1] ?? 0),
            cha_req: Number(str.match(  /reqdCharisma:\s*([\de.]+),/)?.[1] ?? 0),
            int_req: 0,
            
            hac_weight: Number(str.match(  /hackingEffectiveness:\s*([\de.]+),/)?.[1] ?? 0)
                * rep_mult / (100 * constants.MaxSkillLevel),
            str_weight: Number(str.match( /strengthEffectiveness:\s*([\de.]+),/)?.[1] ?? 0)
                * rep_mult / (100 * constants.MaxSkillLevel),
            def_weight: Number(str.match(  /defenseEffectiveness:\s*([\de.]+),/)?.[1] ?? 0)
                * rep_mult / (100 * constants.MaxSkillLevel),
            dex_weight: Number(str.match(/dexterityEffectiveness:\s*([\de.]+),/)?.[1] ?? 0)
                * rep_mult / (100 * constants.MaxSkillLevel),
            agi_weight: Number(str.match(  /agilityEffectiveness:\s*([\de.]+),/)?.[1] ?? 0)
                * rep_mult / (100 * constants.MaxSkillLevel),
            cha_weight: Number(str.match( /charismaEffectiveness:\s*([\de.]+),/)?.[1] ?? 0)
                * rep_mult / (100 * constants.MaxSkillLevel),
            int_weight: 1 / constants.MaxSkillLevel,

            money: Number(str.match(   /baseSalary:\s*([\d.]+),/)?.[1] ?? 0),
            
            hac_exp: Number(str.match(     /hackingExpGain:\s*([\de.]+),/)?.[1] ?? 0),
            str_exp: Number(str.match(    /strengthExpGain:\s*([\de.]+),/)?.[1] ?? 0),
            def_exp: Number(str.match(     /defenseExpGain:\s*([\de.]+),/)?.[1] ?? 0),
            dex_exp: Number(str.match(   /dexterityExpGain:\s*([\de.]+),/)?.[1] ?? 0),
            agi_exp: Number(str.match(     /agilityExpGain:\s*([\de.]+),/)?.[1] ?? 0),
            cha_exp: Number(str.match(    /charismaExpGain:\s*([\de.]+),/)?.[1] ?? 0),
            int_exp: Number(str.match(/intelligenceExpGain:\s*([\de.]+),/)?.[1] ?? 0),
        };
    }

    const crime_work: Record<string, Data.CrimeWork> = {};
    for (const data of (await parseAll(ns, "Crime/Crimes.ts",
        /new Crime\("([\w ]+)",\s*"[\w ]+",\s*CrimeType\.\w+,\s*([\d.e]+),\s*([\d.e]+),\s*([\d.e */]+),\s*([\d.e]+),\s*{([^}]+)}\),/gs
    ))) {
        const str  = data[6];
        const desc = data[1].split(" ").join("").toUpperCase();
        const difficulty = constants.MaxSkillLevel * eval(data[4]);

        crime_work[desc] = {
            desc,
            name: data[1],
            time: Number(data[2]),

            hac_weight: Number(str.match(  /hacking_success_weight:\s*([\d.]+),/)?.[1] ?? 0)
                / (constants.MaxSkillLevel * difficulty),
            str_weight: Number(str.match( /strength_success_weight:\s*([\d.]+),/)?.[1] ?? 0)
                / (constants.MaxSkillLevel * difficulty),
            def_weight: Number(str.match(  /defense_success_weight:\s*([\d.]+),/)?.[1] ?? 0)
                / (constants.MaxSkillLevel * difficulty),
            dex_weight: Number(str.match(/dexterity_success_weight:\s*([\d.]+),/)?.[1] ?? 0)
                / (constants.MaxSkillLevel * difficulty),
            agi_weight: Number(str.match(  /agility_success_weight:\s*([\d.]+),/)?.[1] ?? 0)
                / (constants.MaxSkillLevel * difficulty),
            cha_weight: Number(str.match( /charisma_success_weight:\s*([\d.]+),/)?.[1] ?? 0)
                / (constants.MaxSkillLevel * difficulty),
            int_weight: constants.IntelligenceCrimeWeight / (constants.MaxSkillLevel * difficulty),

            money: Number(data[3]),
            karma: Number(data[5]),
            kills: Number(str.match(/kills:\s*(\d+),/)?.[1] ?? 0),

            hac_exp: Number(str.match(     /hacking_exp:\s*(\d+),/)?.[1] ?? 0),
            str_exp: Number(str.match(    /strength_exp:\s*(\d+),/)?.[1] ?? 0),
            def_exp: Number(str.match(     /defense_exp:\s*(\d+),/)?.[1] ?? 0),
            dex_exp: Number(str.match(   /dexterity_exp:\s*(\d+),/)?.[1] ?? 0),
            agi_exp: Number(str.match(     /agility_exp:\s*(\d+),/)?.[1] ?? 0),
            cha_exp: Number(str.match(    /charisma_exp:\s*(\d+),/)?.[1] ?? 0),
            int_exp: Number(str.match(/intelligence_exp:\s*(\d+)\s*\*/)?.[1] ?? 0)
                * constants.IntelligenceCrimeBaseExpGain,
        };
    }

    const class_work: Record<string, Data.ClassWork> = {}
    for (const [desc, values] of Object.entries({
        STUDYCOMPUTERSCIENCE: [   0, 0.5, 0, 0, 0, 0, 0, 0.01 ],
        DATASTRUCTURES:       [  40,   1, 0, 0, 0, 0, 0, 0.01 ],
        NETWORKS:             [  80,   2, 0, 0, 0, 0, 0, 0.01 ],
        ALGORITHMS:           [ 320,   4, 0, 0, 0, 0, 0, 0.01 ],
        MANAGEMENT:           [ 160,   0, 0, 0, 0, 0, 2, 0.01 ],
        LEADERSHIP:           [ 320,   0, 0, 0, 0, 0, 4, 0.01 ],
        GYMSTRENGTH:          [ 120,   0, 1, 0, 0, 0, 0, 0.01 ],
        GYMDEFENSE:           [ 120,   0, 0, 1, 0, 0, 0, 0.01 ],
        GYMDEXTERITY:         [ 120,   0, 0, 0, 1, 0, 0, 0.01 ],
        GYMAGILITY:           [ 120,   0, 0, 0, 0, 1, 0, 0.01 ],
    })) {
        class_work[desc] = {
            desc,
            name: desc,
            gym: desc.startsWith("GYM"),
            money:  -values[0] / 5,
            hac_exp: values[1] / 5,
            str_exp: values[2] / 5,
            def_exp: values[3] / 5,
            dex_exp: values[4] / 5,
            agi_exp: values[5] / 5,
            cha_exp: values[6] / 5,
            int_exp: values[7] / 5,
        };
    };

    const faction_reqs: Record<string, Data.FactionReqs> = {
        "CyberSec":       { "backdoor": "CSEC" },
        "NiteSec":        { "backdoor": "avmnite-02h" },
        "The Black Hand": { "backdoor": "I.I.I.I" },
        "BitRunners":     { "backdoor": "run4theh111z" },

        "Tian Di Hui": {
            "money": 1e6,
            "hac": 50,
            "city": new Set(["Chongqing", "New Tokyo", "Ishima"]),
        },
        "Netburners": {
            "hac": 80,
            "hacknetLevel": 100,
            "hacknetRAM": 8,
            "hacknetCores": 4,
        },

        "Sector-12": {
            "money": 15e6,
            "city": new Set(["Sector-12"])
        },
        "Aevum": {
            "money": 40e6,
            "city": new Set(["Aevum"])
        },
        "Volhaven": {
            "money": 50e6,
            "city": new Set(["Volhaven"])
        },
        "Chongqing": {
            "money": 20e6,
            "city": new Set(["Chongqing"])
        },
        "New Tokyo": {
            "money": 20e6,
            "city": new Set(["New Tokyo"])
        },
        "Ishima": {
            "money": 30e6,
            "city": new Set(["Ishima"])
        },

        "ECorp":                  { "company": 400e3 },
        "MegaCorp":               { "company": 400e3 },
        "Bachman & Associates":   { "company": 400e3 },
        "Blade Industries":       { "company": 400e3 },
        "NWO":                    { "company": 400e3 },
        "Clarke Incorporated":    { "company": 400e3 },
        "OmniTek Incorporated":   { "company": 400e3 },
        "Four Sigma":             { "company": 400e3 },
        "KuaiGong International": { "company": 400e3 },
        "Fulcrum Secret Technologies": {
            "company": 400e3,
            "backdoor": "fulcrumassets"
        },

        "Speakers for the Dead": {
            "hac": 100,
            "str": 300,
            "def": 300,
            "dex": 300,
            "agi": 300,
            "kills": 30,
            "karma": -45,
            "nocompany": new Set(["CIA", "NSA"])
        },
        "The Dark Army": {
            "hac": 300,
            "str": 300,
            "def": 300,
            "dex": 300,
            "agi": 300,
            "city": new Set(["Chongqing"]),
            "kills": 5,
            "karma": -45,
            "nocompany": new Set(["CIA", "NSA"])
        },
        "The Syndicate": {
            "money": 10e6,
            "hac": 200,
            "str": 200,
            "def": 200,
            "dex": 200,
            "agi": 200,
            "city": new Set(["Aevum", "Sector-12"]),
            "karma": -90,
            "nocompany": new Set(["CIA", "NSA"])
        },
        "Silhouette": {
            "money": 15e6,
            "karma": -22,
            "job": new Set([
                "Chief Technical Officer",
                "Chief Financial Officer",
                "Chief Executive Officer"
            ])
        },
        "Tetrads": {
            "str": 200,
            "def": 200,
            "dex": 200,
            "agi": 200,
            "city": new Set(["Chongqing", "New Tokyo", "Ishima"]),
            "karma": -18,
        },
        "Slum Snakes": {
            "money": 1e6,
            "str": 30,
            "def": 30,
            "dex": 30,
            "agi": 30,
            "karma": -9,
        },

        "The Covenant": {
            "augs": 20,
            "money": 75e9,
            "hac": 850,
            "str": 850,
            "def": 850,
            "dex": 850,
            "agi": 850
        },
        "Illuminati": {
            "augs": 30,
            "money": 150e9,
            "hac": 1500,
            "str": 1200,
            "def": 1200,
            "dex": 1200,
            "agi": 1200
        },
        "Daedalus": {
            "special": "daedalus",
            "money": 100e9
        },

        "Bladeburners": {
            "special": "bladeburners",
            "str": 100,
            "def": 100,
            "dex": 100,
            "agi": 100
        },
        "Church of the Machine God": {
            "special": "stanek"
        },
    };

    const factions: Record<string, Data.Faction> = {};
    for (const data of (await parseAll(ns, "Faction/FactionInfo.tsx",
        /\[FactionNames.(\w+)\]: new FactionInfo\({(.*?)}\),/gs)))
    {
        const name = faction_names[data[1]];
        const str  = data[2];

        const work = {
            HACKING:  str.match(/offerHackingWork:\s*(\w+),/ )?.[1] === "true",
            FIELD:    str.match(/offerFieldWork:\s*(\w+),/   )?.[1] === "true",
            SECURITY: str.match(/offerSecurityWork:\s*(\w+),/)?.[1] === "true",
        }

        let special: Data.Special = null;
        if (str.match(/special:\s*(\w+)/)?.[1] === "true") {
            if (name === "Bladeburners") {
                special = "bladeburners";
            } else if (name === "Church of the Machine God") {
                special = "stanek";
            } else if (name === "Shadows of Anarchy") {
                special = "infiltration";
            } else {
                throw new Error("Unknown special faction " + name);
            }
        }

        const augs = new Set<string>();

        const reqs = faction_reqs[name] ?? {};
        const enemies = Array.from((str.match(/enemies: \[(.*)\]/s)?.[1] ?? "").matchAll(/FactionNames.(\w+)/g) ?? [])
            .map(m => faction_names[m[1]]);
        const keep = str.match(/keepOnInstall:\s*(\w+)/)?.[1] === "true";

        factions[name] = { name, company: null, special, augs, reqs, enemies: new Set(enemies), work, keep };
    }
    for (const aug of Object.values(augs)) {
        for (const faction of aug.factions) {
            factions[faction].augs.add(aug.name);
        }
    }
    
    const company_fields = {
        "Software"            : "Software Engineering Intern",
        "Software Consultant" : "Software Consultant",
        "IT"                  : "IT Intern",
        "Security Engineer"   : "Security Engineer",
        "Network Engineer"    : "Network Engineer",
        "Business"            : "Business Intern",
        "Business Consultant" : "Business Consultant",
        "Security"            : "Security Guard",
        "Agent"               : "Field Agent",
        "Employee"            : "Employee",
        "Part-time Employee"  : "Part-time Employee",
        "Waiter"              : "Waiter",
        "Part-time Waiter"    : "Part-time Waiter"
    };

    for (let [field, job] of (Object.entries(company_fields) as [string, string | null][])) {
        while (job) {
            company_work[job].fields.add(field);
            job = company_work[job].next;
        }
    }

    const company_categories: Record<string, Set<string>> = {
        AllSoftwarePositions:                   new Set(),
        AllITPositions:                         new Set(),
        AllNetworkEngineerPositions:            new Set(),
        SecurityEngineerPositions:              new Set(),
        AllTechnologyPositions:                 new Set(),
        AllBusinessPositions:                   new Set(),
        AllAgentPositions:                      new Set(),
        AllSecurityPositions:                   new Set(),
        AllSoftwareConsultantPositions:         new Set(),
        AllBusinessConsultantPositions:         new Set(),
        SoftwarePositionsUpToHeadOfEngineering: new Set(),
        SoftwarePositionsUpToLeadDeveloper:     new Set(),
        BusinessPositionsUpToOperationsManager: new Set(),
        WaiterOnly:                             new Set(),
        EmployeeOnly:                           new Set(),
        PartTimeWaiterOnly:                     new Set(),
        PartTimeEmployeeOnly:                   new Set(),
        OperationsManagerOnly:                  new Set(),
        CEOOnly:                                new Set(),
    }

    for (const name of job_names.SoftwareCompanyPositions) {
        company_categories.AllSoftwarePositions.add(name);
        company_categories.AllTechnologyPositions.add(name);
    }

    for (const name of job_names.ITCompanyPositions) {
        company_categories.AllITPositions.add(name);
        company_categories.AllTechnologyPositions.add(name);
    }

    for (const name of job_names.NetworkEngineerCompanyPositions) {
        company_categories.AllNetworkEngineerPositions.add(name);
        company_categories.AllTechnologyPositions.add(name);
    }

    for (const name of job_names.BusinessCompanyPositions) {
        company_categories.AllBusinessPositions.add(name);
    }
    for (const name of job_names.SecurityCompanyPositions) {
        company_categories.AllSecurityPositions.add(name);
    }
    for (const name of job_names.AgentCompanyPositions) {
        company_categories.AllAgentPositions.add(name);
    }
    for (const name of job_names.SoftwareConsultantCompanyPositions) {
        company_categories.AllSoftwareConsultantPositions.add(name);
    }
    for (const name of job_names.BusinessConsultantCompanyPositions) {
        company_categories.AllBusinessConsultantPositions.add(name);
    }

    for (let i = 0; i < job_names.SoftwareCompanyPositions.length; ++i) {
        const name = job_names.SoftwareCompanyPositions[i];
        if (i <= 3) { company_categories.SoftwarePositionsUpToLeadDeveloper.add(name); }
        if (i <= 5) { company_categories.SoftwarePositionsUpToHeadOfEngineering.add(name); }
    }

    for (let i = 0; i < job_names.BusinessCompanyPositions.length; ++i) {
        const name = job_names.BusinessCompanyPositions[i];
        if (i <= 3) { company_categories.BusinessPositionsUpToOperationsManager.add(name); }
    }

    company_categories.AllTechnologyPositions.add(job_names.SecurityEngineerCompanyPositions[0]);
    company_categories.SecurityEngineerPositions.add(job_names.SecurityEngineerCompanyPositions[0]);
    company_categories.WaiterOnly.add(job_names.MiscCompanyPositions[0]);
    company_categories.EmployeeOnly.add(job_names.MiscCompanyPositions[1]);
    company_categories.PartTimeWaiterOnly.add(job_names.PartTimeCompanyPositions[0]);
    company_categories.PartTimeEmployeeOnly.add(job_names.PartTimeCompanyPositions[1]);
    company_categories.OperationsManagerOnly.add(job_names.BusinessCompanyPositions[3]);
    company_categories.CEOOnly.add(job_names.BusinessCompanyPositions[5]);

    const companies: Record<string, Data.Company> = {};
    for (const str of (await parseAll(ns, "Company/data/CompaniesMetadata.ts",
        /{\s*name:(?:[^{}]*(?:{[^}]*})?)*}/gs)).map(m => m[0]))
    {
        const name = location_names[str.match(/name:\s*LocationName\.(\w+),/)![1]]

        const    exp_mult = Number(str.match(   /expMultiplier:\s*([\d.]+),/)![1]);
        const  money_mult = Number(str.match(/salaryMultiplier:\s*([\d.]+),/)![1]);
        const stat_offset = Number(str.match(/jobStatReqOffset:\s*([\d.]+),/)![1]);

        const positions: Set<string> = new Set();
        for (const category of
             str.match(/companyPositions:\s*Object.assign\(\s*{},\s*([\w\s,]*)\)/s)![1].match(/\w+/g)!
        ) {
            for (const position of company_categories[category]) { positions.add(position); }
        }

        const fields: Set<string> = new Set();
        for (const position of positions) {
            for (const field of company_work[position].fields) { fields.add(field); }
        }

        let faction = null;
        if (name === "Fulcrum Technologies") {
            faction = "Fulcrum Secret Technologies";
            factions[faction].company = name;
        } else if (name in factions) {
            faction = name;
            factions[faction].company = name;
        }

        companies[name] = { name, faction, positions, fields, exp_mult, money_mult, stat_offset };
    }

    return {
        init: true,
        constants,
        programs,
        locations,
        servers,
        augs,
        field_entry: company_fields,
        faction_work,
        company_work,
        crime_work,
        class_work,
        factions,
        companies,
    };
}
