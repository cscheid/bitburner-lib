/** @param {NS} ns **/
import { copyAll } from "/program/copy-all.js";

function fnow()
{
  return (new Date()).toLocaleString();
}

export async function main(ns) {
  for (let i = Number(ns.args[0]); i <= 20; ++i) {
    let cost = 55000 * (1 << i);
    let m = 0;
    while (m < cost) {
      m = ns.getPlayer().money;
      await ns.asleep(5000);
    }
    let server = ns.purchaseServer("loic", 1 << i);
    ns.tprint(`${fnow()}: Purchased ${server} with ${1 << i} GB`);
    await copyAll(ns);
    await ns.asleep(5000);
    ns.run("/program/loic-3.js", 1, ns.args[1], server);
  }
  
  let finalCost = 55000 * (1 << 20);

  while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
    let m = 0;
    while (m < finalCost) {
      m = ns.getPlayer().money;
      await ns.asleep(5000);
    }
    let server = ns.purchaseServer("loic", 1 << 20);
    ns.tprint(`${fnow()}: Purchased ${server} with ${1 << 20} GB`);
    await copyAll(ns);
    await ns.asleep(5000);
    ns.run("/program/loic-3.js", 1, ns.args[1], server);
  }
  ns.tprint(`${fnow()}: Max servers purchased. The End.`);
}
