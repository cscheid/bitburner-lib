import { command } from "/lib/ui/terminal.js";

/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    if (ns.fileExists("csec-test.msg", "home") &&
        ns.hasRootAccess("CSEC") &&
        ns.getHackingLevel() >= 55) {
      await command("home");
      await command("go CSEC");
      await command("backdoor");
      await ns.sleep(5000);
    }
    await ns.sleep(10000);
  }
}
