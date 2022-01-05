import { command } from "/lib/ui/terminal.js";
import { restart } from "/lib/process.js";
import { getNode, visit } from "/lib/net.js";
import { getLog } from "/program/hack-best-randomized.js";
import { loicWeightsFromPlan } from "/program/show-plan.js";

/** @param {NS} ns */
export async function main(ns) {
  let maxRam = 0;
  let biggestServer;
  for (let server of [...ns.getPurchasedServers(), "home"]) {
    server = ns.getServer(server);
    if (server.maxRam > maxRam) {
      biggestServer = server;
      maxRam = server.maxRam;
    }
  }
  let target = ns.getServer(ns.args[0]);
  let host = biggestServer;
  let step = Math.round(Math.log(maxRam) / Math.log(2)) + 1;
  const budget = Math.floor(biggestServer.maxRam / 1.75);

  await ns.run("/program/buy-servers.js", step, ns.args[0], target, host);
}
