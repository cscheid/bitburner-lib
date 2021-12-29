import { getSharedState } from "/lib/shared-state.js";

/** @param {NS} ns */
export async function main(ns) {
  let ss = getSharedState(ns, "loic-params");
  if (ns.args.length === 0) {
    ns.tprint(`Current weights:\n  hack ${ss.weights[0]}\n  weaken ${ss.weights[1]}\n  grow ${ss.weights[2]}`);
    return;
  }
  let weights = ns.args.map(x => Number(x));
  if (weights.length !== 3 || weights.some(x => isNaN(x) || x <= 0)) {
    ns.tprint(`args must be 3 positive numbers`);
    return;
  }

  ss.weights = weights;
  ns.tprint(`Weights set to ${weights}`);
  return;
}
