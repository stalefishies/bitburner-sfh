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
    router:   any;
    player:   any;
    terminal: any;
    save():   void;
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
    parent:   HTMLDivElement;
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
    reset:   number;
    total:   number;
    bitnode: number;
};

export type MoneyType =
    "goal" | "upgrade" | "program" | "cluster" | "hacknet" | "stocks" | "gang";
export type Money = {
    curr:  number;
    total: number;

    frac:  { [type in MoneyType]: number; }
    spent: { [type in MoneyType]: number; }

    can_train: boolean;
}

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

export type Org = {
    name:     string;
    faction:  boolean;
    joined:   boolean;
    finished: boolean;
    augs:     Set<string>;
    favour:   number;
    rep:      number;
    node?:    Node;
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

    corp:       boolean;
    corp_ticks: number;
};

export type Continent = "America" | "Europe" | "Asia";
export type City      = "Sector-12" | "Aevum" | "Volhaven" | "Chongqing" | "New Tokyo" | "Ishima";

export type Work = {
    type:  "faction" | "company" | "crime" | "program" | "gym" | "university" | "graft";
    desc:  string;
    org:   Org | null;
    goal:  boolean;
    focus: boolean;

    //money:      number;
    //rep:        number;
    //skill_exp:  number;
    //str_exp:    number;
    //def_exp:    number;
    //dex_exp:    number;
    //agi_exp:    number;
    //cha_exp:    number;

    money_rate: number;
    rep_rate:   number;
    skill_rate: number;
    str_rate:   number;
    def_rate:   number;
    dex_rate:   number;
    agi_rate:   number;
    cha_rate:   number;
    int_rate:   number;
}

export type State = {
    have_goal: boolean;

    augs: Set<string> & { queued: Set<string>; };
    factions:  { [faction: string]: Org };
    companies: { [company: string]: Org };

    prev_work: Work | null;
    work:      Work | null;

    continent: Continent | null;
    city:      City;
    location:  string;

    goto: {
        city: City;
        type: "faction" | "work";
        desc: string;
    } | null;

    hac_rate: number;
    hac_time: number;
    money_rate: number;
    money_time: number;

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

export type Player = Skills & SkillExp & {
    hp:     number;
    cur_hp: number;
    money:  number;
    karma:  number;
    mult:   Mults;
}

export type Bitnode = {
    number: number;
    sf:     number[];
    mult:   Mults;

    donation:      number;
    stock_4S_base: number;
    stock_4S_api:  number;
    gang_augs:     number;
    stanek_size:   number;
    daedalus_augs: number;
    world_daemon:  number;
};

export type Node = {
    name:       string;
    owned:      boolean;
    hnet:       boolean;
    skill:      number;
    cores:      number;
    used_ram:   number;
    ram:        number;
    ip:         string;
    org:        string;
    symbol:     string | null;
    money:      number;
    cur_money:  number;
    grow_mult:  number;
    level:      number;
    cur_level:  number;
    base_level: number;
    prepped:    boolean;
    ports:      number;
    cur_ports:  number;
    tH:         number;
    tG:         number;
    tW:         number;
    backdoor:   boolean;
    root:       boolean;
    target:     boolean;
    edges:      Set<string>;
    depth:      number;
};

export type Network = { [name: string]: Node };

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
    pools:     Node[];

    home:      Proc | null;
    corp:      Proc | null;
    backdoor:  Proc | null;
    contract:  Proc | null;

    sharing: Set<Proc>;
    exp:     Set<Proc>;
    stanek:  Set<Proc>;

    total_ram: number;
    free_ram:  number;
    max_ram:   number;
};

export type HackingJob = {
    procs:     Set<Proc>;
    time:      number;
    end_time:  number;
    scripts:   number;
    dps:       number;
} & ({
    type:      "adhoc";
    end_money: number;
    end_level: number;
} | {
    type:      "batch";
    quit:      boolean;
    skill:     number;
    t0:        number;
    depth:     number;
    period:    number;
    money:     number;
    prob:      number;
    threads:   [number, number, number, number];
    hosts:     [string, string, string, string][];
});

