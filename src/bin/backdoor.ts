export async function main(ns: NS) {
    if (sfh.x?.player == null) {
        sfh.getBitburnerInternals();

        if (sfh.x.player == null) {
            ns.toast("Backdoor: Could not get internal player", "error", 60000);
            return;
        }
    }

    const target = ns.args[0] as string;
    if (!(target in sfh.network)) { 
        ns.toast("Backdoor: Invalid target " + String(target), "error", 60000);
        return;
    }

    try {
        const cur_server = sfh.x.player.currentServer;
        sfh.x.player.currentServer = target;
        const promise = ns.singularity.installBackdoor();
        sfh.x.player.currentServer = cur_server;
        await promise;
    } catch {
        ns.toast("Backdoor: Internal error!", "error", 60000);
        sfh.x.player.currentServer = "home";
        sfh.x.player.getCurrentServer().isConnectedTo = true;
    }

    return;

    // make sure we still have the RAM cost of singularity.connect so this isn't too exploity
    ns.singularity.connect;
}
