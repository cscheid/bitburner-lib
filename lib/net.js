export async function visit(ns, callable) {
	let net = await scanAnalyze(ns, "home", 100);
	async function inner(host) {
		await callable(host);
		for (let i = 0; i < host.children.length; ++i) {
			await inner(host.children[i]);
		}
	}
	await inner(net);
}

export async function scanAnalyze(ns, host, depth, visitedHosts) {
  if (visitedHosts === undefined) {
    visitedHosts = {};
    visitedHosts[host] = true;
  }
	depth = ~~depth;
  
	let analysis = await analyze(host);
	let hosts = await ns.scan(host);
	let children = [];
	analysis.children = children;
	if (depth <= 0)
		return analysis;
	for (let i = 0; i < hosts.length; ++i) {
		let target = hosts[i];
		if (visitedHosts[target]) {
			continue;
		}
		visitedHosts[target] = true; 
		children.push(await scanAnalyze(target, depth - 1, visitedHosts));
	}
	return analysis;
}

export async function analyze(ns, host) {
	let hasRootAccess = await ns.hasRootAccess(host);
	let requiredHackingLevel = await ns.getServerRequiredHackingLevel(host);
	let numPortsRequired = await ns.getServerNumPortsRequired(host);
	let maxRam = await ns.getServerMaxRam(host);

	return {
		name: host,
		hasRootAccess,
		requiredHackingLevel,
		numPortsRequired,
		maxRam
	};
}
