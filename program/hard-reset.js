import { allNodes } from "/lib/net.js";
import { command } from "/lib/ui/terminal.js";

/** @param {NS} ns **/
export async function main(ns) {
  for (const node of (await allNodes(ns)).filter(node => node.hasRootAccess)) {
    if (node.name !== "home") {
      await ns.killall();
    }
  }
  command("home; killall; run setup.js");
}
