import * as S from "sfh";

import { format } from "/sfh/format.js";
import { runCorp } from "/bin/corp.js";

import { uiCreate } from "/ui/create.js";
import { uiUpdate } from "/ui/update.js";

declare const React: any;

const clamp = (x: number, lo = 0, hi = 1) => Math.min(Math.max(x, lo), hi);

class SFH {
    install: boolean;
    loop:    boolean;
    reset:   boolean;
    reload:  boolean;

    can:  S.Perms;
    x:    S.Internals;
    ui:   S.UI;
    time: S.Timing;

    bitnode: S.Bitnode;
    player:  S.Player;
    state:   S.State;
    money:   S.Money;
    goal:    S.Goal;
    network: S.Network;
    procs:   S.Processes;
    hacking: S.Hacking;
    sleeves: S.Sleeves;
    trading: S.Trading;
    hnet:    S.Hacknet;
    gang:    S.Gang;
    corp:    S.Corp;

    constructor(sfh: { [K in keyof SFH as (SFH[K] extends Function | boolean ? never : K)]: SFH[K] }) {
        this.install = false;
        this.loop    = true;
        this.reset   = false;
        this.reload  = false;

        this.can  = sfh.can;
        this.x    = sfh.x;
        this.ui   = sfh.ui;
        this.time = sfh.time;

        this.bitnode = sfh.bitnode;
        this.player  = sfh.player;
        this.state   = sfh.state;
        this.money   = sfh.money;
        this.goal    = sfh.goal;
        this.network = sfh.network;
        this.procs   = sfh.procs;
        this.hacking = sfh.hacking;
        this.sleeves = sfh.sleeves;
        this.trading = sfh.trading;
        this.hnet    = sfh.hnet;
        this.gang    = sfh.gang;
        this.corp    = sfh.corp;
    }

    getBitburnerInternals() {
        sfh.x ??= {} as typeof sfh.x;
        const names: (keyof S.Internals)[] = ["router", "player", "terminal"];
        const divs = eval("document").querySelectorAll("div");

        for (const name of names) {
            find_prop: for (const div of divs) {
                const props = div[Object.keys(div)[1]];
                if (props?.children?.props?.[name]) {
                    this.x[name] = props.children.props[name];
                    break find_prop;
                } else if (Array.isArray(props?.children)) {
                    for (let child of props.children) {
                        if (child?.props?.[name]) {
                            this.x[name] = child.props[name];
                            break find_prop;
                        }
                    }
                }
            }
        }
        
        const save_game = eval("document").querySelector('button[aria-label="save game"]');
        this.x.save = (() => save_game.click());
    }

    format(fmt: string, ...args: any[]) { return format(fmt, ...args); }

    sprint(...args: any[]) {
        if (args.length === 0) {
            return "";
        } else if (typeof args[0] === "string") {
            return this.format(args[0], ...args.slice(1));
        } else {
            return args.map((s) => String(s)).join(" ");
        }
    }

    print(...args: any[]) {
        if (this.x.terminal == null) { 
            this.getBitburnerInternals();
            if (this.x.terminal == null) { return; }
        }

        if (args.length === 0) {
            this.x.terminal.print("\n");
        } else {
            this.x.terminal.print(this.sprint(...args));
        }
    }

    uiCreate(ns: NS) {
        const doc: Document = eval("document");

        this.ui.colours  = ns.ui.getTheme();
        this.ui.styles   = ns.ui.getStyles();
        this.ui.root     = doc.getElementById("root") as HTMLDivElement;
        this.ui.parent   = this.ui.root.children[0]   as HTMLDivElement;
        this.ui.overview = this.ui.parent.children[0] as HTMLDivElement;

        uiCreate();
    }

    uiInject(ns: NS) {
        if (!this.ui.root) { this.uiCreate(ns); }

        this.ui.overview.style.display = "none";
        this.ui.parent.style.marginRight = "211px";
        this.ui.root.appendChild(this.ui.sfh);

        this.uiUpdate();
    }

    uiRemove() {
        if (this.ui.root) {
            this.ui.overview.style.display = "";
            this.ui.parent.style.marginRight = "";
            this.ui.root.removeChild(this.ui.sfh);
        }
    }

