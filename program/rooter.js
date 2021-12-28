/** @param {NS} ns */
import { visit, totalPorts, openAllPorts } from "/lib/net.js";

function rootNode(ns, name) {
  openAllPorts(ns, name);
  ns.nuke(name);
}

export async function main(ns) {
  while (true) {
    let hosts = [];
    let scan = await visit(ns, host => hosts.push(host));
    let portLevel = totalPorts(ns);
  
    let hostsToRoot = hosts
        .filter(host => (portLevel >= host.numPortsRequired))
        .filter(host => !host.hasRootAccess)
        .map(host => host.name);

    hostsToRoot.forEach(name => {
      ns.tprint(`Will root ${name}`);
      rootNode(ns, name);
    });

    await ns.sleep(10000);
  }
}
