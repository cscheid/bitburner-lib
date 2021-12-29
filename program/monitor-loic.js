function addEntry(state, { host, id, what, threads, duration })
{
  if (state[host] === undefined) {
    state[host] = [];
  }
  state[host].push({
    id,
    what,
    threads,
    finishTime: performance.now() + duration
  });
  state[host].sort((a, b) => a.finishTime - b.finishTime);
}

function removeEntry(state, { host, id })
{
  let ix = state[host].find(d => d.id === id);
  state[host].splice(ix, 1);
}

/** @param {NS} ns **/
export async function main(ns) {
	let port = ns.getPortHandle(1);
  port.clear();
  let state = {};
  let started = performance.now();

	while (true) {
		await ns.sleep(1);		
		if (port.empty()) {
      continue;
		}
    let data = port.read();
    if (data.log === "start") {
      addEntry(state, data);
    } else if (data.log === "end") {
      removeEntry(state, data);
    }
    if (performance.now() - started > 1000) {
      await ns.write("/log/loic-state.txt", JSON.stringify(state, null, 2), "w");
    }
	}
}
