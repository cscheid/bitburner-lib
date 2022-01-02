import { command } from "/lib/ui/terminal.js";
import { restart } from "/lib/process.js";
import { copyAll } from "/program/copy-all.js";

/** @param {NS} ns */
export async function main(ns)
{
  await copyAll(ns);
  
  let homeRam = await ns.getServerMaxRam("home");

  // Only run this when our home computer is big enough
  if (homeRam >= 512) {
    await restart(ns, "/program/solve-contracts.js", "home");
  }
    
  await restart(ns, "/program/rooter.js", "home");
  await restart(ns, "/program/monitor-loic.js", "home");
  await restart(ns, "/program/story-line.js", "home");

  await command(`unalias install`);
  await command(`alias install="home; killall; run install.js"`);
  
  await command(`cls`);
  await ns.disableLog("getHackingLevel");  
}
