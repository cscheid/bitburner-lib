/** @param {NS} ns */
import { hack } from "/lib/bb/simulator.js";
import * as formulas from "/lib/bb/formulas.js";
import { getTime } from "/lib/time.js";

export async function main(ns) {
  let server = ns.getServer(ns.args[0]);
  let estTime = formulas.calculateHackingTime(ns, server, ns.getPlayer());
  let {
    elapsedTime
  } = await getTime(() => ns.hack(ns.args[0]));
}
