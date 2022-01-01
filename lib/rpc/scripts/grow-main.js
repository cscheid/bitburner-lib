import { wrapMain } from "/lib/rpc.js";

/** @param {NS} ns */
export const main = wrapMain((ns) => ns.grow(ns.args[0]));
