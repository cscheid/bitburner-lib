import { visit, totalPorts, openAllPorts } from "/lib/net.js";
import { bestActionAt, bestTarget } from "/lib/hack.js";
import { randomizedBestActionAt } from "/lib/hack.js";

let log = {};

/** @param {NS} ns */
export async function main(ns) {
  let securityThresh = 1.5;
  let moneyThresh = 0.5;
  
  while (true) {
    let currentLevel = await ns.getHackingLevel();
    let bestNode = await bestTarget(ns);

    if (bestNode === undefined) {
      ns.print("No nodes to hack. Sleeping...");
      await ns.sleep(10000);
      continue;
    }

    await randomizedBestActionAt(ns, bestNode, [1.1, 1.5], [0.7, 0.9], log);
  }
}

export function getLog()
{
  return log;
}
