import { NS } from "netscript";

export type Permissions = {
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

export type UIStat = {
    label:   HTMLTableCellElement;
    value:   HTMLTableCellElement;
    bar:     HTMLTableCellElement;
    bar_bg:  HTMLDivElement;
    bar_fg:  HTMLDivElement;
    time?:   HTMLTableCellElement;
};

export type Bitburner = {
    router:   any;
    player:   any;
    terminal: any;
    save():   void;
};

export type UI = {
    colours:  ReturnType<NS["ui"]["getTheme"]>;
    root:     HTMLDivElement;
    parent:   HTMLDivElement;
    overview: HTMLDivElement;
    terminal: any;
    prompt:   any;

    sfh:      HTMLDivElement;
    header:   HTMLButtonElement;
        title: HTMLDivElement;
    stats:    HTMLDivElement;
        money: UIStat;
        skill: UIStat;
        rep:   UIStat;
        hp:    UIStat;
        str:   UIStat;
        def:   UIStat;
        dex:   UIStat;
        agi:   UIStat;
        cha:   UIStat;
        int:   UIStat;
    buttons:  HTMLDivElement;
        button_list: { name: keyof Permissions; button: HTMLButtonElement; }[]
    work:     HTMLButtonElement;
        type:  HTMLDivElement;
        org:   HTMLDivElement;
        desc:  HTMLDivElement;
    augs:     HTMLDivElement;
        aug_title: HTMLDivElement;
        aug_next:  HTMLDivElement;
        aug_cost:  HTMLDivElement;
        aug_total: HTMLDivElement;
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
    now: number;
    perf: { [name: string]: number };
};

export type MoneyType =
    "goal" | "home" | "cores" | "program" | "cluster" | "hacknet" | "stocks";
export type Money = {
    curr:  number;
    total: number;

    frac:  { [type in MoneyType]: number; }
    spent: { [type in MoneyType]: number; }

    can_train: boolean;
}

export type Org = {
    name:     string;
    faction:  boolean;
    joined:   boolean;
    finished: boolean;
    favour:   number;
    base_rep: number;
    rep:      number;
    node?:    Node;
    dual?:    string;
    title?:   string;
};

export type Goal = {
    type:  null | "program" | "faction" | "augmentation" | "work" | "corp";
    desc:  string;

    money:       number;
    money_next:  number;
    money_total: number;

    augs: { org: Org, name: string }[];
    work: { org: Org, rep:  number }[];
    orgs: Set<Org>;

    skill:  number;
    cha:    number;
    combat: number;
    karma:  number;

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

    money:      number;
    rep:        number;
    skill_exp:  number;
    str_exp:    number;
    def_exp:    number;
    dex_exp:    number;
    agi_exp:    number;
    cha_exp:    number;

    money_rate: number;
    rep_rate:   number;
    skill_rate: number;
    str_rate:   number;
    def_rate:   number;
    dex_rate:   number;
    agi_rate:   number;
    cha_rate:   number;
}

export type State = {
    have_goal: boolean;

    augs: Set<string> & { queued: Set<string>; };
    factions:  { [faction: string]: Org };
    companies: { [company: string]: Org };

    prev_work: Work | null;
    work:      Work | null;

    continent: Continent;
    city:      City;
    location:  string;

    goto: {
        city: City;
        desc: string;
    } | null;

    skill_rate: number;
    skill_time: number;
    money_rate: number;
    money_time: number;

    has_tor:             boolean;
    has_brutessh:        boolean;
    has_ftpcrack:        boolean;
    has_relaysmtp:       boolean;
    has_httpworm:        boolean;
    has_sqlinject:       boolean;
    has_formulas:        boolean;
    has_basics:          boolean;
    has_trading_base:    boolean;
    has_trading:         boolean;
    has_stock_data_base: boolean;
    has_stock_data:      boolean;
    has_gang:            boolean;
    has_corp:            boolean;
    has_bladeburners:    boolean;
};

export type Bitnode = {
    number          : number;
    skill           : number;
    skill_exp       : number;
    str             : number;
    def             : number;
    dex             : number;
    agi             : number;
    cha             : number;
    hack_money      : number;
    hack_profit     : number;
    hack_manual     : number;
    grow_rate       : number;
    weak_rate       : number;
    node_max_money  : number;
    node_init_money : number;
    node_init_level : number;
    aug_cost        : number;
    aug_rep         : number;
    faction_rep     : number;
    faction_passive : number;
    faction_favour  : number;
    faction_exp     : number;
    company_money   : number;
    company_exp     : number;
    crime_money     : number;
    crime_exp       : number;
    infil_money     : number;
    infil_rep       : number;
    class_exp       : number;
    hacknet_prod    : number;
    cct_money       : number;
    home_cost       : number;
    cluster_cost    : number;
    cluster_count   : number;
    cluster_max_ram : number;
    cluster_softcap : number;
    stock_data_base : number;
    stock_data      : number;
    corp_dividends  : number;
    corp_valuation  : number;
    gang_softcap    : number;
    bb_rank         : number;
    bb_cost         : number;
    stanek_power    : number;
    stanek_size     : number;
    daedalus_augs   : number;
    world_daemon    : number;
};

export type Player = {
    hp:                  number;
    cur_hp:              number;
    money:               number;
    karma:               number;
    skill:               number;
    str:                 number;
    def:                 number;
    dex:                 number;
    agi:                 number;
    cha:                 number;
    int:                 number;
    skill_exp:           number;
    str_exp:             number;
    def_exp:             number;
    dex_exp:             number;
    agi_exp:             number;
    cha_exp:             number;
    int_exp:             number;
    skill_mult:          number;
    str_mult:            number;
    def_mult:            number;
    dex_mult:            number;
    agi_mult:            number;
    cha_mult:            number;
    int_mult(w: number): number;
    skill_exp_mult:      number;
    str_exp_mult:        number;
    def_exp_mult:        number;
    dex_exp_mult:        number;
    agi_exp_mult:        number;
    cha_exp_mult:        number;
    int_exp_mult:        number;
    hack_mult:           number;
    time_mult:           number;
    prob_mult:           number;
    grow_mult:           number;
    hacknet_prod_mult:   number;
    hacknet_node_mult:   number;
    hacknet_level_mult:  number;
    hacknet_ram_mult:    number;
    hacknet_core_mult:   number;
    faction_rep_mult:    number;
    company_rep_mult:    number;
    work_money_mult:     number;
    crime_money_mult:    number;
    crime_prob_mult:     number;
    bb_sta_mult:         number;
    bb_sta_gain_mult:    number;
    bb_analysis_mult:    number;
    bb_prob_mult:        number;
    aug_time:            number;
    bn_time:             number;
    total_time:          number;

    bitnode: Bitnode;

    money_hist: number[];
    money_rate: number;
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
    sharing:   Set<Proc>;
    exp:       Set<Proc>;

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
    symbol:     string;
    org:        string;
    price:      number;
    spread:     number;
    history:    number[];
    forecast:   number;
    volatility: number;
    sell_ticks: number;
    node:       Node | null;
};

export type Trading = {
    stocks: { [symbol: string]: Stock };
    list:   Stock[];
    init:   boolean;
    ready:  boolean;
    time:   number;
    dps:    number;
};

export type Hacknet = {
    hashes:   number;
    capacity: number;
    prod:     number;
    dps:      number;
};

export type Gang = {
    state: string;
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

export type SFH = {
    loop:    boolean;
    reload:  boolean;
    reset:   boolean;
    install: boolean;

    can:  Permissions;
    bb:   Bitburner;
    ui:   UI;
    time: Timing;

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

    getBitburnerInternals(): void;

    format(fmt: string, ...args: any[]): (string | HTMLElement)[];
    print(fmt: string, ...args: any[]): void;

    uiCreate(ns: NS): void;
    uiInject(ns: NS): void;
    uiRemove(): void;
    uiUpdate(): void;

    purchase(type: MoneyType, money: (() => number) | null, cost: number | (() => number),
        callback: (() => unknown) | null, frac?: number): boolean;

    playerUpdate(ns: NS, player: ReturnType<NS["getPlayer"]>): void;
    workUpdate(nsGetPlayer: NS["getPlayer"], nsIsFocused: NS["singularity"]["isFocused"]): void;
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

    corpUpdate(C: NS["corporation"], log?: (str: string) => unknown): Promise<void>;
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

export type Calc = {
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

declare global { var sfh: SFH; }
