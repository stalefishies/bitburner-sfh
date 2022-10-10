export type Perms = {
    bitnode:   boolean;     // can destroy the current bitnode
    install:   boolean;     // can install augmentations or soft reset
    scripts:   boolean;     // can run scripts on the network
    purchase:  boolean;     // can spend money
    hacking:   boolean;     // can lower servers below max money / min security
    batching:  boolean;     // can run batch hacks on the network
    trading:   boolean;     // can trade stocks
    hnet:      boolean;     // can spend hashes
    contracts: boolean;     // can run coding contracts
    corp:      boolean;     // can run corporation
    working:   boolean;     // can manage factions and companies
    automate:  boolean;     // can assume no manual input
};

export type Internals = {
    print(message: string, type?: "success" | "warning" | "error" | "info"): void;
    toast(message: string, type?: "success" | "warning" | "error" | "info", duration?: number): void;

    save(): Promise<void>;
    export(): void;
    saveRead(): Promise<any>;
    saveReadB64(): string;
    saveWrite(data: any, reload?: boolean): Promise<void>;

    webpack: any;
    player:  any;
    router:  any;
};

export type UIStat = {
    stat:    "money" | "skill" | "rep" | "hp" | "str" | "def" | "dex" | "agi" | "cha" | "int";
    label:   HTMLTableCellElement;
    value:   HTMLTableCellElement;
    bar:     HTMLTableCellElement;
    bar_bg:  HTMLDivElement;
    bar_fg:  HTMLDivElement;
    time?:   HTMLTableCellElement;
};

export type UI = {
    colours:  ReturnType<NS["ui"]["getTheme"]>;
    styles:   ReturnType<NS["ui"]["getStyles"]>;
    root:     HTMLDivElement;
    overview: HTMLDivElement;

    sfh:      HTMLDivElement;
    header:   HTMLButtonElement;
        title: HTMLDivElement;
    stats: {
        block: HTMLButtonElement;
        child: UIStat[];
    }
    buttons:  HTMLDivElement;
        button_list: { name: keyof Perms; button: HTMLButtonElement; }[]
    work:     HTMLButtonElement;
        type:  HTMLDivElement;
        org:   HTMLDivElement;
        desc:  HTMLDivElement;
    augs:     HTMLDivElement;
        aug_title: HTMLDivElement;
        aug_next:  HTMLDivElement;
        aug_cost:  HTMLDivElement;
        aug_total: HTMLDivElement;
    stocks:   HTMLDivElement;
        stocks_current: HTMLDivElement;
        stocks_total:   HTMLDivElement;
        stocks_profit:  HTMLDivElement;
    gang:     HTMLDivElement;
        gang_status: HTMLDivElement;
        gang_dps:    HTMLDivElement;
        gang_time:   HTMLDivElement;
    corp:     HTMLDivElement;
        corp_profit:   HTMLDivElement;
        corp_progress: HTMLDivElement;
        corp_product:  HTMLDivElement;
};

export type Timing = {
    now:     number;
    period:  number;
    reset:   number;
    total:   number;
    bitnode: number;
};

export type Skills = {
    hac: number;
    str: number;
    def: number;
    dex: number;
    agi: number;
    cha: number;
    int: number;
};
export type SkillExp = { [Prop in keyof Skills as `${Prop}_exp`]: number };

export type Gain = {
    money: number;
    karma: number;
    rep:   number;
} & SkillExp;

export type GainType =
    "scripts" | "work" | "sleeves" | "hacknet" | "gang" | "corp";
export type Gains = { total: Gain } & { [ type in GainType ]: Gain; };

export type SpendType =
    "goal" | "upgrade" | "program" | "cluster" | "hacknet" | "stocks" | "gang" | "sleeves";

export type Money = {
    curr:  number;
    total: number;

    frac:  { [type in SpendType]: number; }
    spent: { [type in SpendType]: number; }

    can_class: boolean;
};

export type Org = {
    name:     string;
    faction:  boolean;
    joined:   boolean;
    finished: boolean;
    augs:     Set<string> & { all: Set<string>; }
    favour:   number;
    rep:      number;
    dual?:    string;
    title?:   string;
};

export type Goal = Skills & {
    type:  null | "program" | "faction" | "augmentation" | "work" | "corp";
    desc:  string;

    money:       number;
    money_next:  number;
    money_total: number;

    augs: { org: Org, name: string }[];
    work: { org: Org, rep:  number }[];
    orgs: Set<Org>;

    times: {
        money: number;
        karma: number;
        rep:   number;
    } & Skills;
    time: number;

    corp:       boolean;
    corp_ticks: number;
};

