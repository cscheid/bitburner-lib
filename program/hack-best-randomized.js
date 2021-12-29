import { visit, totalPorts, openAllPorts } from "/lib/net.js";
import { bestActionAt, bestTarget } from "/lib/hack.js";
import { randomizedBestActionAt } from "/lib/hack.js";

/** @param {NS} ns */
export async function main(ns) {
  let securityThresh = 1.5;
  let moneyThresh = 0.5;
  
  while (true) {
    let currentLevel = ns.getHackingLevel();
    let bestNode = bestTarget(ns);

    if (bestNode === undefined) {
      ns.print("No nodes to hack. Sleeping...");
      await ns.sleep(10000);
      continue;
    }

    await randomizedBestActionAt(ns, bestNode);
  }
}
