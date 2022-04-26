import { NS } from "netscript";
import * as S from "sfh";
import { fmtm, fmtp, clamp } from "/sfh/lib.js";

declare const React: any;

class SFH implements S.SFH {
    install: boolean;
    loop:    boolean;
    reset:   boolean;
    reload:  boolean;

    can:  S.Permissions;
    ui:   S.UI;
    time: S.Timing;

    state:    S.State;
    player:   S.Player;
    network:  S.Network;
    procs:    S.Processes;
    hacking:  S.Hacking;
    trading:  S.Trading;

    constructor(sfh: { [K in keyof SFH as (SFH[K] extends Function | boolean ? never : K)]: SFH[K] }) {
        this.install = false;
        this.loop    = true;
        this.reset   = false;
        this.reload  = false;

        this.can  = sfh.can;
        this.ui   = sfh.ui;
        this.time = sfh.time;

        this.state   = sfh.state;
        this.player  = sfh.player;
        this.network = sfh.network;
        this.procs   = sfh.procs;
        this.hacking = sfh.hacking;
        this.trading = sfh.trading;
    }

    terminal?: { print(text: string): void, printRaw(elem: HTMLElement): void };

/*
        s   min max
        f   min prec
        e   min prec(3) exp_mult(1)
        p   width(4)
        t
        m   prec(3)
        r   prec(2)

    {...,...}   options separated by commas (whitespace ignored)
    number          length
    asfdeptmr     format
    c[krgbcmyw]     colour
    !text           string literal

    $#              choose argument number
    $#.prop         choose argument number and property
*/
    format(fmt: string, ...args: any[]) {
        let output = [];
        let index  = 1;

        const pushError = function(text: string) {
            output.unshift(React.createElement("div", { style: { color: "#F00" } }, "ERROR: " + text));
        }

        const pushTest = function(text: string) {
            output.unshift(React.createElement("div", { style: { color: "#0F0" } }, text));
        }
        
        for (let i = 0; i < fmt.length; ++i) {
            let value  = null;
            let format = null;
            let colour = null;
            let params = [];

            if (fmt[i] === "{") {
                let end = i + 1;
                while (fmt[end] !== "}" && end < fmt.length) { ++end; }

                if (fmt[end] !== "}") {
                    pushError(`unterminated format code '${fmt.substring(i)}`);
                    break;
                }
                
                const codes = fmt.substring(i + 1, end).split(",").map(s => s.trimStart());
                for (const code of codes) {
                    switch (code[0]) {
                        case "0": case "1": case "2": case "3": case "4":
                        case "5": case "6": case "7": case "8": case "9": {
                            let param = Number(code);
                            if (Number.isInteger(param)) {
                                params.push(param);
                            } else {
                                pushError(`invalid integer param ${code}`);
                            }
                        } break;

                        case "$": {
                            let new_index = Number(code.substring(1));
                            if (Number.isInteger(new_index) && new_index >= 0 && new_index < arguments.length) {
                                index = new_index;
                            } else {
                                pushError(`invalid integer index ${code.substring(1)}`);
                            }
                        } break;

                        case "a": case "s": case "f": case "d": case "e":
                        case "p": case "t": case "m": case "r": {
                            format = code.trimEnd();
                        } break;

                        case "c": {
                            colour = code.substring(1).trimEnd();
                            if (colour === "*") { colour = arguments[index++]; }
                        } break;

                        case "!": {
                            value = code.substring(1);
                        } break;
                    }
                }

                value  ??= arguments[index++];
                format ??= (typeof value === "number" ? "f" : "s");

                switch (format) {
                    case "a": {
                        if (!Array.isArray(value)) { pushError(`invalid format array: ${String(value)}`); }
                    } break;

                    case "s": {
                        value = String(value);
                        if (params[1] != null) { value = value.substring(0, params[1]);  }
                        if (params[0] != null) { value = value.padStart(params[0], " "); }
                    } break;

                    case "f": case "d": {
                        value = Number(value);
                        if (format === "d") {
                            value = value.toFixed(0);
                        } else {
                            value = (params[1] == null ? value.toString() : value.toFixed(params[1]));
                        }
                        if (params[0] != null) { value = value.padStart(params[0], " "); }
                    } break;

                    case "t": {
                        if (isFinite(value)) {
                            if (value > 1e10) {
                                value = new Date(value).toLocaleTimeString();
                            } else if (value > 0) {
                                let h = Math.floor(value / 1000 / 60 / 60);
                                let m = Math.floor(value / 1000 / 60 % 60);
                                let s = Math.floor(value / 1000 % 60);

                                value = h.toFixed(0).padStart(2, "0") + ":" + m.toFixed(0).padStart(2, "0")
                                    + ":" + s.toFixed(0).padStart(2, "0");
                            } else {
                                value = "00:00:00";
                            }
                        } else {
                            value = "  null  ";
                        }
                    } break;

                    case "p": {
                        value = Number(value);
                        let min = params[0] ?? 5;
                        if (min < 4) { min = 4; }

                        if (!Number.isFinite(value)) {
                            value = "null";
                        } else {
                            if (9.995 > value && value >= 0.9995) {
                                value = (value * 100).toFixed(Math.max(min - 5, 0)) + "%";
                            } else if (value >= 0.0995) {
                                value = (value * 100).toFixed(Math.max(min - 4, 0)) + "%";
                            } else if (value >= 0) {
                                value = (value * 100).toFixed(Math.max(min - 3, 0)) + "%";
                            } else {
                                value = "inv%";
                            }
                        }

                        value = value.padStart(min, " ");
                    } break;

                    case "e": case "m": case "r": {
                        let e = "\u1D07", b = 10, prec = 3, n = 1;
                        let prefix = "", suffix = "";
                        if (format === "m") {
                            n = 3; prefix = "$";
                        } else if (format === "r") {
                            e = "\u0299"; b = 2; prec = 2; n = 10; suffix = "GB";
                        }

                        if (params[1] != null) { prec = params[1]; }
                        if (params[2] != null) { n    = params[2]; }
                        const digits = n * Math.log10(b);

                        if (typeof value !== "number") {
                            value = "null";
                        } else if (Number.isNaN(value)) {
                            value = "NaN";
                        } else if (!Number.isFinite(value)) {
                            value = (value > 0 ? "+inf" : "-inf");
                        } else if (value === 0) {
                            value = prefix + (0).toFixed(prec) + e
                                + (0).toFixed(0).padStart(2, '0') + suffix;
                        } else {
                            let exponent = Math.floor(Math.log(value) / Math.log(b) / n) * n;
                            if (format === "m" || format === "r") { exponent = Math.max(exponent, 0); }

                            let mantissa = Math.floor(value / (b ** exponent) * 10 ** prec) / 10 ** prec;
                            const max_mantissa = (10 ** digits - 5 * 10 ** (-prec));
                            if (mantissa >= max_mantissa) { exponent += n; mantissa /= b ** n; }

                            value = prefix + mantissa.toFixed(prec) + e
                                + exponent.toFixed(0).padStart(2, '0') + suffix;
                        }

                        if (params[0] != null) {
                            if (params[0] == 0) {
                                let width = digits + prec + 3 + prefix.length + suffix.length;
                                if (prec != 0) { ++width; }
                                value = value.padStart(width, " ");
                            } else {
                                value = value.padStart(params[0], " ");
                            }
                        }
                    } break;
                }

                if (Array.isArray(value)) {
                    output.push(...value);
                } else if (colour != null) {
                    let style: Partial<CSSStyleDeclaration> = {};
                    if      (colour === "k" || colour === "K") { style.color = "#000"; }
                    else if (colour === "r" || colour === "R") { style.color = "#F00"; }
                    else if (colour === "g" || colour === "G") { style.color = "#0F0"; }
                    else if (colour === "b" || colour === "B") { style.color = "#00F"; }
                    else if (colour === "c" || colour === "C") { style.color = "#0FF"; }
                    else if (colour === "m" || colour === "M") { style.color = "#F0F"; }
                    else if (colour === "y" || colour === "Y") { style.color = "#FF0"; }
                    else if (colour === "w" || colour === "W") { style.color = "#FFF"; }
                    else                                       { style.color = colour; }

                    output.push(React.createElement("span", { style }, value));
                } else if (typeof output[output.length - 1] === "string") {
                    output[output.length - 1] += value;
                } else {
                    output.push(value);
                }

                i = end;
            } else {
                if (typeof output[output.length - 1] === "string") {
                    output[output.length - 1] += fmt[i];
                } else {
                    output.push(fmt[i]);
                }
            }
        }
        
        return output;
    }
    