export type Continent = "America" | "Europe" | "Asia";
export type City      = "Sector-12" | "Aevum" | "Volhaven" | "Chongqing" | "New Tokyo" | "Ishima";

export type Work = {
    type:  "faction" | "company" | "crime" | "program" | "gym" | "university" | "graft"
        | "shock" | "sync" | "bladeburner" | "infiltrate" | "support";
    loc:   string;
    desc:  string;

    goal:  boolean;
    focus: boolean;
};

export type State = {
    have_goal: boolean;

    augs: Set<string> & { queued: Set<string>; };
    factions:  { [faction: string]: (Org & { faction: true  }) };
    companies: { [company: string]: (Org & { faction: false }) };

    prev_work:  Work | null;
    work:       Work | null;
    share_mult: number;

    continent: Continent | null;
    city:      City;
    location:  string;

    goto: {
        city: City;
        type: "faction" | "work";
        desc: string;
    } | null;

    has_tor:          boolean;
    has_brutessh:     boolean;
    has_ftpcrack:     boolean;
    has_relaysmtp:    boolean;
    has_httpworm:     boolean;
    has_sqlinject:    boolean;
    has_formulas:     boolean;
    has_basics:       boolean;
    has_stocks:       boolean;
    has_4S:           boolean;
    has_gang:         boolean;
    has_corp:         boolean;
    has_bladeburners: boolean;
};

export type Mults = Skills & SkillExp & {
    hack_money:  number;
    hack_profit: number;
    hack_manual: number;
    hack_prob:   number;
    hack_time:   number;
    grow_rate:   number;
    weak_rate:   number;

    max_money:  number;
    init_money: number;
    init_level: number;

    aug_cost: number;
    aug_rep:  number;

    home_cost:       number;
    cluster_cost:    number;
    cluster_count:   number;
    cluster_max_ram: number;
    cluster_softcap: number;

    faction_rep:     number;
    faction_exp:     number;
    faction_passive: number;
    company_money:   number;
    company_rep:     number;
    company_exp:     number;
    crime_money:     number;
    crime_exp:       number;
    crime_prob:      number;
    class_exp:       number;

    contract_money:  number;
    infil_money:     number;
    infil_rep:       number;

    hacknet_prod:  number;
    hacknet_node:  number;
    hacknet_level: number;
    hacknet_ram:   number;
    hacknet_core:  number;

    corp_dividends: number;
    corp_valuation: number;
    gang_softcap:   number;
    stanek_power:   number;

    bb_sta:      number;
    bb_sta_gain: number;
    bb_analysis: number;
    bb_prob:     number;
    bb_rank:     number;
    bb_cost:     number;
};

export type Person = Skills & SkillExp & {
    mults:  Mults;
    hp:     number;
    cur_hp: number;
} & ({
    sleeve: false;
    player: ReturnType<NS["getPlayer"]>;
    karma:  number;
    kills:  number;
} | {
    sleeve: true;
    index:  number;
    shock:  number;
    sync:   number;
    city:   string;
});

export type Player = Person & { sleeve: false };
export type Sleeve = Person & { sleeve: true  };

export type Bitnode = {
    number: number;
    sf:     number[];
    mults:  Mults;

    donation:      number;
    stock_4S_base: number;
    stock_4S_api:  number;
    gang_augs:     number;
    stanek_size:   number;
    daedalus_augs: number;
    world_daemon:  number;
};

export type Server = {
    server:     ReturnType<NS["getServer"]>;
    name:       string;
    owned:      boolean;
    hnet:       boolean;

    skill:      number;
    ip:         string;
    org:        string;
    symbol:     string | null;

    ports:      number;
    cur_ports:  number;
    root:       boolean;
    backdoor:   boolean;
    target:     boolean;

    ram:        number;
    used_ram:   number;
    cores:      number;
    pool:       boolean;

    money:      number;
    cur_money:  number;
    level:      number;
    cur_level:  number;
    base_level: number;
    prepped:    boolean;

    grow_mult:  number;
    tH:         number;
    tG:         number;
    tW:         number;

    cct:        string[];
    edges:      Set<string>;
    depth:      number;
};

export type NetworkStatus = {
    ready:    boolean;
    scp_args: [string[], string][];
};

export type Network = { [name: string]: Server };

