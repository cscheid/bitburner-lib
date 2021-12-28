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

  const fmt = (v) => String(~~(v * 100) / 100);
  
  const out = [["name", "security level", "money"]];
  hosts.forEach(host => {
    out.push([host.name,
              fmt(host.securityLevel),
              fmt(host.money)]);
  });
  ns.tprint(formatTable(out));
}
