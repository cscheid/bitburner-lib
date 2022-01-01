import { signalDone } from "/lib/rpc.js";

/** @param {NS} ns */
export async function main(ns) {
  await ns.hack(ns.args[0]);
  await signalDone(ns);
}