    print(fmt: string, ...args: any[]) {
        const doc = eval("document");
        if (this.terminal == null) {
            outer: for (const div of doc.querySelectorAll("div")) {
                const props = div[Object.keys(div)[1]];
                if (props?.children?.props?.terminal) {
                    this.terminal = props.children.props.terminal;
                    break outer;
                } else if (Array.isArray(props?.children)) {
                    for (let child of props.children) {
                        if (child?.props?.terminal) {
                            this.terminal = child.props.terminal;
                            break outer;
                        }
                    }
                }
            }

            if (this.terminal == null) { return; }
        }

        const output = this.format(fmt, ...args);
        this.terminal.printRaw(output as any);
    }

    uiCreate(ns: NS) {
        const cols = sfh.ui.colours = ns.ui.getTheme();
        const doc: Document = eval("document");
        sfh.ui.root     = doc.getElementById("root") as HTMLDivElement;
        sfh.ui.parent   = sfh.ui.root.children[0] as HTMLDivElement;
        sfh.ui.overview = sfh.ui.parent.children[0] as HTMLDivElement;

        const wid = 200;
        const pad = 5;
        const lab = 75;
        const pct = 50;

        sfh.ui.sfh = doc.createElement("div");
        sfh.ui.sfh.id = "sfh";
        sfh.ui.sfh.style.position = "fixed";
        sfh.ui.sfh.style.top   = "0";
        sfh.ui.sfh.style.right = "0";
        sfh.ui.sfh.style.boxSizing = "border-box";
        sfh.ui.sfh.style["height"] = "100%";
        sfh.ui.sfh.style["width"] = (wid + 4 * pad + 1) + "px";
        sfh.ui.sfh.style.background = "black";
        sfh.ui.sfh.style.color = "#00FF00";
        sfh.ui.sfh.style.padding = pad + "px";
        sfh.ui.sfh.style.borderLeftWidth = "1px";
        sfh.ui.sfh.style.borderLeftStyle = "solid";
        sfh.ui.sfh.style.borderLeftColor = "#00FF00";
        sfh.ui.sfh.style.fontFamily = ns.ui.getStyles().fontFamily;

        function pushContainer() {
            const container = doc.createElement("div");

            container.style.padding = pad + "px";
            container.style.borderBottomWidth = "1px";
            container.style.borderBottomStyle = "solid";
            container.style.borderBottomColor = "#00FF00";

            sfh.ui.sfh.appendChild(container);
            return container;
        }

        sfh.ui.header = pushContainer();
        sfh.ui.title = doc.createElement("div");
        sfh.ui.title.style.textAlign = "center";
        sfh.ui.title.style.fontSize = "2em";
        sfh.ui.title.innerText = "SFH";

        // TODO: save/kill scripts
        sfh.ui.header.appendChild(sfh.ui.title);


        sfh.ui.stats = pushContainer();
        const statTable = doc.createElement("table");
        statTable.style.borderSpacing = "0px";
        const columns = doc.createElement("colgroup");
        const column_1 = doc.createElement("col");
        column_1.style["width"] = "63px";
        const column_2 = doc.createElement("col");
        column_2.style["width"] = "55px";
        const column_3 = doc.createElement("col");
        column_3.style["width"] = "82px";
        sfh.ui.stats.appendChild(statTable);
        statTable.appendChild(columns);
        columns.appendChild(column_1);
        columns.appendChild(column_2);
        columns.appendChild(column_3);

        function pushStat(title: string, theme = "success", time = false): S.UIStat {
            const col = (theme ? cols[theme] : null) ?? cols.success;
            const stat: S.UIStat = {
                label:   doc.createElement("td"),
                value:   doc.createElement("td"),
                bar:     doc.createElement("td"),
                bar_bg:  doc.createElement("div"),
                bar_fg:  doc.createElement("div"),
            };

            stat.label.innerText = title;
            stat.label.style.padding = "0px";
            stat.label.style.color = col;
            stat.value.colSpan = 2;
            stat.value.style.padding = "0px";
            stat.value.style.textAlign  = "right";
            stat.value.style.color = col;
            stat.bar.colSpan = (time ? 2 : 3);
            stat.bar.style.padding = "0px";
            stat.bar.style.paddingBottom = "1px";
            stat.bar_bg.style["width"] = "100%";
            stat.bar_bg.style["height"] = "5px";
            stat.bar_bg.style.background = cols.well;
            stat.bar_fg.style["height"] = "5px";
            stat.bar_fg.style.background = col;
            stat.bar_fg.style.animationName = "slide";
            stat.bar_fg.style.animationDuration = "250ms";
            stat.bar_fg.style.animationTimingFunction = "ease-out";

            const row_1 = doc.createElement("tr");
            const row_2 = doc.createElement("tr");

            statTable.appendChild(row_1);
            row_1.appendChild(stat.label);
            row_1.appendChild(stat.value);
            statTable.appendChild(row_2);
            row_2.appendChild(stat.bar);
            stat.bar.appendChild(stat.bar_bg);
            stat.bar_bg.appendChild(stat.bar_fg);

            if (time) {
                stat.time = doc.createElement("td");
                stat.time.style.padding = "0px";
                stat.time.style.textAlign = "right";
                stat.time.style.color = col;
                row_2.appendChild(stat.time);
            }

            return stat;
        }

        sfh.ui.money = pushStat("Money", "money", true);
        sfh.ui.skill = pushStat("Hack",  "hack", true);
        sfh.ui.rep   = pushStat("Rep",   "rep", true);
        sfh.ui.hp    = pushStat("HP",    "hp");
        sfh.ui.str   = pushStat("Str",   "combat");
        sfh.ui.def   = pushStat("Def",   "combat");
        sfh.ui.dex   = pushStat("Dex",   "combat");
        sfh.ui.agi   = pushStat("Agi",   "combat");
        sfh.ui.cha   = pushStat("Cha",   "cha");
        sfh.ui.int   = pushStat("Int",   "int");

        sfh.ui.buttons = pushContainer();
        sfh.ui.button_list = [];

        let button_left = true;
        function pushButton(label: string, name: keyof S.Permissions) {
            const button = doc.createElement("button");
            button.innerText = label;
            button.style.font = "inherit";
            button.style.padding = "5px";
            button.style.width = "50%";
            button.style.borderColor = cols.button;
            button.style.border = "1px solid " + cols.button;
            button.style.cursor = "pointer";
            button.style.transitionDuration = "0.25s";

            button.style.color = (sfh.can[name] ? cols.success : cols.error);
            button.style.backgroundColor = (sfh.can[name] ? cols.button : cols.black);
            button.onclick = (() => {
                sfh.can[name] = !sfh.can[name];
                button.style.color = (sfh.can[name] ? cols.success : cols.error);
                button.style.backgroundColor = (sfh.can[name] ? cols.button : cols.black);
            });

            sfh.ui.buttons.appendChild(button);
            sfh.ui.button_list.push({ name, button });
        }

        pushButton("Bitnode",   "bitnode");
        pushButton("Install",   "install");
        pushButton("Scripts",   "scripts");
        pushButton("Purchase",  "purchase");
        pushButton("Contracts", "contracts");
        pushButton("Batching",  "batching");
        pushButton("Working",   "working");
        pushButton("Automate",  "automate");

        sfh.ui.work = pushContainer();
        function pushText(container: HTMLDivElement, align = "center") {
            const text = doc.createElement("div");
            text.innerText = "--";
            text.style.textAlign = align;

            container.appendChild(text);
            return text;
        }
        sfh.ui.type = pushText(sfh.ui.work);
        sfh.ui.org  = pushText(sfh.ui.work);
        sfh.ui.desc = pushText(sfh.ui.work);

        sfh.ui.augs = pushContainer();
        sfh.ui.aug_title = pushText(sfh.ui.augs, "center");
        sfh.ui.aug_title.innerText = "Next augmentation:"
        sfh.ui.aug_next  = pushText(sfh.ui.augs, "center");
        sfh.ui.aug_cost  = pushText(sfh.ui.augs, "center");
        sfh.ui.aug_total = pushText(sfh.ui.augs, "center");

        this.uiUpdate();
    }

