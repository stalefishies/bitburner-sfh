declare const React: any;

export function uiCreate() {
    const cols = sfh.ui.colours;
    const doc: Document = eval("document");

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
    sfh.ui.sfh.style.height = "100%";
    sfh.ui.sfh.style.width = (wid + 4 * pad + 1) + "px";
    sfh.ui.sfh.style.background = "black";
    sfh.ui.sfh.style.color = "#00FF00";
    sfh.ui.sfh.style.padding = pad + "px";
    sfh.ui.sfh.style.borderLeftWidth = "1px";
    sfh.ui.sfh.style.borderLeftStyle = "solid";
    sfh.ui.sfh.style.borderLeftColor = "#00FF00";
    sfh.ui.sfh.style.fontFamily = sfh.ui.styles.fontFamily;

    function pushContainer(): HTMLDivElement;
    function pushContainer(button: () => void): HTMLButtonElement;
    function pushContainer(button?: () => void) {
        const container = doc.createElement(button == null ? "div" : "button");

        container.style.width = "100%";
        container.style.font = "inherit";
        container.style.padding = pad + "px";
        container.style.margin = "0px";
        container.style.color = cols.success;
        container.style.backgroundColor = cols.black;
        container.style.border = "none";
        container.style.borderBottomWidth = "1px";
        container.style.borderBottomStyle = "solid";
        container.style.borderBottomColor = "#00FF00";

        if (button) {
            container.style.cursor = "pointer";
            container.onclick = button;
        }

        sfh.ui.sfh.appendChild(container);
        return container;
    }

    function pushBlock(button?: () => void) {
        const block = doc.createElement("button");

        block.style.width = "100%";
        block.style.font = "inherit";
        block.style.padding = pad + "px";
        block.style.margin = "0px";
        block.style.color = cols.success;
        block.style.backgroundColor = cols.black;
        block.style.border = "none";
        block.style.borderBottomWidth = "1px";
        block.style.borderBottomStyle = "solid";
        block.style.borderBottomColor = "#00FF00";

        if (button) {
            block.style.cursor = "pointer";
            block.onclick = button;
        } else {
            block.onclick = () => undefined;
        }

        sfh.ui.sfh.appendChild(block);
        return { block, child: [] };
    }

    sfh.ui.header = pushContainer(() => sfh.x.save());
    sfh.ui.title = doc.createElement("div");
    sfh.ui.title.style.textAlign = "center";
    sfh.ui.title.style.fontSize = "2em";
    sfh.ui.title.style.border = "none";
    sfh.ui.title.style.padding = "0px";
    sfh.ui.title.style.margin = "0px";
    sfh.ui.title.innerText = "SFH";

    sfh.ui.header.appendChild(sfh.ui.title);

    sfh.ui.stats = pushBlock();
    const statTable = doc.createElement("table");
    statTable.style.borderSpacing = "0px";
    const columns = doc.createElement("colgroup");
    const column_1 = doc.createElement("col");
    column_1.style["width"] = "63px";
    const column_2 = doc.createElement("col");
    column_2.style["width"] = "55px";
    const column_3 = doc.createElement("col");
    column_3.style["width"] = "82px";
    sfh.ui.stats.block.appendChild(statTable);
    statTable.appendChild(columns);
    columns.appendChild(column_1);
    columns.appendChild(column_2);
    columns.appendChild(column_3);

    type UIStat = typeof sfh.ui.stats.child[0];
    function pushStat(stat_name: UIStat["stat"], title: string, theme: string, time = false) {
        const col = (theme ? cols[theme] : null) ?? cols.success;
        const stat: UIStat = {
            stat:    stat_name,
            label:   doc.createElement("td"),
            value:   doc.createElement("td"),
            bar:     doc.createElement("td"),
            bar_bg:  doc.createElement("div"),
            bar_fg:  doc.createElement("div"),
        };

        stat.label.innerText = title;
        stat.label.style.padding = "0px";
        stat.label.style.textAlign = "left";
        stat.label.style.color = col;
        stat.value.colSpan = 2;
        stat.value.style.padding = "0px";
        stat.value.style.textAlign = "right";
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

        sfh.ui.stats.child.push(stat);
    }

    pushStat("money", "Money","money", true);
    pushStat("skill", "Hack", "hack",  true);
    pushStat("rep",   "Rep",  "rep",   true);
    pushStat("hp",    "HP",   "hp");
    pushStat("str",   "Str",  "combat");
    pushStat("def",   "Def",  "combat");
    pushStat("dex",   "Dex",  "combat");
    pushStat("agi",   "Agi",  "combat");
    pushStat("cha",   "Cha",  "cha");
    pushStat("int",   "Int",  "int");

    sfh.ui.buttons = pushContainer();
    sfh.ui.button_list = [];

    let button_left = true;
    function pushButton(label: string, name: keyof typeof sfh.can) {
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
    pushButton("Hacking",   "hacking");
    pushButton("Batching",  "batching");
    pushButton("Trading",   "trading");
    pushButton("Hacknet",   "hnet");
    pushButton("Contracts", "contracts");
    pushButton("Corp",      "corp");
    pushButton("Working",   "working");
    pushButton("Automate",  "automate");

    sfh.ui.work = pushContainer(() => sfh.x.router.toWork());
    function pushText(container: HTMLDivElement | HTMLButtonElement, align = "center") {
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
    sfh.ui.aug_next  = pushText(sfh.ui.augs, "center");
    sfh.ui.aug_cost  = pushText(sfh.ui.augs, "center");
    sfh.ui.aug_total = pushText(sfh.ui.augs, "center");

    sfh.ui.stocks = pushContainer();
    sfh.ui.stocks_current = pushText(sfh.ui.stocks, "center");
    sfh.ui.stocks_total   = pushText(sfh.ui.stocks, "center");
    sfh.ui.stocks_profit  = pushText(sfh.ui.stocks, "center");

    sfh.ui.gang = pushContainer();
    sfh.ui.gang_status = pushText(sfh.ui.gang, "center");
    sfh.ui.gang_dps    = pushText(sfh.ui.gang, "center");
    sfh.ui.gang_time   = pushText(sfh.ui.gang, "center");

    sfh.ui.corp = pushContainer();
    sfh.ui.corp_profit   = pushText(sfh.ui.corp, "center");
    sfh.ui.corp_progress = pushText(sfh.ui.corp, "center");
    sfh.ui.corp_product  = pushText(sfh.ui.corp, "center");
}