    uiUpdate() { uiUpdate(); }

    purchase(type: S.MoneyType, money: (() => number) | null, cost: number | (() => number),
        callback: (() => unknown) | null, frac?: number): boolean
    {
        if (!this.can.purchase && (this.bitnode.number !== 8 || type !== "stocks")) { return false; }
        if (money == null) { money = (() => Number.POSITIVE_INFINITY); }

        const init_money = money();
        cost = (typeof cost === "function" ? Number(cost()) : Number(cost));
        if (cost < 0 || !Number.isFinite(cost) || cost > init_money) { return false; }

        this.money.spent[type] ??= 0;
        this.money.frac[type]  ??= 0;
        frac ??= this.money.frac[type];
        
        const goal = init_money - cost >= this.goal.money;
        if (this.money.spent[type] + cost >= (goal ? 2 : 1) * frac * this.money.total) { return false; }

        if (callback == null) { return true; }
        try { callback() } catch {}

        sfh.money.curr = money();
        if (sfh.money.curr >= init_money) { return false; }

        this.money.spent[type] += init_money - sfh.money.curr;
        return true;
    }

    playerUpdate(ns: NS, player: ReturnType<NS["getPlayer"]>) {
        const avg = function(list: number[], value: number, T = 60, k = 0.97716) {
            list.unshift(value);
            while (list.length > T) {
                const pop = list.pop() ?? 0;
                list[list.length - 1] *= k;
                list[list.length - 1] += (1 - k) * pop;
            }
            return list.reduce((acc, x) => acc + x) / T;
        }

        this.player.hac = player.skills.hacking;
        this.player.str = player.skills.strength;
        this.player.def = player.skills.defense;
        this.player.dex = player.skills.dexterity;
        this.player.agi = player.skills.agility;
        this.player.cha = player.skills.charisma;
        this.player.int = player.skills.intelligence;

        this.player.hac_exp = player.exp.hacking;
        this.player.str_exp = player.exp.strength;
        this.player.def_exp = player.exp.defense;
        this.player.dex_exp = player.exp.dexterity;
        this.player.agi_exp = player.exp.agility;
        this.player.cha_exp = player.exp.charisma;
        this.player.int_exp = player.exp.intelligence;

        this.player.hp     = player.hp.max;
        this.player.cur_hp = player.hp.current;
        this.player.money  = player.money;
        this.player.karma  = (ns as any).heart.break();

        const map: [keyof S.Mults, keyof typeof player.mults | null][] = [
            ["hac",             "hacking"],
            ["str",             "strength"],
            ["def",             "defense"],
            ["dex",             "dexterity"],
            ["agi",             "agility"],
            ["cha",             "charisma"],
            ["int",             null],

            ["hac_exp",         "hacking_exp"],
            ["str_exp",         "strength_exp"],
            ["def_exp",         "defense_exp"],
            ["dex_exp",         "dexterity_exp"],
            ["agi_exp",         "agility_exp"],
            ["cha_exp",         "charisma_exp"],
            ["int_exp",         null],

            ["hack_money",      "hacking_money"],
            ["hack_profit",     null],
            ["hack_manual",     null],
            ["hack_prob",       "hacking_chance"],
            ["hack_time",       "hacking_speed"],
            ["grow_rate",       "hacking_grow"],
            ["weak_rate",       null],

            ["max_money",       null],
            ["init_money",      null],
            ["init_level",      null],

            ["aug_cost",        null],
            ["aug_rep",         null],

            ["home_cost",       null],
            ["cluster_cost",    null],
            ["cluster_count",   null],
            ["cluster_max_ram", null],
            ["cluster_softcap", null],

            ["faction_rep",     "faction_rep"],
            ["faction_exp",     null],
            ["faction_passive", null],
            ["company_money",   "work_money"],
            ["company_rep",     "company_rep"],
            ["company_exp",     null],
            ["crime_money",     "crime_money"],
            ["crime_exp",       null],
            ["crime_prob",      "crime_success"],
            ["class_exp",       null],

            ["contract_money",  null],
            ["infil_money",     null],
            ["infil_rep",       null],

            ["hacknet_prod",    "hacknet_node_money"],
            ["hacknet_node",    "hacknet_node_purchase_cost"],
            ["hacknet_level",   "hacknet_node_level_cost"],
            ["hacknet_ram",     "hacknet_node_ram_cost"],
            ["hacknet_core",    "hacknet_node_core_cost"],

            ["corp_dividends",  null],
            ["corp_valuation",  null],
            ["gang_softcap",    null],
            ["stanek_power",    null],

            ["bb_sta",          null],
            ["bb_sta_gain",     null],
            ["bb_analysis",     null],
            ["bb_prob",         null],
            ["bb_rank",         null],
            ["bb_cost",         null],
        ];

        this.player.mult ??= {} as S.Mults;
        for (const it of map) {
            this.player.mult[it[0]] = (it[1] ? player.mults[it[1]] : 1) * this.bitnode.mult[it[0]];
        }

        this.time.reset   = player.playtimeSinceLastAug;
        this.time.bitnode = player.playtimeSinceLastBitnode;
        this.time.total   = player.totalPlaytime;
    }

