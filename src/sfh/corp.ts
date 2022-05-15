import { NS } from "netscript";
import * as S from "sfh";

import { calcMaterials as calcMaterialsBase } from "/util/materials.js";

let C: NS["corporation"];
let log: (s: string) => unknown;

const sleep        = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const productName  = (i: number | string): string => `${Number(i).toFixed(0).padStart(3, "0")}`;
const productIndex = (s: string): number => parseInt(s, 10);
const cities: S.City[] = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"];

const str = {
    adv: "Wilson Analytics",
    res: "Project Insight",
    sal: "ABC SalesBots",
    pro: "Smart Factories",
    sto: "Smart Storage",
    int: "Neural Accelerators",
    eff: "FocusWires",
    cre: "Nuoptimal Nootropic Injector Implants",
    cha: "Speech Processor Implants",
    adp: "DreamSense",

    wap: "Warehouse API",
    oap: "Office API",
    exp: "Export",
    mrd: "Market Research - Demand",
    mdc: "Market Data - Competition",
    vec: "VeChain",
    dv1: "Shady Accounting",
    dv2: "Government Partnership",

    lab: "Hi-Tech R&D Laboratory",
    ta1: "Market-TA.I",
    ta2: "Market-TA.II",
    ful: "uPgrade: Fulcrum",
    cp1: "uPgrade: Capacity.I",
    cp2: "uPgrade: Capacity.II",

    ops: "Operations",
    eng: "Engineer",
    bus: "Business",
    mgm: "Management",
    rnd: "Research & Development",
    una: "Unassigned",
    tra: "Training",

    wat: "Water",
    ene: "Energy",
    foo: "Food",
    pla: "Plants",
    met: "Metal",
    har: "Hardware",
    che: "Chemicals",
    dru: "Drugs",
    rob: "Robots",
    aic: "AI Cores",
    ree: "Real Estate",
}

const extra_divs: [string, number][] = [
    ["Food",             10e9],
    ["Software",         25e9],
    ["Tobacco",          40e9],
    ["Chemical",         70e9],
    ["Fishing",          80e9],
    ["Utilities",       150e9],
    ["Pharmaceutical",  200e9],
    ["Energy",          225e9],
    ["Computer",        500e9],
    ["Real Estate",     600e9],
    ["Healthcare",      750e9],
    ["Robotics",       1000e9]
];

function setWait(new_ticks: number) { sfh.corp.wait_ticks = Math.max(sfh.corp.wait_ticks, new_ticks); }

const cm_cache: ReturnType<typeof calcMaterialsBase>[] = [];
function calcMaterials(city: S.City, volume: number) {
    if (cm_cache[volume] == null) { cm_cache[volume] = calcMaterialsBase("Agriculture", volume); }
    return cm_cache[volume]!;
}

async function startup() {
    log("Starting agriculture...");
    C.expandIndustry("Agriculture", "A");
    sfh.corp.divisions.add("A");
    C.expandIndustry("Food", "fo");
    sfh.corp.divisions.add("fo");
    C.unlockUpgrade("Smart Supply");

    for (const city of cities) {
        if (city != "Sector-12") {
            C.expandCity("A", city);
            C.purchaseWarehouse("A", city);
        }

        C.upgradeWarehouse("A", city);
        C.upgradeWarehouse("A", city);

        C.setSmartSupply("A", city, true);
        C.setSmartSupplyUseLeftovers("A", city, "Water",  true);
        C.setSmartSupplyUseLeftovers("A", city, "Energy", true);

        C.sellMaterial("A", city, "Plants", "MAX", "MP");
        C.sellMaterial("A", city, "Food",   "MAX", "MP");
    }

    try {
        C.hireAdVert("A");
        for (let i = 0; i < 2; ++i) {
            C.levelUpgrade(str.pro);
            C.levelUpgrade(str.sal);
            C.levelUpgrade(str.int);
            C.levelUpgrade(str.eff);
            C.levelUpgrade(str.cha);
            C.levelUpgrade(str.cre);
        }
    } catch {}

    for (const city of cities) {
        for (const pos of [str.ops, str.eng, str.bus]) {
            const employee = C.hireEmployee("A", city);
            log(`Assigning "A" employee to ${pos} in ${city}...`);
            if (employee) { await C.assignJob("A", city, employee.name, pos); }
        }
    }

    setWait(2);
}