    uiInject(ns: NS) {
        if (!this.ui.root) { this.uiCreate(ns); }

        this.ui.overview.style.display = "none";
        this.ui.parent.style.marginRight = "211px";
        this.ui.root.appendChild(this.ui.sfh);
    }

    uiRemove() {
        if (this.ui.root) {
            this.ui.overview.style.display = "";
            this.ui.parent.style.marginRight = "";
            this.ui.root.removeChild(this.ui.sfh);
        }
    }

    uiUpdate() {
        const updateStat = (stat: S.UIStat, value: string, bar: number, min: number, max: number) => {
            stat.value.innerText = value;
            const pct = Math.max(Math.min((bar - min) / (max - min), 1), 0) * 100;
            stat.bar_fg.style["width"] = pct.toFixed(0) + "%";
        }

        const updateStatGoal = (stat: S.UIStat, value: number, goal: number, fmt?: (v: number) => string) => {
            updateStat(stat, (fmt ? fmt(value) : value.toFixed(1)), value, 0, goal);
        }

        const updateStatExp = (stat: S.UIStat, name: string) => {
            const plr = this.player as unknown as { [key: string]: number };
            const raw = (Math.log(plr[name + "_exp"] + 534.5) * 32 - 200) * plr[name + "_mult"];
            const exp_lo = Math.max(Math.exp((plr[name] / plr[name + "_mult"] + 200) / 32) - 534.5, 0);
            const exp_hi = Math.max(Math.exp(((plr[name] + 1) / plr[name + "_mult"] + 200) / 32) - 534.5, 0);
            updateStat(stat, (Math.floor(raw * 10) / 10).toFixed(1), plr[name + "_exp"], exp_lo, exp_hi);
        }

        const updateStatTime = (stat: S.UIStat, time: number) => {
            if (!stat.time) { return; }
            time = Math.round(time / 1000);
            if (!Number.isFinite(time) || time >= 360e6) {
                stat.time.innerText = "--:--:--";
            } else if (time >= 1) {
                const s = time % 60;
                const m = Math.floor(time / 60) % 60;
                const h = Math.floor(time / 3600);
                stat.time.innerText = h.toFixed(0).padStart(2, "0") + ":"
                    + m.toFixed(0).padStart(2, "0") + ":" + s.toFixed(0).padStart(2, "0");
            } else {
                stat.time.innerText = "00:00:00";
            }
        }

        let money_goal = this.state.goal.money;
        let money_time = (money_goal - this.player.money) / this.player.money_rate;

        let rep_cur    = 0;
        let rep_goal   = Number.POSITIVE_INFINITY;
        let rep_time   = Number.POSITIVE_INFINITY;

        if (this.state.work?.org != null) {
            const org = this.state.work.org;
            rep_cur = org.rep;

            const goal = this.state.goal;
            for (const work of this.state.goal.work) {
                if (work.org.name == org.name) {
                    rep_goal = work.rep;
                    break;
                }
            }

            rep_time = (rep_goal - rep_cur) / this.state.work.rep_rate;
        }

        updateStatGoal(this.ui.money, this.player.money, money_goal, fmtm);
        updateStatTime(this.ui.money, money_time);
        updateStatExp(this.ui.skill, "skill");
        updateStatTime(this.ui.skill, 0);
        updateStatGoal(this.ui.rep, rep_cur, rep_goal);
        updateStatTime(this.ui.rep, rep_time);
        updateStatGoal(this.ui.hp, this.player.cur_hp, this.player.hp,
            (v) => v.toFixed(0) + " / " + this.player.hp.toFixed(0));
        updateStatExp(this.ui.str, "str");
        updateStatExp(this.ui.def, "def");
        updateStatExp(this.ui.dex, "dex");
        updateStatExp(this.ui.agi, "agi");
        updateStatExp(this.ui.cha, "cha");
        updateStatGoal(this.ui.int, this.player.int, 256, (v) => v.toFixed(0));

        for (const button of this.ui.button_list) {
            if (this.can[button.name]) {
                button.button.style.color = this.ui.colours.success;
                button.button.style.backgroundColor = this.ui.colours.button;
            } else {
                button.button.style.color = this.ui.colours.error;
                button.button.style.backgroundColor = this.ui.colours.black;
            }
        }

        if (sfh.state.work) {
            const type_tr: { [name: string]: string } = {
                "faction"    : "Faction Work",
                "company"    : "Company Work",
                "program"    : "Creating Program",
                "university" : "University Course",
                "crime"      : "Comitting Crime",
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
                "Hacking"                      : "Hacking Contracts",
                "Security"                     : "Security Work",
                "Field"                        : "Field Work",
            };

            const work = sfh.state.work;
            this.ui.type.innerText = type_tr[work.type] ?? work.type ?? "null";
            this.ui.org.innerText  = org_tr[work.org?.name ?? ""] ?? work.org?.name ?? "--";
            this.ui.desc.innerText = desc_tr[work.desc] ?? work.desc ?? "--";
        } else {
            this.ui.type.innerText = "Not Working";
            this.ui.org.innerText  = "--";
            this.ui.desc.innerText = "--";
        }

        if (sfh.state.goal.augs.length > 0) {
            const aug = sfh.state.goal.augs[0];
            this.ui.aug_next.innerText = aug.name.substring(0, 20);

            let cost = data.augs[aug.name].cost * this.player.bitnode.aug_cost
                * 1.9 ** this.state.augs.queued.size;
            this.ui.aug_cost.innerText  = this.format(" Cost: {13,m}", cost).join("");
            this.ui.aug_total.innerText = this.format("Total: {13,m}", sfh.state.goal.money).join("");
        } else {
            this.ui.aug_next.innerText  = "none";
            this.ui.aug_cost.innerText  = " Cost:            --";
            this.ui.aug_total.innerText = "Total:            --";
        }
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

        this.player.money_hist ??= [];
        if (this.player.money != null && player.money >= this.player.money) {
            this.player.money_rate = avg(this.player.money_hist, player.money - this.player.money ?? 0) / 2000;
        }

        this.player.hp     = player.max_hp;
        this.player.cur_hp = player.hp;
        this.player.money  = player.money;
        this.player.karma  = (ns as any).heart.break();
        this.player.skill  = player.hacking;

        this.player.str = player.strength;
        this.player.def = player.defense;
        this.player.dex = player.dexterity;
        this.player.agi = player.agility;
        this.player.cha = player.charisma;
        this.player.int = player.intelligence;

        this.player.int_mult = function(weight = 1) {
            return (1 + weight * player.intelligence ** 0.8 / 600);
        }

        this.player.skill_exp = player.hacking_exp;
        this.player.str_exp = player.strength_exp;
        this.player.def_exp = player.defense_exp;
        this.player.dex_exp = player.dexterity_exp;
        this.player.agi_exp = player.agility_exp;
        this.player.cha_exp = player.charisma_exp;

        this.player.skill_mult = player.hacking_mult;
        this.player.str_mult = player.strength_mult;
        this.player.def_mult = player.defense_mult;
        this.player.dex_mult = player.dexterity_mult;
        this.player.agi_mult = player.agility_mult;
        this.player.cha_mult = player.charisma_mult;

        this.player.skill_exp_mult = player.hacking_exp_mult;
        this.player.str_exp_mult = player.strength_exp_mult;
        this.player.def_exp_mult = player.defense_exp_mult;
        this.player.dex_exp_mult = player.dexterity_exp_mult;
        this.player.agi_exp_mult = player.agility_exp_mult;
        this.player.cha_exp_mult = player.charisma_exp_mult;

        this.player.hack_mult = player.hacking_money_mult;
        this.player.time_mult = player.hacking_speed_mult;
        this.player.prob_mult = player.hacking_chance_mult;
        this.player.grow_mult = player.hacking_grow_mult;

        this.player.faction_rep_mult = player.faction_rep_mult;
        this.player.company_rep_mult = player.company_rep_mult;
        this.player.work_money_mult  = player.work_money_mult;
        this.player.crime_money_mult = player.crime_money_mult;
        this.player.crime_prob_mult  = player.crime_success_mult;

        this.player.hnet_money_mult = player.hacknet_node_money_mult;
        this.player.hnet_node_mult  = player.hacknet_node_purchase_cost_mult;
        this.player.hnet_level_mult = player.hacknet_node_level_cost_mult;
        this.player.hnet_ram_mult   = player.hacknet_node_ram_cost_mult;
        this.player.hnet_core_mult  = player.hacknet_node_core_cost_mult;

        this.player.aug_time     = player.playtimeSinceLastAug;
        this.player.bn_time      = player.playtimeSinceLastBitnode;
        this.player.total_time   = player.totalPlaytime;
    }

