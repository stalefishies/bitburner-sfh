type Props = { children: Child | Child[]; } & { [key: string]: any };
type Child = { props: Props }

export async function main(ns: NS) {
    if (ns.args.length > 0) { await ns.sleep(Number(ns.args[0] ?? 0)); }

    const found: { [name: string]: any[] } = {};

    const seen: Set<Props> = new Set();
    const queue: Props[] = [];

    for (const div of eval("document").querySelectorAll("div")) {
        await ns.sleep(0);

        for (const key of Object.keys(div)) {
            if (key.startsWith("__reactProps")) {
                const props = div[key];
                if (props?.children) {
                    queue.push(props);
                    seen.add(props);
                }
            }
        }
    }

    for (let props; props = queue.shift(); ) {
        for (const [key, prop] of Object.entries(props)) {
            if (key === "children" || prop == null || typeof prop === "string"
                || typeof prop === "number" || typeof prop === "boolean") { continue; }

            if (!(key in found)) { found[key] = []; }
            found[key].push(prop);
        }

        const children = (Array.isArray(props.children) ? props.children : [props.children]);
        for (const child of children) {
            if (child == null || child.props == null || seen.has(child.props)) { continue; }
            queue.push(child.props);
            seen.add(child.props);
        }
    }

    let total = 0;
    for (const [name, props] of Object.entries(found).sort((s, t) => s[0].localeCompare(t[0]))) {
        total += props.length;
        ns.tprintf("%20s %3d %s", name, props.length, typeof props[0]);
    }
    ns.tprintf("%20s %3d", "TOTAL", total);
}
