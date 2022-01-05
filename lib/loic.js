import { getSharedState } from "/lib/shared-state.js";

export function setLoicWeights(ns, weights)
{
  let ss = getSharedState(ns, "loic-params");
  ss.weights = weights.slice();
  return;
}