    workUpdate(nsGetCurrentWork: NS["singularity"]["getCurrentWork"], nsIsFocused: NS["singularity"]["isFocused"]) {
        const prev_goal  = sfh.state.work?.goal  ?? false;
        const prev_focus = sfh.state.work?.focus ?? false;

        const work = nsGetCurrentWork() as CurrentWork | null;
        let rates = {} as any;

        if (work == null) {
            this.state.work = null;
        } else switch (work.type) {
            case "FACTION": {
                this.state.work = {
                    type:  "faction",
                    desc:  work.factionWorkType,
                    org:   this.state.factions[work.factionName],
                } as any;
                rates = sfh.x.player.currentWork.getExpRates(sfh.x.player);
            } break;

            case "COMPANY": {
                this.state.work = {
                    type:  "company",
                    desc:  sfh.x.player.jobs[work.companyName],
                    org:   this.state.companies[work.companyName],
                } as any;
                rates = sfh.x.player.currentWork.getGainRates(sfh.x.player);
            } break;

            case "CREATE_PROGRAM": {
                this.state.work = {
                    type:  "program",
                    desc:  work.programName,
                    org:   null,
                } as any;
           } break;

            case "CRIME": {
                this.state.work = {
                    type:  "crime",
                    desc:  work.crimeType,
                    org:   null,
                } as any;
                // rates are complicated since they're per-crime not per-tick
            } break;

            case "CLASS": {
                this.state.work = {
                    type: (work.classType.startsWith("GYM") ? "gym" : "university"),
                    desc: work.classType,
                    org: null
                } as any;
                rates = sfh.x.player.currentWork.calculateRates(sfh.x.player);
            } break;

            case "GRAFTING": {
                this.state.work = {
                    type:  "graft",
                    desc:  work.augmentation,
                    org:   null,
                } as any;
            } break;

            default: {
                this.state.work = null;
                throw new Error(`Unknown work type: ${(work as any).type}`);
            } break;
        }

        const has_focus = nsIsFocused();
        if (this.state.work) {
            this.state.work.focus = has_focus;
            const rate = 5e-3;

            //this.state.work.money      = player.workMoneyGained;
            //this.state.work.rep        = player.workRepGained;
            //this.state.work.skill_exp  = player.workHackExpGained;
            //this.state.work.str_exp    = player.workStrExpGained;
            //this.state.work.def_exp    = player.workDefExpGained;
            //this.state.work.dex_exp    = player.workDexExpGained;
            //this.state.work.agi_exp    = player.workAgiExpGained;
            //this.state.work.cha_exp    = player.workChaExpGained;
            this.state.work.money_rate = (rates?.money      ?? 0) * rate;
            this.state.work.rep_rate   = (rates?.reputation ?? 0) * rate;
            this.state.work.skill_rate = (rates?.hackExp    ?? 0) * rate;
            this.state.work.str_rate   = (rates?.strExp     ?? 0) * rate;
            this.state.work.def_rate   = (rates?.defExp     ?? 0) * rate;
            this.state.work.dex_rate   = (rates?.dexExp     ?? 0) * rate;
            this.state.work.agi_rate   = (rates?.agiExp     ?? 0) * rate;
            this.state.work.cha_rate   = (rates?.chaExp     ?? 0) * rate;
            this.state.work.int_rate   = (rates?.intExp     ?? 0) * rate;

            this.state.work.goal = false;
            if (this.state.work.org) {
                for (const goal of this.goal.work) {
                    if (this.state.work.org?.name === goal.org.name && goal.org.rep < goal.rep) {
                        this.state.work.goal = true;
                        break;
                    }
                }
            } else if (this.state.work.type === "university") {
                this.state.work.goal = this.player.hac < this.goal.hac
                    || this.player.cha < this.goal.cha;
            } else if (this.state.work.type === "gym") {
                this.state.work.goal = this.player.str < this.goal.str
                    || this.player.def < this.goal.def
                    || this.player.dex < this.goal.dex
                    || this.player.agi < this.goal.agi;
            }
        }
    }

