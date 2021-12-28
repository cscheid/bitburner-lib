import { visit, totalPorts, openAllPorts } from "/lib/net.js";
import { bestActionAt } from "/lib/hack.js";

/** @param {NS} ns */
export async function main(ns) {
  let name = ns.args[0];
  while (true) {
    await visit(ns, async (node) => {
      if (node.name === node) {
        await bestActionAt(ns, node);
      }
    });
    await ns.sleep(100);
  }
}