    workUpdate(nsGetPlayer: NS["getPlayer"], nsIsFocused: NS["isFocused"]) {
        const focussed = nsIsFocused();
        if (sfh.state.work?.focus && !focussed) { sfh.can.automate = false; }

        const faction_work_name: { [name: string]: string } = {
            "carrying out hacking contracts": "Hacking",
            "carrying out field missions":    "Field",
            "performing security detail":     "Security"
        };

        const player = nsGetPlayer();
        switch (player.workType) {
            case "": { this.state.work = null; } break;

            case "Working for Faction": { this.state.work = {
                type:  "faction",
                desc:  faction_work_name[player.currentWorkFactionDescription],
                org:   this.state.factions[player.currentWorkFactionName] ?? null,
            } as any } break;

            case "Working for Company": { this.state.work = {
                type:  "company",
                desc:  player.jobs[player.companyName],
                org:   this.state.companies[player.companyName] ?? null,
            } as any } break;

            case "Working on Create a Program": { this.state.work = {
                type:  "program",
                desc:  player.createProgramName,
                org:   null,
            } as any } break;

            case "Committing a crime": { this.state.work = {
                type:  "crime",
                desc:  player.crimeType,
                org:   null,
            } as any } break;

            case "Studying or Taking a class at university": { this.state.work = {
                type:  "university",
                desc:  player.className,
                org:   null,
            } as any } break;
        }

        if (this.state.work) {
            this.state.work.focus = focussed;
            const rate = (focussed || sfh.state.augs.has("Neuroreceptor Management Implant")) ? 5e-3 : 4e-3;

            this.state.work.money      = player.workMoneyGained;
            this.state.work.rep        = player.workRepGained;
            this.state.work.skill_exp  = player.workHackExpGained;
            this.state.work.str_exp    = player.workStrExpGained;
            this.state.work.def_exp    = player.workDefExpGained;
            this.state.work.dex_exp    = player.workDexExpGained;
            this.state.work.agi_exp    = player.workAgiExpGained;
            this.state.work.cha_exp    = player.workChaExpGained;
            this.state.work.money_rate = (player.workMoneyGainRate - player.workMoneyLossRate) * rate;
            this.state.work.rep_rate   = player.workRepGainRate * rate;
            this.state.work.skill_rate = player.workHackExpGainRate * rate;
            this.state.work.str_rate   = player.workStrExpGainRate * rate;
            this.state.work.def_rate   = player.workDefExpGainRate * rate;
            this.state.work.dex_rate   = player.workDexExpGainRate * rate;
            this.state.work.agi_rate   = player.workAgiExpGainRate * rate;
            this.state.work.cha_rate   = player.workChaExpGainRate * rate;
        }
    }

