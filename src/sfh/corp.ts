/*

corp script state:
1. not ready for corp
2. waiting for 1GB to become free on home
3. running the corp script

bool for waiting for 1GB - set when we have a corp or have >= 150e9 or in BN3
bool to say to run the corp script - set by the network script when it's reserved the space

1. if we haven't got a corp:
    create corp
    run startup actions

2. update corp

3. if we're not public:
    consider getting an investment
    if we get an investment:
        buy some divisions

4. run tobacco
    if not public: return
    buy all cities
    buy all warehouses

5. run agriculture
    buy all cities
    buy all warehouses
    1 warehouse upgrade
    1 warehouse upgrade

6. make purchases

7. bribe factions

*/

import { calcMaterials as calcMaterialsBase } from "/misc/materials.js"

const cm_cache: ReturnType<typeof calcMaterialsBase>[] = [];
function calcMaterials(volume: number) {
    if (cm_cache[volume] == null) { cm_cache[volume] = calcMaterialsBase("Agriculture", volume); }
    return cm_cache[volume]!;
}

let C:   NS["corporation"];
let log: (s:  string) => unknown;

const productName  = (i: number | string): string => `${Number(i).toFixed(0).padStart(3, "0")}`;
const productIndex = (s: string): number => parseInt(s, 10);
const cities: City[] = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"];

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

function startup() {
    log("Starting agriculture...");

    try {
        C.expandIndustry("Agriculture", "A");
        sfh.corp.A.exists = true;
        sfh.corp.divisions.add("A");
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

        C.hireAdVert("A");
        for (let i = 0; i < 2; ++i) {
            C.levelUpgrade(str.pro);
            C.levelUpgrade(str.sal);
            C.levelUpgrade(str.int);
            C.levelUpgrade(str.eff);
            C.levelUpgrade(str.cha);
            C.levelUpgrade(str.cre);
        }

        C.expandIndustry("Food", "fo");
        sfh.corp.divisions.add("fo");

        for (const city of cities) {
            for (const pos of [str.ops, str.eng, str.bus]) {
                const employee = C.hireEmployee("A", city);
                if (employee) { C.assignJob("A", city, employee.name, pos); }
            }
        }

        setWait(2);
    } catch (error) {
        sfh.can.corp = false;
        const message = (error instanceof Error ? error.message : String(error));
        throw new Error("ERROR IN CORP STARTUP:\n\n" + message);
    }
}

function updateState() {
    const corp = C.getCorporation();

    sfh.corp.public = corp.public;
    sfh.corp.funds  = corp.funds;
    sfh.corp.profit = corp.revenue - corp.expenses;

    let A, T;
    for (const division of corp.divisions) {
        sfh.corp.divisions.add(division.name);

        if (division.name === "A") { A = division; }
        if (division.name === "T") { T = division; }
    }

    if (A) {
        sfh.corp.A.exists  = true;
        sfh.corp.A.adverts = C.getHireAdVertCount("A");

        for (const city of (A.cities as City[])) {
            sfh.corp.A.office[city].warehouse = C.hasWarehouse("A", city);
            sfh.corp.A.office[city].employees = C.getOffice("A", city).size;
        }
    }

    if (T) {
        sfh.corp.T.exists   = true;
        sfh.corp.T.adverts  = C.getHireAdVertCount("T");
        sfh.corp.T.research = T.research;
        sfh.corp.T.res_rate = 1;    // TODO: calculate this

        for (const city of (T.cities as City[])) {
            sfh.corp.T.office[city].warehouse = C.hasWarehouse("T", city);
            sfh.corp.T.office[city].employees = C.getOffice("T", city).size;
        }

        //const res = T.research;
        //if (res > sfh.corp.research) { sfh.corp.res_rate = (res - sfh.corp.research) / 10; }
        //sfh.corp.research = res;
    }
}

