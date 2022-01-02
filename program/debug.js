import { showDebug, hideDebug, clearDebug, scrollOn, scrollOff, setLevel } from "/lib/ui/debug.js";

/** @param {NS} ns */
export async function main(ns)
{
  switch (ns.args[0].toLocaleLowerCase()) {
  case "show":
    await showDebug();
    break;
  case "hide":
    await hideDebug();
    break;
  case "clear":
    await clearDebug();
    break;
  case "scrollon":
    await scrollOn(ns);
    break;
  case "scrolloff":
    await scrollOff(ns);
    break;
  case "level":
    setLevel(ns, Number(ns.args[1]));
    break;
  }
}
