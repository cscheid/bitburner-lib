import { showDebug, hideDebug } from "/lib/ui/debug.js";

/** @param {NS} ns */
export async function main(ns)
{
  switch (ns.args[0]) {
  case "show":
    showDebug();
    break;
  case "hide":
    hideDebug();
    break;
  }
}
