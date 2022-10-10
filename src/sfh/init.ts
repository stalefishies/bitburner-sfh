import SFH from "/sfh/sfh.js"

// TODO: construct this based on bitnode; e.g. if hacking level is penalised,
// get CSP Gen II in CyberSec to help get the NiteSec requirement

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
    let reset = (ns.args.length == 2 && ns.args[0] == "sfh" && ns.args[1] === true)
        || !globalThis.sfh?.player || sfh.reset
        || sfh.time?.reset > player.playtimeSinceLastAug;
    if (!reset) { globalThis.sfh = new SFH(globalThis.sfh); return; }

    if (globalThis.sfh != null && sfh.procs?.set != null) {
        for (const proc of sfh.procs.set) {
            ns.kill(proc.pid);
            if (proc.pids) { for (const pid of proc.pids) { ns.kill(pid); } }
        }
    }

    // setup what SFH is allowed to do on its own
    const permissions = globalThis.sfh?.can ?? {
        bitnode:   true,  install:   true,
        scripts:   true,  purchase:  true,
        hacking:   true,  batching:  true,
        trading:   true,  hnet:      true,
        contracts: true,  corp:      true,
        working:   true,  automate:  true
    };

    globalThis.sfh = new SFH({
        can:     permissions,
        x:       {} as typeof sfh.x,
        ui:      {} as typeof sfh.ui,
        time:    { now: 0, period: 0, reset: player.playtimeSinceLastAug,
            bitnode: player.playtimeSinceLastBitnode, total: player.totalPlaytime },
        bitnode: {} as typeof sfh.bitnode,
        player:  {} as typeof sfh.player,
        state:   {} as typeof sfh.state,
        money:   {} as typeof sfh.money,

        gains:   {
            total: { money: 0, karma: 0, rep: 0,
                hac_exp: 0, str_exp: 0, def_exp: 0, dex_exp: 0, agi_exp: 0, cha_exp: 0, int_exp: 0 },
            scripts: { money: 0, karma: 0, rep: 0,
                hac_exp: 0, str_exp: 0, def_exp: 0, dex_exp: 0, agi_exp: 0, cha_exp: 0, int_exp: 0 },
            work: { money: 0, karma: 0, rep: 0,
                hac_exp: 0, str_exp: 0, def_exp: 0, dex_exp: 0, agi_exp: 0, cha_exp: 0, int_exp: 0 },
            sleeves: { money: 0, karma: 0, rep: 0,
                hac_exp: 0, str_exp: 0, def_exp: 0, dex_exp: 0, agi_exp: 0, cha_exp: 0, int_exp: 0 },
            hacknet: { money: 0, karma: 0, rep: 0,
                hac_exp: 0, str_exp: 0, def_exp: 0, dex_exp: 0, agi_exp: 0, cha_exp: 0, int_exp: 0 },
            gang: { money: 0, karma: 0, rep: 0,
                hac_exp: 0, str_exp: 0, def_exp: 0, dex_exp: 0, agi_exp: 0, cha_exp: 0, int_exp: 0 },
            corp: { money: 0, karma: 0, rep: 0,
                hac_exp: 0, str_exp: 0, def_exp: 0, dex_exp: 0, agi_exp: 0, cha_exp: 0, int_exp: 0 },
        },

        goal:    { type: null, desc: "", money: 0, money_next: 0, money_total: 0,
            augs: [], work: [], orgs: new Set(),
            hac: 0, str: 0, def: 0, dex: 0, agi: 0, cha: 0, int: 0,
            times: { money: 0, karma: 0, rep: 0, hac: 0, str: 0, def: 0, dex: 0, agi: 0, cha: 0, int: 0 },
            time: 0, corp: false, corp_ticks: 0
        },

        netstat: { ready: true, scp_args: [] },
        network: {},

        procs:   { set: new Set(), pools: [], home: null,
            sharing: new Set(), exp: new Set(), stanek: new Set(),
            backdoor: null, total_ram: 0, free_ram: 0, max_pool: 0 },

        hacking: { params: {}, list: [], min_dps: 0, scripts: 0, max_scripts: 10000 },

        sleeves: [],

        trading: {
            stocks: {}, list: [], init: false, time: 0, dps: 0,
            spent: 0, sell: 0, total_spent: 0, total_sold: 0
        },

        hnet: { hashes: 0, capacity: 0, prod: 0, study_mult: 1, train_mult: 1 },

        gang: {
            state: "respect", members: Array.from({ length: 12 }, () =>
                ({ ready: false, task: "Train Combat", com_time: 0, hac_time: 0, cha_time: 0 })),
            prev_times: { time: 0, rspct: 0, power: 0, money: 0 }, can_ascend: true, train_time: 0,
            name: "", size: 0, time: 0, clash: 0, aug_rep: 0
        },

        corp: {
            reserve: false, ready: false, state: 5, public: false, wait_ticks: 0, divisions: new Set(),
            funds: 0, profit: 0, round: 0, offer: 0, div_frac: 0, dividends: 0,
            A: { exists: false, adverts: 0,
                office: {
                    ["Sector-12"]: { warehouse: false, employees: 0 },
                    ["Aevum"]:     { warehouse: false, employees: 0 },
                    ["Volhaven"]:  { warehouse: false, employees: 0 },
                    ["Chongqing"]: { warehouse: false, employees: 0 },
                    ["New Tokyo"]: { warehouse: false, employees: 0 },
                    ["Ishima"]:    { warehouse: false, employees: 0 },
                }
            },
            T: { exists: false, adverts: 0, research: 0, res_rate: 0,
                office: {
                    ["Sector-12"]: { warehouse: false, employees: 0 },
                    ["Aevum"]:     { warehouse: false, employees: 0 },
                    ["Volhaven"]:  { warehouse: false, employees: 0 },
                    ["Chongqing"]: { warehouse: false, employees: 0 },
                    ["New Tokyo"]: { warehouse: false, employees: 0 },
                    ["Ishima"]:    { warehouse: false, employees: 0 },
                },
                products: []
            }
        },

        stanek: { width: 0, height: 0 }
    });
    sfh.getBitburnerInternals();

    let bn = null;
    try { bn = ns.getBitNodeMultipliers(); } catch {}

    sfh.bitnode = {
        number: player.bitNodeN,
        sf:     Array(20).fill(0),
        mults: {
            hac:             bn?.HackingLevelMultiplier     ?? 1,
            str:             bn?.StrengthLevelMultiplier    ?? 1,
            def:             bn?.DefenseLevelMultiplier     ?? 1,
            dex:             bn?.DexterityLevelMultiplier   ?? 1,
            agi:             bn?.AgilityLevelMultiplier     ?? 1,
            cha:             bn?.CharismaLevelMultiplier    ?? 1,
            int:                                               1,

            hac_exp:         bn?.HackExpGain                ?? 1,
            str_exp:                                           1,
            def_exp:                                           1,
            dex_exp:                                           1,
            agi_exp:                                           1,
            cha_exp:                                           1,
            int_exp:                                           1,

            hack_money:      bn?.ScriptHackMoney            ?? 1,
            hack_profit:     bn?.ScriptHackMoneyGain        ?? 1,
            hack_manual:     bn?.ManualHackMoney            ?? 1,
            hack_prob:                                         1,
            hack_time:                                         1,
            grow_rate:       bn?.ServerGrowthRate           ?? 1,
            weak_rate:       bn?.ServerWeakenRate           ?? 1,

            max_money:       bn?.ServerMaxMoney             ?? 1,
            init_money:      bn?.ServerStartingMoney        ?? 1,
            init_level:      bn?.ServerStartingSecurity     ?? 1,

            aug_cost:        bn?.AugmentationMoneyCost      ?? 1,
            aug_rep:         bn?.AugmentationRepCost        ?? 1,

            home_cost:       bn?.HomeComputerRamCost        ?? 1,
            cluster_cost:    bn?.PurchasedServerCost        ?? 1,
            cluster_count:   bn?.PurchasedServerLimit       ?? 1,
            cluster_max_ram: bn?.PurchasedServerMaxRam      ?? 1,
            cluster_softcap: bn?.PurchasedServerSoftcap     ?? 1,

            faction_rep:     bn?.FactionWorkRepGain         ?? 1,
            faction_exp:     bn?.FactionWorkExpGain         ?? 1,
            faction_passive: bn?.FactionPassiveRepGain      ?? 1,
            company_money:   bn?.CompanyWorkMoney           ?? 1,
            company_rep:                                       1,
            company_exp:     bn?.CompanyWorkExpGain         ?? 1,
            crime_money:     bn?.CrimeMoney                 ?? 1,
            crime_exp:       bn?.CrimeExpGain               ?? 1,
            crime_prob:                                        1,
            class_exp:       bn?.ClassGymExpGain            ?? 1,

            contract_money:  bn?.CodingContractMoney        ?? 1,
            infil_money:     bn?.InfiltrationMoney          ?? 1,
            infil_rep:       bn?.InfiltrationRep            ?? 1,

            hacknet_prod:    bn?.HacknetNodeMoney           ?? 1,
            hacknet_node:                                      1,
            hacknet_level:                                     1,
            hacknet_ram:                                       1,
            hacknet_core:                                      1,

            corp_dividends:  bn?.CorporationSoftcap         ?? 1,
            corp_valuation:  bn?.CorporationValuation       ?? 1,
            gang_softcap:    bn?.GangSoftcap                ?? 1,
            stanek_power:    bn?.StaneksGiftPowerMultiplier ?? 1,

            bb_sta:                                            1,
            bb_sta_gain:                                       1,
            bb_analysis:                                       1,
            bb_prob:                                           1,
            bb_rank:         bn?.BladeburnerRank            ?? 1,
            bb_cost:         bn?.BladeburnerSkillCost       ?? 1,
        },

        donation:      150  * (bn?.RepToDonateToFaction       ??  1),
        stock_4S_base: 1e9  * (bn?.FourSigmaMarketDataCost    ??  1),
        stock_4S_api:  25e9 * (bn?.FourSigmaMarketDataApiCost ??  1),
        gang_augs:            ((bn as any)?.GangUniqueAugs    ??  1),
        stanek_size:          (bn?.StaneksGiftExtraSize       ??  0),
        daedalus_augs:        (bn?.DaedalusAugsRequirement    ?? 30),
        world_daemon:  3000 * (bn?.WorldDaemonDifficulty      ??  1)
    };

    for (const sf of ns.singularity.getOwnedSourceFiles()) { sfh.bitnode.sf[sf.n] = sf.lvl; }
    sfh.playerUpdate(ns, player);

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
    for (const faction of Object.values(data.factions)) {
        const favour = ns.singularity.getFactionFavor(faction.name);
        const joined = player.factions.includes(faction.name);

        sfh.state.factions[faction.name] = {
            name: faction.name, faction: true, joined, finished: false,
            augs: Object.assign(new Set<string>(), { all: new Set<string>() }), favour, rep: 0
        };
       
        //const hostname = data.factions[faction].server;
        //if (hostname) { sfh.state.factions[faction].server = sfh.network[hostname]; }
    }

    sfh.state.companies = {};
    for (const company of Object.values(data.companies)) {
        const favour = ns.singularity.getCompanyFavor(company.name);
        const joined = company.name in player.jobs;

        sfh.state.companies[company.name] = {
            name: company.name, faction: false, joined, finished: false,
            augs: Object.assign(new Set<string>(), { all: new Set<string>() }), favour, rep: 0
        };

        if (company.faction) {
            sfh.state.companies[company.name].dual = company.faction;
            sfh.state.factions[company.faction].dual = company.name;
        }
    }

    sfh.state.work = null;
    sfh.state.goto = null;
    sfh.state.city = player.city as City;
    sfh.state.continent = null;

    const all_augs = new Set<{ org: Org, name: string }>();
    for (const set of aug_sets) {
        for (const faction in set) {
            const faction_reqs = data.factions[faction].reqs;

            switch (faction_reqs.special) {
                case null:      break;
                case undefined: break;

                case "daedalus": {
                    if (sfh.state.augs.size < sfh.bitnode.daedalus_augs) { continue; }
                } break;

                default: continue;
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
                        max_rep = Math.max(max_rep, data.augs[aug].rep * sfh.player.mults.aug_rep);
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

            if (sfh.state.factions[faction].favour >= sfh.bitnode.donation) {
                sfh.goal.work.push({ org: sfh.state.factions[faction], rep: max_rep });
            } else {
                const don_rep = 25000 * (1.02 ** sfh.bitnode.donation - 1);
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

    sfh.goalSort();

    sfh.money.curr  = player.money;
    sfh.money.total = player.money;
    sfh.money.frac  = {} as any;
    sfh.money.spent = {} as any;
    sfh.money.can_class = false;

    const money_fracs: typeof sfh.money.frac = {
        goal:    (sfh.bitnode.number === 8 ? 0.05 : Number.POSITIVE_INFINITY),
        upgrade: (sfh.bitnode.number === 8 ? 0.01 : 0.25),
        program: 0.001,
        cluster: (sfh.bitnode.number === 8 ? 0.01 : 0.15),
        hacknet: Math.min(sfh.player.mults.hacknet_prod, 1) * 0.1,
        stocks:  (sfh.bitnode.number === 8 ? 0.75 : 0.05),
        gang:    Math.min(sfh.player.mults.gang_softcap, 1) * 0.05,
        sleeves: (sfh.bitnode.number === 8 ? 0.01 : 0.15),
    };

    for (const type of (Object.keys(money_fracs) as (keyof typeof money_fracs)[])) {
        sfh.money.frac[type]  = money_fracs[type];
        sfh.money.spent[type] = 0;
    }

    for (const type of (Object.keys(sfh.gains) as (keyof typeof sfh.gains)[])) {
        for (const key of (Object.keys(sfh.gains[type]) as (keyof typeof sfh.gains.total)[])) {
            sfh.gains[type][key] = 0;
        }
    }

    sfh.uiCreate(ns);
}
