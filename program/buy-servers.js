/** @param {NS} ns **/
import { copyAll } from "/program/copy-all.js";

export async function main(ns) {
  debugger;
  for (let i = Number(ns.args[0]); i < Number(ns.args[1]); ++i) {
    let cost = 55000 * (1 << i);
    let m = 0;
    while (m < cost) {
      m = ns.getPlayer().money;
      await ns.asleep(5000);
    }
    let server = ns.purchaseServer("loic", 1 << i);
    await copyAll(ns);
    await ns.asleep(5000);
    ns.run("/program/loic-3.js", 1, ns.args[2], server);
  }
}
