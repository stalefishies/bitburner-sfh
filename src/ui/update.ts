declare const React: any;

export function uiUpdate() {
    sfh.ui.title.innerText = sfh.time.reset > 120 * 1000 ? "SFH"
        : sfh.sprint("{t}", 120 * 1000 - sfh.time.reset);

    const updateStat = (index: number, value: string, bar: number, min: number, max: number) => {
        const stat = sfh.ui.stats.child[index];
        stat.value.innerText = value;
        const pct = Math.max(Math.min((bar - min) / (max - min), 1), 0) * 100;
        stat.bar_fg.style["width"] = pct.toFixed(0) + "%";
    }

    const updateStatGoal = (index: number, value: number, goal: number, fmt?: (v: number) => string) => {
        updateStat(index, (fmt ? fmt(value) : value.toFixed(1)), value, 0, goal);
    }

    const updateStatExp = (index: number, name: keyof Skills) => {
        const plr = sfh.player as unknown as { [key: string]: any };
        let level = typeof plr[name]           === "number" ? plr[name]           : 1;
        let exp   = typeof plr[name + "_exp"]  === "number" ? plr[name + "_exp"]  : 0;
        let mult  = typeof plr[name + "_mult"] === "number" ? plr[name + "_mult"] : 1;

        const raw = (Math.log(exp + 534.5) * 32 - 200) * mult;
        const exp_lo = Math.max(Math.exp((level / mult + 200) / 32) - 534.5, 0);
        const exp_hi = Math.max(Math.exp(((level + 1) / mult + 200) / 32) - 534.5, 0);
        updateStat(index, (Math.floor(raw * 10) / 10).toFixed(1), exp, exp_lo, exp_hi);
    }

    const updateStatTime = (index: number, time: number) => {
        const stat = sfh.ui.stats.child[index];
        if (!stat.time) { return; }
        time = Math.round(time / 1000);
        if (!Number.isFinite(time) || time <= 0) {
            stat.time.innerText = "--:--:--";
        } else if (time >= 360000) {
            stat.time.innerText = (time / 86400).toFixed(0) + "d";
        } else {
            const s = time % 60;
            const m = Math.floor(time / 60) % 60;
            const h = Math.floor(time / 3600);
            stat.time.innerText = h.toFixed(0).padStart(2, "0") + ":"
            + m.toFixed(0).padStart(2, "0") + ":" + s.toFixed(0).padStart(2, "0");
        }
    }

    let rep_cur    = 0;
    let rep_goal   = Number.POSITIVE_INFINITY;
    let rep_time   = Number.POSITIVE_INFINITY;

    if (sfh.state.work?.org != null) {
        const org = sfh.state.work.org;
        rep_cur = org.rep;

        for (const work of sfh.goal.work) {
            if (work.org.name == org.name) {
                rep_goal = work.rep;
                break;
            }
        }

        rep_time = (rep_goal - rep_cur) / sfh.state.work.rep_rate;
    }

    updateStatGoal(0, sfh.player.money, sfh.goal.money, (m) => sfh.format("{m}", m));
    updateStatTime(0, sfh.state.money_time);

    if (sfh.player.hac < sfh.goal.hac) {
        const mult     = sfh.player.mult.hac;
        const goal_exp = Math.max(Math.exp((Math.floor(sfh.goal.hac) / mult + 200) / 32) - 534.5, 0);
        const string   = sfh.player.hac.toFixed(0) + " / " + sfh.goal.hac.toFixed(0);

        updateStat(1, string, sfh.player.hac_exp, 0, goal_exp);
        updateStatTime(1, sfh.state.hac_time);
    } else {
        updateStatExp(1, "hac");
        updateStatTime(1, sfh.state.hac_time);
    }

    updateStatGoal(2, rep_cur, rep_goal);
    updateStatTime(2, rep_time);
    updateStatGoal(3, sfh.player.cur_hp, sfh.player.hp,
        (v) => v.toFixed(0) + " / " + sfh.player.hp.toFixed(0));
    updateStatExp(4, "str");
    updateStatExp(5, "def");
    updateStatExp(6, "dex");
    updateStatExp(7, "agi");
    updateStatExp(8, "cha");
    updateStatExp(9, "int");

    for (const button of sfh.ui.button_list) {
        if (sfh.can[button.name]) {
            button.button.style.color = sfh.ui.colours.success;
            button.button.style.backgroundColor = sfh.ui.colours.button;
        } else {
            button.button.style.color = sfh.ui.colours.error;
            button.button.style.backgroundColor = sfh.ui.colours.black;
        }
    }

    if (sfh.state.work) {
        const type_tr: { [name: string]: string } = {
            "faction"    : "Faction Work",
            "company"    : "Company Work",
            "program"    : "Creating Program",
            "gym"        : "At a Gym",
            "university" : "At University",
            "crime"      : "Comitting Crime",
            "graft"      : "Grafting",
        };

        const org_tr: { [name: string]: string } = {
            "KuaiGong International"      : "KuaiGong Intl.",
            "Fulcrum Secret Technologies" : "Fulcrum Secret Tech.",
            "Speakers for the Dead"       : "Speakers f.t. Dead",
            "Church of the Machine God"   : "C.o.t. Machine God",
            "Aevum Police Headquarters"   : "Aevum Police",
            "Galactic Cybersystems"       : "Galactic Cybersys.",
            "Solaris Space Systems"       : "Solaris Space Sys.",
            "Global Pharmaceuticals"      : "Global Pharma.",
            "Central Intelligence Agency" : "CIA",
            "National Security Agency"    : "NSA",
        };

        const desc_tr: { [name: string]: string } = {
            "Software Engineering Intern"  : "Software Eng. Intern",
            "Junior Software Engineer"     : "Junior Software Eng.",
            "Senior Software Engineer"     : "Senior Software Eng.",
            "Lead Software Developer"      : "Lead Software Dev.",
            "Vice President of Technology" : "VP of Technology",
            "Chief Technology Officer"     : "CTO",
            "Systems Administrator"        : "Systems Admin.",
            "Network Administrator"        : "Network Admin.",
            "Chief Financial Officer"      : "CFO",
            "Chief Executive Officer"      : "CEO",
            "Senior Software Consultant"   : "Sr. Soft. Consultant",
            "Senior Business Consultant"   : "Sr. Busn. Consultant",

            "HACKING"                      : "Hacking Contracts",
            "SECURITY"                     : "Security Work",
            "FIELD"                        : "Field Work",

            "STUDYCOMPUTERSCIENCE"         : "Training Hacking",
            "DATASTRUCTURES"               : "Training Hacking",
            "NETWORKS"                     : "Training Hacking",
            "ALGORITHMS"                   : "Training Hacking",

            "MANAGEMENT"                   : "Training Charisma",
            "LEADERSHIP"                   : "Training Charisma",

            "GYMSTRENGTH"                  : "Training Strength",
            "GYMDEFENSE"                   : "Training Defense",
            "GYMDEXTERITY"                 : "Training Dexterity",
            "GYMAGILITY"                   : "Training Agility",
        };

        const work = sfh.state.work;
        sfh.ui.type.innerText = type_tr[work.type] ?? work.type ?? "null";
        sfh.ui.org.innerText  = org_tr[work.org?.name ?? ""] ?? work.org?.name ?? "--";
        sfh.ui.desc.innerText = desc_tr[work.desc] ?? work.desc ?? "--";
    } else {
        sfh.ui.type.innerText = "Not Working";
        sfh.ui.org.innerText  = "--";
        sfh.ui.desc.innerText = "--";
    }

    let goal_title = "Goal: (none)"
    let goal_desc  = "--";
    if (sfh.goal.type) {
        goal_title = "Goal: " + sfh.goal.type[0].toUpperCase() + sfh.goal.type.substring(1);
        goal_desc  = sfh.goal.desc.substring(0, 20);
    }

    sfh.ui.aug_title.innerText = goal_title;
    sfh.ui.aug_next.innerText  = goal_desc;
    sfh.ui.aug_cost.innerText  = sfh.format("Cost: {13,m}", sfh.goal.money_next);
    sfh.ui.aug_total.innerText = sfh.format("Total: {13,m}", sfh.goal.money_total);

    sfh.ui.stocks_current.innerText = sfh.sprint("{13,m} {5,p}",
        sfh.trading.sell, sfh.trading.sell / sfh.trading.spent);
    sfh.ui.stocks_total.innerText = sfh.sprint("{13,m} {5,p}",
        sfh.trading.total_sold + sfh.trading.sell,
        (sfh.trading.total_sold + sfh.trading.sell) / sfh.trading.total_spent);
    sfh.ui.stocks_profit.innerText = sfh.sprint("{13,m}",
        sfh.trading.total_sold + sfh.trading.sell - sfh.trading.total_spent);

    if (false){//sfh.state.has_gang) {
        const state = sfh.gang.state[0].toUpperCase() + sfh.gang.state.substring(1);

        if (sfh.gang.state === "train") {
            sfh.ui.gang_status.innerText = sfh.format("Gang: {} ({})", state, sfh.gang.train);
        } else if (sfh.gang.size < 12) {
            sfh.ui.gang_status.innerText = sfh.format("Gang: {} ({})", state, sfh.gang.size);
        } else {
            sfh.ui.gang_status.innerText = sfh.format("Gang: {} ({p})", state, sfh.gang.clash);
        }

        sfh.ui.gang_dps.innerText = sfh.format("{m}/s", sfh.gang.dps);
        sfh.ui.gang_time.innerText = sfh.format("{t}", sfh.gang.time);
    } else {
        const time = Math.max((54000 + sfh.player.karma) / sfh.sleeves.karma_rate * 1000, 0);

        sfh.ui.gang_status.innerText = "gang ui disabled";//"No gang";
        sfh.ui.gang_dps.innerText    = sfh.format("Karma: {}", sfh.player.karma);
        sfh.ui.gang_time.innerText   = sfh.format("{t}", time);
    }

    if (sfh.state.has_corp) {
        sfh.ui.corp_profit.innerText = sfh.format("Pro: {13,m}/s", sfh.corp.profit);
        if (sfh.corp.public) {
            sfh.ui.corp_progress.innerText = sfh.format("Div: {13,m}/s", sfh.corp.dividends);
        } else {
            sfh.ui.corp_progress.innerText = sfh.format("{6,d}: {m}",
                                                        sfh.corp.round, sfh.corp.offer);
        }
        let product_name = null;
        let product_dev  = 0;
        let product_time = 0;
        sfh.corp.products.forEach(function (p, i) {
            if (p.development < 100 && p.development > product_dev) {
                product_name = i.toFixed(0).padStart(3, "0");
                product_dev  = p.development / 100;
                product_time = p.time;
            }
        });
        if (product_name == null) {
            sfh.ui.corp_product.innerText = "--";
        } else if (product_time < 0) {
            sfh.ui.corp_product.innerText = sfh.format("{}    --   ", product_name);
        } else {
            sfh.ui.corp_product.innerText = sfh.format("{} {t}", product_name, product_time);
        }
    } else if (sfh.goal.corp) {
        sfh.ui.corp_profit.innerText   = "--";
        sfh.ui.corp_progress.innerText = "Waiting for corp...";
        sfh.ui.corp_product.innerText  = "--";
    } else {
        sfh.ui.corp_profit.innerText   = "No corporation";

        const time = Math.max(150e9 - sfh.player.money, 0) / sfh.state.money_rate * 1000;
        if (time < 1e10) {
            sfh.ui.corp_progress.innerText = sfh.format("{t}", time);
        } else {
            sfh.ui.corp_progress.innerText = "--";
        }

        if (sfh.goal.corp_ticks > 0) {
            sfh.ui.corp_product.innerText = sfh.format("{}", sfh.goal.corp_ticks);
        } else {
            const corp_lerp = Math.min(Math.max(sfh.money.total, sfh.goal.money_total / 2, 0) / 150e9, 1);
            const corp_time = (30 + corp_lerp * 60) * 60 * 1000;
            sfh.ui.corp_product.innerText  = sfh.format("{t}", corp_time);
        }
    }
}
