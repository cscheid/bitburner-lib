import { command } from "/lib/ui/terminal.js";
import { restart } from "/lib/process.js";

/** @param {NS} ns */
export async function main(ns) {
  await ns.exec("/program/copy-all.js", "home");
  await restart(ns, "/program/solve-contracts.js", "home");
  await restart(ns, "/program/rooter.js", "home");

  await command(`unalias install`);
  await command(`alias install="run install.js"`);
  
  for (const file of await ns.ls("home", "/program/")) {
    if (!file.startsWith("/program/")) {
      continue;
    }
    let shortcut = file.slice("/program/".length, -(".js".length));
    ns.tprint("Setting up alias for ${shortcut}");
    await command(`unalias ${shortcut}`);
    await command(`alias ${shortcut}="run ${file}"`);
  }
}
