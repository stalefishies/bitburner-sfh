/** @param {NS} ns **/
export async function main(ns) {
    const files = [];
    for (let arg of ns.args) {
        if (ns.fileExists(arg)) {
            files.push(arg);
        } else {
            ns.tprintf("ERROR: %s not found", arg);
        }
    }

    if (files.length > 0) {
        await globalThis.sfh.netCopy(ns.scp.bind(ns), files);
    } else {
        ns.tprintf("ERROR: No files to scp");
    }
}