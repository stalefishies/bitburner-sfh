import { NS } from "netscript";

export type Aug = {
    name     : string;
    cost     : number;
    rep      : number;
    prereqs  : string[];
    mults    : ReturnType<NS["singularity"]["getAugmentationStats"]>;
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
    name       : string;
    next       : string | null;
    salary     : number;
    rep_mult   : number;
    skill_req  : number;
    str_req    : number;
    def_req    : number;
    dex_req    : number;
    agi_req    : number;
    cha_req    : number;
    rep_req    : number;
    skill_mult : number;
    str_mult   : number;
    def_mult   : number;
    dex_mult   : number;
    agi_mult   : number;
    cha_mult   : number;
    skill_rate : number;
    str_rate   : number;
    def_rate   : number;
    dex_rate   : number;
    agi_rate   : number;
    cha_rate   : number;
};

export type FactionWork = {
    skill_mult : number;
    str_mult   : number;
    def_mult   : number;
    dex_mult   : number;
    agi_mult   : number;
    cha_mult   : number;
    int_mult   : number;
    skill_rate : number;
    str_rate   : number;
    def_rate   : number;
    dex_rate   : number;
    agi_rate   : number;
    cha_rate   : number;
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
