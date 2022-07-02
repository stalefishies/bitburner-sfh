import { NS } from "netscript";
import * as S from "sfh";
import SFH from "/sfh/sfh.js";

type AugSet = { [faction: string]: Iterable<string> };
const aug_sets: AugSet[] = [{
    "Tian Di Hui": new Set([
        "ADR-V1 Pheromone Gene",
        "Social Negotiation Assistant (S.N.A)"
    ]),
    "CyberSec": new Set([
        "Neurotrainer I",
        "Synaptic Enhancement Implant",
        "BitWire",
        "Cranial Signal Processors - Gen I"
    ])
}, {
    "Netburners": new Set([
        "Hacknet Node NIC Architecture Neural-Upload",
        "Hacknet Node Cache Architecture Neural-Upload",
        "Hacknet Node CPU Architecture Neural-Upload",
        "Hacknet Node Kernel Direct-Neural Interface",
        "Hacknet Node Core Direct-Neural Interface"
    ])
}, {
    "NiteSec": new Set([
        "BitWire",
        "Neurotrainer II",
        "Artificial Synaptic Potentiation",
        "Cranial Signal Processors - Gen II",
        "CRTX42-AA Gene Modification",
        "Neural-Retention Enhancement",
        "Embedded Netburner Module",
        "Cranial Signal Processors - Gen III"
    ])
}, {
    "The Black Hand": new Set([
        "Artificial Synaptic Potentiation",
        "Embedded Netburner Module",
        "DataJack",
        "Cranial Signal Processors - Gen III",
        "The Black Hand",
        "Cranial Signal Processors - Gen IV",
        "Enhanced Myelin Sheathing",
        "Embedded Netburner Module Core Implant",
        "Neuralstimulator",
    ]),
    "Sector-12": new Set(["CashRoot Starter Kit"])
}, {
    "Tian Di Hui": new Set([
        "Nanofiber Weave",
        "Speech Enhancement",
        "Nuoptimal Nootropic Injector Implant",
        "Neuroreceptor Management Implant"
    ]),
    "Chongqing": new Set(["Neuregen Gene Modification"]),
    "New Tokyo": new Set(["NutriGen Implant"]),
    "Ishima": new Set(["INFRARET Enhancement"])
}, {
    "Bachman & Associates": new Set([
        "Speech Enhancement",
        "Nuoptimal Nootropic Injector Implant",
        "ADR-V2 Pheromone Gene",
        "FocusWire",
        "SmartJaw",
        "Neuralstimulator"
    ])
}, {
    "BitRunners": new Set([
        "Neurotrainer II",
        "Embedded Netburner Module",
        "DataJack",
        "Cranial Signal Processors - Gen III",
        "Cranial Signal Processors - Gen IV",
        "Enhanced Myelin Sheathing",
        "Neural Accelerator",
        "Cranial Signal Processors - Gen V",
        "Embedded Netburner Module Core Implant",
        "Artificial Bio-neural Network Implant",
        "BitRunners Neurolink",
        "Embedded Netburner Module Core V2 Upgrade"
    ])
}, {
    "Sector-12": new Set([
        "Wired Reflexes",
        "Augmented Targeting I",
        "Augmented Targeting II",
        "Speech Processor Implant"
    ]),
    "Aevum": new Set(["PCMatrix"])
}, {
    "Volhaven": new Set([
        "Combat Rib I",
        "Combat Rib II",
        "DermaForce Particle Barrier"
    ]),
}, {
    "Daedalus": new Set(["NEMEAN Subdermal Weave", "The Red Pill"])
}, {
    "NWO": new Set([
        "ADR-V1 Pheromone Gene",
        "Neurotrainer III",
        "Power Recirculation Core",
        "Embedded Netburner Module",
        "Synfibril Muscle",
        "Enhanced Social Interaction Implant",
        "Embedded Netburner Module Core Implant",
        "Synthetic Heart",
        "Xanipher",
        "Embedded Netburner Module Core V2 Upgrade",
        "Embedded Netburner Module Analyze Engine",
        "Embedded Netburner Module Direct Memory Access Upgrade",
        "Embedded Netburner Module Core V3 Upgrade",
        "Hydroflame Left Arm"
    ])
}, {
    "Clarke Incorporated": new Set([
        "Speech Enhancement",
        "Nuoptimal Nootropic Injector Implant",
        "ADR-V2 Pheromone Gene",
        "FocusWire",
        "Enhanced Social Interaction Implant",
        "Neuronal Densification",
        "nextSENS Gene Modification",
        "Neuralstimulator"
    ]),
}];

