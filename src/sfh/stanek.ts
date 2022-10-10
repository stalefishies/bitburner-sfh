enum FragmentType {
    None,
    Delete,
    HackingChance,
    HackingSpeed,
    HackingMoney,
    HackingGrow,
    Hacking,
    Strength,
    Defense,
    Dexterity,
    Agility,
    Charisma,
    HacknetMoney,
    HacknetCost,
    Rep,
    WorkMoney,
    Crime,
    Bladeburner,
    Booster,
}

const frag_priority: Record<number, number> = {
    [FragmentType.Hacking]:        0,
    [FragmentType.Rep]:            1,
    [FragmentType.HackingGrow]:    2,
    [FragmentType.HackingSpeed]:   3,
    [FragmentType.HacknetCost]:    4,
    [FragmentType.HacknetMoney]:   5,
    [FragmentType.HackingMoney]:   6,
    [FragmentType.Strength]:       7,
    [FragmentType.Defense]:        8,
    [FragmentType.Dexterity]:      9,
    [FragmentType.Agility]:       10,
    [FragmentType.Charisma]:      11,
    [FragmentType.Crime]:         12,
    [FragmentType.HackingChance]: 13,
    [FragmentType.WorkMoney]:     14,
    [FragmentType.Bladeburner]:   15,
};

const frag_is_piece: Record<number, boolean> = {
    [FragmentType.None]:          false,
    [FragmentType.Delete]:        false,
    [FragmentType.HackingChance]: true,
    [FragmentType.HackingSpeed]:  true,
    [FragmentType.HackingMoney]:  true,
    [FragmentType.HackingGrow]:   true,
    [FragmentType.Hacking]:       true,
    [FragmentType.Strength]:      true,
    [FragmentType.Defense]:       true,
    [FragmentType.Dexterity]:     true,
    [FragmentType.Agility]:       true,
    [FragmentType.Charisma]:      true,
    [FragmentType.HacknetMoney]:  true,
    [FragmentType.HacknetCost]:   true,
    [FragmentType.Rep]:           true,
    [FragmentType.WorkMoney]:     true,
    [FragmentType.Crime]:         true,
    [FragmentType.Bladeburner]:   true,
    [FragmentType.Booster]:       false,
}

async function main(ns: NS) {
    sfh.stanek.width  = ns.stanek.giftWidth();
    sfh.stanek.height = ns.stanek.giftHeight();

    const fragments = ns.stanek.fragmentDefinitions();
    const boosters  = fragments
        .filter(f => f.type === FragmentType.Booster);
    const pieces    = fragments
        .filter(f => frag_is_piece[f.type])
        .sort((f, g) => frag_priority[f.type] - frag_priority[g.type])
        .slice(0, Math.round(sfh.stanek.width * sfh.stanek.height / 4.5));

    const max_time = performance.now() + 30;
    while (performance.now() < max_time) {
        break;
    }
}
