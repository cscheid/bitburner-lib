import { wrapMain } from "/lib/rpc.js";

/** @param {NS} ns */
async function directMain(ns) {
  let result = await ns.hack(ns.args[0]);
  return result;
}

export const main = wrapMain(directMain);