    goalSort(): void {
        const augs = new Set(this.goal.augs);
        this.goal.augs.splice(0, this.goal.augs.length);

        const faction_continent: { [city in S.City]: S.Continent } = {
            "Sector-12": "America",
            "Aevum":     "America",
            "Volhaven":  "Europe",
            "Chongqing": "Asia",
            "New Tokyo": "Asia",
            "Ishima":    "Asia"
        }

        const installed = new Set();
        while (augs.size > 0) {
            let [next] = augs;
            for (const aug of augs) {
                if (data.augs[aug.name].cost > data.augs[next.name].cost) { next = aug; }
            }

            const stack = [next];
            augs.delete(next);

            stack: while (stack.length > 0) {
                const top = stack[stack.length - 1];

                const prereq_names = new Set(data.augs[top.name].prereqs);
                while (prereq_names.size > 0) {
                    let [prereq_name] = prereq_names;
                    for (const name of prereq_names) {
                        if (data.augs[name].cost > data.augs[prereq_name].cost) { prereq_name = name; }
                    }
                    prereq_names.delete(prereq_name);

                    if (sfh.state.augs.has(prereq_name) || sfh.state.augs.queued.has(prereq_name)) { continue; }
                    if (installed.has(prereq_name)) { continue; }

                    let prereq = null;
                    for (const item of augs) {
                        if (item.name === prereq_name) { prereq = item; break; }
                    }
                    
                    if (prereq == null) {
                        throw new Error(`ERROR: Could not find prereq '${name}' for augmentation `
                            + `'${top.name}' from faction ${top.org.name}`);
                    }

                    stack.push(prereq);
                    augs.delete(prereq);
                    continue stack;
                }

                sfh.goal.augs.push(top);
                installed.add(top.name);
                stack.pop();
            }
        }

        sfh.goal.work.sort(function(a, b) {
            return (a.org.favour + (a.org.faction ? 100 : 0)) - (b.org.favour + (b.org.faction ? 100 : 0));
        });

        for (const { org } of (sfh.goal.augs as { org: S.Org }[]).concat(sfh.goal.work)) {
            const reqs = data.factions[org.name].reqs;
            sfh.goal.hac = Math.max(sfh.goal.hac, reqs.hacking ?? 0);
            sfh.goal.hac = Math.max(sfh.goal.hac, sfh.network[reqs.backdoor ?? ""]?.skill ?? 0);
            sfh.goal.hac = Math.max(sfh.goal.hac, reqs.special === "daedalus" ? 2500 : 0);

            if (!org.joined) { sfh.goal.orgs.add(org); }

            const continent = faction_continent[org.name as S.City];
            if (continent != null) {
                if (sfh.state.continent == null) {
                    sfh.state.continent = continent;
                } else if (sfh.state.continent !== continent) {
                    throw new Error(`Need to join ${org.name}, but continent is set to ${sfh.state.continent}`);
                }
            }
        }
    }

