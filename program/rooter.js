/** @param {NS} ns */
import { visit } from "/lib/net.js";

export async function main(ns) {
//  while (true) {
  let hosts = [];
  let currentLevel = ns.getHackingLevel();
  let scan = await visit(ns, host => hosts.push(host));
  
  hosts = hosts
    .filter(host => (host.requiredHackingLevel <= currentLevel))
    .map(host => host.name);
  ns.tprint(JSON.stringify(hosts, null, 2));
//  }
}
