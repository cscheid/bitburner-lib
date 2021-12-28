import { getContracts } from "/program/find-contracts.js";
import { solve } from "/contracts/runner.js";

/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    for (const { host, file } of await getContracts(ns)) {
      ns.tprint(`attempting contract ${host}:${file}`);
      let solution = solve(ns, file, host);
      if (solution === undefined) {
        continue;
      }
      let outcome = ns.codingcontract.attempt(solution, file, host, {
        returnReward: true
      });
      ns.tprint(`Outcome: ${outcome}`);
      await ns.write("/log/contracts.txt", `${(new Date()).toISOString()}: ${outcome}`, "a");
    }
    await ns.sleep(1000);
  }
}
