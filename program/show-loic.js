import { getSharedState } from "/lib/shared-state.js";
import { formatTable } from "/lib/fmt.js";

/** @param {NS} ns **/
export async function main(ns) {
  let state = getSharedState(ns, "monitor-loic-queue").state;
  let counts = getSharedState(ns, "monitor-loic-queue").counts;

  let summary = [["host", "hack", "grow", "weaken"]];
  
  summary.push(["(state)", "", "", ""]);
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

  summary.push(["(counts)", "", "", ""]);
  for (const [host, c] of Object.entries(counts)) {
    summary.push([host,
                  String(c.hack),
                  String(c.grow),
                  String(c.weaken)]);
  }
  
  let t1 = formatTable(summary);

  ns.tprint("\n\n" + t1);
}
