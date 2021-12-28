import { visit, totalPorts, openAllPorts } from "/lib/net.js";
import { formatTable } from "/lib/fmt.js";

/** @param {NS} ns */
export async function main(ns) {
  const hosts = [];
  let hack = ns.getHackingLevel();
  
  await visit(ns, (host) => {
    if (host.requiredHackingLevel > hack || !host.hasRootAccess)
      return;
    hosts.push(host);
  });

  const fmt = (v) => String(Math.round(v * 100) / 100);
  
  const out = [["name", "minsec", "sec", "maxmoney", "money"]];
  hosts.forEach(host => {
    out.push([host.name,
              fmt(host.minSecurity),
              fmt(host.security),
              fmt(host.maxMoney),
              fmt(host.money)]);
  });
  ns.tprint("\n\n" + formatTable(out));
}