    netAdd(server: ReturnType<NS["getServer"]>, edges: string[], depth: number | null = null) {
        const name = server.hostname;
        if (name === "home") { server.maxRam = Math.max(server.maxRam - 64, 0); }
        const node = (name in this.network ? this.network[name] : ({} as S.Node));
        
        node.name     = name;
        node.owned    = server.purchasedByPlayer;
        node.hnet     = name.startsWith("hacknet-");
        node.skill    = server.requiredHackingSkill;
        node.cores    = server.cpuCores;
        node.used_ram = 0;
        node.ram      = server.maxRam;
        
        node.ip     = server.ip;
        node.org    = server.organizationName;
        node.symbol = null;

        node.money     = server.moneyMax;
        node.cur_money = server.moneyAvailable;
        node.grow_mult = server.serverGrowth / 100;

        node.level      = server.minDifficulty;
        node.cur_level  = server.hackDifficulty;
        node.base_level = server.baseDifficulty;

        node.prepped = (node.cur_level == node.level && node.cur_money == node.money);

        node.ports     = server.numOpenPortsRequired;
        node.cur_ports = server.openPortCount;

        node.tH = 5000 * (2.5 * node.skill * node.level + 500)
            / ((this.player.hac + 50) * this.player.mult.hack_time * this.intMult(1));
        node.tG = 3.2 * node.tH;
        node.tW = 4.0 * node.tH;

        node.backdoor = server.backdoorInstalled;
        node.root     = false;
        node.target   = false;

        node.edges = new Set(edges);
        if (typeof depth === "number") {
            node.depth = depth;
        } else if (node.name === "home") {
            node.depth = 0;
        } else {
            node.depth = Infinity;
            for (const edge of node.edges) {
                const depth = this.network[edge]?.depth ?? Infinity;
                if (depth < node.depth) { node.depth = depth + 1; }
            }
            if (node.depth === Infinity) {
                throw new Error(`Could not get depth for node ${node.name} from edges [${edges.join(", ")}]`);
            }
        }

        this.network[name] = node;
    }

    async netCopy(nsScp: NS["scp"], ...args: (string | string[])[]) {
        let files = [];
        for (let arg of args) {
            if (typeof arg === "string") { files.push(arg); } else { files.push(...arg); }
        }

        for (let node of this.nodes(n => n.owned || n.ram >= 2)) {
            if (node.name === "home") { continue; }
            await nsScp(files, node.name, "home");
        }
    }

    netSort() {
        this.procs.pools.sort(function(m: S.Node, n: S.Node) {
            if (m.hnet === n.hnet) {
                if (m.ram - m.used_ram == n.ram - n.used_ram) {
                    if (m.ram == n.ram) {
                        return m.name.localeCompare(n.name);
                    } else {
                        return (m.ram - n.ram);
                    }
                } else {
                    return (m.ram - m.used_ram) - (n.ram - n.used_ram);
                }
            } else {
                return (m.hnet ? 1 : 0) - (n.hnet ? 1 : 0);
            }
        });

        this.procs.total_ram = this.procs.free_ram = this.procs.max_ram = 0;
        for (const pool of this.procs.pools) {
            this.procs.total_ram += pool.ram;
            this.procs.free_ram  += pool.ram - pool.used_ram;
            this.procs.max_ram    = Math.max(this.procs.max_ram, pool.ram);
        }
    }

    netHost(ram: number, min_threads = 1, max_threads?: number) {
        if (max_threads == null) { max_threads = min_threads; }

        let host = null;
        let threads = 0;
        for (const pool of this.pools()) {
            const count = Math.min(max_threads, Math.floor((pool.ram - pool.used_ram) / ram));
            if (count >= min_threads && count > threads) {
                host    = pool;
                threads = count;
            }
            
            if (threads == max_threads) { break; }
        }

        return (host ? { name: host.name, ram: ram * threads, threads } : null);
    }

