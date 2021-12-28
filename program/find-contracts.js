import { visit } from "/lib/net.js";
import { formatTable } from "/lib/fmt.js";

export async function getContracts(ns)
{
  let contracts = [];
  await visit(ns, (host) => {
    const files = ns.ls(host.name);
    files.forEach(file => {
      if (file.endsWith("cct")) {
        let type = ns.codingcontract.getContractType(file, host.name);
        contracts.push({host: host.name, file, type});
      }
    });
  });
  return contracts;
}

/** @param {NS} ns */
export async function main(ns) {
  const contracts = [["host", "file", "type"]];
  let contractData = await getContracts(ns);
  contracts.push(...contractData.map(d => [d.host, d.file, d.type]));
  ns.tprint("\n\n" + formatTable(contracts));
}
