import { visit, totalPorts, openAllPorts } from "/lib/net.js";

export function formatTable(lst)
{
  const maxs = lst[0].map(el => 0);
  lst.forEach(row => {
    row.forEach((v, i) => {
      maxs[i] = Math.max(maxs[i], v.length);
    });
  });

  const result = [];
  lst.forEach(row => {
    const strs = [];
    row.forEach((v, i) => {
      const pad = " ".repeat(maxs[i] - v.length);
      strs.push(v + pad);
    });
    result.push(strs.join(" | "));
    if (result.length === 1) {
      result.push("-".repeat(result[0].length));
    }
  });
  
  return result.join("\n");
}

/** @param {NS} ns */
export async function main(ns) {
  const hosts = [];
  let hack = ns.getHackingLevel();
  
  await visit(ns, (host) => {
    if (host.requiredHackingLevel > hack)
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
