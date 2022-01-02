import { showDebug, hideDebug, clearDebug } from "/lib/ui/debug.js";

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
    await clearDebug();
    break;
  case "scrolloff":
    await clearDebug();
    break;
  }
}