    netProc(set: Set<S.Proc> | null, nsExec: NS["exec"], script: string,
        host: { name: string, ram: number, alloc?: { [name: string]: number }, threads: number } | null,
        ...args: (string | number | boolean)[])
    {
        if (!host) { return null; }
        const proc: S.Proc = { pid: 0, alive: false, time: Date.now(),
            script, host: host.name, ram: host.ram, threads: host.threads, args };
        if (host.alloc) { proc.pids = new Set(); proc.alloc = {}; }

        const testAlloc = (host: string, ram: number) => {
            if (!(host in this.network)) {
                throw new Error(`Tried to exec proc with invalid pool ${host}`);
            } else if (!(ram > -1e-3)) {
                throw new Error(`Tried to exec proc with invalid ram ${ram} on pool ${host}`);
            }

            let new_ram = this.network[host].used_ram + ram;
            if (new_ram > this.network[host].ram + 1e-3) {
                let free_space = (this.network[host].ram - this.network[host].used_ram).toFixed(2);
                throw new Error(`Tried to exec proc with ${ram}GB on pool ${host}, `
                    + `but ${host} only has ${free_space}GB of space`);
            }
        }

        testAlloc(proc.host, proc.ram);
        for (const name in host.alloc) {
            testAlloc(name, host.alloc[name]);
            if (host.alloc[name] > 1e-3) {
                proc.alloc![name] ??= 0;
                proc.alloc![name] += host.alloc[name];
            }
        }

        proc.pid = nsExec(script, host.name, host.threads, ...args);
        if (proc.pid == 0) {
            //let exec_str = `"${proc.script} ${args.join(" ")}"`;
            //throw new Error(`Could not execute ${exec_str} on ${host.name} with ${proc.threads} threads`);
            //sfh.can.scripts = false;
            return null;
        }

        proc.alive = true;
        this.procs.set.add(proc);
        if (set) { set.add(proc); }

        const commitAlloc = (host: string, ram: number) => {
            this.network[host].used_ram += ram;
            if (this.network[host].used_ram > this.network[host].ram - 1e-3) {
                this.network[host].used_ram = this.network[host].ram;
            }
        }

        commitAlloc(proc.host, proc.ram);
        for (const name in proc.alloc) { commitAlloc(name, proc.alloc[name]); }
        this.netSort();

        return proc;
    }

    netExec(nsExec: NS["exec"], script: string, ram: number, threads: number,
        ...args: (string | number | boolean)[])
    {
        const host = this.netHost(ram, threads);
        return this.netProc(null, nsExec, script, host, ...args);
    }

    netGC(nsIsRunning: NS["isRunning"]) {
        outer: for (const proc of this.procs.set) {
            if (proc.pid < 0 || nsIsRunning(proc.pid)) { continue; }

            if (proc.pids) {
                for (const pid of proc.pids) {
                    if (nsIsRunning(pid)) { continue outer; }
                    proc.pids!.delete(pid);
                }
            }

            this.network[proc.host].used_ram -= proc.ram;
            if (this.network[proc.host].used_ram < 0.005) { this.network[proc.host].used_ram = 0; }

            for (const host in proc.alloc) {
                this.network[host].used_ram -= proc.alloc[host];
                if (this.network[host].used_ram < 0.005) { this.network[host].used_ram = 0; }
            }

            proc.alive = false;
            this.procs.set.delete(proc);
        }
    }
    
    *nodes(filter?: ((n: S.Node) => boolean)) {
        for (const node of Object.values(this.network)) {
            if (filter == null || filter(node)) { yield node; }
        }
    }

    *pools(filter?: ((p: S.Node) => boolean)) {
        for (const pool of this.procs.pools) {
            if (filter == null || filter(pool)) { yield pool; }
        }
    }

    calc(target: S.Node | string, cores = 1) {
        if (typeof target === "string") { target = this.network[target]; }
        return new Calc(this.player, target, cores);
    }

    intMult(weight = 1) {
        return (1 + weight * (this.player.int ?? 0) ** 0.8 / 600);
    }

    async corpUpdate(C: NS["corporation"], sleep?: (ms: number) => Promise<unknown>,
        log?: (str: string) => unknown) { await runCorp(C, sleep, log); }
}

export default SFH;

/********
 * CALCULATIONS
 */

class Calc {
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

    constructor(player: S.Player, target: S.Node, cores = 1) {
        this.skill          = player.hac;
        this.skill_exp      = player.hac_exp
        this.int            = player.int;
        this.cores          = cores;
        this.core_mult      = (1 + (this.cores - 1) / 16);
        this.money          = target.money;
        this.level          = target.level;
        this.cur_money      = target.cur_money;
        this.cur_level      = target.cur_level;
        this.req_skill      = target.skill;
        this.base_level     = target.base_level;
        this.skill_mult     = player.mult.hac;
        this.skill_exp_mult = player.mult.hac_exp;
        this.hack_mult      = player.mult.hack_money;
        this.time_mult      = player.mult.hack_time;
        this.prob_mult      = player.mult.hack_prob;
        this.prof_mult      = player.mult.hack_profit;
        this.grow_mult      = player.mult.grow_rate * target.grow_mult;
        this.weak_mult      = player.mult.weak_rate;
    }