function getInvestment() {
    const offer = C.getInvestmentOffer();
    const prev_offer = sfh.corp.offer;
    sfh.corp.offer  = offer.funds;
    sfh.corp.round  = offer.round - 1;

    log(`Stage ${sfh.corp.round}: ${sfh.corp.offer.toExponential(3)}${sfh.corp.wait_ticks > 0 ? " (waiting)" : ""}`);

    if (sfh.corp.wait_ticks > 0 || sfh.corp.public || sfh.corp.offer == 0 || prev_offer == 0) { return; }

    const increase = (sfh.corp.offer - prev_offer) / sfh.corp.offer;
    if (increase > 0.01) { return; }

    C.acceptInvestmentOffer();
    ++sfh.corp.round;
    log(`Taking investment offer ${sfh.corp.round}: \$${sfh.corp.offer.toExponential(3)}`);

    if (sfh.corp.round < 4) {
        let div_funds = 0.1 * C.getCorporation().funds;
        let div_spend = 0;

        for (const extra of extra_divs) {
            const name = (extra[0] === "Tobacco" ? "T" : extra[0].substring(0, 2).toLowerCase());
            if (sfh.corp.divisions.has(name)) { continue; }
            if (div_spend + extra[1] > div_funds) { break; }
            try { C.expandIndustry(extra[0], name); } catch { break; }
            log(`Purchased ${extra[0]} division`);
            sfh.corp.divisions.add(name);
            div_spend += extra[1];
        }

        setWait(2);
    } else if (sfh.corp.round == 4) {
        try { C.expandIndustry("Tobacco", "T"); sfh.corp.divisions.add("T"); } catch {}

        for (const city of cities) {
            if (city != "Sector-12") {
                C.expandCity("T", city);
                C.purchaseWarehouse("T", city);
            }

            C.setSmartSupply("T", city, true);
            C.setSmartSupplyUseLeftovers("T", city, "Water",  true);
            C.setSmartSupplyUseLeftovers("T", city, "Plants", true);
        }

        C.goPublic(0);
        sfh.corp.public = true;
    }
}

function research(min_research: number, ...names: string[]) {
    if (C.getDivision("T").research >= min_research) {
        for (const name of names) {
            if (!C.hasResearched("T", name)) {
                log(`Researching ${name}`);
                C.research("T", name);
            }
        }
        return true;
    }
    return false;
}

