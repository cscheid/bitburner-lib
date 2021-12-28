import { visit } from "/lib/net.js";
import { formatTable } from "/lib/fmt.js";

/** @param {NS} ns */
export async function main(ns) {
  const contracts = [["host", "file", "type"]];
  
  await visit(ns, (host) => {
    const files = ns.ls(host.name);
    files.forEach(file => {
      if (file.endsWith("cct")) {
        let type = ns.codingcontract.getContractType(file, host.name);
        contracts.push([host.name, file, type]);
      }
    });
  });
  ns.tprint("\n\n" + formatTable(contracts));
}