    int_mult(weight = 1) { return (1 + weight * this.int ** 0.8 / 600); }

    setup(money = this.money, level = this.level) {
        this.cur_money = money;
        this.cur_level = level;
        return this;
    }

    hackTime(level = this.level) {
        return 5000 * (2.5 * this.req_skill * level + 500) / (this.skill + 50) / this.time_mult / this.int_mult(1);
    }

    growTime(level = this.level)       { return 3.20 * this.hackTime(level); }
    weakTime(level = this.level)       { return 4.00 * this.hackTime(level); }
    manualHackTime(level = this.level) { return 0.25 * this.hackTime(level); }
    manualGrowTime(level = this.level) { return 0.20 * this.hackTime(level); }
    manualWeakTime(level = this.level) { return 0.25 * this.hackTime(level); }
    backdoorTime(level = this.level)   { return 0.25 * this.hackTime(level); }

    exp(threads = 1) {
        if (this.skill < this.req_skill) { return 0; }
        return (3 + 0.3 * this.base_level) * threads * this.skill_exp_mult;
    }

    expAt(skill: number) {
        return Math.max(Math.exp((Math.floor(skill) / this.skill_mult + 200) / 32) - 534.5, 0);
    }

    expTo(skill = this.skill + 1) {
        let exp_req = Math.exp((skill / this.skill_mult + 200) / 32) - 534.5;
        return (exp_req > this.skill_exp ? exp_req - this.skill_exp : 0);
    }

    expRate() {
        return this.exp(1) / this.growTime(this.level) / 1.75;
    }

    hackFrac(level = this.cur_level) {
        let frac = (100 - level) * (this.skill - this.req_skill + 1) / this.skill * this.hack_mult / 24000;
        return clamp(frac, 0, 1);
    }

    hackMax(frac: number, level = this.cur_level) {
        let hack_frac = this.hackFrac(level);
        if (hack_frac == 0) { return 0; }

        frac = clamp(frac, 0, 1);
        if (frac == 1) {
            return Math.ceil(1 / hack_frac);
        } else {
            return Math.floor(frac / hack_frac);
        }
    }

    hackProb(level = this.cur_level) {
        let prob = (100 - level) / 100 * (1.75 * this.skill - this.req_skill) / (1.75 * this.skill)
            * this.prob_mult * this.int_mult(1);
        return clamp(prob, 0, 1);
    }

    runHack(threads: number, level_init = this.level,
            money = this.cur_money, level = this.cur_level, sim = true)
    {
        let prob = this.hackProb(level);
        let frac = this.hackFrac(level);
        let money_removed = Math.min(Math.floor(frac * money) * threads, money);

        let profit     = money_removed * this.prof_mult;
        let money_diff = -money_removed;
        let level_diff = 0.002 * Math.min(threads, (frac == 0 ? 1e6 : Math.ceil(1 / frac)));
        level_diff = clamp(level_diff, this.level - level, 100 - level);

        let time = this.hackTime(level_init);
        let exp  = this.exp(threads) * (3 * prob + 1) / 4;

        if (sim) {
            this.cur_money += money_diff;
            this.cur_level += level_diff;
        }

        return { threads, time, money_diff, level_diff, prob, exp, profit };
    }

    solveHack(frac: number, level_init = this.level,
              money = this.cur_money, level = this.cur_level, sim = true)
    {
        if (this.money == 0) { return this.runHack(0, level_init, money, level, sim); }
        return this.runHack(this.hackMax(frac, level), level_init, money, level, sim);
    }

    growBase(level = this.cur_level) {
        let base = (level <= 8 ? 1.0035 : 1 + 0.03 / level);
        let mult = this.grow_mult * this.core_mult;
        return base ** mult;
    }

    growInv(money_lo: number, money_hi: number, level = this.cur_level) {
        if (money_hi <= money_lo) { return 0; }
        const base = this.growBase(level);

        let threads = 1000;
        let prev = threads;
        for (let i = 0; i < 30; ++i) {
            let factor = money_hi / Math.min(money_lo + threads, money_hi - 1);
            threads = Math.log(factor) / Math.log(base);
            if (Math.ceil(threads) == Math.ceil(prev)) { break; }
            prev = threads;
        }

        return Math.ceil(Math.max(threads, prev, 0));
    }

