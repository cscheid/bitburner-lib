/** @param {NS} ns **/
import { formatLs } from "./free-utils.ns";
let ns;

async function analyze(host) {
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

async function scanAnalyze(host, depth, visitedHosts) {
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

// unlike regular scan-analyze, we just full-scan the whole net
// and save to disk
export async function main(NS) {
	ns = NS;
	let host = "home";
	let depth = 100;
	let visitedHosts = {};
	visitedHosts[host] = true;

	let result = await scanAnalyze(host, depth, visitedHosts);
    await ns.write("data_full-scan.txt", JSON.stringify(result, null, 2), "w");
}
