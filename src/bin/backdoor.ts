import { NS } from "netscript";

export async function main(ns: NS) {
    if (sfh.bb.player == null) {
        sfh.getBitburnerInternals();

        if (sfh.bb.player == null) {
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
        const cur_server = sfh.bb.player.currentServer;
        sfh.bb.player.currentServer = target;
        const promise = ns.installBackdoor();
        sfh.bb.player.currentServer = cur_server;
        await promise;
    } catch {
        ns.toast("Backdoor: Internal error!", "error", 60000);
        sfh.bb.player.currentServer = "home";
        sfh.bb.player.getCurrentServer().isConnectedTo = true;
    }

    return;

    // make sure we still have the RAM cost of singularity.connect so this isn't too exploity
    ns.connect;
}
