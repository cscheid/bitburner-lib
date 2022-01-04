import { command } from "/lib/ui/terminal.js";

/** @param {NS} ns */
export async function main(ns) {
  let level = ns.getHackingLevel();
  let factionNodes = [{
    file: "csec-test.msg",
    node: "CSEC"
  }, {
    file: "nitesec-test.msg",
    node: "avmnite-02h"
  }, {
    file: "19dfj3l1nd.msg",
    node: "run4theh111z"
  }, {
    file: "j3.msg",
    node: "I.I.I.I"
  }];
  while (true) {
    for (const node of factionNodes) {
      let server = await ns.getServer(node.node);
      if (ns.fileExists(node.file, "home") &&
          ns.hasRootAccess(node.node) &&
          server.backdoorInstalled === false &&
          server.requiredHackingSkill <= level) {
        await command("home");
        await ns.sleep(1000);
        await command(`go ${node.node}`);
        await ns.sleep(1000);
        await command("backdoor");
        await ns.sleep(5000);
        await command("home");
      }
    }
    await ns.sleep(10000);
  }
}
