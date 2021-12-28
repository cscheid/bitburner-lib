/** @param {NS} ns */
import { visit, totalPorts, openAllPorts } from "/lib/net.js";

export async function main(ns) {
//  while (true) {
  let hosts = [];
  let currentLevel = ns.getHackingLevel();
  let scan = await visit(ns, host => hosts.push(host));
  let portLevel = totalPorts(ns);
  
  hosts = hosts
    .filter(host => (host.requiredHackingLevel <= currentLevel))
    .filter(host => (portLevel >= host.numPortsRequired))
    .map(host => host.name);
  ns.tprint(JSON.stringify(hosts, null, 2));
//  }
}
