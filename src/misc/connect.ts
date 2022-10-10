export function autocomplete(data: any, args: any) { return data.servers; }

export async function main(ns: NS) {
    const name = ns.args.join(" ");
    const dest = sfh.network[name];
    if (!dest) {
        sfh.print("Unknown server {}", name);
        return;
    }

    let list = [dest];
    while (list[0].name !== "home") {
        let parent = null;
        for (const edge of list[0].edges) {
            if (sfh.network[edge].depth < list[0].depth) {
                parent = sfh.network[edge];
                break;
            }
        }

        if (parent == null) {
            sfh.print("Could not trace path to home");
            return;
        }

        list.unshift(parent);
    }

    for (const server of list) { ns.singularity.connect(server.name); }
}
