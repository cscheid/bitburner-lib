import { command } from "/lib/ui/terminal.js";
import { restart } from "/lib/process.js";

/** @param {NS} ns */
export async function main(ns) {
  await ns.exec("/program/copy-all.js");
  restart(ns, "/program/solve-contracts.js", "home");
  restart(ns, "/program/rooter.js", "home");
}
