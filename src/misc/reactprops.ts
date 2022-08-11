//const props = div[Object.keys(div)[1]];
//if (props?.children?.props?.[name]) {
//    this.bb[name] = props.children.props[name];
//    break find_prop;
//} else if (Array.isArray(props?.children)) {
//    for (let child of props.children) {
//        if (child?.props?.[name]) {
//            this.bb[name] = child.props[name];
//            break find_prop;
//        }
//    }
//}

type Props = { children: Child | Child[]; }
type Child = { props: Props }

export async function main(ns: NS) {
    if (ns.args.length > 0) { await ns.sleep(Number(ns.args[0])); }

    const found: { [name: string]: any[] } = {};

    const seen: Set<Props> = new Set();
    const queue: Props[] = [];

    for (const div of eval("document").querySelectorAll("div")) {
        await ns.sleep(0);

        let props = null;
        for (const key of Object.keys(div)) {
            if (key.startsWith("__reactProps")) {
                props = div[key];
                break;
            }
        }

        if (props == null || props.children == null) { continue; }
        queue.push(props);
        seen.add(props);
    }

    while (queue.length > 0) {
        const props = queue.shift()!;
        if (props == null) { continue; }

        for (const key of Object.keys(props)) {
            const prop = props[key as keyof typeof props];
            if (prop == null || typeof prop === "string" || typeof prop === "number"
                || typeof prop === "boolean") { continue; }

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

    for (const name of Object.keys(found).sort((s, t) => s.localeCompare(t))) {
        const props = found[name];

        ns.tprintf("%20s %3d %s", name, props.length, typeof props[0]);
    }
}
