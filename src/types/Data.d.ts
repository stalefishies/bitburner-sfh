import { NS } from "netscript";

export type Aug = {
    name     : string;
    cost     : number;
    rep      : number;
    prereqs  : string[];
    mults    : ReturnType<NS["getAugmentationStats"]>;
    factions : string[];
}

export type FactionReq = {
    augs?         : number;
    money?        : number;
    hacking?      : number;
    combat?       : number;
    city?         : string[];
    backdoor?     : string;
    company?      : number;
    kills?        : number;
    karma?        : number;
    job?          : string[];
    nocompany?    : string[];
    hacknetLevel? : number;
    hacknetRAM?   : number;
    hacknetCores? : number;
    special?      : "daedalus" | "bladeburners" | "stanek";
}

export type Faction = {
    name     : string;
    reqs     : FactionReq;
    augs     : string[];
    enemies? : string[];
    company? : string;
    server?  : string;
    work     : { [name: string]: FactionWork };
    keep     : boolean;
}

export type Job = {
    name                   : string;
    nextPosition           : string | null;
    baseSalary             : number;
    repMultiplier          : number;
    requiredHacking        : number;
    requiredStrength       : number;
    requiredDefense        : number;
    requiredDexterity      : number;
    requiredAgility        : number;
    requiredCharisma       : number;
    requiredReputation     : number;
    hackingEffectiveness   : number;
    strengthEffectiveness  : number;
    defenseEffectiveness   : number;
    dexterityEffectiveness : number;
    agilityEffectiveness   : number;
    charismaEffectiveness  : number;
    hackingExpGain         : number;
    strengthExpGain        : number;
    defenseExpGain         : number;
    dexterityExpGain       : number;
    agilityExpGain         : number;
    charismaExpGain        : number;
};

export type FactionWork = {
    rep_skill_mult : number;
    rep_str_mult   : number;
    rep_def_mult   : number;
    rep_dex_mult   : number;
    rep_agi_mult   : number;
    rep_cha_mult   : number;
    rep_int_mult   : number;
    skill_rate     : number;
    str_rate       : number;
    def_rate       : number;
    dex_rate       : number;
    agi_rate       : number;
    cha_rate       : number;
};

export type Company = {
    name        : string;
    fields      : { [name: string]: Job[] };
    exp_mult    : number;
    money_mult  : number;
    stat_offset : number;
    faction?    : string;
    server?     : string;
}

export type Data = {
    augs:         { [name: string]: Aug         },
    factions:     { [name: string]: Faction     },
    jobs:         { [name: string]: Job         },
    faction_work: { [name: string]: FactionWork },
    companies:    { [name: string]: Company     },
}

declare global { var data: Data; }