function manageProducts() {
    if (!sfh.corp.divisions.has("T")) { return; }

    let all_ready = true;
    for (const name of C.getDivision("T").products) {
        const index = productIndex(name);
        const info  = C.getProduct("T", name);

        if (sfh.corp.products[index] == null) {
            log(`Init product ${name} ${info.developmentProgress.toFixed(2)}`);

            sfh.corp.products[index] = {
                development: 0, time: -1, price_ticks: 0, price_power: 0,
                amount: Array(6).fill(0), change: Array(6).fill(0)
            };

            for (let i = 0; i < cities.length; ++i) {
                sfh.corp.products[index].amount[i] = info.cityData[cities[i]][0];
            }
        }

        const product = sfh.corp.products[index];
        if (product.development == 100) {
            product.time += 10;
        } else if (info.developmentProgress < 100) {
            if (product.development == 0 || product.development >= info.developmentProgress) {
                product.time = -1;
            } else {
                product.time = 10000 * (100 - info.developmentProgress)
                    / (info.developmentProgress - product.development);
            }

            product.development = info.developmentProgress;
        } else {
            product.development = 100;
            product.time        = 0;

            product.price_power = 0.5;
            for (const other of sfh.corp.products) {
                if (other == null) { continue; }
                product.price_power = Math.max(product.price_power, other.price_power);
            }

            research(10e3, "Hi-Tech R&D Laboratory")
                && research(100e3, "uPgrade: Fulcrum", "uPgrade: Capacity.I")
                && research(150e3, "uPgrade: Capacity.II")
                && research(200e3, "Market-TA.I", "Market-TA.II");
        }

        if (product.development < 100) { all_ready = false; }
    }

    if (all_ready) {
        let product_max = 3;
        if (C.hasResearched("T", "uPgrade: Capacity.I" )) { ++product_max; }
        if (C.hasResearched("T", "uPgrade: Capacity.II")) { ++product_max; }

        while (C.getDivision("T").products.length >= product_max) {
            let worst_product = null;
            let worst_rating  = null;

            for (const name of C.getDivision("T").products) {
                const info = C.getProduct("T", name) as any;
                if (worst_rating == null || info.rat < worst_rating) {
                    worst_product = name;
                    worst_rating  = info.rat;
                }
            }

            if (worst_product == null) { break; }
            C.discontinueProduct("T", worst_product);
        }
        
        if (C.getDivision("T").products.length < product_max) {
            let index = 0;
            for (const name of C.getDivision("T").products) {
                if (productIndex(name) > index) { index = productIndex(name); }
            }

            const name  = productName(index + 1);
            const funds = C.getCorporation().funds;

            let success = true;
            if (funds > 2e12) {
                C.makeProduct("T", "Sector-12", name, funds / 2000, funds / 2000);
            } else if (funds > 2e9) {
                C.makeProduct("T", "Sector-12", name, 1e9, 1e9);
            } else if (funds > 1) {
                C.makeProduct("T", "Sector-12", name, funds / 2, funds / 2);
            } else {
                success = false;
            }

            if (success) {
                sfh.corp.products[index] = {
                    development: 0, time: 0, price_ticks: 0, price_power: 0,
                    amount: Array(6).fill(0), change: Array(6).fill(0)
                };
            }
            setWait(1);
        }
    } else { setWait(1); }

    for (const index in sfh.corp.products) {
        const name    = productName(index);
        const product = sfh.corp.products[index];
        if (product == null) { continue; }

        let info;
        try { info = C.getProduct("T", name); } catch {
            delete sfh.corp.products[index];
            continue;
        }

        if (product.development < 100) {
            log(`Product ${name} ${product.development.toFixed(2)}%`);
            continue;
        }

        for (let i = 0; i < cities.length; ++i) {
            const amount = info.cityData[cities[i]][0];
            product.change[i] = amount - product.amount[i];
            product.amount[i] = amount;
        }

        let inventory  = 0;
        let max_change = 0;
        for (let i = 0; i < cities.length; ++i) {
            inventory += product.amount[i];
            max_change = Math.max(max_change, product.change[i]);
        }

        if (C.hasResearched("T", "Market-TA.II")) {
            if (inventory < 0.1) {
                C.setProductMarketTA2("T", name, true);
            } else {
                C.setProductMarketTA2("T", name, false);
                C.sellProduct("T", "Sector-12", name, "MAX", "MP", true);
            }
        } else {
            if (product.price_ticks > 0) { --product.price_ticks; }
            product.price_power = Math.max(product.price_power, 0);

            let price = "MP";
            if (inventory < 0.1) {
                if (product.price_ticks === 0) {
                    product.price_power = Math.round(10 * (product.price_power + 0.1)) / 10;
                    product.price_ticks = 1;
                }

                price += " * (10 ** " + product.price_power.toFixed(1) + ")";
            } else if (max_change > 0) {
                product.price_power = Math.max(Math.round(10 * (product.price_power - 0.1)) / 10, 0);
                product.price_ticks = Math.min(60, product.time / 10);
            }

            C.sellProduct("T", "Sector-12", name, "MAX", price, true);
        }

        log(`Product ${name} ${(product.time / 10).toFixed(0).padStart(4, " ")} | `
            + `Price ${product.price_power.toFixed(1)}`
            + ` ${product.price_ticks.toFixed(0).padStart(2, " ")} `);
        for (let i = 0; i < cities.length; ++i) {
            if (product.amount[i] > 0.1 || product.change[i] > 0) {
                log(`        ${cities[i].padStart(9, " ")} ${product.amount[i].toExponential(3)}`
                    + ` (${product.change[i].toExponential(3)})`);
            }
        }
    }
}

