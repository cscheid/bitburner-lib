import { visit, totalPorts, openAllPorts } from "/lib/net.js";
import { bestActionAt } from "/lib/hack.js";

/** @param {NS} ns */
export async function main(ns) {
  let name = ns.args[0];
  while (true) {
    let target;
    await visit(ns, (node) => {
      if (node.name === name) {
        target = node;
      }
    });
    if (target === undefined) {
      throw new Error(`Couldn't find ${name}`);
    }
    await bestActionAt(ns, target);
    await ns.sleep(100);
  }
}
