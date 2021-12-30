import { getSharedState } from "/lib/shared-state.js";
import { formatTable } from "/lib/fmt.js";

/** @param {NS} ns **/
export async function main(ns) {
  let state = getSharedState(ns, "monitor-loic-queue").state;
  let counts = getSharedState(ns, "monitor-loic-queue").counts;

  let summary = [["host", "hack", "grow", "weaken"]];
  
  for (const [host, actions] of Object.entries(state)) {
    let status = {
      "hack": 0,
      "grow": 0,
      "weaken": 0,
    };
    for (const action of actions) {
      status[action.what] += action.threads;
    }
    summary.push([host,
                  String(status.hack),
                  String(status.grow),
                  String(status.weaken)]);
  }

  for (const [host, counts] of Object.entries(counts)) {
    summary.push([host,
                  String(counts.hack),
                  String(counts.grow),
                  String(counts.weaken)]);
  }
  
  let t1 = formatTable(summary);
  let t2 = formatTable(summary);
  ns.tprint(JSON.stringify(summary, null, 2));
}