type Arg = (string | number | boolean);
export type Proc = {
    pid:       number;
    alive:     boolean;
    time:      number;
    end_time?: number;
    script:    string;
    host:      string;
    ram:       number;
    threads:   number;
    args?:     Arg[];
    pids?:     Set<number>;
    alloc?:    { [name: string]: number };
};

export type Processes = {
    set:       Set<Proc>;
    pools:     Server[];

    home:      Proc | null;
    backdoor:  Proc | null;

    sharing: Set<Proc>;
    exp:     Set<Proc>;
    stanek:  Set<Proc>;

    total_ram: number;
    free_ram:  number;
    max_pool:  number;
};

export type BatchLog = {
    batch: number;
    hac:   number;
    quit:  boolean;

    loop:  number;
    level: number;
    money: number;

    killed:   [boolean, boolean, boolean, boolean];
    late:     [boolean, boolean, boolean, boolean];
    dispatch: [boolean, boolean, boolean, boolean];
}

export type HackingParams = {
    target:    Server;
    calc_time: number;
    calc_hac:  number;
    init_time: number;

    prep: {
        procs:     Set<Proc>;
        end_time:  number;
        end_money: number;
        end_level: number;
        time:      number;
    };

    batch: {
        hac:     [number, number];
        t0:      number;

        period:  number;
        kW:      number;
        kG:      number;
        kH:      number;

        money:   number;
        prob:    number;
        max_dps: number;
        threads: [number, number, number, number];
    } & ({
        proc:    null;
    } | {
        proc:    Proc;
        log:     BatchLog[];
        quit:    boolean;
        scripts: number;
        batch:   number;
        depth:   number;
        dps:     number;
        delay:   [number, number, number, number];

        pools: [
            { [name: string]: { count: number, free: number } },
            { [name: string]: { count: number, free: number } },
            { [name: string]: { count: number, free: number } },
            { [name: string]: { count: number, free: number } }
        ];

        running: [
            { host: string, pid: number }[],
            { host: string, pid: number }[],
            { host: string, pid: number }[],
            { host: string, pid: number }[]
        ];
    });
};

export type Hacking = {
    params:      { [target: string]: HackingParams; }
    list:        HackingParams[];
    min_dps:     number;
    scripts:     number;
    max_scripts: number;
};

export type Sleeves = Sleeve[];

export type Stock = {
    symbol:    string;
    org:       string;
    server:    Server | null;
    ask_price: number;
    bid_price: number;
    spread:    number;
    max:       number;
    vol:       number;
    prob:      number;
    mult:      number;
    ticks:     number;

    short: boolean;
    owned: number;
    spent: number;
    sell:  number;

    history:  number[];
    length:   number;
    forecast: number;
    flip:     number;
    flip_s:   number;
};

export type Trading = {
    stocks: { [symbol: string]: Stock };
    list:   Stock[];
    init:   boolean;
    time:   number;
    dps:    number;

    spent:       number;
    sell:        number;
    total_spent: number;
    total_sold:  number;
};

export type Contracts = {

};

export type Hacknet = {
    hashes:     number;
    capacity:   number;
    prod:       number;
    study_mult: number;
    train_mult: number;
};

export type Gang = {
    state: "respect" | "power" | "money";
    members: {
        ready:    boolean;
        task:     string;
        com_time: number;
        hac_time: number;
        cha_time: number;
    }[];
    prev_times: { time: number, rspct: number, power: number, money: number };

    can_ascend: boolean;
    train_time: number;

    name:  string;
    size:  number;
    time:  number;
    clash: number;
    aug_rep: number;
};

export type Corp = {
    reserve:    boolean;    // make space to run the corp script
    ready:      boolean;    // can run the corp script
    state:      number;

    public:     boolean;
    funds:      number;
    profit:     number;
    divisions:  Set<string>;
    wait_ticks: number;
    round:      number;
    offer:      number;
    div_frac:   number;
    dividends:  number;

    A: {
        exists:  boolean;
        adverts: number;

        office: {
            [city in City]: {
                warehouse: boolean;
                employees: number;
            }
        };
    };

    T: {
        exists:   boolean;
        adverts:  number;
        research: number;
        res_rate: number;

        office: {
            [city in City]: {
                warehouse: boolean;
                employees: number;
            }
        };

        products: {
            development: number,
            time:        number,
            price_ticks: number,
            price_power: number,
            amount:      number[],
            change:      number[]
        }[];
    };
};

export type Stanek = {
    width:  number;
    height: number;


};

type Host = { name: string, ram: number, alloc?: { [name: string]: number }, threads: number };

declare class SFH {
    loop:    boolean;
    reload:  boolean;
    reset:   boolean;
    install: boolean;

