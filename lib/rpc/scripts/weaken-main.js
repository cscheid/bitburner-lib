import { wrapMain } from "/lib/rpc.js";

/** @param {NS} ns */
export const main = wrapMain((ns) => ns.weaken(ns.args[0]));
