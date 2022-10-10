export async function main(ns: NS) {
    const diff = Math.pow(sfh.player.str + sfh.player.def + sfh.player.dex
        + sfh.player.agi + sfh.player.cha, 0.9) / 250 + sfh.player.int / 1600;

    for (const city of ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"]) {
        sfh.print("{}", city);

        for (const location of Object.values(data.locations)) {
            if (location.city !== city) { continue; }

            sfh.print("    {30}   {3}   {2} {4}   {}{}{}{}{}", location.name,
                location.types.has("company") ? data.companies[location.name].stat_offset : "",
                location.infil_max > 0 ? location.infil_max : "",
                location.infil_max > 0
                    ? sfh.format("{4,p}", Math.min(Math.max((location.infil_init - diff) / 3, 0), 1))
                    : "",
                location.types.has("university")  ? "U" : "-",
                location.types.has("gym")         ? "G" : "-",
                location.types.has("tech vendor") ? "T" : "-",
                location.types.has("casino")      ? "$" : "-",
                location.types.has("special")     ? "S" : "-",
            );
        }
    }
}
