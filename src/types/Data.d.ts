import { Mults, Skills } from "src/types/SFH.js";

export type Special = "bladeburners" | "stanek" | "infiltration" | "daedalus" | "other" | null;

export type Program = {
    name:  string;
    level: number;
    time:  number;
};

export type Location = {
    name:       string;
    city:       string;
    types:      Set<string>;
    exp_mult:   number;
    cost_mult:  number;
    ram_min:    number;
    ram_max:    number;
    infil_init: number;
    infil_max:  number;
};

export type Server = {
    name:      string;
    layer:     number;
    ports:     number;
    hac_min:   number;
    hac_max:   number;
    money_min: number;
    money_max: number;
    level_min: number;
    level_max: number;
    grow_min:  number;
    grow_max:  number;
};

export type Augmentation = {
    name:             string;
    rep:              number;
    cost:             number;
    special:          Special;
    prereqs:          Set<string>;
    factions:         Set<string>;
    mults:            Record<keyof Mults, number>;
    startingMoney:    number;
    startingPrograms: Set<string>;
    custom_stats:     boolean;
};

export type FactionWork = {
    desc: string;
    name: string;
} & {
    [Prop in keyof Skills as `${Prop}_weight`]: number
} & {
    [Prop in keyof Skills as `${Prop}_exp`]: number
};

export type CrimeWork = {
    desc:  string;
    name:  string;
    time:  number;
    money: number;
    karma: number;
    kills: number;
} & {
    [Prop in keyof Skills as `${Prop}_weight`]: number
} & {
    [Prop in keyof Skills as `${Prop}_exp`]: number
};

export type CompanyWork = {
    desc:     string;
    name:     string;
    next:     string | null;
    fields:   Set<string>;
    money:    number;
    rep_req:  number;
} & {
    [Prop in keyof Skills as `${Prop}_req`]: number
} & {
    [Prop in keyof Skills as `${Prop}_weight`]: number
} & {
    [Prop in keyof Skills as `${Prop}_exp`]: number
};

export type ClassWork = {
    desc:  string;
    name:  string;
    gym:   boolean;
    money: number;
} & {
    [Prop in keyof Skills as `${Prop}_exp`]: number
};

export type FactionReqs = Partial<Skills> & {
    augs?:         number;
    money?:        number;
    karma?:        number;
    kills?:        number;
    city?:         Set<string>;
    backdoor?:     string;
    company?:      number;
    job?:          Set<string>;
    nocompany?:    Set<string>;
    hacknetLevel?: number;
    hacknetRAM?:   number;
    hacknetCores?: number;
    special?:      Special;
};

export type Faction = {
    name:    string;
    company: string | null;
    special: Special;
    reqs:    FactionReqs;
    augs:    Set<string>;
    enemies: Set<string>;
    work:    Record<string, boolean>;
    keep:    boolean;
};

export type Company = {
    name:        string;
    faction:     string | null;
    positions:   Set<string>;
    fields:      Set<string>;
    exp_mult:    number;
    money_mult:  number;
    stat_offset: number;
};

export type WorkResult = {
    desc:  string;
    name:  string;
    time:  number;
    prob:  number;
    money: number;
    karma: number;
    rep:   number;
} & {
    [Prop in keyof Skills as `${Prop}_exp`]: number
};

export type Data = {
    init: boolean;

    constants:    Record<string, number>;
    programs:     Record<string, Program>;
    locations:    Record<string, Location>;
    servers:      Record<string, Server>;
    augs:         Record<string, Augmentation>;
    field_entry:  Record<string, string>;
    faction_work: Record<string, FactionWork>;
    company_work: Record<string, CompanyWork>;
    crime_work:   Record<string, CrimeWork>;
    class_work:   Record<string, ClassWork>;
    factions:     Record<string, Faction>;
    companies:    Record<string, Company>;

    calcWork       (work: CurrentWork | null, person?: Person, focus?: boolean): WorkResult;
    calcFactionWork(loc: string, desc: string, person?: Person, focus?: boolean): WorkResult;
    calcCompanyWork(loc: string, desc: string, person?: Person, focus?: boolean): WorkResult;
    calcCrimeWork  (desc: string, person?: Person, focus?: boolean): WorkResult;
    calcGymWork    (loc: string, desc: string, person?: Person, focus?: boolean): WorkResult;
    calcStudyWork  (loc: string, desc: string, person?: Person, focus?: boolean): WorkResult;

    bestFactionWork(loc: string, person?: Person, key?: keyof WorkResult): string;
    bestCompanyWork(loc: string, person?: Person, key?: keyof WorkResult): string;
    bestCrimeWork(person?: Person, key?: keyof WorkResult): string;
}

declare global { var data: Data; }
