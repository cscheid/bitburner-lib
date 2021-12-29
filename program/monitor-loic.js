function addEntry(state, host, type, count)
{
  if (state[host] === undefined) {
    state[host] = {
      "hack": 0,
      "weaken": 0,
      "grow": 0,
    };
  }
  state[host][type] += count;
}

/** @param {NS} ns **/
export async function main(ns) {
	let port = ns.getPortHandle(1);
  let state = {};
  let started = performance.now();

	while (true) {
		await ns.sleep(1);		
		if (port.empty()) {
      continue;
		}
    let data = port.read();
    addEntry(state, data.host, data.what, data.threads);
    if (performance.now() - started > 1000) {
      await ns.write("/log/loic-state.txt", JSON.stringify(state, null, 2), "w");
    }
	}
}
