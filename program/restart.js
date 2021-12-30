import { restart } from "/lib/process.js";

/** @param {NS} ns */
export async function main(ns)
{
  await restart(ns, ns.args[0], ns.getHostname());
}
