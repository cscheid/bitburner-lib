import { getSharedState } from "/lib/shared-state.js";

/** @param {NS} ns */
export async function main(ns) {
  let weights = ns.args.map(x => Number(x));
  if (weights.length !== 3 || weights.some(x => isNaN(x) || x <= 0)) {
    ns.tprint(`args must be 3 positive numbers`);
    return;
  }
  let ss = getSharedState(ns, "loic-params");
  ss.weights = weights;
  ns.tprint(`Weights set to ${weights}`);
  return;
}
