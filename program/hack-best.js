import { visit, totalPorts, openAllPorts } from "/lib/net.js";
import { bestActionAt } from "/lib/hack.js";

/** @param {NS} ns */
export async function main(ns) {
  let securityThresh = 1.5;
  let moneyThresh = 0.5;
  
  while (true) {
    let currentLevel = ns.getHackingLevel();
    let bestNode;
    
    await visit(ns, (host) => {
      if (host.requiredHackingLevel > currentLevel)
        return;
      if (!host.hasRootAccess)
        return;
      
      if (bestNode === undefined || host.maxMoney > bestNode.maxMoney) {
        bestNode = host;
      }
    });
    if (bestNode === undefined) {
      ns.print("No nodes to hack. Sleeping...");
      await ns.sleep(10000);
      continue;
    }

    await bestActionAt(ns, bestNode, securityThresh, moneyThresh);
  }
}
