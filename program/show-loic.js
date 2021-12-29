/** @param {NS} ns **/
export async function main(ns) {
  let state = Object.entries(JSON.parse(ns.read("/log/loic-state.txt")));
  let summary = {};
  for (const [host, actions] of state) {
    summary[host] = {
      "hack": 0,
      "grow": 0,
      "weaken": 0,
    };
    for (const action of actions) {
      summary[host][action.what] += action.threads;
    }
  }
  ns.tprint(JSON.stringify(summary, null, 2));
}