function manageInvestment() {
    const offer      = C.getInvestmentOffer();
    const prev_offer = sfh.corp.offer;
    sfh.corp.offer = offer.funds;
    sfh.corp.round = offer.round - 1;

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
    } else {
        try {
            C.expandIndustry("Tobacco", "T");
            sfh.corp.T.exists = true;
            sfh.corp.divisions.add("T");

            for (const city of cities) {
                if (city != "Sector-12") {
                    C.expandCity("T", city);
                    C.purchaseWarehouse("T", city);
                }

                C.setSmartSupply("T", city, true);
                C.setSmartSupplyUseLeftovers("T", city, "Water",  true);
                C.setSmartSupplyUseLeftovers("T", city, "Plants", true);
            }
        } catch {}

        C.goPublic(0);
        sfh.corp.public = true;
    }
}

function manageDividends() {
    if (sfh.corp.round > 3 && !sfh.corp.public) {
        C.goPublic(0);
        sfh.corp.public = true;
    }

    if (!sfh.corp.public) {
        sfh.corp.div_frac  = 0;
        sfh.corp.dividends = 0;
        return;
    }

    if (sfh.corp.funds <= 0 || sfh.corp.profit <= 1e10) {
        sfh.corp.div_frac = 0;
    } else {
        const frac = (Math.log10(sfh.corp.profit) - 10) / 90;
        sfh.corp.div_frac = Math.max(Math.min(frac, 1), 0);
    }

    C.issueDividends(sfh.corp.div_frac);
    sfh.corp.dividends = C.getCorporation().dividendEarnings;

    if (sfh.corp.dividends < 1e7 || sfh.corp.dividends * 3600 < sfh.money.curr) {
        C.issueDividends(0);
        sfh.corp.div_frac  = 0;
        sfh.corp.dividends = 0;
    }
}

function expandDivision(div: "A" | "T") {
    for (const city of cities) {
        if (sfh.corp[div].office[city].employees == 0) {
            try { C.expandCity(div, city); } catch { return false; }
            sfh.corp[div].office[city].employees = C.getOffice(div, city).employees.length;
            if (sfh.corp[div].office[city].employees == 0) { return false; }
        }
    }

    for (const city of cities) {
        if (!sfh.corp[div].office[city].warehouse) {
            try { C.purchaseWarehouse(div, city); } catch { return false; }
            sfh.corp[div].office[city].warehouse = C.hasWarehouse(div, city);
            if (!sfh.corp[div].office[city].warehouse) { return false; }
        }
    }

    return true;
}

function manageAgriculture() {
    if (!sfh.corp.A.exists) { return; }
    expandDivision("A");

    for (const city of cities) {
        if (!sfh.corp.A.office[city].warehouse) { continue; }

        C.sellMaterial("A", city, "Water",  (C.getMaterial("A", city, "Water" ).qty > 0.1 ? "MAX" : "0"), "0");
        C.sellMaterial("A", city, "Energy", (C.getMaterial("A", city, "Energy").qty > 0.1 ? "MAX" : "0"), "0");
        C.sellMaterial("A", city, "Food",   "MAX", "MP");
        C.sellMaterial("A", city, "Plants", "MAX", "MP");

        const volume = C.getWarehouse("A", city).size * [0.85, 0.8, 0.75, 0.75, 0.75][sfh.corp.round];
        const mats = calcMaterials(volume);
        for (const mat of [str.har, str.rob, str.aic, str.ree] as (keyof typeof mats)[]) {
            const qty = C.getMaterial("A", city, mat).qty;
            const diff = qty - mats[mat];
            if (Math.abs(diff) / qty > 0.01) { setWait(2); }
            C.buyMaterial("A", city, mat, (diff < 0 ? -diff / 10 : 0));
            C.sellMaterial("A", city, mat, (diff > 0 ? String(diff / 10) : "0"), "0");
        }
    }
}