    can:  Perms;
    x:    Internals;
    ui:   UI;
    time: Timing;

    bitnode: Bitnode;
    player:  Player;
    state:   State;
    money:   Money;
    gains:   Gains;
    goal:    Goal;
    netstat: NetworkStatus;
    network: Network;
    procs:   Processes;
    hacking: Hacking;
    sleeves: Sleeves;
    trading: Trading;
    hnet:    Hacknet;
    gang:    Gang;
    corp:    Corp;
    stanek:  Stanek;

    constructor(sfh: { [K in keyof SFH as (SFH[K] extends Function | boolean ? never : K)]: SFH[K] });

    getBitburnerInternals(): void;

    format(fmt: string, ...args: any[]): string;
    sprint(...args: any[]): string;
    print(...args: any[]): void;

    uiCreate(ns: NS): void;
    uiInject(ns: NS): void;
    uiRemove(): void;
    uiUpdate(): void;

    purchase(type: SpendType, money: (() => number) | null, cost: number | (() => number),
        callback: (() => unknown) | null, frac?: number): boolean;

    gainUpdate(type: Exclude<GainType, "total">, gain: Partial<Gain> | null): void;
    playerUpdate(ns: NS, player: ReturnType<NS["getPlayer"]>): void;
    sleeveUpdate(index: number, info: ReturnType<NS["sleeve"]["getInformation"]>,
        skills: ReturnType<NS["sleeve"]["getSleeveStats"]>): void;
    workUpdate(nsGetCurrentWork: ReturnType<NS["singularity"]["getCurrentWork"]>, focus: boolean): void;
    goalSort(): void;

    netAdd(server: ReturnType<NS["getServer"]>, edges: string[], depth: number | null): void;
    netCopy(nsScp: NS["scp"], ...args: (string | string[])[]): void;
    netSort(): void;

    netHost(ram: number, min_threads?: number, max_threads?: number): Host | null;
    netProc(set: Set<Proc> | null, nsExec: NS["exec"], script: string, host: Host | null, ...args: Arg[]): Proc | null;
    netExec(nsExec: NS["exec"], script: string, ram: number, threads: number, ...args: Arg[]): Proc | null;

    netGC(nsIsRunning: NS["isRunning"]): void;

    servers(filter?: ((n: Server) => boolean)): Iterable<Server>;
    pools(filter?: ((n: Server) => boolean)): Iterable<Server>;

    calc(target: Server | string, cores?: number): Calc;
    intMult(weight: number): number;
}

type CalcRet = {
    threads:    number;
    time:       number;
    money_diff: number;
    level_diff: number;
    prob:       number;
    exp:        number;
    profit:     number;
};

declare class Calc {
    skill:          number;
    skill_exp:      number;
    int:            number;
    cores:          number;
    core_mult:      number;
    money:          number;
    level:          number;
    cur_money:      number;
    cur_level:      number;
    req_skill:      number;
    base_level:     number;
    skill_mult:     number;
    skill_exp_mult: number;
    hack_mult:      number;
    time_mult:      number;
    prob_mult:      number;
    prof_mult:      number;
    grow_mult:      number;
    weak_mult:      number;

    int_mult(weight: number): number;
    setup(money?: number, level?: number): Calc;

    hackTime(level?: number): number;
    growTime(level?: number): number;
    weakTime(level?: number): number;
    manualHackTime(level?: number): number;
    manualGrowTime(level?: number): number;
    manualWeakTime(level?: number): number;
    backdoorTime(level?: number): number;

    exp(threads?: number): number;
    expAt(skill: number): number;
    expTo(skill: number): number;
    expRate(): number;

    hackFrac(level?: number): number;
    hackProb(level?: number): number;
    runHack(threads: number, level_init?: number, money?: number, level?: number, sim?: boolean): CalcRet;
    solveHack(frac: number, level_init?: number, money?: number, level?: number, sim?: boolean): CalcRet;

    runGrow(threads: number, level_init?: number, money?: number, level?: number, sim?: boolean): CalcRet;
    solveGrow(money_new?: number, level_init?: number, money?: number, level?: number, sim?: boolean): CalcRet;

    runWeak(threads: number, level_init?: number, money?: number, level?: number, sim?: boolean): CalcRet;
    solveWeak(level_new?: number, level_init?: number, money?: number, level?: number, sim?: boolean): CalcRet;

    share(threads: number): { threads: number, mult: number, time: number };
    batchSchedule(t0?: number, max_depth?: number): { depth: number, period: number };
}
