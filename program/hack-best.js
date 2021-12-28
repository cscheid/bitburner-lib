/** @param {NS} ns */
import { visit, totalPorts, openAllPorts } from "/lib/net.js";

export async function main(ns) {
  let securityThresh = 1.5;
  let moneyThresh = 0.5;
  
  while (true) {
    let currentLevel = ns.getHackingLevel();
    let bestNode;
    
    visit(ns, (host) => {
      if (host.requiredHackingLevel > currentLevel)
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
    
    if (bestNode.minSecurity * securityThresh > bestNode.security) {
      // while security too high, weaken
      await ns.weaken(bestNode.name);
    } else if (bestNode.money < bestNode.maxMoney * moneyThresh) {
      // while too poor, grow
      await ns.grow(bestNode.name);
    } else {
      await ns.hack(bestNode.name);
    }
      
    await ns.sleep(100);
  }
}
