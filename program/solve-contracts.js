import { getContracts } from "/program/find-contracts.js";
import { solve } from "/contracts/runner.js";

/** @param {NS} ns */
export async function main(ns) {
  for (const { host, file } of await getContracts(ns)) {
    ns.tprint(`attempting contract ${host}:${file}`);
    solve(ns, file, host);
  }
}
