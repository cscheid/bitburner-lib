import { command } from "/lib/ui/terminal.js";
import { getNode } from "/lib/net.js";

/** @param {NS} ns */
export async function main(ns) {
  let level = ns.getHackingLevel();
  let factionNodes = [{
    file: "csec-test.msg",
    node: "CSEC"
  }, {
    file: "nitesec-test.msg",
    node: "avmnite-02h"
  }];
  while (true) {
    for (const node of factionNodes) {
      if (ns.fileExists(node.file, "home") &&
          ns.hasRootAccess(node.node) &&
          (await getNode(ns, node.node)).requiredHackingLevel <= level) {
        await command("home");
        await command("go CSEC");
        await command("backdoor");
        await ns.sleep(5000);
      }
    }
    await ns.sleep(10000);
  }
}
