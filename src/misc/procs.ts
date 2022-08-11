function printKeys(obj: any) {
    while (obj != null && obj != Object.getPrototypeOf({})) {
        for (let name of Object.getOwnPropertyNames(obj)) {
            sfh.print("    {8} {}", Array.isArray(obj[name]) ? "array" : typeof obj[name], name);
        }
        obj = Object.getPrototypeOf(obj);
    }
}

export async function main(ns: NS) {
    let routed = false;
    if (String(ns.args[0]).startsWith(">")) {
        routed = true;

        const page = String(ns.args.shift()).substring(1);
        switch (page.toLowerCase()) {
            case "terminal":      { sfh.x.router.toTerminal();      } break;
            case "factions":      { sfh.x.router.toFactions();      } break;
            case "augmentations": { sfh.x.router.toAugmentations(); } break;
            case "stats":         { sfh.x.router.toStats();         } break;
            case "stocks":        { sfh.x.router.toStocks();        } break;

            default: {
                sfh.print("{cr}{cr}{cr}", "Unknown router destination '", page, "'");
                return;
            }
        }
    }

    const name = String(ns.args[0]);
    let object = null;

    outer: for (const div of eval("document").querySelectorAll("div")) {
        const props = div[Object.keys(div)[1]];
        if (props?.children?.props?.[name]) {
            object = props.children.props[name];
            break outer;
        } else if (Array.isArray(props?.children)) {
            for (let child of props.children) {
                if (child?.props?.[name]) {
                    object = child.props[name];
                    break outer;
                }
            }
        }
    }
    
    if (routed) { sfh.x.router.toTerminal(); }

    if (object == null) {
        sfh.print("{cr}{cr}{cr}", "Could not find React prop '", ns.args[0], "'");
        return;
    }

    for (let i = 1; i < ns.args.length; ++i) {
        object = object[String(ns.args[i])];

        if (object == null) {
            sfh.print("{cr}{cr}{cr}{cr}{cr}", "Could not find property '",
                ns.args.slice(1, i + 1).join("."), "' on '", ns.args[0], "'");
            return;
        }
    }

    printKeys(object);
}
