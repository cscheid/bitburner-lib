import { command } from "/lib/ui/terminal.js";

/** @param {NS} ns */
export async function main(ns) {
  await ns.kill("/program/solve-contracts.js", "home");
  await ns.run("/program/solve-contracts.js", "home");
}
