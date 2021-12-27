/** @param {NS} ns **/
import { scanAnalyze } from "../lib/net.js";

// unlike regular scan-analyze, we just full-scan the whole net
// and save to disk
export async function main(ns) {
	let host = "home";
	let depth = 100;
	let visitedHosts = {};
	visitedHosts[host] = true;

	let result = await scanAnalyze(ns, host, depth, visitedHosts);
  await ns.write("data/network-scan.txt", JSON.stringify(result, null, 2), "w");
}
