import { command } from "/lib/ui/terminal.js";
import { restart } from "/lib/process.js";
import { copyAll } from "/program/copy-all.js";

/** @param {NS} ns */
export async function main(ns)
{
  for (const file of await ns.ls("home", "/program/")) {
    if (!file.startsWith("/program/")) {
      continue;
    }
    let shortcut = file.slice("/program/".length, -(".js".length));
    ns.tprint("Setting up alias for ${shortcut}");
    await command(`unalias ${shortcut}`);
    await command(`alias ${shortcut}="run ${file}"`);
  }

  await copyAll(ns);
  
  await restart(ns, "/program/solve-contracts.js", "home");
  await restart(ns, "/program/rooter.js", "home");
  await restart(ns, "/program/monitor-loic.js", "home");

  await command(`unalias install`);
  await command(`alias install="home; killall; run install.js"`);
  
  await command(`cls`);
  await ns.disableLog("getHackingLevel");  
}