export type HackingParams = {
    target: Node;
    job:    HackingJob | null;
    prob:   number;
    dps:    number;
    skill:  number;

    prep:   { money: number, level: number, time: number };
    single: { threads: number; money: number; dps: number; };
    batch:  { t0: number; depth: number; period: number; money: number;
        threads: [number, number, number, number]; dps: number; };
};

export type Hacking = {
    params:     { [target: string]: HackingParams; }
    list:       HackingParams[];
    min_dps:    number;
    scripts:    number;
    batch_time: number;

    dps: number;
    exp: number;
};

export type Sleeves = {
    money_rate: number;
    karma_rate: number;
    skill_rate: number;
    str_rate:   number;
    def_rate:   number;
    dex_rate:   number;
    agi_rate:   number;
    cha_rate:   number;
    int_rate:   number;
}

export type Stock = {
    symbol:    string;
    org:       string;
    node:      Node | null;
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

export type Hacknet = {
    hashes:   number;
    capacity: number;
    prod:     number;
    dps:      number;
};

export type Gang = {
    state: "train" | "respect" | "reputation" | "power" | "money";

    can_ascend: boolean;
    train_time: number;

    name:  string;
    size:  number;
    train: number;
    time:  number;
    dps:   number;
    clash: number;
    rep:   number;

    training: [boolean, number, number, number][];
};

export type Corp = {
    public:     boolean;
    wait_ticks: number;
    divisions:  Set<string>;

    funds:     number;
    profit:    number;
    round:     number;
    offer:     number;
    div_frac:  number;
    dividends: number;
    research:  number;
    res_rate:  number;

    products: {
        development: number,
        time:        number,
        price_ticks: number,
        price_power: number,
        amount:      number[],
        change:      number[]
    }[];
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
    goal:    Goal;
    network: Network;
    procs:   Processes;
    hacking: Hacking;
    sleeves: Sleeves;
    trading: Trading;
    hnet:    Hacknet;
    gang:    Gang;
    corp:    Corp;

    constructor(sfh: { [K in keyof SFH as (SFH[K] extends Function | boolean ? never : K)]: SFH[K] });

    getBitburnerInternals(): void;

    format(fmt: string, ...args: any[]): string;
    sprint(...args: any[]): string;
    print(...args: any[]): void;

    uiCreate(ns: NS): void;
    uiInject(ns: NS): void;
    uiRemove(): void;
    uiUpdate(): void;

    purchase(type: MoneyType, money: (() => number) | null, cost: number | (() => number),
        callback: (() => unknown) | null, frac?: number): boolean;

    playerUpdate(ns: NS, player: ReturnType<NS["getPlayer"]>): void;
    workUpdate(nsGetCurrentWork: NS["singularity"]["getCurrentWork"], nsIsFocused: NS["singularity"]["isFocused"]): void;
    goalSort(): void;

    netAdd(server: ReturnType<NS["getServer"]>, edges: string[], depth: number | null): void;
    netCopy(nsScp: NS["scp"], ...args: (string | string[])[]): void;
    netSort(): void;

    netHost(ram: number, min_threads?: number, max_threads?: number): Host | null;
    netProc(set: Set<Proc> | null, nsExec: NS["exec"], script: string, host: Host | null, ...args: Arg[]): Proc | null;
    netExec(nsExec: NS["exec"], script: string, ram: number, threads: number, ...args: Arg[]): Proc | null;

    netGC(nsIsRunning: NS["isRunning"]): void;

    nodes(filter?: ((n: Node) => boolean)): Iterable<Node>;
    pools(filter?: ((n: Node) => boolean)): Iterable<Node>;

    calc(target: Node | string, cores?: number): Calc;
    intMult(weight: number): number;

    corpUpdate(C: NS["corporation"], sleep?: (ms: number) => Promise<unknown>, log?: (str: string) => unknown):
        Promise<void>;
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
