import { visit, totalPorts, openAllPorts } from "/lib/net.js";
import { bestActionAt } from "/lib/hack.js";
import { logNow } from "/lib/log.js";

/** @param {NS} ns */
export async function main(ns) {
  if (ns.args.length === 0) {
    ns.tprint("\n\nUsage: hack.js <node> [action]");
    return;
  }
  let name = ns.args[0];
  let action = "best";
  if (ns.args[1]) {
    action = ns.args[1];
  }
  while (true) {
    let target;
    let dispatch = {
      "best": async () => await bestActionAt(ns, target),
      "grow": async () => {
        await logNow(ns);
        await ns.grow(target.name);
      },
      "weaken": async () => {
        await logNow(ns);
        await ns.weaken(target.name);
      },
      "hack": async () => {
        await logNow(ns);
        await ns.hack(target.name);
      }
    };
    await visit(ns, (node) => {
      if (node.name === name) {
        target = node;
      }
    });
    if (target === undefined) {
      throw new Error(`Couldn't find ${name}`);
    }
    await dispatch[action](); // bestActionAt(ns, target);
    await ns.sleep(100);
  }
}
