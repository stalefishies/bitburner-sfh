export async function main(ns: NS) {
    ns.disableLog("ALL");

    const files: {
        basename: string,
        ext:      string,
        size:     number,
        ram:      number
    }[] = [];

    for (const file of ns.ls("home")) {
        const [ basename, ext ] = file.split(".");
        const size = ns.read(file).length;
        const ram  = ns.getScriptRam(file);

        files.push({ basename, ext, size, ram });
    }

    files.sort((f, g) => (f.ext + f.basename).localeCompare(g.ext + g.basename));

    for (const { basename, ext, size, ram } of files) {
        sfh.print("{50} {3} {6} {12}", basename, ext.toUpperCase(), size,
            ram > 0 ? sfh.format("{r}", ram) : "---");
    }
}
