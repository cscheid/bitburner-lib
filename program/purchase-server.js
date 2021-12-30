/** @param {NS} ns **/
import { copyAll } from "/program/copy-all.js";

export async function main(ns) {
  ns.tprint(ns.purchaseServer("loic", Number(ns.args[0])));
  await copyAll(ns);
}