export async function main(ns: NS) {
    ns.disableLog("ALL");

    let player = ns.getPlayer();
    let reset = (ns.args.length == 2 && ns.args[0] == "sfh" && ns.args[1] == "reset")
        || !globalThis.sfh?.player || sfh.reset
        || sfh.player.aug_time > player.playtimeSinceLastAug;
    if (!reset) { globalThis.sfh = new SFH(globalThis.sfh); return; }

    if (globalThis.sfh != null && sfh.procs?.set != null) {
        for (const proc of sfh.procs.set) {
            ns.kill(proc.pid);
            if (proc.pids) { for (const pid of proc.pids) { ns.kill(pid); } }
        }
    }

    // setup what SFH is allowed to do on its own
    const permissions = (globalThis.sfh?.can as S.Permissions | null) ?? {
        bitnode:   false, install:   true,
        scripts:   true,  purchase:  true,
        hacking:   true,  batching:  true,
        trading:   true,  hnet:      true,
        contracts: true,  corp:      true,
        working:   true,  automate:  true
    };

    globalThis.sfh = new SFH({
        can:     permissions,
        bb:      {} as S.Bitburner,
        ui:      {} as S.UI,
        time:    { now: 0, perf: {} },
        player:  {} as S.Player,
        state:   {} as S.State,
        money:   {} as S.Money,
        goal:    { type: null, desc: "", money: 0, money_next: 0, money_total: 0,
            augs: [], work: [], orgs: new Set(),
            skill: 0, cha: 0, combat: 0, karma: 0,
            corp: false, corp_ticks: 0 },
        network: {},
        procs:   { set: new Set(), pools: [], home: null, corp: null, sharing: new Set(), exp: new Set(),
            backdoor: null, contract: null, total_ram: 0, free_ram: 0, max_ram: 0 },
        hacking: { params: {}, list: [], min_dps: 0, scripts: 0, batch_time: 0, dps: 0, exp: 0 },
        sleeves: { money_rate: 0, karma_rate: 0, skill_rate: 0, str_rate: 0, def_rate: 0, dex_rate: 0, agi_rate: 0, cha_rate: 0, int_rate: 0 },
        trading: { stocks: {}, list: [], init: false, ready: false, time: 0, dps: 0 },
        hnet:    { hashes: 0, capacity: 0, prod: 0, dps: 0 },
        gang:    { state: "train", name: "none", size: 0, train: 0, time: 0, dps: 0, clash: 0, rep: 0, training: [] },
        corp:    { public: false, wait_ticks: 0, divisions: new Set(), funds: 0, profit: 0,
            round: 0, offer: 0, div_frac: 0, dividends: 0, research: 0, res_rate: 0, products: [] }
    });
    sfh.getBitburnerInternals();
    sfh.playerUpdate(ns, player);
    
    let bitnode = null;
    try { bitnode = ns.getBitNodeMultipliers(); } catch {}

    if (!sfh.player.bitnode) { sfh.player.bitnode = {} as any; }
    sfh.player.bitnode.number          = player.bitNodeN;
    sfh.player.bitnode.agi             = bitnode?.AgilityLevelMultiplier     ?? 1
    sfh.player.bitnode.aug_cost        = bitnode?.AugmentationMoneyCost      ?? 1
    sfh.player.bitnode.aug_rep         = bitnode?.AugmentationRepCost        ?? 1
    sfh.player.bitnode.bb_rank         = bitnode?.BladeburnerRank            ?? 1
    sfh.player.bitnode.bb_cost         = bitnode?.BladeburnerSkillCost       ?? 1
    sfh.player.bitnode.cha             = bitnode?.CharismaLevelMultiplier    ?? 1
    sfh.player.bitnode.class_exp       = bitnode?.ClassGymExpGain            ?? 1
    sfh.player.bitnode.cct_money       = bitnode?.CodingContractMoney        ?? 1
    sfh.player.bitnode.company_exp     = bitnode?.CompanyWorkExpGain         ?? 1
    sfh.player.bitnode.company_money   = bitnode?.CompanyWorkMoney           ?? 1
    sfh.player.bitnode.corp_dividends  = bitnode?.CorporationSoftcap         ?? 1
    sfh.player.bitnode.corp_valuation  = bitnode?.CorporationValuation       ?? 1
    sfh.player.bitnode.crime_exp       = bitnode?.CrimeExpGain               ?? 1
    sfh.player.bitnode.crime_money     = bitnode?.CrimeMoney                 ?? 1
    sfh.player.bitnode.daedalus_augs   = bitnode?.DaedalusAugsRequirement    ?? 1
    sfh.player.bitnode.def             = bitnode?.DefenseLevelMultiplier     ?? 1
    sfh.player.bitnode.dex             = bitnode?.DexterityLevelMultiplier   ?? 1
    sfh.player.bitnode.faction_passive = bitnode?.FactionPassiveRepGain      ?? 1
    sfh.player.bitnode.faction_exp     = bitnode?.FactionWorkExpGain         ?? 1
    sfh.player.bitnode.faction_rep     = bitnode?.FactionWorkRepGain         ?? 1
    sfh.player.bitnode.stock_data      = bitnode?.FourSigmaMarketDataApiCost ?? 1
    sfh.player.bitnode.stock_data_base = bitnode?.FourSigmaMarketDataCost    ?? 1
    sfh.player.bitnode.gang_softcap    = bitnode?.GangSoftcap                ?? 1
    sfh.player.bitnode.skill_exp       = bitnode?.HackExpGain                ?? 1
    sfh.player.bitnode.skill           = bitnode?.HackingLevelMultiplier     ?? 1
    sfh.player.bitnode.hacknet_prod    = bitnode?.HacknetNodeMoney           ?? 1
    sfh.player.bitnode.home_cost       = bitnode?.HomeComputerRamCost        ?? 1
    sfh.player.bitnode.infil_money     = bitnode?.InfiltrationMoney          ?? 1
    sfh.player.bitnode.infil_rep       = bitnode?.InfiltrationRep            ?? 1
    sfh.player.bitnode.hack_manual     = bitnode?.ManualHackMoney            ?? 1
    sfh.player.bitnode.cluster_cost    = bitnode?.PurchasedServerCost        ?? 1
    sfh.player.bitnode.cluster_count   = bitnode?.PurchasedServerLimit       ?? 1
    sfh.player.bitnode.cluster_max_ram = bitnode?.PurchasedServerMaxRam      ?? 1
    sfh.player.bitnode.cluster_softcap = bitnode?.PurchasedServerSoftcap     ?? 1
    sfh.player.bitnode.faction_favour  = bitnode?.RepToDonateToFaction       ?? 1
    sfh.player.bitnode.hack_money      = bitnode?.ScriptHackMoney            ?? 1
    sfh.player.bitnode.hack_profit     = bitnode?.ScriptHackMoneyGain        ?? 1
    sfh.player.bitnode.grow_rate       = bitnode?.ServerGrowthRate           ?? 1
    sfh.player.bitnode.node_max_money  = bitnode?.ServerMaxMoney             ?? 1
    sfh.player.bitnode.node_init_money = bitnode?.ServerStartingMoney        ?? 1
    sfh.player.bitnode.node_init_level = bitnode?.ServerStartingSecurity     ?? 1
    sfh.player.bitnode.weak_rate       = bitnode?.ServerWeakenRate           ?? 1
    sfh.player.bitnode.str             = bitnode?.StrengthLevelMultiplier    ?? 1
    sfh.player.bitnode.stanek_power    = bitnode?.StaneksGiftPowerMultiplier ?? 1
    sfh.player.bitnode.stanek_size     = bitnode?.StaneksGiftExtraSize       ?? 1
    sfh.player.bitnode.world_daemon    = bitnode?.WorldDaemonDifficulty      ?? 1

    // Get augmentations
    sfh.state.augs = Object.assign(new Set<string>(), { queued: new Set<string>() });
    for (const aug of ns.singularity.getOwnedAugmentations(false)) { sfh.state.augs.add(aug); }
    for (const aug of ns.singularity.getOwnedAugmentations(true)) {
        if (!sfh.state.augs.has(aug)) { sfh.state.augs.queued.add(aug); }
    }

    // Get all nodes
    const queue = ["home"];
    const seen  = new Set();
    for (let name; name = queue.shift();) {
        seen.add(name);

        sfh.netAdd(ns.getServer(name), ns.scan(name), null);
        for (const edge of sfh.network[name].edges) {
            if (!seen.has(edge)) { queue.push(edge); }
        }
    }

    sfh.state.factions  = {};
    sfh.state.companies = {};
    for (const faction in data.factions) {
        const favour = ns.singularity.getFactionFavor(faction);
        const joined = player.factions.includes(faction);
        sfh.state.factions[faction] = { name: faction, faction: true, joined, finished: false,
            favour, base_rep: 0, rep: 0 };
       
        const hostname = data.factions[faction].server;
        if (hostname) { sfh.state.factions[faction].node = sfh.network[hostname]; }

        if (data.factions[faction].company) {
            const company = data.factions[faction].company as string;
            const joined  = company in player.jobs;
            const favour  = ns.singularity.getCompanyFavor(company);
            sfh.state.companies[company] = { name: company, faction: false, joined, finished: false,
                favour, base_rep: 0, rep: 0 };

            if (hostname) { sfh.state.companies[company].node = sfh.network[hostname]; }

            sfh.state.factions[faction].dual  = company;
            sfh.state.companies[company].dual = faction;
        }
    }

    sfh.state.work = null;
    sfh.state.city = null as any;
    sfh.state.goto = null;
    sfh.state.continent = "America";

    sfh.state.skill_rate = 0;
    sfh.state.skill_time = 0;
    sfh.state.money_rate = 0;
    sfh.state.money_time = 0;

    const all_augs = new Set<{ org: S.Org, name: string }>();
    for (const set of aug_sets) {
        for (const faction in set) {
            const faction_reqs = data.factions[faction].reqs;
            if ("combat" in faction_reqs || "karma" in faction_reqs) { continue; }

            switch (faction_reqs.special) {
                case null:      break;
                case undefined: break;

                case "daedalus": {
                    const augs_req = Math.round(30 * sfh.player.bitnode.daedalus_augs);
                    if (sfh.state.augs.size < augs_req) { continue; }
                } break;

                default: continue;
            }

            if (faction === "Sector-12" || faction === "Aevum") {
                sfh.state.continent = "America";
            } else if (faction === "Volhaven") {
                sfh.state.continent = "Europe";
            } else if (faction === "Chongqing" || faction === "New Tokyo" || faction === "Ishima") {
                sfh.state.continent = "Asia";
            }

            let max_rep = 0;
            const this_augs = [];
            for (const aug of set[faction]) {
                if (data.augs[aug] == null) {
                    throw new Error(`Invalid augmentation '${aug}' in aug set for faction ${faction}`);
                }
                
                if (!sfh.state.augs.has(aug)) {
                    sfh.state.have_goal = true;
                    if (!sfh.state.augs.queued.has(aug)) {
                        this_augs.push(aug);
                        max_rep = Math.max(max_rep, data.augs[aug].rep * sfh.player.bitnode.aug_rep);
                    }
                }
            }

            if (this_augs.length === 0) { continue; }

            if ("company" in faction_reqs && sfh.state.factions[faction].favour == 0) {
                const company = sfh.state.companies[sfh.state.factions[faction].dual!];
                const cur_rep = 25000 * (1.02 ** company.favour - 1);
                const end_rep = faction_reqs.company ?? 0;
                const mid_rep = 25000 * ((1 + end_rep / 25000) ** (1/3) - 1);

                if (cur_rep > mid_rep) {
                    sfh.goal.work.push({ org: company, rep: end_rep });
                } else {
                    sfh.goal.work.push({ org: company, rep: mid_rep });
                    continue;
                }
            }

            const favour_donate = 150 * sfh.player.bitnode.faction_favour;

            if (sfh.state.factions[faction].favour >= favour_donate) {
                sfh.goal.work.push({ org: sfh.state.factions[faction], rep: max_rep });
            } else {
                const don_rep = 25000 * (1.02 ** favour_donate - 1);
                const cur_rep = 25000 * (1.02 ** sfh.state.factions[faction].favour - 1);

                if (max_rep < don_rep - cur_rep) {
                    const mid_rep = 25000 * (Math.sqrt(1 + max_rep / 25000) - 1);
                    if (max_rep <= 150e3 || cur_rep > mid_rep) {
                        sfh.goal.work.push({ org: sfh.state.factions[faction], rep: max_rep });
                    } else {
                        sfh.goal.work.push({ org: sfh.state.factions[faction], rep: mid_rep });
                        continue;
                    }
                } else {
                    const mid_rep = 25000 * (Math.sqrt(1 + don_rep / 25000) - 1);
                    if (cur_rep > mid_rep) {
                        sfh.goal.work.push({ org: sfh.state.factions[faction], rep: don_rep - cur_rep });
                    } else {
                        sfh.goal.work.push({ org: sfh.state.factions[faction], rep: mid_rep });
                    }
                    continue;
                }
            }

            for (const aug of this_augs) {
                sfh.goal.augs.push({ org: sfh.state.factions[faction], name: aug });
            }
        }

        if (sfh.state.have_goal) { break; }
    }

    // TODO: use default_exp, scaled by home RAM
    const default_exp = 5e6 * sfh.player.skill_exp_mult * sfh.player.bitnode.skill_exp;

    for (const { org } of (sfh.goal.augs as { org: S.Org }[]).concat(sfh.goal.work)) {
        const reqs = data.factions[org.name].reqs;
        sfh.goal.skill = Math.max(sfh.goal.skill, reqs.hacking ?? 0);
        sfh.goal.skill = Math.max(sfh.goal.skill, sfh.network[reqs.backdoor ?? ""]?.skill ?? 0);
        sfh.goal.skill = Math.max(sfh.goal.skill, reqs.special === "daedalus" ? 2500 : 0);
    }

    sfh.money.curr  = player.money;
    sfh.money.total = player.money;
    sfh.money.frac  = {} as any;
    sfh.money.spent = {} as any;
    sfh.money.can_train = false;

    const money_fracs: { [type in S.MoneyType]: number } = {
        goal:    Number.POSITIVE_INFINITY,
        home:    0.25,
        cores:   0.01,
        program: 0.001,
        cluster: 0.15,
        hacknet: 0.1,
        stocks:  0.1,
    };

    for (const type of (Object.keys(money_fracs) as S.MoneyType[])) {
        sfh.money.frac[type]  = money_fracs[type];
        sfh.money.spent[type] = 0;
    }

    sfh.goalSort();
    sfh.uiCreate(ns);
}