export async function runCorp(_C: NS["corporation"], _log?: (str: string) => any) {
    C = _C;
    log = (_log ? _log : function (str: string) { return undefined; });

    if (C.getCorporation().divisions.length === 0) { await startup(); }

    let init_corp = C.getCorporation();
    while (init_corp.state !== "START") {
        const bonus_time = (C as any).getBonusTime();
        const delay = (bonus_time > 10000 ? 100 : 1000);
        await sleep(delay);
        init_corp = C.getCorporation();
    }

    log("");
    log(`Cycle beginning at ${new Date(Date.now()).toLocaleTimeString()}`);

    sfh.corp.public = init_corp.public;
    sfh.corp.funds  = init_corp.funds;
    sfh.corp.profit = init_corp.revenue - init_corp.expenses;

    let dividend_tax = -0.15;
    if (C.hasUnlockUpgrade(str.dv1)) { dividend_tax += 0.05; }
    if (C.hasUnlockUpgrade(str.dv2)) { dividend_tax += 0.10; }
    sfh.corp.dividends = Math.pow(10 * sfh.corp.profit * sfh.corp.div_frac
        * init_corp.numShares / init_corp.totalShares, sfh.player.bitnode.corp_dividends + dividend_tax) / 10;

    for (const division of init_corp.divisions) { sfh.corp.divisions.add(division.name); }

    getInvestment();
    if (sfh.corp.wait_ticks > 0) { --sfh.corp.wait_ticks; }

    if (sfh.corp.round > 3 && !sfh.corp.public) { C.goPublic(0); sfh.corp.public = true; }
    if (sfh.corp.public) { C.issueDividends(0.01); sfh.corp.div_frac = 0.01; manageProducts(); }

    for (const city of cities) {
        C.sellMaterial("A", city, "Water",  (C.getMaterial("A", city, "Water" ).qty > 0.1 ? "MAX" : "0"), "0");
        C.sellMaterial("A", city, "Energy", (C.getMaterial("A", city, "Energy").qty > 0.1 ? "MAX" : "0"), "0");
        C.sellMaterial("A", city, "Food",   "MAX", "MP");
        C.sellMaterial("A", city, "Plants", "MAX", "MP");

        const volume = C.getWarehouse("A", city).size * [0.85, 0.8, 0.75, 0.75, 0.75][sfh.corp.round];
        const mats = calcMaterials(city, volume);
        for (const mat of [str.har, str.rob, str.aic, str.ree] as (keyof typeof mats)[]) {
            const qty = C.getMaterial("A", city, mat).qty;
            const diff = qty - mats[mat];
            if (Math.abs(diff) / qty > 0.01) { setWait(2); }
            C.buyMaterial("A", city, mat, (diff < 0 ? -diff / 10 : 0));
            C.sellMaterial("A", city, mat, (diff > 0 ? String(diff / 10) : "0"), "0");
        }
    }

    for (const extra of extra_divs) {
        if (extra[0] === "Tobacco") { continue; }
        const name = extra[0].substring(0, 2).toLowerCase();
        if (sfh.corp.divisions.has(name)) { continue; }
        if (C.getCorporation().funds < 100 * extra[1]) { break; }
        try { C.expandIndustry(extra[0], name); } catch { break; }
        sfh.corp.divisions.add(name);
    }

    const upgrades: [string, number][] = [
        [str.wap, 1],
        [str.oap, 1],
        [str.exp, 1000],
        [str.mrd, 1000],
        [str.mdc, 1000],
        [str.vec, 1000],
        [str.dv1, (sfh.corp.public ? 1 : 1000)],
        [str.dv2, (sfh.corp.public ? 1 : 1000)]
    ];

    for (const upgrade of upgrades) {
        if (C.hasUnlockUpgrade(upgrade[0])) { continue; }
        const min_funds = C.getUnlockUpgradeCost(upgrade[0]) * upgrade[1];
        if (C.getCorporation().funds >= min_funds) {
            try { C.unlockUpgrade(upgrade[0]); } catch { break; }
        }
    }

    const purchases: {
        name:  string;
        rank:  number;
        cost?: number;

        getCost():  number;
        purchase(): unknown;
    }[] = [];
    const pdiv = (sfh.corp.divisions.has("T") ? "T" : "A");

    for (const city of cities) {
        purchases.push({ name: city + " office",
            rank: (pdiv === "A" ? 1 : (city === "Sector-12" ? 2 : 10)),
            getCost:  () => C.getOfficeSizeUpgradeCost(pdiv, city, 3), 
            purchase: () => C.upgradeOfficeSize(pdiv, city, 3)});
        purchases.push({ name: city + " warehouse",
            rank: (pdiv === "A" ? 3 : (city === "Sector-12" ? 100 : 1000)),
            getCost:  () => C.getUpgradeWarehouseCost(pdiv, city), 
            purchase: () => C.upgradeWarehouse(pdiv, city)});
    }

    purchases.push({name: "AdVert",
        rank: 10,
        getCost:  () => C.getHireAdVertCost(pdiv),
        purchase: () => C.hireAdVert(pdiv)});

    for (const upgrade of [
        str.adv, str.res, str.sal, str.pro, str.sto, str.int, str.eff, str.cre, str.cha, str.adp
    ]) {
        let rank = 50;
        if      (upgrade === str.adv) { rank = 1; }
        else if (upgrade === str.res) { rank = (sfh.corp.round < 3 ? 1 : 2); }
        else if (upgrade === str.adp) { rank = 1000; }

        purchases.push({ name: upgrade.substring(0, 20), rank,
            getCost:  () => C.getUpgradeLevelCost(upgrade),
            purchase: () => C.levelUpgrade(upgrade)});
    }

    for (const purchase of purchases) {
        purchase.cost = purchase.getCost();
        if (purchase.rank <= 0) { purchase.rank = 1e9; }
    }

    for (let i = 0; i < 50; ++i) {
        purchases.sort((p, q) => p.rank * p.cost! - q.rank * q.cost!);
        const next = purchases[0];

        if (C.getCorporation().funds < next.cost!) { break; }
        try { next.purchase(); } catch { break; }

        log(`Purchased ${next.name}`);
        next.cost = next.getCost();
        setWait(1);
    }

    let sleep_time = 0;
    const max_time = ((C as any).getBonusTime() > 10000 ? 0 : 7000);

    for (const div of (sfh.corp.public ? ["A", "T"] : ["A"])) {
        const division = C.getDivision(div);
        const in_black = C.getCorporation().funds > 0
            && (division.lastCycleRevenue - division.lastCycleExpenses) > 0;

        for (const city of cities) {
            const office = C.getOffice(div, city);
            const hire_count = office.size - office.employees.length;
            for (let i = 0; i < hire_count; ++i) { C.hireEmployee(div, city); }
            const employees = C.getOffice(div, city).employees;

            const total: { [key: string]: number } = {
                [str.ops]: 0, [str.eng]: 0, [str.bus]: 0, [str.mgm]: 0,
                [str.rnd]: 0, [str.una]: 0, [str.tra]: 0, hap: 0, mor: 0, ene: 0
            };

            for (const name of employees) {
                const employee = C.getEmployee(div, city, name);
                ++total[employee.pos];
                total.hap += employee.hap;
                total.mor += employee.mor;
                total.ene += employee.ene;
            }

            if (in_black) {
                if (total.hap / employees.length < 95) { setWait(1); }
                if (total.mor / employees.length < 95) { setWait(1); }
                if (total.ene / employees.length < 95) { setWait(1); }
            }

            if (total[str.una] > 0 || total[str.tra] > 0) { setWait(2); }

            for (const name of employees) {
                if (sleep_time > max_time) { return; }

                const employee = C.getEmployee(div, city, name);
                if (employee.pos != str.una && employee.pos != str.tra) { continue; }

                let pos = str.ops;
                if (div === "A") {
                    pos = str.bus;
                    let num = total[str.bus];
                    for (const new_pos of [str.ops, str.eng, str.mgm]) {
                        if (total[new_pos] < num) {
                            pos = new_pos;
                            num = total[new_pos];
                        }
                    }
                } else if (city === "Sector-12") {
                    let num = total[str.ops];
                    for (const new_pos of [str.eng, str.bus, str.mgm, str.rnd]) {
                        if (total[new_pos] < num) {
                            pos = new_pos;
                            num = total[new_pos];
                        }
                    }
                } else {
                    const min = Math.ceil(employees.length / 30);
                    if      (total[str.ops] < min) { pos = str.ops; }
                    else if (total[str.eng] < min) { pos = str.eng; }
                    else if (total[str.bus] < min) { pos = str.bus; }
                    else if (total[str.mgm] < min) { pos = str.mgm; }
                    else { pos = str.rnd; }
                }

                log(`${div} ${city.padStart(9, " ")} employee to ${pos.split(" ")[0]}`);
                --total[employee.pos];
                ++total[pos];

                sleep_time += 1000;
                await C.assignJob(div, city, name, pos);
            }
        }
    }

    if ((C as any).getBonusTime() > 10000) {
        const delay = Math.max(0, 500 - sleep_time);
        if (delay > 0) { await sleep(delay); }
    } else {
        const delay = Math.max(0, 6000 - sleep_time);
        if (delay > 0) { await sleep(delay); }
    }
}

