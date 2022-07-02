import { NS } from "netscript";

import { contract } from "/bin/cct.js"

export function autocomplete(data: any, args: any) { return data.servers; }

export async function main(ns: NS) {
    const node_arg = ns.args[0] as string | null;
    const file_arg = ns.args[1] as string | null;
    
    for (let node of (node_arg ? [node_arg] : sfh.nodes())) {
        if (typeof node !== "string") { node = node.name; }

        for (const file of (file_arg ? [file_arg] : ns.ls(node, ".cct"))) {
            try {
                const type = ns.codingcontract.getContractType(file, node);
                const data = ns.codingcontract.getData(file, node);
                sfh.print("{cc}{cc}", file, ":");
                sfh.print("    {}", type);
                sfh.print("    {}", JSON.stringify(data));

                const answer = await contract(type, data);

                if (answer == null) {
                    sfh.print("{cr}{cr}", "Got null for contract type ", type);
                } else {
                    sfh.print("Answer: {}", JSON.stringify(answer));
                }

                sfh.print("\n");
            } catch (e) {
                sfh.print("{cr}{cr}{cr}{cr}", "Could not find ", file, " on ", node);
                throw e;
            }
        }
    }
}