    netAdd(server: ReturnType<NS["getServer"]>, edges: string[], depth: number | null = null) {
        const name = server.hostname;
        if (name === "home") { server.maxRam = Math.max(server.maxRam - 64, 0); }
        const node = (name in this.network ? this.network[name] : ({} as S.Node));
        
        node.name  = name;
        node.owned = server.purchasedByPlayer;
        node.skill = server.requiredHackingSkill;
        node.cores = server.cpuCores;
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
            / ((this.player.skill + 50) * this.player.time_mult * this.player.int_mult(1));
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
            await nsScp(files, "home", node.name);
        }
    }

    netSort() {
        this.procs.pools.sort(function(m: S.Node, n: S.Node) {
            if (m.ram - m.used_ram == n.ram - n.used_ram) {
                if (m.ram == n.ram) {
                    return m.name.localeCompare(n.name);
                } else {
                    return (m.ram - n.ram);
                }
            } else {
                return (m.ram - m.used_ram) - (n.ram - n.used_ram);
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
        for (const name in this.network) {
            const node = this.network[name];
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
        this.skill          = player.skill;
        this.skill_exp      = player.skill_exp
        this.int            = player.int;
        this.cores          = cores;
        this.core_mult      = (1 + (this.cores - 1) / 16);
        this.money          = target.money;
        this.level          = target.level;
        this.cur_money      = target.cur_money;
        this.cur_level      = target.cur_level;
        this.req_skill      = target.skill;
        this.base_level     = target.base_level;
        this.skill_mult     = player.skill_mult * player.bitnode.skill;
        this.skill_exp_mult = player.skill_exp_mult * player.bitnode.skill_exp;
        this.hack_mult      = player.hack_mult * player.bitnode.hack_money;
        this.time_mult      = player.time_mult;
        this.prob_mult      = player.prob_mult;
        this.prof_mult      = player.bitnode.hack_profit;
        this.grow_mult      = player.grow_mult * target.grow_mult * player.bitnode.grow_rate;
        this.weak_mult      = player.bitnode.weak_rate;
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

        let profit     = prob * money_removed * this.prof_mult;
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

    runGrow(threads: number, level_init = this.level,
            money = this.cur_money, level = this.cur_level, sim = true)
    {
        let base = this.growBase(level);
        let money_new = Math.min((money + threads) * (base ** threads), this.money);
        let eff_threads = Math.max(Math.ceil(Math.log(money_new / money) / Math.log(base)), 0);
        let money_diff = money_new - money;

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
        if (money >= money_new) { return this.runGrow(0, level_init, money, level, sim); }

        const base = this.growBase(level);
        let threads = 1000;
        let prev = threads;
        
        for (let i = 0; i < 30; ++i) {
            let factor = money_new / Math.min(money + threads, money_new - 1);
            threads = Math.log(factor) / Math.log(base);
            if (Math.ceil(threads) == Math.ceil(prev)) { break; }
            prev = threads;
        }
        threads = Math.ceil(Math.max(threads, prev));

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