export async function main(ns: NS) {
    ns.disableLog("ALL");

    while (!sfh.state.has_corp) {
        if (sfh.can.corp) {
            if (sfh.can.purchase && sfh.player.money >= 150e9) {
                ns.print("Buying corp...");
                sfh.state.has_corp = ns.corporation.createCorporation("SFH", true);
            } else if (sfh.player.bitnode.number === 3) {
                ns.print("Starting corp with seed money...");
                sfh.state.has_corp = ns.corporation.createCorporation("SFH", false);
            }

            if (sfh.state.has_corp) { break; }
        }

        ns.print("Waiting to buy corp...");
        await ns.asleep(10000);
    }

    ns.print("Entering main corp loop");
    for (;;) {
        while (!sfh.can.corp) {
            ns.print("Waiting for corp permissions...");
            await ns.asleep(10000);
        }

        await sfh.corpUpdate(ns.corporation, ns.print.bind(ns));

        for (const work of sfh.state.goal.work) {
            if (!work.org.faction || !work.org.joined) { continue; }

            const funds = ns.corporation.getCorporation().funds;
            const req_bribe = (work.rep - work.org.rep) * 1e9;
            if (req_bribe > 0 && funds > 10 * req_bribe) {
                ns.print(`Bribing ${work.org.name}...`);
                ns.corporation.bribe(work.org.name, req_bribe, 0);
            }
        }

        for (const name in sfh.state.factions) {
            const faction = sfh.state.factions[name];
            if (!faction.joined) { continue; }

            let req_rep = 0
            for (const aug of data.factions[name].augs) {
                if (!sfh.state.augs.has(aug) && !sfh.state.augs.queued.has(aug)) {
                    req_rep = Math.max(req_rep, data.augs[aug].rep * sfh.player.bitnode.aug_rep);
                }
            }
            
            const funds = ns.corporation.getCorporation().funds;
            const req_bribe = (req_rep - faction.base_rep) * 1e9;
            if (req_bribe > 0 && funds > 100 * req_bribe) {
                ns.print(`Bribing ${name}...`);
                ns.corporation.bribe(name, req_bribe, 0);
            }
        }
    }
}
