import { logNow } from "/lib/log.ts";

export async function bestActionAt(ns, node, securityThresh = 1.5, moneyThresh = 0.5)
{
  await logNow(ns);
  if (node.security > node.minSecurity * securityThresh) {
    // while security too high, weaken
    await ns.weaken(node.name);
  } else if (node.money < node.maxMoney * moneyThresh) {
    // while too poor, grow
    await ns.grow(node.name);
  } else {
    await ns.hack(node.name);
  }
}