function manageTobacco() {
    if (!sfh.corp.public || !sfh.corp.T.exists) { return; }
    expandDivision("T");

    let all_ready = true;
    for (const name of C.getDivision("T").products) {
        const index = productIndex(name);
        const info  = C.getProduct("T", name);

        if (sfh.corp.T.products[index] == null) {
            log(`Init product ${name} ${info.developmentProgress.toFixed(2)}`);

            sfh.corp.T.products[index] = {
                development: 0, time: -1, price_ticks: 0, price_power: 0,
                amount: Array(6).fill(0), change: Array(6).fill(0)
            };

            for (let i = 0; i < cities.length; ++i) {
                sfh.corp.T.products[index].amount[i] = info.cityData[cities[i]][0];
            }
        }

        const product = sfh.corp.T.products[index];
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
            for (const other of sfh.corp.T.products) {
                if (other == null) { continue; }
                product.price_power = Math.max(product.price_power, other.price_power);
            }

            for (const [min_res, name] of [
                [ 15e3, "Hi-Tech R&D Laboratory"],
                [ 30e3, "uPgrade: Fulcrum"      ],
                [ 60e3, "uPgrade: Capacity.I"   ],
                [ 90e3, "uPgrade: Capacity.II"  ],
                [120e3, "Market-TA.I"           ],
                [150e3, "Market-TA.II"          ]
            ] as [number, string][]) {
                if (C.hasResearched("T", name)) { continue; }
                if (C.getDivision("T").research - C.getResearchCost("T", name) < min_res) { break; }

                log(`Researching ${name}`);
                C.research("T", name);
            }
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
            } else if (funds > 3e9) {
                C.makeProduct("T", "Sector-12", name, 1e9, 1e9);
            } else if (funds > 1) {
                C.makeProduct("T", "Sector-12", name, funds / 3, funds / 3);
            } else {
                success = false;
            }

            if (success) {
                sfh.corp.T.products[index] = {
                    development: 0, time: 0, price_ticks: 0, price_power: 0,
                    amount: Array(6).fill(0), change: Array(6).fill(0)
                };
            }
            setWait(1);
        }
    } else { setWait(1); }

    products: for (const index in sfh.corp.T.products) {
        const name    = productName(index);
        const product = sfh.corp.T.products[index];
        if (product == null) { continue; }

        let info;
        try { info = C.getProduct("T", name); } catch {
            delete sfh.corp.T.products[index];
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

function managePurchases() {
    const purchases: {
        div:   string;
        name:  string;
        rank:  number;
        cost?: number;

        getCost():  number;
        purchase(): unknown;
    }[] = [];

    for (const div of ["A", "T"] as ("A" | "T")[]) {
        if (!sfh.corp[div].exists) { continue; }

        for (const city of cities) {
            if (sfh.corp[div].office[city].employees > 0) {
                purchases.push({ div, name: city + " office",
                    rank: (div === "A" ? 1 : (city === "Sector-12" ? 2 : 10)),
                    getCost: function() {
                        if (C.getOffice(div, city).size >= 999) {
                            return Number.POSITIVE_INFINITY;
                        } else {
                            return C.getOfficeSizeUpgradeCost(div, city, 3);
                        }
                    },
                    purchase: () => C.upgradeOfficeSize(div, city, 3)
                });
            }

            if (sfh.corp[div].office[city].warehouse) {
                purchases.push({ div, name: city + " warehouse",
                    rank: (div === "A" ? 3 : (city === "Sector-12" ? 100 : 1000)),
                    getCost:  () => C.getUpgradeWarehouseCost(div, city), 
                    purchase: () => C.upgradeWarehouse(div, city)
                });
            }
        }

        purchases.push({ div, name: "AdVert",
            rank: 10,
            getCost:  () => C.getHireAdVertCost(div),
            purchase: () => C.hireAdVert(div)
        });

        for (const upgrade of [
            str.adv, str.res, str.sal, str.pro, str.sto, str.int, str.eff, str.cre, str.cha, str.adp
        ]) {
            let rank = 50;
            if      (upgrade === str.adv) { rank = 1; }
            else if (upgrade === str.res) { rank = (sfh.corp.round < 3 ? 1 : 2); }
            else if (upgrade === str.adp) { rank = 1000; }

            purchases.push({ div, name: upgrade.substring(0, 20), rank,
                getCost:  () => C.getUpgradeLevelCost(upgrade),
                purchase: () => C.levelUpgrade(upgrade)
            });
        }
    }

    for (const purchase of purchases) {
        if (purchase.rank <= 0)  { purchase.rank = 1e9; }
        if (purchase.div == "A") { purchase.rank *= 100; }

        purchase.cost = purchase.getCost();
    }

    for (let i = 0; i < 50; ++i) {
        purchases.sort((p, q) => p.rank * p.cost! - q.rank * q.cost!);
        const next = purchases[0];

        if (C.getCorporation().funds < next.cost!) { break; }
        try { next.purchase(); } catch { break; }

        log(`Purchased ${next.div} ${next.name}`);
        next.cost = next.getCost();
        setWait(1);
    }
}

function manageEmployees() {
    for (const div of ["A", "T"] as ("A" | "T")[]) {
        if (!sfh.corp[div].exists) { continue; }

        const division = C.getDivision(div);
        const in_black = C.getCorporation().funds > 0
            && (division.lastCycleRevenue - division.lastCycleExpenses) > 0;

        for (const city of cities) {
            if (sfh.corp[div].office[city].employees == 0) { continue; }

            const office = C.getOffice(div, city);
            const hire_count = office.size - office.employees.length;
            for (let i = 0; i < hire_count; ++i) { C.hireEmployee(div, city); }
            const employees = C.getOffice(div, city).employees;

            let unassigned = false;
            let total_hap = 0;
            let total_mor = 0;
            let total_ene = 0;

            for (const name of employees) {
                const employee = C.getEmployee(div, city, name);

                if (employee.pos === str.una || employee.pos === str.tra) {
                    unassigned = true;
                    break;
                }

                total_hap += employee.hap;
                total_mor += employee.mor;
                total_ene += employee.ene;
            }

            if (unassigned) {
                setWait(2);
            } else if (in_black) {
                if (total_hap / employees.length < 90) { setWait(1); }
                if (total_mor / employees.length < 90) { setWait(1); }
                if (total_ene / employees.length < 90) { setWait(1); }
            }

            C.setAutoJobAssignment(div, city, str.tra, 0);
            if (div === "A") {
                C.setAutoJobAssignment(div, city, str.ops, Math.floor((employees.length + 2) / 4));
                C.setAutoJobAssignment(div, city, str.eng, Math.floor((employees.length + 1) / 4));
                C.setAutoJobAssignment(div, city, str.bus, Math.floor((employees.length + 3) / 4));
                C.setAutoJobAssignment(div, city, str.mgm, Math.floor((employees.length + 0) / 4));
                C.setAutoJobAssignment(div, city, str.rnd, 0);
            } else if (city === "Sector-12") {
                C.setAutoJobAssignment(div, city, str.ops, Math.floor((employees.length + 4) / 5));
                C.setAutoJobAssignment(div, city, str.eng, Math.floor((employees.length + 3) / 5));
                C.setAutoJobAssignment(div, city, str.bus, Math.floor((employees.length + 2) / 5));
                C.setAutoJobAssignment(div, city, str.mgm, Math.floor((employees.length + 1) / 5));
                C.setAutoJobAssignment(div, city, str.rnd, Math.floor((employees.length + 0) / 5));
            } else {
                const other = Math.floor(employees.length / 10);
                C.setAutoJobAssignment(div, city, str.ops, Math.floor((other + 3) / 4));
                C.setAutoJobAssignment(div, city, str.eng, Math.floor((other + 2) / 4));
                C.setAutoJobAssignment(div, city, str.bus, Math.floor((other + 1) / 4));
                C.setAutoJobAssignment(div, city, str.mgm, Math.floor((other + 0) / 4));
                C.setAutoJobAssignment(div, city, str.rnd, employees.length - other);
            }
        }
    }
}

export async function main(ns: NS) {
    ns.disableLog("ALL");
    if (ns.args.length !== 1 || ns.args[0] !== "sfh" || !sfh.can.corp) { return; }

    C   = ns.corporation;
    log = ns.print.bind(ns);

    let init_corp;
    try {
        init_corp = C.getCorporation();
    } catch {
        if (sfh.can.purchase && sfh.money.curr >= 150e9) {
            ns.print("Buying corp...");
            sfh.state.has_corp = ns.corporation.createCorporation("SFH", true);
        } else if (sfh.bitnode.number === 3) {
            ns.print("Starting corp with seed money...");
            sfh.state.has_corp = ns.corporation.createCorporation("SFH", false);

            if (sfh.state.has_corp) {
                sfh.money.spent.goal ??= 0;
                sfh.money.spent.goal += 150e9;
            }
        }

        try {
            init_corp = C.getCorporation();
        } catch {
            return;
        }
    }

    if (init_corp.divisions.length === 0) {
        startup();
        init_corp = C.getCorporation();
    }

    let state = 5;
    if      (init_corp.state === "START"     ) { state = 0; }
    else if (init_corp.state === "PURCHASE"  ) { state = 1; }
    else if (init_corp.state === "PRODUCTION") { state = 2; }
    else if (init_corp.state === "SALE"      ) { state = 3; }
    else if (init_corp.state === "EXPORT"    ) { state = 4; }

    const cycle = state < sfh.corp.state;
    sfh.corp.state = state;

    updateState();

    if (cycle) {
        log(`\nBeginning at ${new Date(Date.now()).toLocaleTimeString()} in state ${init_corp.state}`);

        manageInvestment();
        manageDividends();
        if (sfh.corp.wait_ticks > 0) { --sfh.corp.wait_ticks; }

        manageAgriculture();
        manageTobacco();

        // purchase extra divisions
        for (const extra of extra_divs) {
            if (extra[0] === "Tobacco") { continue; }
            const name = extra[0].substring(0, 2).toLowerCase();
            if (sfh.corp.divisions.has(name)) { continue; }
            if (C.getCorporation().funds < 100 * extra[1]) { break; }
            try { C.expandIndustry(extra[0], name); } catch { break; }
            sfh.corp.divisions.add(name);
        }

        // purchase corporation upgrades
        for (const upgrade of [
            [str.wap, 1                           ],
            [str.oap, 1                           ],
            [str.exp, 1000                        ],
            [str.mrd, 1000                        ],
            [str.mdc, 1000                        ],
            [str.vec, 1000                        ],
            [str.dv1, (sfh.corp.public ? 1 : 1000)],
            [str.dv2, (sfh.corp.public ? 1 : 1000)]
        ] as [string, number][]) {
            if (C.hasUnlockUpgrade(upgrade[0])) { continue; }
            const min_funds = C.getUnlockUpgradeCost(upgrade[0]) * upgrade[1];
            if (C.getCorporation().funds >= min_funds) {
                try { C.unlockUpgrade(upgrade[0]); } catch { break; }
            }
        }

        managePurchases();
        updateState();

        manageEmployees();
        updateState();
    }

    sfh.gainUpdate("corp", { money: sfh.corp.dividends });

    for (const work of sfh.goal.work) {
        if (!work.org.faction || !work.org.joined) { continue; }

        const funds = C.getCorporation().funds;
        const req_bribe = (work.rep - work.org.rep) * 1e9;
        if (req_bribe > 0 && funds > 10 * req_bribe) {
            ns.print(`Bribing ${work.org.name}...`);
            C.bribe(work.org.name, req_bribe);
        }
    }

    for (const name in sfh.state.factions) {
        const faction = sfh.state.factions[name];
        if (!faction.joined) { continue; }

        let req_rep = 0
        for (const aug of data.factions[name].augs) {
            if (!sfh.state.augs.has(aug) && !sfh.state.augs.queued.has(aug)) {
                req_rep = Math.max(req_rep, data.augs[aug].rep * sfh.player.mults.aug_rep);
            }
        }
        
        const funds = C.getCorporation().funds;
        const req_bribe = (req_rep - faction.rep) * 1e9;
        if (req_bribe > 0 && funds > 100 * req_bribe) {
            ns.print(`Bribing ${name}...`);
            C.bribe(name, req_bribe);
        } else if (funds > 1e20) {
            ns.print(`Bribing ${name}...`);
            C.bribe(name, funds / 10000);
        }
    }

    updateState();
}