    runGrow(threads: number, level_init = this.level,
            money = this.cur_money, level = this.cur_level, sim = true)
    {
        let money_new  = Math.min((money + threads) * (this.growBase(level) ** threads), this.money);
        let money_diff = money_new - money;

        let eff_threads = this.growInv(money, money_new, level);
        let level_diff = (money_new > money ? 0.004 * Math.min(threads, eff_threads) : 0);
        level_diff = clamp(level_diff, this.level - level, 100 - level);

        let time = this.growTime(level_init);
        let exp  = this.exp(threads);

        if (sim) {
            this.cur_money += money_diff;
            this.cur_level += level_diff;
        }    

        return { threads, time, money_diff, level_diff, prob: 1, exp, profit: 0 };
    }

    solveGrow(money_new = this.money, level_init = this.level,
              money = this.cur_money, level = this.cur_level, sim = true)
    {
        money_new = clamp(money_new, 0, this.money);
        const threads = this.growInv(money, money_new, level);
        return this.runGrow(threads, level_init, money, level, sim);
    }

    runWeak(threads: number, level_init = this.level,
            _money = this.cur_money, level = this.cur_level, sim = true)
    {
        let level_diff = -0.05 * threads * this.core_mult * this.weak_mult;
        level_diff = clamp(level_diff, this.level - level, 100 - level);

        let time = this.weakTime(level_init);
        let exp  = this.exp(threads);

        if (sim) { this.cur_level += level_diff; }    
        return { threads, time, money_diff: 0, level_diff, prob: 1, exp, profit: 0 };
    }

    solveWeak(level_new = this.level, level_init = this.level,
              _money = this.cur_money, level = this.cur_level, sim = true)
    {
        level_new = clamp(level_new, this.level, 100);
        let threads = Math.max(Math.ceil((level - level_new) / (0.05 * this.core_mult * this.weak_mult)), 0);
        return this.runWeak(threads, level_init, _money, level, sim);
    }

    share(threads: number) {
        let mult = 1 + Math.log(1 + threads * this.int_mult(2)) / (8 * Math.log(1000));
        return { threads, mult, time: 10000 };
    }

    batchSchedule(t0 = 50, max_depth = Infinity) {
        const hack_time = this.hackTime(this.level);
        const grow_time = 3.2 * hack_time;
        const weak_time = 4.0 * hack_time;
        const kW_max = Math.floor(Math.min(1 + (weak_time - 4 * t0) / (8 * t0), max_depth));

        schedule: for (let kW = kW_max; kW >= 1; --kW) {
            const kG_lo = Math.ceil(Math.max((kW - 1) * 0.8, 1));
            const kG_hi = Math.floor(1 + kW * 0.8);

            for (let kG = kG_hi; kG >= kG_lo; --kG) {
                const kH_lo = Math.ceil(Math.max((kW - 1) * 0.25, (kG - 1) * 0.3125, 1));
                const kH_hi = Math.floor(Math.min(1 + kW * 0.25, 1 + kG * 0.3125));

                for (let kH = kH_hi; kH >= kH_lo; --kH) {
                    // get period ranges permitted by each k
                    let period_lo_H = (hack_time + 5 * t0) / kH;
                    let period_hi_H = (hack_time - 1 * t0) / (kH - 1);
                    let period_lo_G = (grow_time + 3 * t0) / kG
                    let period_hi_G = (grow_time - 3 * t0) / (kG - 1);
                    let period_lo_W = (weak_time + 4 * t0) / kW;
                    let period_hi_W = (weak_time - 4 * t0) / (kW - 1);

                    // if all ranges overlap, we have a period range which permits all kH, kG, kW: take its minimum
                    let period_lo = Math.max(period_lo_H, period_lo_G, period_lo_W);
                    let period_hi = Math.min(period_hi_H, period_hi_G, period_hi_W);
                    if (period_lo <= period_hi) { return { depth: kW, period: period_lo }; }
                }
            }
        }

        return { depth: 1, period: weak_time + 4 * t0 };
    }
}
